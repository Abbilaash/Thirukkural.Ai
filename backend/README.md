# Thirukkural.Ai Backend

A Flask-based API backend for the Thirukkural.Ai chat application.

## Features

- Chat API with emotion-based Kural suggestions
- Emotion detection from user input
- Static dialogue responses
- CORS enabled for frontend integration
- Health check endpoint

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the Flask application:
```bash
python app.py
```

The API will be available at `http://localhost:5000`

## API Endpoints

### POST /api/chat
Main chat endpoint for processing user messages.

**Request:**
```json
{
  "message": "I'm feeling sad today",
  "history": []
}
```

**Response:**
```json
{
  "response": "I understand what you're going through. Here's some guidance from ancient wisdom.",
  "kural": {
    "tamil": "துயரம் வளர்க்கும் மனிதனை",
    "english": "Sorrow nurtures the human soul",
    "relevance": "Through sadness, we learn empathy and grow stronger",
    "category": "Emotions"
  },
  "follow_up": "Is there anything specific you'd like to explore further?",
  "conversation_entry": {
    "user": "I'm feeling sad today",
    "bot": "I understand what you're going through...",
    "kural": {...},
    "timestamp": "2025-01-27T10:30:00"
  }
}
```

### GET /api/emotions
Get list of available emotions.

### GET /api/kurals/<emotion>
Get Kurals by specific emotion.

### GET /api/random
Get a random Kural.

### GET /api/health
Health check endpoint.

## Development

The backend uses Flask with CORS enabled to allow frontend communication. The chat logic includes:

- Emotion detection from user input
- Static dialogue responses
- Kural database with Tamil and English translations
- Conversation history tracking
