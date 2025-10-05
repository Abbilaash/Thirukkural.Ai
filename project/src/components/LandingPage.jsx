import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Target,
  Code,
  Shuffle,
  User,
  Zap,
  Scale,
  Clock,
  MessageCircle,
  Send,
  Bot,
  X,
  ThumbsUp,
  ThumbsDown,
  LogOut
} from 'lucide-react';
import { emotionSuggestions, categories, layers } from '../data/emotions.js';
import { analyzePersonality, getRandomKuralByPersonality } from '../utils/quizLogic.js';
import { useLanguage } from '../hooks/useLanguage.js';
import { chatApi } from '../services/chatApi.js';
import ThemeToggle from './ThemeToggle.jsx';
import LanguageToggle from './LanguageToggle.jsx';

const LandingPage = ({ quizAnswers }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [randomKural, setRandomKural] = useState(null);
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const chatInputRef = useRef(null);
  const { language } = useLanguage();

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('quizCompleted');
    localStorage.removeItem('quizAnswers');
    
    // Redirect to quiz
    window.location.href = '/';
  };

  const handleFeedback = async (messageId, feedback) => {
    try {
      const message = messages.find(m => m.id === messageId);
      if (!message) return;

      await chatApi.submitFeedback({
        userMessage: message.userMessage || 'N/A',
        botResponse: message.message,
        kural: message.kural,
        feedback: feedback, // 'positive' or 'negative'
        timestamp: new Date().toISOString()
      });

      // Update the message to show feedback was submitted
      setMessages(prev => prev.map(m => 
        m.id === messageId 
          ? { ...m, feedbackSubmitted: true, feedbackType: feedback }
          : m
      ));
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };
  
  const personality = analyzePersonality(quizAnswers);

  const handleSurpriseMe = () => {
    const kural = getRandomKuralByPersonality(personality.type);
    setRandomKural(kural);
  };

  const handleEmotionClick = (emotion) => {
    setSearchQuery(emotion);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize with welcome message when chat expands
  useEffect(() => {
    if (isChatExpanded && messages.length === 0) {
      setMessages([
        {
          id: 1,
          type: 'bot',
          message: "Hello! I'm here to help you find wisdom through Thirukkural. What's on your mind today?",
          timestamp: new Date()
        }
      ]);
    }
  }, [isChatExpanded, messages.length]);

  // Auto-focus the chat input when chat becomes full screen
  useEffect(() => {
    if (isChatExpanded && chatInputRef.current) {
      // Small delay to ensure the DOM is updated
      setTimeout(() => {
        chatInputRef.current.focus();
        // Move cursor to end of text
        const textarea = chatInputRef.current;
        const length = textarea.value.length;
        textarea.setSelectionRange(length, length);
      }, 100);
    }
  }, [isChatExpanded]);

  const handleSearchInputFocus = () => {
    if (searchQuery.trim()) {
      setIsChatExpanded(true);
    }
  };

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
    if (e.target.value.trim()) {
      setIsChatExpanded(true);
    }
  };

  const handleSendMessage = async () => {
    if (!searchQuery.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      message: searchQuery,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentQuery = searchQuery;
    setSearchQuery('');
    setIsLoading(true);

    try {
      const response = await chatApi.sendMessage(currentQuery, messages);
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        message: response.response,
        kural: response.kural,
        followUp: response.follow_up,
        userMessage: currentQuery, // Store user message for feedback
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        message: "I'm sorry, I'm having trouble connecting right now. Please try again later.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      handleSendMessage();
    }
  };

  const handleChatClose = () => {
    setIsChatExpanded(false);
    setMessages([]);
    setSearchQuery('');
  };

  const getIconComponent = (iconName) => {
    const icons = {
      Heart, Shield, Lightbulb, Users, User, Zap, Scale, Clock
    };
    return icons[iconName] || Heart;
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors ${isChatExpanded ? 'overflow-hidden' : ''}`}>
      {!isChatExpanded ? (
        <>
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
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="flex items-center px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </motion.button>
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
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 mb-8 max-w-2xl mx-auto border border-amber-200 dark:border-gray-600"
            >
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
                Your Personality: {personality.type}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-3">{personality.description}</p>
              <div className="flex flex-wrap gap-2">
                {personality.traits.map((trait, index) => (
                  <span key={index} className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-sm">
                    {trait}
                  </span>
                ))}
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
                  onChange={handleSearchInputChange}
                  onFocus={handleSearchInputFocus}
                  className="w-full pl-16 pr-6 py-4 rounded-2xl border-2 border-amber-200 dark:border-gray-600 focus:border-amber-500 dark:focus:border-amber-400 focus:outline-none text-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-800 dark:text-gray-100"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsChatExpanded(true)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-amber-500 to-orange-500 dark:from-amber-600 dark:to-orange-600 text-white px-6 py-2 rounded-xl font-medium flex items-center"
                >
                  {searchQuery.trim() ? 'Chat with AI' : 'Get My Kural'}
                  {searchQuery.trim() ? <MessageCircle className="w-4 h-4 ml-2" /> : <ArrowRight className="w-4 h-4 ml-2" />}
                </motion.button>
              </div>
              
              {/* Emotion Suggestions */}
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
              
              {/* Surprise Me Button */}
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
            
            {/* Random Kural Display */}
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
                  {language === 'tamil' && (
                    <p className="text-gray-600 dark:text-gray-300 font-medium">
                      {randomKural.english}
                    </p>
                  )}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                  {randomKural.relevance}
                </p>
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

      {/* Featured Kurals */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              Featured Kurals
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Discover how ancient Tamil wisdom applies to modern life
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/** This section uses featuredKurals defined inline in the TS version; keeping behavior */}
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

      {/* Explore by Layers */}
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
        </>
      ) : (
        /* Full Screen Chat Interface */
        <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900 flex flex-col">
          {/* Chat Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-600 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
            <div className="flex items-center">
              <Bot className="w-6 h-6 mr-2" />
              <h3 className="font-semibold">Thirukkural.Ai Chat</h3>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleChatClose}
                className="p-1 hover:bg-white/20 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex items-start space-x-2 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          message.type === 'user' 
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500' 
                            : 'bg-gradient-to-r from-amber-500 to-orange-500'
                        }`}>
                          {message.type === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                        </div>
                        <div className={`rounded-2xl px-4 py-2 ${
                          message.type === 'user'
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100'
                        }`}>
                          <p className="text-sm">{message.message}</p>
                          
                          {/* Kural Display */}
                          {message.kural && (
                            <div className="mt-3 p-3 bg-white/90 dark:bg-gray-800/90 rounded-xl border border-amber-200 dark:border-gray-600">
                              <div className="mb-2">
                                <span className="inline-block px-2 py-1 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 text-amber-700 dark:text-amber-300 rounded-full text-xs font-medium">
                                  {message.kural.category}
                                </span>
                              </div>
                              <div className="mb-2">
                                <p className="text-gray-800 dark:text-gray-100 font-serif text-sm mb-1">
                                  {language === 'tamil' ? message.kural.tamil : message.kural.english}
                                </p>
                                {language === 'tamil' && (
                                  <p className="text-gray-600 dark:text-gray-300 text-xs">
                                    {message.kural.english}
                                  </p>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                                {message.kural.relevance}
                              </p>
                            </div>
                          )}
                          
                                    <div className="flex items-center justify-between mt-2">
                                      <p className="text-xs opacity-70">
                                        {message.timestamp.toLocaleTimeString()}
                                      </p>
                                      
                                      {/* Feedback Buttons - Only for bot messages */}
                                      {message.type === 'bot' && (
                                        <div className="flex items-center space-x-1">
                                          <button
                                            onClick={() => handleFeedback(message.id, 'positive')}
                                            disabled={message.feedbackSubmitted}
                                            className={`p-1 rounded transition-colors ${
                                              message.feedbackSubmitted && message.feedbackType === 'positive'
                                                ? 'text-green-500 bg-green-50 dark:bg-green-900/20'
                                                : 'text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20'
                                            }`}
                                            title="Helpful"
                                          >
                                            <ThumbsUp className="w-3 h-3" />
                                          </button>
                                          <button
                                            onClick={() => handleFeedback(message.id, 'negative')}
                                            disabled={message.feedbackSubmitted}
                                            className={`p-1 rounded transition-colors ${
                                              message.feedbackSubmitted && message.feedbackType === 'negative'
                                                ? 'text-red-500 bg-red-50 dark:bg-red-900/20'
                                                : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                                            }`}
                                            title="Not helpful"
                                          >
                                            <ThumbsDown className="w-3 h-3" />
                                          </button>
                                        </div>
                                      )}
                                    </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="flex items-start space-x-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-600">
                <div className="flex items-end space-x-2">
                  <div className="flex-1">
                    <textarea
                      ref={chatInputRef}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type what you feel..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 focus:border-amber-500 dark:focus:border-amber-400 focus:outline-none resize-none bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-400"
                      rows="1"
                      style={{ minHeight: '48px', maxHeight: '120px' }}
                      onInput={(e) => {
                        e.target.style.height = 'auto';
                        e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                      }}
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSendMessage}
                    disabled={!searchQuery.trim() || isLoading}
                    className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
        </div>
      )}

    </div>
  );
};

export default LandingPage;


