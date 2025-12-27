import json
import re
from difflib import SequenceMatcher
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple

# Common stop words to ignore during token matching
STOP_WORDS = {
    "i", "me", "my", "myself", "we", "our", "ours", "ourselves", "you", "your", "yours",
    "yourself", "yourselves", "he", "him", "his", "himself", "she", "her", "hers",
    "herself", "it", "its", "itself", "they", "them", "their", "theirs", "themselves",
    "what", "which", "who", "whom", "this", "that", "these", "those", "am", "is", "are",
    "was", "were", "be", "been", "being", "have", "has", "had", "having", "do", "does",
    "did", "doing", "a", "an", "the", "and", "but", "if", "or", "because", "as", "until",
    "while", "of", "at", "by", "for", "with", "about", "against", "between", "into",
    "through", "during", "before", "after", "above", "below", "to", "from", "up", "down",
    "in", "out", "on", "off", "over", "under", "again", "further", "then", "once", "here",
    "there", "when", "where", "why", "how", "all", "any", "both", "each", "few", "more",
    "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so",
    "than", "too", "very", "s", "t", "can", "will", "just", "don", "should", "now"
}

# Map user concepts to dataset emotions/themes
SYNONYM_MAP = {
    "depressed": ["despair", "grief", "sadness", "suffering", "hopelessness", "melancholy", "misery", "anguish"],
    "depression": ["despair", "grief", "sadness", "suffering", "hopelessness", "melancholy", "misery", "anguish"],
    "sad": ["sadness", "sorrow", "grief", "misery"],
    "anxious": ["anxiety", "fear", "worry", "dread", "restlessness"],
    "anxiety": ["anxiety", "fear", "worry", "dread", "restlessness"],
    "angry": ["anger", "wrath", "severity", "harshness"],
    "anger": ["anger", "wrath", "severity", "harshness"],
    "happy": ["joy", "delight", "bliss", "cheerfulness"],
    "happiness": ["joy", "delight", "bliss", "cheerfulness"],
    "confused": ["confusion", "doubt", "uncertainty", "bewilderment"],
    "confusion": ["confusion", "doubt", "uncertainty", "bewilderment"],
    "lonely": ["loneliness", "isolation", "alienation"],
    "loneliness": ["loneliness", "isolation", "alienation"],
    "tired": ["exhaustion", "weariness", "fatigue"],
    "stress": ["burden", "pressure", "anxiety", "overwhelmed"],
    "stressed": ["burden", "pressure", "anxiety", "overwhelmed"],
    "love": ["affection", "devotion", "intimacy", "tenderness"],
    "money": ["wealth", "prosperity", "poverty", "destitution"],
    "rich": ["wealth", "prosperity", "abundance"],
    "poor": ["poverty", "destitution", "deprivation"],
}


