"use client";
import { useState, useEffect } from 'react';
import LandingPage from '@/components/LandingPage';
import PersonalityQuiz from '@/components/PersonalityQuiz';

export default function Home() {
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('quizCompleted');
    if (saved === 'true') {
      const savedAnswers = localStorage.getItem('quizAnswers');
      if (savedAnswers) {
        setQuizAnswers(JSON.parse(savedAnswers));
        setQuizCompleted(true);
      }
    }
  }, []);

  const handleQuizComplete = (answers: Record<string, string>) => {
    setQuizAnswers(answers);
    setQuizCompleted(true);
    localStorage.setItem('quizCompleted', 'true');
    localStorage.setItem('quizAnswers', JSON.stringify(answers));
  };

  const handleRetakeQuiz = () => {
    setQuizCompleted(false);
    setQuizAnswers(null);
    localStorage.removeItem('quizCompleted');
    localStorage.removeItem('quizAnswers');
  };

  return (
    <main>
      {!quizCompleted ? (
        <PersonalityQuiz onComplete={handleQuizComplete} />
      ) : (
        <LandingPage quizAnswers={quizAnswers || {}} onRetakeQuiz={handleRetakeQuiz} />
      )}
    </main>
  );
}
