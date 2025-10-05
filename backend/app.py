from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import random
from datetime import datetime
import uuid

app = Flask(__name__)
CORS(app)

# In-memory storage for quiz answers (in production, use a database)
quiz_responses = []
feedback_responses = []

# Sample Kurals database with emotions and responses
KURALS_DATABASE = {
    "joy": [
        {
            "tamil": "மகிழ்ச்சியே வாழ்க்கையின் மணம்",
            "english": "Joy is the fragrance of life",
            "relevance": "True happiness comes from within and spreads to others",
            "category": "Emotions"
        },
        {
            "tamil": "இன்பம் தரும் செயல்களே இனிய வாழ்க்கை",
            "english": "Actions that bring joy create a sweet life",
            "relevance": "Choose activities that bring genuine happiness to yourself and others",
            "category": "Emotions"
        }
    ],
    "sadness": [
        {
            "tamil": "துயரம் வளர்க்கும் மனிதனை",
            "english": "Sorrow nurtures the human soul",
            "relevance": "Through sadness, we learn empathy and grow stronger",
            "category": "Emotions"
        },
        {
            "tamil": "கண்ணீர் வழியும் இடத்தில் வளரும் அன்பு",
            "english": "Love grows where tears flow",
            "relevance": "Shared sorrows create deeper bonds and understanding",
            "category": "Emotions"
        }
    ],
    "anger": [
        {
            "tamil": "கோபம் அழிக்கும் அறிவை",
            "english": "Anger destroys wisdom",
            "relevance": "When angry, step back and breathe before acting",
            "category": "Emotions"
        },
        {
            "tamil": "சினம் தீயின் வழி",
            "english": "Anger is the path of fire",
            "relevance": "Channel anger into positive action rather than destruction",
            "category": "Emotions"
        }
    ],
    "fear": [
        {
            "tamil": "பயம் வளர்க்கும் வீரம்",
            "english": "Fear nurtures courage",
            "relevance": "Facing fears makes us stronger and more resilient",
            "category": "Emotions"
        },
        {
            "tamil": "அச்சம் தவிர்த்து அறிவு பெறு",
            "english": "Remove fear and gain wisdom",
            "relevance": "Knowledge and understanding dispel unnecessary fears",
            "category": "Emotions"
        }
    ],
    "love": [
        {
            "tamil": "அன்பின் வழியது உயிர்நிலை",
            "english": "Love is the way of life",
            "relevance": "Love gives meaning to our existence and relationships",
            "category": "Relationships"
        },
        {
            "tamil": "காதல் வாழ்க்கையின் மணம்",
            "english": "Love is the fragrance of life",
            "relevance": "True love enriches both the giver and receiver",
            "category": "Relationships"
        }
    ],
    "forgiveness": [
        {
            "tamil": "மன்னிப்பு மனிதனின் பெருமை",
            "english": "Forgiveness is human greatness",
            "relevance": "Forgiving others frees your own heart from bitterness",
            "category": "Ethics"
        },
        {
            "tamil": "குற்றம் மன்னித்தல் அறிவின் அடையாளம்",
            "english": "Forgiving faults is the mark of wisdom",
            "relevance": "Forgiveness shows strength, not weakness",
            "category": "Ethics"
        }
    ],
    "strength": [
        {
            "tamil": "வலிமை மனதில் வளரும்",
            "english": "Strength grows in the mind",
            "relevance": "True strength comes from mental resilience and character",
            "category": "Wisdom"
        },
        {
            "tamil": "தன்னை வென்றவன் உலகை வெல்வான்",
            "english": "He who conquers himself conquers the world",
            "relevance": "Self-mastery is the greatest victory",
            "category": "Wisdom"
        }
    ],
    "peace": [
        {
            "tamil": "அமைதி மனதின் நிலை",
            "english": "Peace is the state of mind",
            "relevance": "Inner peace comes from acceptance and mindfulness",
            "category": "Wisdom"
        },
        {
            "tamil": "சமாதானம் வாழ்க்கையின் பூ",
            "english": "Peace is the flower of life",
            "relevance": "Peaceful minds create peaceful relationships and communities",
            "category": "Wisdom"
        }
    ],
    "gratitude": [
        {
            "tamil": "நன்றி வாழ்க்கையின் மணம்",
            "english": "Gratitude is the fragrance of life",
            "relevance": "Gratitude transforms what we have into enough",
            "category": "Ethics"
        },
        {
            "tamil": "கடமை உணர்வு மனிதனின் பெருமை",
            "english": "Sense of duty is human greatness",
            "relevance": "Gratitude leads to service and contribution to others",
            "category": "Ethics"
        }
    ],
    "hope": [
        {
            "tamil": "நம்பிக்கை வாழ்க்கையின் விளக்கு",
            "english": "Hope is the lamp of life",
            "relevance": "Hope keeps us moving forward even in dark times",
            "category": "Wisdom"
        },
        {
            "tamil": "எதிர்காலம் நம்பிக்கையில் வளரும்",
            "english": "The future grows in hope",
            "relevance": "Hope is the foundation for building a better tomorrow",
            "category": "Wisdom"
        }
    ]
}

