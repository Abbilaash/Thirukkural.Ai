import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { QuizAnswers } from '../App';
import ThemeToggle from './ThemeToggle';

interface Question {
  id: number;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
}

const questions: Question[] = [
  {
    id: 1,
    question: "How do you usually make decisions?",
    options: {
      A: "Based on logic and facts",
      B: "Based on emotions and relationships",
      C: "I ask others for advice",
      D: "I trust my intuition"
    }
  },
  {
    id: 2,
    question: "How do you handle criticism?",
    options: {
      A: "I reflect and try to improve",
      B: "I take it personally",
      C: "I ignore it",
      D: "I defend myself strongly"
    }
  },
  {
    id: 3,
    question: "What do you value most in people?",
    options: {
      A: "Honesty",
      B: "Loyalty",
      C: "Intelligence",
      D: "Kindness"
    }
  },
  {
    id: 4,
    question: "When someone wrongs you, what do you do?",
    options: {
      A: "Forgive and move on",
      B: "Try to understand their side",
      C: "Avoid them",
      D: "Seek revenge"
    }
  },
  {
    id: 5,
    question: "Which quality best describes you?",
    options: {
      A: "Ambitious",
      B: "Peaceful",
      C: "Curious",
      D: "Loyal"
    }
  },
  {
    id: 6,
    question: "How do you usually react in conflicts?",
    options: {
      A: "I try to calm things down",
      B: "I avoid the situation",
      C: "I stand up firmly",
      D: "I try to find a compromise"
    }
  },
  {
    id: 7,
    question: "How important is self-discipline in your life?",
    options: {
      A: "Extremely important – I follow routines strictly",
      B: "Somewhat – I try, but not always",
      C: "Not much – I go with the flow",
      D: "I rely on motivation rather than discipline"
    }
  },
  {
    id: 8,
    question: "How do you handle failure?",
    options: {
      A: "I learn from it and move on",
      B: "I feel disappointed for long",
      C: "I try something else immediately",
      D: "I blame external factors"
    }
  },
  {
    id: 9,
    question: "What kind of leader would you be?",
    options: {
      A: "Fair and just",
      B: "Inspiring and motivational",
      C: "Strategic and calculating",
      D: "Friendly and approachable"
    }
  },
  {
    id: 10,
    question: "Which of these do you fear most?",
    options: {
      A: "Dishonor",
      B: "Loneliness",
      C: "Poverty",
      D: "Failure"
    }
  },
  {
    id: 11,
    question: "What do you do with spare time?",
    options: {
      A: "Reflect or meditate",
      B: "Help others",
      C: "Learn new things",
      D: "Relax and entertain myself"
    }
  },
  {
    id: 12,
    question: "How do you approach love?",
    options: {
      A: "Deep and committed",
      B: "Cautious but open",
      C: "Practical and balanced",
      D: "Passionate and intense"
    }
  },
  {
    id: 13,
    question: "Do you believe in destiny or effort?",
    options: {
      A: "Effort – I create my path",
      B: "A mix of both",
      C: "Destiny – what's meant to happen will",
      D: "I don't think much about it"
    }
  },
  {
    id: 14,
    question: "If you find money on the road, what will you do?",
    options: {
      A: "Try to find the owner or report it",
      B: "Leave it there",
      C: "Take it if no one's around",
      D: "Donate it"
    }
  },
  {
    id: 15,
    question: "How do you want to be remembered?",
    options: {
      A: "As someone wise and honest",
      B: "As someone who made a difference",
      C: "As someone strong and successful",
      D: "As someone who brought joy to others"
    }
  }
];

interface PersonalityQuizProps {
  onComplete: (answers: QuizAnswers) => void;
}

const PersonalityQuiz: React.FC<PersonalityQuizProps> = ({ onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});

  const handleAnswerChange = (questionId: number, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleFinish = () => {
    onComplete(answers);
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentQ = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 transition-colors">
      {/* Theme Toggle */}
      <div className="fixed top-4 right-4 z-10">
        <ThemeToggle />
      </div>
      
      <div className="w-full max-w-2xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8 text-amber-600 dark:text-amber-400 mr-3" />
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Personality Discovery</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 max-w-lg mx-auto">
            Before we begin, answer a few questions so we can recommend a Kural that reflects your personality.
          </p>
        </motion.div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-2">
            <span>Question {currentQuestion + 1} of {questions.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-amber-500 to-orange-500 dark:from-amber-600 dark:to-orange-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-6 border border-amber-100 dark:border-gray-600"
          >
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-6">
              {currentQ.question}
            </h2>

            <div className="space-y-4">
              {Object.entries(currentQ.options).map(([key, value]) => (
                <motion.label
                  key={key}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    answers[currentQ.id] === key
                      ? 'border-amber-500 dark:border-amber-400 bg-amber-50 dark:bg-amber-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-amber-300 dark:hover:border-amber-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQ.id}`}
                    value={key}
                    checked={answers[currentQ.id] === key}
                    onChange={() => handleAnswerChange(currentQ.id, key)}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded-full border-2 mr-4 flex items-center justify-center ${
                    answers[currentQ.id] === key
                      ? 'border-amber-500 dark:border-amber-400 bg-amber-500 dark:bg-amber-400'
                      : 'border-gray-300 dark:border-gray-500'
                  }`}>
                    {answers[currentQ.id] === key && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <span className="text-gray-700 dark:text-gray-200 font-medium">{key}.</span>
                  <span className="text-gray-600 dark:text-gray-300 ml-2">{value}</span>
                </motion.label>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all ${
              currentQuestion === 0
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-lg border border-gray-200 dark:border-gray-600'
            }`}
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Previous
          </motion.button>

          {currentQuestion === questions.length - 1 ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleFinish}
              disabled={!answers[currentQ.id]}
              className={`px-8 py-3 rounded-xl font-medium transition-all ${
                answers[currentQ.id]
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 dark:from-amber-600 dark:to-orange-600 text-white shadow-lg hover:shadow-xl'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              }`}
            >
              Finish & Explore
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNext}
              disabled={!answers[currentQ.id]}
              className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all ${
                answers[currentQ.id]
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 dark:from-amber-600 dark:to-orange-600 text-white shadow-lg hover:shadow-xl'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              }`}
            >
              Next
              <ChevronRight className="w-5 h-5 ml-2" />
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonalityQuiz;