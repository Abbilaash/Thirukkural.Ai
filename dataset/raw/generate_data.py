import json
import google.generativeai as genai
import time
import re
from concurrent.futures import ThreadPoolExecutor, as_completed
from threading import Lock
from google.api_core import exceptions as google_exceptions

# --- Configuration ---
# Replace with your actual API key from Google AI Studio
GOOGLE_API_KEY = 'AIzaSyCmkZ_hRz1Ayp25Bnz_VbvrjTnRsGm3HIQ' 
genai.configure(api_key=GOOGLE_API_KEY)

# Path to your original Kural dataset
input_file_path = 'kural_data.json'

# Path for the new, larger training file
output_file_path = 'unformatted_data.jsonl'

# MODIFIED: We now generate 10 scenarios for each Kural for a richer dataset.
prompts_per_kural = 10

# Parallel processing configuration
# For Free Tier: gemini-flash-latest supports ~15 RPM (Requests Per Minute)
# Recommended: Start with 10 workers, increase to 12-14 if no rate limit errors
MAX_WORKERS = 10  # Number of parallel API calls (adjust based on API rate limits)
MAX_RETRIES = 3   # Number of retries for failed requests
RETRY_DELAY = 2   # Seconds to wait before retrying

# --- Model for Generation ---
# Using Gemini 1.5 Flash for its speed and cost-effectiveness.
generation_model = genai.GenerativeModel('gemini-flash-latest')

# Thread-safe lock for writing to file
file_lock = Lock()

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
    
    # Retry logic for handling rate limits and transient errors
    for attempt in range(MAX_RETRIES):
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
                
        except google_exceptions.ResourceExhausted as e:
            # Rate limit hit - wait and retry
            if attempt < MAX_RETRIES - 1:
                wait_time = RETRY_DELAY * (attempt + 1)
                print(f"⚠️  Rate limit hit for Kural ID {kural_data['kural_id']}. Waiting {wait_time}s before retry {attempt + 1}/{MAX_RETRIES}...")
                time.sleep(wait_time)
            else:
                print(f"❌ Rate limit exceeded after {MAX_RETRIES} retries for Kural ID {kural_data['kural_id']}")
                return []
                
        except (google_exceptions.DeadlineExceeded, google_exceptions.ServiceUnavailable) as e:
            # Transient errors - retry
            if attempt < MAX_RETRIES - 1:
                print(f"⚠️  Transient error for Kural ID {kural_data['kural_id']}. Retrying {attempt + 1}/{MAX_RETRIES}...")
                time.sleep(RETRY_DELAY)
            else:
                print(f"❌ Failed after {MAX_RETRIES} retries for Kural ID {kural_data['kural_id']}: {e}")
                return []
                
        except Exception as e:
            print(f"An error occurred for Kural ID {kural_data['kural_id']}: {e}")
            if 'response' in locals():
                print(f"--- Model Output Was ---\n{response.text}\n----------------------")
            return []
    
    return []

def process_single_kural(kural, index, total):
    """
    Process a single Kural - generate prompts and return training examples.
    This function will be called in parallel.
    """
    print(f"Processing Kural {index+1}/{total} (ID: {kural['kural_id']})...")
    
    user_prompts = generate_synthetic_prompts(kural)
    
    if not user_prompts:
        print(f"Skipping Kural ID {kural['kural_id']} due to generation failure.")
        return None
    
    # This is the consistent, high-quality answer the model will be trained to provide.
    model_output = (
        f"Drawing from the wisdom of the Thirukkural, this verse may offer guidance:\n\n"
        f"**{kural['tamil_kural']}**\n\n"
        f"**Translation:** {kural['eng_translation']}\n\n"
        f"This speaks to the virtue of **{kural['virtue']}** within the theme of **{kural['theme']}**."
    )
    
    # Create training examples for each generated prompt
    training_examples = []
    for prompt in user_prompts:
        training_example = {
            "input_text": prompt,
            "output_text": model_output
        }
        training_examples.append(training_example)
    
    # Show a live example of the first generated pair for this Kural
    print(f"  ✓ Completed Kural {index+1}: Generated {len(user_prompts)} prompts")
    print(f"     Sample INPUT: '{user_prompts[0][:60]}...'")
    
    return {
        'kural_id': kural['kural_id'],
        'index': index,
        'examples': training_examples
    }

def create_training_dataset():
    """
    Main function to read Kural data, generate synthetic prompts in parallel, and write the JSONL file.
    """
    with open(input_file_path, 'r', encoding='utf-8') as infile:
        kural_dataset = json.load(infile)

    total_kurals = len(kural_dataset)
    print(f"Loaded {total_kurals} Kurals. Starting PARALLEL generation of {prompts_per_kural} scenarios each...")
    print(f"Using {MAX_WORKERS} parallel workers for faster processing.\n")
    
    start_time = time.time()
    completed_count = 0
    failed_count = 0
    
    # Store all results to write them in order
    all_results = {}
    
    # Use ThreadPoolExecutor for parallel API calls
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        # Submit all tasks
        future_to_kural = {
            executor.submit(process_single_kural, kural, i, total_kurals): (kural, i) 
            for i, kural in enumerate(kural_dataset)
        }
        
        # Process completed tasks as they finish
        for future in as_completed(future_to_kural):
            kural, index = future_to_kural[future]
            try:
                result = future.result()
                if result:
                    all_results[result['index']] = result['examples']
                    completed_count += 1
                else:
                    failed_count += 1
                    
                # Print progress every 10 kurals
                if (completed_count + failed_count) % 10 == 0:
                    elapsed = time.time() - start_time
                    progress = (completed_count + failed_count) / total_kurals * 100
                    print(f"\n📊 Progress: {completed_count + failed_count}/{total_kurals} ({progress:.1f}%) | "
                          f"Elapsed: {elapsed:.1f}s | Success: {completed_count} | Failed: {failed_count}\n")
                    
            except Exception as e:
                print(f"Exception processing Kural ID {kural['kural_id']}: {e}")
                failed_count += 1
    
    # Write all results to file in order
    print("\n📝 Writing results to file...")
    with open(output_file_path, 'w', encoding='utf-8') as outfile:
        for i in sorted(all_results.keys()):
            for example in all_results[i]:
                outfile.write(json.dumps(example, ensure_ascii=False) + '\n')
    
    elapsed_time = time.time() - start_time
    print(f"\n✅ Successfully generated synthetic dataset!")
    print(f"   Total Kurals processed: {completed_count}/{total_kurals}")
    print(f"   Failed: {failed_count}")
    print(f"   Total time: {elapsed_time:.1f} seconds ({elapsed_time/60:.1f} minutes)")
    print(f"   Average time per Kural: {elapsed_time/total_kurals:.2f} seconds")
    print(f"   Your training file is ready at: {output_file_path}")
    print(f"   Total training examples: {sum(len(examples) for examples in all_results.values())}")

# --- Run the Script ---
# Ensure you have set your GOOGLE_API_KEY before running.
create_training_dataset()