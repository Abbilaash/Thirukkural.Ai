# Thirukkural.AI – AI Agent Playbook

## Architecture Snapshots
- `backend/mainModules/api_req.py` is the only operational backend script: a CLI that forwards a typed prompt to Google Vertex AI (Gemini) and streams answers; `backend/orchestrator.py` is currently empty, and `frontend/` is a placeholder.
- Dataset tooling lives under `dataset/`: `raw/` creates synthetic QA pairs from canonical Thirukkural metadata, `Gemini/` reformats to the Vertex fine-tuning JSONL schema, and `llama/` mirrors that data into Llama-style message traces plus stratified train/test splits.
- Data always flows `dataset/raw/generate_data.py` → `dataset/Gemini/gemini_formatter.py` → (optionally) `dataset/llama/llama_formatter.py` → `split_*` scripts. Reuse those scripts instead of hand-editing JSON; downstream tools expect their exact shapes.

## Environment & Secrets
- Python virtual env already lives at `.venv/`; activate with `& .venv\Scripts\Activate.ps1` before running any script.
- Backend scripts rely on `.env` inside `backend/` (loaded via `python-dotenv`). Ensure `VERTEX_ENDPOINT=projects/<project>/locations/<region>/endpoints/<id>`, `GENAI_API_KEY`, `PIPELINE_PORT`, and `REACT_APP_ORCHESTRATOR_PORT` exist; `api_req.generate()` parses `project_id`, `location`, and `endpoint_id` from that string, so keep the slash-separated format untouched.
- Dataset generation embeds a placeholder `GOOGLE_API_KEY` constant inside `dataset/raw/generate_data.py`; override it locally (env var or edit the constant) before committing.

## Core Workflows
- **Ask the model:** `python backend/mainModules/api_req.py` prompts "ME:" in the console, then streams "Valluvar says..." chunks. Handle `ValueError` by checking `.env`.
- **Synthesize data:** run `python dataset/raw/generate_data.py`. It spawns up to `MAX_WORKERS=10` Gemini Flash calls with automatic rate-limit retries and writes `unformatted_data.jsonl`. Inputs come from `kural_data.json` (match the filename under `dataset/raw/`).
- **Format for Gemini fine-tuning:** `python dataset/Gemini/gemini_formatter.py` converts simple `{input_text, output_text}` rows into `contents` arrays expected by Vertex; outputs `gemini_tuning_final.jsonl`.
- **Convert for Llama:** `python dataset/llama/llama_formatter.py` consumes the Gemini JSONL and emits Llama-style `messages`. This is the only place `context"` fields appear; keep them empty unless you propagate richer metadata everywhere.
- **Maintain stratified splits:** both `dataset/Gemini/split_gemini.py` and `dataset/llama/split_llama.py` expect every answer to embed the Tamil Kural between the first pair of `**`. When inventing new outputs, preserve that bolded verse so the splitters can bucket by Kural.

## Coding Conventions & Gotchas
- Scripts are designed to be run as stand-alone CLIs; prefer `if __name__ == "__main__"` entry points and avoid importing them into web servers without wrapping the global config.
- Keep file paths relative to their module directories (e.g., `gemini_formatter.py` assumes it runs from `dataset/Gemini`). If you add tooling elsewhere, accept a `--input` argument instead of hardcoding new paths.
- Long generation configs (temperature, top_p, large `max_output_tokens`) in `api_req.generate()` are intentional to produce story-like answers; don't reset them without coordinating with dataset expectations.
- Rate-limit handling in `generate_data.py` uses exponential waits and logs every 10 Kurals. Maintain that observable logging style so contributors can monitor multi-hour runs without extra tooling.
- There is no monolithic requirements file; when adding dependencies, note whether they belong to backend inference (`google-genai`, `python-dotenv`) or data tooling (`google-generativeai`) to keep contributors aware of what to install manually.

## When Extending
- Stick new backend utilities under `backend/mainModules/` if they talk to Vertex/Gemini and `subModules/` for helpers; `orchestrator.py` can eventually orchestrate those modules, so keep APIs import-friendly.
- Any dataset change must keep the verse text **bolded** and include English translations plus virtue/theme metadata in the response body; other scripts parse those markers.
- Before committing generated JSONL files, run the relevant `split_*` script to ensure per-Kural counts stay near the 8/2 train/test contract and inspect its summary log for anomalies.
