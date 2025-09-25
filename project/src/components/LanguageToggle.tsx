import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../hooks/useLanguage';

interface LanguageToggleProps {
  variant?: 'header' | 'footer';
}

const LanguageToggle: React.FC<LanguageToggleProps> = ({ variant = 'header' }) => {
  const { language, toggleLanguage } = useLanguage();

  const baseClasses = variant === 'header' 
    ? "text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors font-medium"
    : "text-gray-400 hover:text-white transition-colors";

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleLanguage}
      className={baseClasses}
    >
      {language === 'tamil' ? 'தமிழ் ⇄ English' : 'Tamil ⇄ English'}
    </motion.button>
  );
};

export default LanguageToggle;