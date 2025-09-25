import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PersonalityQuiz from './components/PersonalityQuiz';
import LandingPage from './components/LandingPage';
import { useTheme } from './hooks/useTheme';

export interface QuizAnswers {
  [key: number]: string;
}

function App() {
  const { theme } = useTheme();
  
  // Check if quiz was completed before
  const [quizCompleted, setQuizCompleted] = useState(() => {
    return localStorage.getItem('quizCompleted') === 'true';
  });
  
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswers>(() => {
    const saved = localStorage.getItem('quizAnswers');
    return saved ? JSON.parse(saved) : {};
  });

  const handleQuizComplete = (answers: QuizAnswers) => {
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
              !quizCompleted ? 
              <PersonalityQuiz onComplete={handleQuizComplete} /> :
              <Navigate to="/explore" replace />
            } 
          />
          <Route 
            path="/explore" 
            element={
              quizCompleted ? 
              <LandingPage quizAnswers={quizAnswers} /> :
              <Navigate to="/" replace />
            } 
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;