class UniqueRagKuralFetcher:
    """Lightweight retriever that scores Kurals against a free-form query."""

    def __init__(self, data_path: Optional[Path] = None) -> None:
        repo_root = Path(__file__).resolve().parents[2]
        default_path = repo_root / "dataset" / "raw" / "kural_data_raw.json"
        self.data_path = Path(data_path) if data_path else default_path
        if not self.data_path.exists():
            raise FileNotFoundError(f"Kural dataset not found at {self.data_path}")

        with self.data_path.open("r", encoding="utf-8") as source:
            self.records: List[Dict[str, Any]] = json.load(source)

        self._prepare_index()

    def _prepare_index(self) -> None:
        for record in self.records:
            blob_parts = [
                record.get("eng_translation", ""),
                record.get("tamil_kural", ""),
                record.get("theme", ""),
                record.get("virtue", ""),
                record.get("emotion", ""),
                record.get("modern_scenario", ""),
                record.get("qa_question", ""),
                record.get("qa_answer", ""),
            ]
            normalized_blob = self._normalize(" ".join(blob_parts))
            record["_search_blob"] = normalized_blob
            record["_tokens"] = set(normalized_blob.split())

    @staticmethod
    def _normalize(text: str) -> str:
        cleaned = re.sub(r"[^a-z0-9\s]", " ", text.lower())
        return re.sub(r"\s+", " ", cleaned).strip()

    def _expand_query(self, query_tokens: Set[str]) -> Set[str]:
        expanded = set(query_tokens)
        for token in query_tokens:
            if token in SYNONYM_MAP:
                expanded.update(SYNONYM_MAP[token])
        return expanded

    def _score(self, query_tokens: Set[str], query_blob: str, record: Dict[str, Any]) -> float:
        tokens = record.get("_tokens", set())
        if not tokens:
            return 0.0

        # Filter out stop words from query tokens for scoring
        meaningful_query_tokens = {t for t in query_tokens if t not in STOP_WORDS}
        if not meaningful_query_tokens:
             meaningful_query_tokens = query_tokens # Fallback if all are stop words

        intersection = len(meaningful_query_tokens & tokens)
        
        # Overlap score: How many meaningful query tokens are present?
        # We normalize by len(meaningful_query_tokens) to get a ratio [0, 1]
        overlap_score = intersection / len(meaningful_query_tokens)

        # Thematic/Emotion Boost
        # Check if any meaningful query token matches the record's specific fields exactly
        thematic_bonus = 0.0
        
        # Helper to check field match
        def check_field(field_name: str, weight: float):
            val = record.get(field_name, "")
            if val:
                val_norm = self._normalize(val)
                val_tokens = set(val_norm.split())
                if meaningful_query_tokens & val_tokens:
                    return weight
            return 0.0

        thematic_bonus += check_field("emotion", 2.0) # Huge bonus for emotion match
        thematic_bonus += check_field("theme", 1.0)
        thematic_bonus += check_field("virtue", 1.0)

        # Sequence matcher is slow and often noisy for keyword bags, but useful for exact phrase matches
        # We reduce its weight and only calculate if we have some overlap or it's a short query
        seq_score = 0.0
        if intersection > 0:
             seq_score = SequenceMatcher(None, record.get("_search_blob", ""), query_blob).ratio()

        return (overlap_score * 5.0) + thematic_bonus + (seq_score * 0.5)

    def search(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        query_blob = self._normalize(query)
        if not query_blob:
            return []

        initial_tokens = set(query_blob.split())
        query_tokens = self._expand_query(initial_tokens)
        
        scored: List[Tuple[float, Dict[str, Any]]] = []

        for record in self.records:
            score = self._score(query_tokens, query_blob, record)
            if score <= 0.1: # Slight threshold to filter noise
                continue
            scored.append((score, record))

        scored.sort(key=lambda item: item[0], reverse=True)
        results: List[Dict[str, Any]] = []

        for score, record in scored[:top_k]:
            summary = {
                key: record.get(key)
                for key in (
                    "kural_id",
                    "tamil_kural",
                    "eng_translation",
                    "virtue",
                    "theme",
                    "emotion",
                    "modern_scenario",
                    "qa_question",
                    "qa_answer",
                )
                if record.get(key) is not None
            }
            summary["score"] = round(score, 4)
            results.append(summary)

        return results

    @staticmethod
    def to_context_block(results: List[Dict[str, Any]]) -> str:
        if not results:
            return ""

        lines: List[str] = []
        for entry in results:
            lines.append(
                "\n".join(
                    [
                        f"Kural #{entry.get('kural_id', 'N/A')} | Theme: {entry.get('theme', 'Unknown')} | Virtue: {entry.get('virtue', 'Unknown')}",
                        f"Tamil: {entry.get('tamil_kural', '').strip()}",
                        f"English Translation: {entry.get('eng_translation', '').strip()}",
                        f"Emotion: {entry.get('emotion', 'Unknown')} | Modern Scenario: {entry.get('modern_scenario', '').strip()}",
                        f"Guidance QA: Q: {entry.get('qa_question', '').strip()} | A: {entry.get('qa_answer', '').strip()}",
                    ]
                )
            )
        return "\n\n".join(lines)