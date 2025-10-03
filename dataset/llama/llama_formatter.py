"""
Convert Gemini tuning format to Llama tuning format.

Gemini format:
{
  "contents": [
    {"role": "user", "parts": [{"text": "Question"}]},
    {"role": "model", "parts": [{"text": "Answer"}]}
  ]
}

Llama format:
{
  "messages": [
    {"role": "user", "content": "Question", "context": ""},
    {"role": "assistant", "content": "Answer"}
  ]
}
"""

import json

# --- Configuration ---
input_file = 'gemini_tuning_final.jsonl'
output_file = 'llama_tuning_final.jsonl'

print("=" * 70)
print("GEMINI TO LLAMA FORMAT CONVERTER")
print("=" * 70)

print(f"\n📖 Reading from: {input_file}")
print(f"📝 Writing to: {output_file}")

converted_count = 0
skipped_count = 0

with open(input_file, 'r', encoding='utf-8') as infile, \
     open(output_file, 'w', encoding='utf-8') as outfile:
    
    for line_num, line in enumerate(infile, 1):
        if line.strip():
            try:
                # Parse Gemini format
                gemini_data = json.loads(line)
                
                # Extract user and model messages
                user_message = None
                assistant_message = None
                
                if 'contents' in gemini_data:
                    for content in gemini_data['contents']:
                        role = content.get('role')
                        
                        if role == 'user' and 'parts' in content:
                            # Extract user's question
                            if len(content['parts']) > 0:
                                user_message = content['parts'][0].get('text', '')
                        
                        elif role == 'model' and 'parts' in content:
                            # Extract model's answer
                            if len(content['parts']) > 0:
                                assistant_message = content['parts'][0].get('text', '')
                
                # Convert to Llama format if both messages exist
                if user_message and assistant_message:
                    llama_data = {
                        "messages": [
                            {
                                "role": "user",
                                "content": user_message,
                                "context": ""
                            },
                            {
                                "role": "assistant",
                                "content": assistant_message
                            }
                        ]
                    }
                    
                    # Write to output file
                    outfile.write(json.dumps(llama_data, ensure_ascii=False) + '\n')
                    converted_count += 1
                    
                    # Progress indicator
                    if converted_count % 1000 == 0:
                        print(f"   Converted {converted_count} examples...")
                else:
                    skipped_count += 1
                    print(f"⚠️  Warning: Incomplete data on line {line_num}")
                    
            except json.JSONDecodeError as e:
                skipped_count += 1
                print(f"⚠️  Warning: Invalid JSON on line {line_num}: {e}")
            except Exception as e:
                skipped_count += 1
                print(f"⚠️  Warning: Error processing line {line_num}: {e}")

# Summary
print("\n" + "=" * 70)
print("CONVERSION COMPLETE")
print("=" * 70)

print(f"\n📊 Results:")
print(f"   ✅ Successfully converted: {converted_count} examples")
print(f"   ⚠️  Skipped: {skipped_count} examples")
print(f"   📁 Output file: {output_file}")

print("\n🔍 Sample Llama Format:")
print("-" * 70)

# Show a sample from the output
try:
    with open(output_file, 'r', encoding='utf-8') as f:
        first_line = f.readline()
        if first_line:
            sample = json.loads(first_line)
            print(json.dumps(sample, indent=2, ensure_ascii=False)[:500] + "...")
except Exception as e:
    print(f"Could not read sample: {e}")

print("\n" + "=" * 70)
print("✅ Conversion complete! Your Llama format file is ready.")
print("=" * 70)
