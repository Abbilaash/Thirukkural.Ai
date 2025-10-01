import random
import json
from collections import defaultdict

# --- Configuration ---
input_file_path = 'llama_tuning_final.jsonl'
train_output_path = 'train_1.jsonl'
test_output_path = 'test_1.jsonl'

# We will split 8 scenarios for training and 2 for testing PER KURAL
# This ensures the model is tested on the same Kurals it trained on,
# but with different scenarios it hasn't seen before.
train_scenarios_per_kural = 8
test_scenarios_per_kural = 2
total_scenarios_per_kural = 10

print("=" * 70)
print("STRATIFIED DATA SPLIT - BY KURAL")
print("=" * 70)

# --- Script Logic ---
print(f"\n📖 Loading data from {input_file_path}...")

# Read all examples and group them by Kural
kural_groups = defaultdict(list)

with open(input_file_path, 'r', encoding='utf-8') as infile:
    for line_num, line in enumerate(infile, 1):
        if line.strip():
            try:
                example = json.loads(line)
                
                # Extract model's response from Gemini format
                # Format: {"contents": [{"role": "user", ...}, {"role": "model", "parts": [{"text": "..."}]}]}
                if 'contents' in example:
                    # Find the model's response
                    for content in example['contents']:
                        if content.get('role') == 'model':
                            if 'parts' in content and len(content['parts']) > 0:
                                model_text = content['parts'][0].get('text', '')
                                
                                # Extract Tamil Kural from the text
                                # It's between the first pair of **  markers
                                if '**' in model_text:
                                    parts = model_text.split('**')
                                    if len(parts) >= 2:
                                        kural_id = parts[1].strip()  # Tamil text
                                        kural_groups[kural_id].append(example)
                                        break
                            
            except json.JSONDecodeError as e:
                print(f"⚠️  Warning: Invalid JSON on line {line_num}: {e}")

total_examples = sum(len(examples) for examples in kural_groups.values())
print(f"   Found {total_examples} total examples")
print(f"   Grouped into {len(kural_groups)} unique Kurals")

# Analyze distribution
print(f"\n📊 Analyzing distribution:")
distribution = defaultdict(int)
for kural_id, examples in kural_groups.items():
    count = len(examples)
    distribution[count] += 1

for count in sorted(distribution.keys()):
    num_kurals = distribution[count]
    print(f"   {num_kurals} Kurals have {count} scenarios")

# --- Perform Stratified Split ---
print(f"\n🔀 Performing stratified split:")
print(f"   {train_scenarios_per_kural} scenarios per Kural for TRAINING")
print(f"   {test_scenarios_per_kural} scenarios per Kural for TESTING")

train_data = []
test_data = []
skipped_kurals = []

for kural_id, examples in kural_groups.items():
    num_examples = len(examples)
    
    if num_examples < total_scenarios_per_kural:
        # Handle Kurals with fewer than 10 scenarios
        # Split proportionally: 80% train, 20% test
        num_test = max(1, int(num_examples * 0.2))
        num_train = num_examples - num_test
        
        # Shuffle this Kural's examples
        random.shuffle(examples)
        
        train_data.extend(examples[:num_train])
        test_data.extend(examples[num_train:])
        
        if num_examples < 10:
            skipped_kurals.append((kural_id[:50], num_examples, num_train, num_test))
    else:
        # Ideal case: Kural has exactly 10 or more scenarios
        # Shuffle this Kural's examples
        random.shuffle(examples)
        
        # Take first 8 for training, next 2 for testing
        train_data.extend(examples[:train_scenarios_per_kural])
        test_data.extend(examples[train_scenarios_per_kural:train_scenarios_per_kural + test_scenarios_per_kural])

# Shuffle the final datasets (so Kurals are mixed, but split is maintained)
random.shuffle(train_data)
random.shuffle(test_data)

# --- Write Output Files ---
print(f"\n📝 Writing split data...")

with open(train_output_path, 'w', encoding='utf-8') as outfile:
    for example in train_data:
        outfile.write(json.dumps(example, ensure_ascii=False) + '\n')

print(f"   ✅ Wrote {len(train_data)} examples to {train_output_path}")

with open(test_output_path, 'w', encoding='utf-8') as outfile:
    for example in test_data:
        outfile.write(json.dumps(example, ensure_ascii=False) + '\n')

print(f"   ✅ Wrote {len(test_data)} examples to {test_output_path}")

# --- Summary ---
print("\n" + "=" * 70)
print("SPLIT SUMMARY")
print("=" * 70)

expected_train = len(kural_groups) * train_scenarios_per_kural
expected_test = len(kural_groups) * test_scenarios_per_kural

print(f"\n📊 Results:")
print(f"   Total Kurals: {len(kural_groups)}")
print(f"   Training examples: {len(train_data)} (expected: ~{expected_train})")
print(f"   Testing examples: {len(test_data)} (expected: ~{expected_test})")

total_examples = len(train_data) + len(test_data)
if total_examples > 0:
    print(f"   Split ratio: {len(train_data)/total_examples*100:.1f}% train / {len(test_data)/total_examples*100:.1f}% test")
else:
    print(f"   ⚠️  No data was split!")

if skipped_kurals:
    print(f"\n⚠️  {len(skipped_kurals)} Kurals had fewer than 10 scenarios:")
    for kural_text, total, train, test in skipped_kurals[:10]:
        print(f"   '{kural_text}...': {total} total → {train} train, {test} test")
    if len(skipped_kurals) > 10:
        print(f"   ... and {len(skipped_kurals) - 10} more")

print(f"\n✅ Stratified split complete!")
print(f"   Each Kural contributes to BOTH training and testing sets.")
print(f"   The model will be tested on Kurals it has seen, but with NEW scenarios.")
print("=" * 70)