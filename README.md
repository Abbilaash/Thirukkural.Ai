# Thirukkural.Ai - Ancient Wisdom, Modern Understanding

A React-based web application that bridges ancient Tamil wisdom (Thirukkural) with modern AI technology, providing personalized guidance through an intelligent chat interface.

## 🌟 Features

### Frontend (React + Vite)
- **Personality Quiz**: 15-question assessment to understand user values and personality type
- **Interactive Chat Interface**: AI-powered chat that expands from the search input
- **Emotion-Based Kural Discovery**: Find relevant wisdom based on current emotions
- **Multi-language Support**: Tamil and English language toggle
- **Dark/Light Theme**: Beautiful UI with theme switching
- **Responsive Design**: Works seamlessly on desktop and mobile

### Backend (Flask + Python)
- **Chat API**: Intelligent conversation with emotion detection
- **Kural Database**: Comprehensive collection of Thirukkural with translations
- **Personality Analysis**: AI-driven personality assessment
- **Static Dialogue System**: Pre-built responses for natural conversation flow
- **CORS Support**: Seamless frontend-backend communication

## 🎯 How It Works

### 1. Personality Assessment
Users complete a 15-question quiz that analyzes their values across four dimensions:
- **Wisdom**: Analytical thinking and ethical decision-making
- **Compassion**: Empathy and relationship focus
- **Strength**: Leadership and determination
- **Harmony**: Balance and inner peace

### 2. Chat Interface
When users start typing in the "Type what you feel..." input:
- The interface expands into a full chat experience
- AI detects emotions from user input
- Provides relevant Thirukkural wisdom with explanations
- Maintains conversation history

### 3. Emotion Detection
The system recognizes emotions from user input:
- Joy, Sadness, Anger, Fear
- Love, Forgiveness, Strength, Peace
- Gratitude, Hope, and more

### 4. Kural Matching
Based on detected emotions and personality type, the system provides:
- Original Tamil verses
- English translations
- Modern relevance explanations
- Category-based organization

## 🛠️ API Endpoints

### Chat API
- **POST** `/api/chat` - Send message and get AI response
- **GET** `/api/emotions` - Get available emotions
- **GET** `/api/kurals/<emotion>` - Get Kurals by emotion
- **GET** `/api/random` - Get random Kural
- **GET** `/api/health` - Health check

### Example Chat Request
```json
{
  "message": "I'm feeling sad today",
  "history": []
}
```

### Example Response
```json
{
  "response": "I understand what you're going through. Here's some guidance from ancient wisdom.",
  "kural": {
    "tamil": "துயரம் வளர்க்கும் மனிதனை",
    "english": "Sorrow nurtures the human soul",
    "relevance": "Through sadness, we learn empathy and grow stronger",
    "category": "Emotions"
  },
  "follow_up": "Is there anything specific you'd like to explore further?"
}
```

### API Integration
- RESTful API design with Flask
- CORS enabled for cross-origin requests
- Error handling and loading states
- Conversation history management

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 🙏 Acknowledgments

- **Thirukkural**: Ancient Tamil wisdom by Thiruvalluvar
- **React**: Modern frontend framework
- **Flask**: Lightweight Python web framework
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Animation library

---

**Made with ❤️ for preserving Tamil wisdom and making it accessible to the modern world.**
