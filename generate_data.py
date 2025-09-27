import json
import google.generativeai as genai
import time
import re

# --- Configuration ---
# Replace with your actual API key from Google AI Studio
GOOGLE_API_KEY = 'AIzaSyCmkZ_hRz1Ayp25Bnz_VbvrjTnRsGm3HIQ' 
genai.configure(api_key=GOOGLE_API_KEY)

# Path to your original Kural dataset
input_file_path = 'input_data.json'

# Path for the new, larger training file
output_file_path = 'training_data_10_scenarios.jsonl'

# MODIFIED: We now generate 10 scenarios for each Kural for a richer dataset.
prompts_per_kural = 10

# --- Model for Generation ---
# Using Gemini 1.5 Flash for its speed and cost-effectiveness.
generation_model = genai.GenerativeModel('gemini-flash-latest')

def generate_synthetic_prompts(kural_data):
    """
    Uses the Gemini API to generate 10 diverse user-like prompts for a given Kural.
    """
    
    # VERIFIED: The prompt is refined to ask for JSON output and emphasize diversity.
    prompt_for_generator = f"""
    You are an expert in creating high-quality training data for AI.
    Your task is to generate {prompts_per_kural} diverse user inputs. These inputs must be realistic scenarios where the following ancient verse (Kural) would be the perfect piece of wisdom to offer.

    **Kural Information:**
    - **Translation:** {kural_data['eng_translation']}
    - **Core Emotion:** {kural_data['emotion']}
    - **Theme:** {kural_data['theme']}
    - **Virtue:** {kural_data['virtue']}
    - **Modern Example:** {kural_data['modern_scenario']}

    Create a variety of inputs:
    - Some should be direct questions.
    - Some should be statements describing a feeling or a personal struggle.
    - Some should describe a situation at work or in life.

    Return your answer as a single, valid JSON array of strings.
    Example format: ["User input 1.", "User input 2.", "Another user input..."]
    
    Do not write any other text or explanation. Only output the raw JSON array.
    """
    
    try:
        response = generation_model.generate_content(prompt_for_generator)
        
        # VERIFIED: Using a more robust method to clean and parse the JSON response.
        # This handles cases where the model might add markdown ```json ``` tags.
        clean_response_text = re.sub(r'```json\n?|```', '', response.text.strip())
        
        synthetic_prompts = json.loads(clean_response_text)
        
        if isinstance(synthetic_prompts, list) and len(synthetic_prompts) == prompts_per_kural:
            return synthetic_prompts
        else:
            print(f"Warning: Model did not return a list of {prompts_per_kural} items for Kural ID: {kural_data['kural_id']}")
            return []
            
    except Exception as e:
        print(f"An error occurred for Kural ID {kural_data['kural_id']}: {e}")
        if 'response' in locals():
            print(f"--- Model Output Was ---\n{response.text}\n----------------------")
        return []

def create_training_dataset():
    """
    Main function to read Kural data, generate synthetic prompts, and write the JSONL file.
    """
    with open(input_file_path, 'r', encoding='utf-8') as infile:
        kural_dataset = json.load(infile)

    print(f"Loaded {len(kural_dataset)} Kurals. Starting generation of {prompts_per_kural} scenarios each...")

    with open(output_file_path, 'w', encoding='utf-8') as outfile:
        for i, kural in enumerate(kural_dataset):
            print(f"\nProcessing Kural {i+1}/{len(kural_dataset)} (ID: {kural['kural_id']})...")
            
            user_prompts = generate_synthetic_prompts(kural)
            
            if not user_prompts:
                print(f"Skipping Kural ID {kural['kural_id']} due to generation failure.")
                continue

            # This is the consistent, high-quality answer the model will be trained to provide.
            model_output = (
                f"Drawing from the wisdom of the Thirukkural, this verse may offer guidance:\n\n"
                f"**{kural['tamil_kural']}**\n\n"
                f"**Translation:** {kural['eng_translation']}\n\n"
                f"This speaks to the virtue of **{kural['virtue']}** within the theme of **{kural['theme']}**."
            )
            
            # Create a training example for each of the 10 generated prompts
            for prompt in user_prompts:
                training_example = {
                    "input_text": prompt,
                    "output_text": model_output
                }
                outfile.write(json.dumps(training_example, ensure_ascii=False) + '\n')
            
            # Show a live example of the first generated pair for this Kural
            print("  -> Example generated: ")
            print(f"     INPUT: '{user_prompts[0]}'")
            print(f"     OUTPUT: '{model_output[:70]}...'")

            # API rate limit buffer
            time.sleep(1) 

    print(f"\n✅ Successfully generated synthetic dataset with {prompts_per_kural} scenarios per Kural.")
    print(f"Your training file is ready at: {output_file_path}")

# --- Run the Script ---
# Ensure you have set your GOOGLE_API_KEY before running.
create_training_dataset()