# Chat responses for different conversation contexts
CHAT_RESPONSES = {
    "greeting": [
        "Hello! I'm here to help you find wisdom through Thirukkural. What's on your mind today?",
        "Welcome! I sense you're seeking guidance. How can I help you today?",
        "Greetings! I'm ready to share ancient wisdom that speaks to your heart. What brings you here?"
    ],
    "general": [
        "That's a beautiful thought. Let me share some wisdom that might resonate with you.",
        "I understand what you're going through. Here's some guidance from ancient wisdom.",
        "Your feelings are valid. Let me offer you some perspective from Thirukkural."
    ],
    "follow_up": [
        "Is there anything specific you'd like to explore further?",
        "Would you like to dive deeper into this topic?",
        "How does this wisdom speak to your current situation?"
    ]
}

def get_emotion_from_text(text):
    """Extract emotion from user input using keyword matching"""
    text_lower = text.lower()
    
    emotion_keywords = {
        "joy": ["happy", "joy", "cheerful", "excited", "celebrate", "smile", "laugh"],
        "sadness": ["sad", "depressed", "down", "blue", "cry", "tears", "grief", "mourn"],
        "anger": ["angry", "mad", "furious", "rage", "irritated", "annoyed", "frustrated"],
        "fear": ["afraid", "scared", "fear", "anxious", "worried", "nervous", "panic"],
        "love": ["love", "adore", "cherish", "romance", "affection", "care", "devotion"],
        "forgiveness": ["forgive", "forgiveness", "pardon", "excuse", "apologize", "sorry"],
        "strength": ["strong", "power", "courage", "brave", "mighty", "resilient", "tough"],
        "peace": ["peace", "calm", "serene", "tranquil", "quiet", "still", "harmony"],
        "gratitude": ["grateful", "thankful", "appreciate", "blessed", "gratitude", "thanks"],
        "hope": ["hope", "hopeful", "optimistic", "positive", "future", "dream", "aspire"]
    }
    
    for emotion, keywords in emotion_keywords.items():
        if any(keyword in text_lower for keyword in keywords):
            return emotion
    
    return "general"

def get_chat_response(user_message, conversation_history=None):
    """Generate appropriate chat response based on user input"""
    if conversation_history is None:
        conversation_history = []
    
    # Check for greetings
    greeting_words = ["hello", "hi", "hey", "good morning", "good afternoon", "good evening"]
    if any(word in user_message.lower() for word in greeting_words):
        # Get a random kural for greeting
        all_kurals = []
        for emotion_kurals in KURALS_DATABASE.values():
            all_kurals.extend(emotion_kurals)
        kural = random.choice(all_kurals)
        
        return {
            "message": random.choice(CHAT_RESPONSES["greeting"]),
            "kural": kural,
            "follow_up": random.choice(CHAT_RESPONSES["follow_up"])
        }
    
    # Get emotion from text
    emotion = get_emotion_from_text(user_message)
    
    # Get relevant Kural
    if emotion in KURALS_DATABASE:
        kural = random.choice(KURALS_DATABASE[emotion])
    else:
        # Default to a general wisdom kural
        all_kurals = []
        for emotion_kurals in KURALS_DATABASE.values():
            all_kurals.extend(emotion_kurals)
        kural = random.choice(all_kurals)
    
    # Generate response
    base_response = random.choice(CHAT_RESPONSES["general"])
    follow_up = random.choice(CHAT_RESPONSES["follow_up"])
    
    return {
        "message": f"{base_response}",
        "kural": kural,
        "follow_up": follow_up
    }

