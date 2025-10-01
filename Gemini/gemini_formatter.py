import json

# --- Configuration ---
# Your VERY FIRST generated data file (the one in the simple format)
original_file = 'final_training_data_normalized.jsonl'

# The final, CORRECTLY formatted file for Gemini tuning
final_output_file = 'gemini_tuning_final.jsonl'

print(f"Starting FINAL conversion of '{original_file}' to the correct Gemini 'contents' format...")

lines_converted = 0

with open(original_file, 'r', encoding='utf-8') as infile, \
     open(final_output_file, 'w', encoding='utf-8') as outfile:
    
    for line in infile:
        # 1. Load the simple {"input_text": ..., "output_text": ...} format
        original_data = json.loads(line)
        
        user_text = original_data.get('input_text', '')
        model_text = original_data.get('output_text', '')
        
        # 2. Build the new, correct structure based on the documentation example
        gemini_contents_data = {
            "contents": [
                {
                    "role": "user",
                    "parts": [
                        {
                            "text": user_text
                        }
                    ]
                },
                {
                    "role": "model",
                    "parts": [
                        {
                            "text": model_text
                        }
                    ]
                }
            ]
        }
        
        # 3. Write the new, correctly formatted line to the output file
        outfile.write(json.dumps(gemini_contents_data, ensure_ascii=False) + '\n')
        
        lines_converted += 1

print(f"\n✅ FINAL conversion complete!")
print(f"Successfully converted {lines_converted} lines.")
print(f"Your definitive training file is ready at: '{final_output_file}'")