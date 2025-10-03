from google import genai
from google.genai import types
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def generate():

    vertex_endpoint = os.getenv("VERTEX_ENDPOINT")
    genai_api_key = os.getenv("GENAI_API_KEY")
    pipeline_port = os.getenv("PIPELINE_PORT")
    react_app_port = os.getenv("REACT_APP_ORCHESTRATOR_PORT")

    if vertex_endpoint:
        parts = vertex_endpoint.split('/')
        project_id = parts[1] 
        location = parts[3]   
        endpoint_id = parts[5] 
    else:
        raise ValueError("VERTEX_ENDPOINT not found")
    
    print(f"Model running in {location}")
    print()

    client = genai.Client(
        vertexai=True,
        project=project_id,
        location=location,
    )

    # Use the full endpoint path from .env
    model = vertex_endpoint
    system_instruction = """You are Thiruvalluvar's AI assistant, an expert on Thirukkural wisdom. 
Guidelines for responses:
- Always relate answers to specific Thirukkural verses when possible
- Provide both Tamil verse and English translation
- Keep responses concise but meaningful
- Focus on practical life applications
- Give user multiple logical and emotional decisions or options to perform for their situation from the thirukkural
- Avoid generic or vague answers
- If unsure, say "Thirukkural doesn't specifically address this, but related wisdom suggests..."
"""

    contents = [
        types.Content(
            role="user",
            parts=[
                types.Part(text=f"{system_instruction}\n\nUser Question: {input('ME: ')}")
            ]
        )
    ]

    generate_content_config = types.GenerateContentConfig(
        temperature=0.85,
        top_p=0.95,
        max_output_tokens=65535,
        safety_settings=[
            types.SafetySetting(
                category="HARM_CATEGORY_HATE_SPEECH",
                threshold="BLOCK_NONE"
            ),
            types.SafetySetting(
                category="HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold="BLOCK_NONE"
            ),
            types.SafetySetting(
                category="HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold="BLOCK_NONE"
            ),
            types.SafetySetting(
                category="HARM_CATEGORY_HARASSMENT",
                threshold="BLOCK_NONE"
            )
        ],
    )

    try:
        print("Valluvar says...")
        for chunk in client.models.generate_content_stream(
            model=model,
            contents=contents,
            config=generate_content_config,
        ):
            print(chunk.text, end="")
    except Exception as e:
        print(f"Error: {e}")
#function to ask a question to the Thirukkural model goes here


if __name__ == "__main__":
    generate()




# def ask_thirukkural(question):
#     """Function to ask a question to the Thirukkural model"""
#     # Extract configuration from .env
#     vertex_endpoint = os.getenv("VERTEX_ENDPOINT")
#     if not vertex_endpoint:
#         raise ValueError("VERTEX_ENDPOINT not found in .env file")
    
#     parts = vertex_endpoint.split('/')
#     project_id = parts[1]
#     location = parts[3]
    
#     client = genai.Client(
#         vertexai=True,
#         project=project_id,
#         location=location,
#     )

#     contents = [
#         types.Content(
#             role="user",
#             parts=[
#                 types.Part(text=question)
#             ]
#         )
#     ]

#     generate_content_config = types.GenerateContentConfig(
#         temperature=0.7,
#         top_p=0.9,
#         max_output_tokens=1000,
#     )

#     try:
#         response = client.models.generate_content(
#             model=vertex_endpoint,
#             contents=contents,
#             config=generate_content_config,
#         )
#         return {"success": True, "response": response.text}
#     except Exception as e:
#         return {"success": False, "error": str(e)}