@app.route('/api/chat', methods=['POST'])
def chat():
    """Main chat endpoint"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
            
        user_message = data.get('message', '')
        conversation_history = data.get('history', [])
        
        print(f"Received message: {user_message}")  # Debug logging
        
        if not user_message.strip():
            return jsonify({
                'error': 'Message cannot be empty'
            }), 400
        
        # Generate response
        response = get_chat_response(user_message, conversation_history)
        print(f"Generated response: {response}")  # Debug logging
        
        # Add to conversation history
        conversation_entry = {
            'user': user_message,
            'bot': response['message'],
            'kural': response['kural'],
            'timestamp': datetime.now().isoformat()
        }
        
        return jsonify({
            'response': response['message'],
            'kural': response['kural'],
            'follow_up': response['follow_up'],
            'conversation_entry': conversation_entry
        })
        
    except Exception as e:
        print(f"Error in chat endpoint: {str(e)}")  # Debug logging
        import traceback
        traceback.print_exc()  # Print full traceback
        return jsonify({
            'error': 'Internal server error',
            'details': str(e)
        }), 500

@app.route('/api/emotions', methods=['GET'])
def get_emotions():
    """Get available emotions for suggestions"""
    return jsonify({
        'emotions': list(KURALS_DATABASE.keys())
    })

@app.route('/api/kurals/<emotion>', methods=['GET'])
def get_kurals_by_emotion(emotion):
    """Get Kurals by specific emotion"""
    if emotion in KURALS_DATABASE:
        return jsonify({
            'emotion': emotion,
            'kurals': KURALS_DATABASE[emotion]
        })
    else:
        return jsonify({
            'error': 'Emotion not found'
        }), 404

@app.route('/api/random', methods=['GET'])
def get_random_kural():
    """Get a random Kural"""
    all_kurals = []
    for emotion, kurals in KURALS_DATABASE.items():
        for kural in kurals:
            kural_copy = kural.copy()
            kural_copy['emotion'] = emotion
            all_kurals.append(kural_copy)
    
    random_kural = random.choice(all_kurals)
    return jsonify(random_kural)

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'Thirukkural.Ai API is running',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/quiz/submit', methods=['POST'])
def submit_quiz():
    """Submit quiz answers and store them"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        answers = data.get('answers', {})
        if not answers:
            return jsonify({'error': 'No answers provided'}), 400
        
        # Generate unique session ID
        session_id = str(uuid.uuid4())
        
        # Create quiz response record
        quiz_response = {
            'session_id': session_id,
            'answers': answers,
            'timestamp': datetime.now().isoformat(),
            'total_questions': len(answers)
        }
        
        # Store in memory (in production, save to database)
        quiz_responses.append(quiz_response)
        
        print(f"Quiz submitted: {session_id}")  # Debug logging
        
        print(quiz_responses)
        return jsonify({
            'success': True,
            'session_id': session_id,
            'message': 'Quiz answers submitted successfully',
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        print(f"Error in quiz submission: {str(e)}")
        return jsonify({
            'error': 'Internal server error',
            'details': str(e)
        }), 500

@app.route('/api/quiz/responses', methods=['GET'])
def get_quiz_responses():
    """Get all quiz responses (for analytics)"""
    try:
        return jsonify({
            'success': True,
            'total_responses': len(quiz_responses),
            'responses': quiz_responses,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({
            'error': 'Internal server error',
            'details': str(e)
        }), 500

@app.route('/api/quiz/responses/<session_id>', methods=['GET'])
def get_quiz_response(session_id):
    """Get specific quiz response by session ID"""
    try:
        response = next((r for r in quiz_responses if r['session_id'] == session_id), None)
        if not response:
            return jsonify({'error': 'Quiz response not found'}), 404
        
        return jsonify({
            'success': True,
            'response': response
        })
    except Exception as e:
        return jsonify({
            'error': 'Internal server error',
            'details': str(e)
        }), 500

@app.route('/api/quiz/analytics', methods=['GET'])
def get_quiz_analytics():
    """Get quiz analytics and insights"""
    try:
        if not quiz_responses:
            return jsonify({
                'success': True,
                'total_responses': 0,
                'analytics': {
                    'total_responses': 0,
                    'average_completion_time': 0,
                    'most_common_answers': {},
                    'personality_distribution': {}
                }
            })
        
        # Calculate analytics
        total_responses = len(quiz_responses)
        
        # Count answer frequencies
        answer_counts = {}
        personality_counts = {}
        
        for response in quiz_responses:
            answers = response['answers']
            for question_id, answer in answers.items():
                key = f"Q{question_id}_{answer}"
                answer_counts[key] = answer_counts.get(key, 0) + 1
            
            # Analyze personality type (simplified)
            wisdom_count = sum(1 for q, a in answers.items() if a in ['A'] and int(q) in [1, 2, 3, 4, 5])
            compassion_count = sum(1 for q, a in answers.items() if a in ['B'] and int(q) in [1, 2, 3, 4, 5])
            strength_count = sum(1 for q, a in answers.items() if a in ['C'] and int(q) in [1, 2, 3, 4, 5])
            harmony_count = sum(1 for q, a in answers.items() if a in ['D'] and int(q) in [1, 2, 3, 4, 5])
            
            if wisdom_count >= max(compassion_count, strength_count, harmony_count):
                personality_type = 'The Wise Seeker'
            elif compassion_count >= max(wisdom_count, strength_count, harmony_count):
                personality_type = 'The Compassionate Heart'
            elif strength_count >= max(wisdom_count, compassion_count, harmony_count):
                personality_type = 'The Strong Leader'
            else:
                personality_type = 'The Peaceful Soul'
            
            personality_counts[personality_type] = personality_counts.get(personality_type, 0) + 1
        
        return jsonify({
            'success': True,
            'analytics': {
                'total_responses': total_responses,
                'answer_frequencies': answer_counts,
                'personality_distribution': personality_counts,
                'timestamp': datetime.now().isoformat()
            }
        })
        
    except Exception as e:
        return jsonify({
            'error': 'Internal server error',
            'details': str(e)
        }), 500

@app.route('/api/feedback/submit', methods=['POST'])
def submit_feedback():
    """Submit user feedback for bot responses"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        user_message = data.get('userMessage', '')
        bot_response = data.get('botResponse', '')
        kural = data.get('kural', {})
        feedback = data.get('feedback', '')  # 'positive' or 'negative'
        timestamp = data.get('timestamp', datetime.now().isoformat())
        
        if not feedback or feedback not in ['positive', 'negative']:
            return jsonify({'error': 'Invalid feedback type'}), 400
        
        # Generate unique feedback ID
        feedback_id = str(uuid.uuid4())
        
        # Create feedback record
        feedback_record = {
            'feedback_id': feedback_id,
            'user_message': user_message,
            'bot_response': bot_response,
            'kural': kural,
            'feedback': feedback,
            'timestamp': timestamp
        }
        
        # Store in memory (in production, save to database)
        feedback_responses.append(feedback_record)
        
        print(f"Feedback submitted: {feedback_id} - {feedback}")  # Debug logging
        
        return jsonify({
            'success': True,
            'feedback_id': feedback_id,
            'message': 'Feedback submitted successfully',
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        print(f"Error in feedback submission: {str(e)}")
        return jsonify({
            'error': 'Internal server error',
            'details': str(e)
        }), 500

@app.route('/api/feedback/responses', methods=['GET'])
def get_feedback_responses():
    """Get all feedback responses (for analytics)"""
    try:
        return jsonify({
            'success': True,
            'total_feedback': len(feedback_responses),
            'feedback': feedback_responses,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({
            'error': 'Internal server error',
            'details': str(e)
        }), 500

@app.route('/api/feedback/analytics', methods=['GET'])
def get_feedback_analytics():
    """Get feedback analytics and insights"""
    try:
        if not feedback_responses:
            return jsonify({
                'success': True,
                'total_feedback': 0,
                'analytics': {
                    'positive_feedback': 0,
                    'negative_feedback': 0,
                    'feedback_rate': 0,
                    'most_helpful_kurals': []
                }
            })
        
        # Calculate analytics
        total_feedback = len(feedback_responses)
        positive_count = sum(1 for f in feedback_responses if f['feedback'] == 'positive')
        negative_count = sum(1 for f in feedback_responses if f['feedback'] == 'negative')
        
        # Count Kural feedback
        kural_feedback = {}
        for feedback in feedback_responses:
            if feedback['kural'] and 'tamil' in feedback['kural']:
                kural_text = feedback['kural']['tamil']
                if kural_text not in kural_feedback:
                    kural_feedback[kural_text] = {'positive': 0, 'negative': 0}
                kural_feedback[kural_text][feedback['feedback']] += 1
        
        # Find most helpful Kurals
        most_helpful = sorted(
            kural_feedback.items(),
            key=lambda x: x[1]['positive'] - x[1]['negative'],
            reverse=True
        )[:5]
        
        return jsonify({
            'success': True,
            'analytics': {
                'total_feedback': total_feedback,
                'positive_feedback': positive_count,
                'negative_feedback': negative_count,
                'feedback_rate': round((positive_count / total_feedback) * 100, 2) if total_feedback > 0 else 0,
                'most_helpful_kurals': most_helpful,
                'timestamp': datetime.now().isoformat()
            }
        })
        
    except Exception as e:
        return jsonify({
            'error': 'Internal server error',
            'details': str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
