import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PersonalityQuiz from './components/PersonalityQuiz.jsx';
import LandingPage from './components/LandingPage.jsx';
import { useTheme } from './hooks/useTheme.js';
import { chatApi } from './services/chatApi.js';

function App() {
  const { theme } = useTheme();

  const [quizCompleted, setQuizCompleted] = useState(() => {
    return localStorage.getItem('quizCompleted') === 'true';
  });

  const [quizAnswers, setQuizAnswers] = useState(() => {
    const saved = localStorage.getItem('quizAnswers');
    return saved ? JSON.parse(saved) : {};
  });

  const handleQuizComplete = async (answers) => {
    try {
      // Submit quiz answers to backend
      const response = await chatApi.submitQuiz(answers);
      console.log('Quiz submitted successfully:', response);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      // Continue with local storage even if API fails
    }
    
    // Update local state and storage
    setQuizAnswers(answers);
    setQuizCompleted(true);
    localStorage.setItem('quizCompleted', 'true');
    localStorage.setItem('quizAnswers', JSON.stringify(answers));
  };

  return (
    <div className={theme}>
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              !quizCompleted ? (
                <PersonalityQuiz onComplete={handleQuizComplete} />
              ) : (
                <Navigate to="/explore" replace />
              )
            }
          />
          <Route
            path="/explore"
            element={
              quizCompleted ? (
                <LandingPage quizAnswers={quizAnswers} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;


