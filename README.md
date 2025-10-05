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

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- Python 3.8 or higher
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Start the Flask server:**
   ```bash
   python run.py
   ```
   
   Or use the provided scripts:
   - Windows: `start.bat`
   - Linux/Mac: `./start.sh`

   The backend will be available at `http://localhost:5000`

### Frontend Setup

1. **Navigate to project directory:**
   ```bash
   cd project
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:5173`

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

## 🎨 UI Components

### Core Components
- **LandingPage**: Main interface with search and chat integration
- **PersonalityQuiz**: 15-question assessment
- **ChatInterface**: Expandable chat window with message history
- **ThemeToggle**: Dark/light mode switching
- **LanguageToggle**: Tamil/English language support

### Styling
- **Tailwind CSS**: Utility-first styling
- **Framer Motion**: Smooth animations and transitions
- **Lucide React**: Beautiful icons
- **Responsive Design**: Mobile-first approach

## 🔧 Development

### Project Structure
```
Thirukkural.Ai/
├── backend/                 # Flask API server
│   ├── app.py              # Main Flask application
│   ├── requirements.txt     # Python dependencies
│   ├── run.py              # Server startup script
│   └── README.md           # Backend documentation
├── project/                # React frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── services/       # API service functions
│   │   ├── hooks/          # Custom React hooks
│   │   ├── data/           # Static data
│   │   └── utils/          # Utility functions
│   ├── package.json        # Node dependencies
│   └── vite.config.ts      # Vite configuration
└── README.md               # This file
```

### Key Features Implementation

#### Chat Interface Expansion
- Input field detects typing and expands chat interface
- Smooth animations using Framer Motion
- Message history with user/bot differentiation
- Kural display with Tamil/English toggle

#### Emotion Detection
- Keyword-based emotion recognition
- Fallback to general wisdom for unrecognized emotions
- Personality-based Kural recommendations

#### API Integration
- RESTful API design with Flask
- CORS enabled for cross-origin requests
- Error handling and loading states
- Conversation history management

## 🌐 Deployment

### Backend Deployment
1. Install dependencies: `pip install -r requirements.txt`
2. Set environment variables if needed
3. Run: `python run.py` or use production WSGI server

### Frontend Deployment
1. Build: `npm run build`
2. Deploy the `dist` folder to your hosting service
3. Update API_BASE_URL in `chatApi.js` for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- **Thirukkural**: Ancient Tamil wisdom by Thiruvalluvar
- **React**: Modern frontend framework
- **Flask**: Lightweight Python web framework
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Animation library

---

**Made with ❤️ for preserving Tamil wisdom and making it accessible to the modern world.**