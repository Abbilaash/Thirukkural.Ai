"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Heart, 
  Shield, 
  Lightbulb, 
  BookOpen, 
  Users, 
  ArrowRight,
  Sparkles,
  Brain,
  Shuffle,
  User,
  Zap,
  Scale,
  Clock,
  Loader2
} from 'lucide-react';
import { emotionSuggestions, categories, layers } from '../data/emotions';
import { analyzePersonality, getRandomKuralByPersonality } from '../utils/quizLogic';
import { useLanguage } from '../hooks/useLanguage';
import ThemeToggle from './ThemeToggle';
import LanguageToggle from './LanguageToggle';
import { fetchAgentResponse } from '../utils/agentClient';

// Helper function to format Tamil Kural (4 words top, 3 words bottom)
const formatTamilKural = (text: string) => {
  if (!text) return null;
  
  // If it already has newlines, respect them
  if (text.includes('\n')) {
    return (
      <div className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 leading-relaxed font-serif">
        {text.split('\n').map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>
    );
  }

  const words = text.trim().split(/\s+/);
  
  // Standard Kural has 7 words (cir). 
  // We'll try to split 4 and 3.
  if (words.length >= 4) {
    const line1 = words.slice(0, 4).join(' ');
    const line2 = words.slice(4).join(' ');
    return (
      <div className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 leading-relaxed font-serif">
        <p>{line1}</p>
        <p>{line2}</p>
      </div>
    );
  }

  // Fallback for non-standard lengths
  return (
    <p className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 leading-relaxed font-serif">
      {text}
    </p>
  );
};

interface LandingPageProps {
  quizAnswers: Record<string, string>;
  onRetakeQuiz: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ quizAnswers, onRetakeQuiz }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [randomKural, setRandomKural] = useState<any>(null);
  const [agentResponse, setAgentResponse] = useState<any>(null);
  const [agentMeta, setAgentMeta] = useState<any>(null);
  const [agentError, setAgentError] = useState('');
  const [agentLoading, setAgentLoading] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const { language } = useLanguage();
  
  const personality = analyzePersonality(quizAnswers);

  const handleSurpriseMe = () => {
    const kural = getRandomKuralByPersonality(personality.type);
    setRandomKural(kural);
  };

  const handleEmotionClick = (emotion: string) => {
    setSearchQuery(emotion);
    setAgentError('');
  };

  const handleAgentRequest = async () => {
    if (!searchQuery.trim()) {
      setAgentError('Please describe how you feel to receive a personalized Kural.');
      return;
    }

    if (agentLoading) {
      return;
    }

    setAgentError('');
    setAgentLoading(true);
    try {
      const payload = await fetchAgentResponse(searchQuery, personality);
      setAgentResponse(payload.response ?? null);
      setAgentMeta({
        question: payload.question,
        plan: payload.plan,
        retrievedKurals: payload.retrieved_kurals,
        raw: payload.raw_response,
      });
    } catch (error: any) {
      setAgentError(error.message || 'Unable to reach the Thirukkural agent right now.');
      setAgentResponse(null);
      setAgentMeta(null);
    } finally {
      setAgentLoading(false);
    }
  };

  const getIconComponent = (iconName: string) => {
    const icons: Record<string, any> = {
      Heart, Shield, Lightbulb, Users, User, Zap, Scale, Clock
    };
    return icons[iconName] || Heart;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-amber-200 dark:border-gray-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <BookOpen className="w-8 h-8 text-amber-600 dark:text-amber-400 mr-3" />
              <span className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-400 dark:to-orange-400 bg-clip-text text-transparent">
                Thirukkural.Ai
              </span>
            </div>
            <div className="flex items-center space-x-6">
              <LanguageToggle variant="header" />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl sm:text-6xl font-bold text-gray-800 dark:text-gray-100 mb-6">
              <span className="bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-400 dark:to-orange-400 bg-clip-text text-transparent">
                Ancient Wisdom.
              </span>
              <br />
              Modern Understanding.
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Explore Thirukkural through emotions, ethics, and values—powered by AI.
              Discover timeless wisdom that speaks to your soul.
            </p>
            
            {/* Personality Result */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 mb-8 max-w-2xl mx-auto border border-amber-200 dark:border-gray-600 relative"
            >
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
                Your Personality: {personality.type}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-3">{personality.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {personality.traits.map((trait, index) => (
                  <span key={index} className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-sm">
                    {trait}
                  </span>
                ))}
              </div>
              <div className="flex justify-end">
                <button 
                  onClick={onRetakeQuiz}
                  className="text-sm text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 font-medium flex items-center transition-colors"
                >
                  <Shuffle className="w-4 h-4 mr-1" />
                  Retake Personality Quiz
                </button>
              </div>
            </motion.div>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="max-w-2xl mx-auto mb-8"
            >
              <div className="relative">
                <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
                <input
                  type="text"
                  placeholder="Type what you feel..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setAgentError('');
                  }}
                  className="w-full pl-16 pr-48 py-4 rounded-2xl border-2 border-amber-200 dark:border-gray-600 focus:border-amber-500 dark:focus:border-amber-400 focus:outline-none text-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-800 dark:text-gray-100"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAgentRequest}
                  disabled={agentLoading}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-amber-500 to-orange-500 dark:from-amber-600 dark:to-orange-600 text-white px-6 py-2 rounded-xl font-medium flex items-center disabled:opacity-60"
                >
                  {agentLoading ? 'Summoning wisdom...' : 'Get My Kural'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </motion.button>
              </div>
              {agentError && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{agentError}</p>}

              <div className="mt-4">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Or choose an emotion:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {emotionSuggestions.map((emotion, index) => (
                    <motion.button
                      key={emotion.value}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 + index * 0.05, duration: 0.3 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleEmotionClick(emotion.text)}
                      className="flex items-center px-3 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full border border-amber-200 dark:border-gray-600 hover:border-amber-300 dark:hover:border-amber-400 transition-colors"
                    >
                      <span className="mr-2">{emotion.emoji}</span>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{emotion.text}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSurpriseMe}
                className="mt-4 bg-gradient-to-r from-purple-500 to-pink-500 dark:from-purple-600 dark:to-pink-600 text-white px-6 py-3 rounded-xl font-medium flex items-center mx-auto"
              >
                <Shuffle className="w-5 h-5 mr-2" />
                Surprise Me
              </motion.button>
            </motion.div>

            {randomKural && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-6 max-w-2xl mx-auto border border-amber-200 dark:border-gray-600"
              >
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 text-amber-700 dark:text-amber-300 rounded-full text-sm font-medium">
                    {randomKural.emotion}
                  </span>
                </div>
                <div className="mb-4">
                  <p className="text-gray-800 dark:text-gray-100 font-serif text-lg mb-2">
                    {language === 'tamil' ? randomKural.tamil : randomKural.english}
                  </p>
                  {language === 'tamil' && <p className="text-gray-600 dark:text-gray-300 font-medium">{randomKural.english}</p>}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">{randomKural.relevance}</p>
              </motion.div>
            )}

            {agentLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-6 max-w-3xl mx-auto border border-amber-200 dark:border-gray-600 flex items-center justify-center space-x-3"
              >
                <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
                <p className="text-gray-700 dark:text-gray-200 text-sm sm:text-base">Consulting Thiruvalluvar...</p>
              </motion.div>
            )}

            {agentResponse && !agentLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-8 max-w-4xl mx-auto border border-amber-200 dark:border-gray-600 text-left"
              >
                {/* Summary Section */}
                <div className="mb-10 text-center">
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4 leading-tight">
                    {agentResponse.summary}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Based on your query: <span className="italic">"{agentMeta?.question}"</span>
                  </p>
                </div>

                {/* Kurals Section */}
                <div className="grid gap-8 mb-10">
                  {agentResponse.kurals?.map((kural: any) => (
                    <div 
                      key={kural.kural_id} 
                      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-amber-100 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-shadow duration-300"
                    >
                      <div className="bg-amber-50 dark:bg-amber-900/20 px-6 py-3 border-b border-amber-100 dark:border-amber-800 flex justify-between items-center">
                        <span className="font-bold text-amber-700 dark:text-amber-400 flex items-center">
                          <BookOpen className="w-4 h-4 mr-2" />
                          Kural {kural.kural_id}
                        </span>
                        <span className="text-xs text-amber-600 dark:text-amber-500 uppercase tracking-wider font-medium">
                          {kural.virtue} • {kural.theme}
                        </span>
                      </div>
                      <div className="p-6 sm:p-8 text-center">
                        {/* Tamil Text with 4-3 split */}
                        <div className="mb-6">
                          {formatTamilKural(kural.tamil)}
                        </div>
                        {/* English Text */}
                        <p className="text-gray-600 dark:text-gray-300 italic font-serif text-lg leading-relaxed">
                          "{kural.english}"
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actions Section */}
                {agentResponse.actions && (
                  <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-6 sm:p-8 border border-gray-200 dark:border-gray-700 mb-8">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-6 flex items-center">
                      <Sparkles className="w-5 h-5 text-amber-500 mr-2" />
                      Actionable Guidance
                    </h4>
                    <div className="grid md:grid-cols-2 gap-6">
                      {Object.entries(agentResponse.actions).map(([key, value]) => (
                        <div key={key} className="flex items-start">
                          <div className="mt-1 mr-3 min-w-[20px]">
                            <div className="w-2 h-2 rounded-full bg-amber-400 mt-2"></div>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1 font-semibold">
                              {key.replace(/_/g, ' ')}
                            </p>
                            <p className="text-gray-700 dark:text-gray-200 leading-relaxed">
                              {value as string}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Analysis Details Toggle */}
                <div className="text-center">
                  <button
                    onClick={() => setShowAnalysis(!showAnalysis)}
                    className="text-sm text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-medium focus:outline-none transition-colors"
                  >
                    {showAnalysis ? 'Hide Analysis Details' : 'View Analysis Details'}
                  </button>
                </div>

                {/* Collapsible Analysis Section */}
                {showAnalysis && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700"
                  >
                    {(() => {
                      const planDetails = agentMeta?.plan ?? {};
                      const likelyNeeds = Array.isArray(planDetails.likely_needs) ? planDetails.likely_needs : [];
                      const actionOutline = Array.isArray(planDetails.action_outline) ? planDetails.action_outline : [];
                      const retrievedCount = agentMeta?.retrievedKurals?.length ?? 0;

                      return (
                        <div className="grid gap-4 md:grid-cols-3 text-sm">
                          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                            <h5 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Planner Insight</h5>
                            <p className="text-gray-600 dark:text-gray-400 mb-2">{planDetails.situation_summary}</p>
                            {planDetails.emotional_tone && (
                              <p className="text-xs text-gray-500">Tone: {planDetails.emotional_tone}</p>
                            )}
                          </div>
                          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                            <h5 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Retrieval Stats</h5>
                            <p className="text-gray-600 dark:text-gray-400">
                              {retrievedCount} Kurals retrieved.
                            </p>
                            {agentMeta?.retrievedKurals && (
                              <ul className="mt-2 space-y-1 text-xs text-gray-500">
                                {agentMeta.retrievedKurals.slice(0, 3).map((item: any) => (
                                  <li key={item.kural_id}>#{item.kural_id} (Score: {item.score})</li>
                                ))}
                              </ul>
                            )}
                          </div>
                          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                            <h5 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Blueprint</h5>
                            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
                              {actionOutline.slice(0, 3).map((step: string, i: number) => (
                                <li key={i}>{step}</li>
                              ))}
                              {actionOutline.length > 3 && <li>...</li>}
                            </ul>
                          </div>
                        </div>
                      );
                    })()}
                  </motion.div>
                )}
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              How It Works
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Three simple steps to discover your perfect Kural
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              whileHover={{ scale: 1.05 }}
              className="text-center p-6"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-amber-400 to-orange-400 dark:from-amber-500 dark:to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                1. Complete Personality Quiz
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Answer 15 questions to understand your values and personality type
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              whileHover={{ scale: 1.05 }}
              className="text-center p-6"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-amber-400 to-orange-400 dark:from-amber-500 dark:to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                2. Search by Feeling
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Type what you're experiencing or use our "Surprise Me" feature
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              whileHover={{ scale: 1.05 }}
              className="text-center p-6"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-amber-400 to-orange-400 dark:from-amber-500 dark:to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                3. Discover Matching Kural
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Receive a personalized Kural with modern context and ethical insights
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Explore by Categories */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              Explore by Categories
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Browse Kurals by themes that matter to you
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <motion.button
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-amber-100 dark:border-gray-600 text-center hover:shadow-xl transition-all"
              >
                {React.createElement(getIconComponent(category.icon), {
                  className: "w-12 h-12 text-amber-600 dark:text-amber-400 mx-auto mb-3"
                })}
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  {category.count} Kurals
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {category.description}
                </p>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Explore by Values */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              Explore by Values
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Dive deeper into specific virtues and emotions
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {layers.map((layer, index) => (
              <motion.button
                key={layer.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-amber-100 dark:border-gray-600 text-left hover:shadow-xl transition-all"
              >
                {React.createElement(getIconComponent(layer.icon), {
                  className: "w-10 h-10 text-amber-600 dark:text-amber-400 mb-3"
                })}
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
                  {layer.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {layer.description}
                </p>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 dark:bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <BookOpen className="w-6 h-6 text-amber-400 dark:text-amber-300 mr-2" />
                <span className="text-xl font-bold">Thirukkural.Ai</span>
              </div>
              <p className="text-gray-400 dark:text-gray-300">
                Bridging ancient wisdom with modern understanding through AI and semantic technology.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Explore</h4>
              <ul className="space-y-2 text-gray-400 dark:text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">By Emotions</a></li>
                <li><a href="#" className="hover:text-white transition-colors">By Ethics</a></li>
                <li><a href="#" className="hover:text-white transition-colors">By Themes</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Random Kural</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400 dark:text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">API Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Research Papers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Methodology</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Citations</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-gray-400 dark:text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">GitHub</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Feedback</a></li>
                <li><LanguageToggle variant="footer" /></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 dark:border-gray-600 mt-8 pt-8 text-center text-gray-400 dark:text-gray-300">
            <p>&copy; 2025 Thirukkural.Ai. Made with ❤️ for preserving Tamil wisdom.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
