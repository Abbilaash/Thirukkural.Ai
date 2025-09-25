import { QuizAnswers } from '../App';

export interface PersonalityResult {
  type: string;
  description: string;
  traits: string[];
}

export const analyzePersonality = (answers: QuizAnswers): PersonalityResult => {
  // Simple scoring system based on answer patterns
  let wisdom = 0;
  let compassion = 0;
  let strength = 0;
  let harmony = 0;

  Object.entries(answers).forEach(([questionId, answer]) => {
    const qId = parseInt(questionId);
    
    switch (qId) {
      case 1: // Decision making
        if (answer === 'A') wisdom += 2;
        if (answer === 'B') compassion += 2;
        if (answer === 'D') harmony += 1;
        break;
      case 2: // Handle criticism
        if (answer === 'A') wisdom += 2;
        if (answer === 'B') compassion += 1;
        break;
      case 3: // Value in people
        if (answer === 'A') wisdom += 2;
        if (answer === 'D') compassion += 2;
        break;
      case 4: // When wronged
        if (answer === 'A') compassion += 2;
        if (answer === 'B') wisdom += 1;
        break;
      case 5: // Quality
        if (answer === 'A') strength += 2;
        if (answer === 'B') harmony += 2;
        break;
      // Add more scoring logic for other questions
      default:
        // Default scoring
        if (answer === 'A') wisdom += 1;
        if (answer === 'B') compassion += 1;
        if (answer === 'C') strength += 1;
        if (answer === 'D') harmony += 1;
    }
  });

  // Determine dominant personality type
  const scores = { wisdom, compassion, strength, harmony };
  const maxScore = Math.max(...Object.values(scores));
  
  if (wisdom === maxScore) {
    return {
      type: 'The Wise Seeker',
      description: 'You value knowledge, truth, and ethical decision-making',
      traits: ['Analytical', 'Ethical', 'Thoughtful']
    };
  } else if (compassion === maxScore) {
    return {
      type: 'The Compassionate Heart',
      description: 'You prioritize relationships, empathy, and understanding',
      traits: ['Empathetic', 'Kind', 'Understanding']
    };
  } else if (strength === maxScore) {
    return {
      type: 'The Strong Leader',
      description: 'You embody courage, determination, and leadership',
      traits: ['Courageous', 'Determined', 'Leadership']
    };
  } else {
    return {
      type: 'The Peaceful Soul',
      description: 'You seek balance, harmony, and inner peace',
      traits: ['Balanced', 'Peaceful', 'Harmonious']
    };
  }
};

export const getRandomKuralByPersonality = (personalityType: string) => {
  const kuralsByType = {
    'The Wise Seeker': [
      {
        tamil: "அறிவுடையார் எல்லாம் உடையார் அறிவிலார் என்னுடையார் என்னும் இல்",
        english: "Those with wisdom have everything; those without wisdom have nothing, even if they possess much",
        emotion: "Wisdom",
        relevance: "True wealth comes from knowledge and understanding, not material possessions"
      }
    ],
    'The Compassionate Heart': [
      {
        tamil: "அன்பின் வழியது உயிர்நிலை அஃதிலார்க்கு என்புதோல் போர்த்த உடம்பு",
        english: "Love is the way of life; without it, the body is just bones covered with skin",
        emotion: "Love",
        relevance: "Compassion and love give meaning to our existence and relationships"
      }
    ],
    'The Strong Leader': [
      {
        tamil: "தன்னை அடக்கி தன்னை வென்றார் தன்னை அடக்கி வெல்லும் உலகு",
        english: "Those who conquer themselves can conquer the world",
        emotion: "Self-discipline",
        relevance: "True leadership begins with mastering oneself before leading others"
      }
    ],
    'The Peaceful Soul': [
      {
        tamil: "நிறைமொழி மாந்தர் பெருமை நிலத்து வழி நடக்கும் வழி",
        english: "The greatness of noble people is the path that guides the world",
        emotion: "Peace",
        relevance: "Living with integrity creates harmony and shows others the way forward"
      }
    ]
  };

  const kurals = kuralsByType[personalityType as keyof typeof kuralsByType] || kuralsByType['The Wise Seeker'];
  return kurals[Math.floor(Math.random() * kurals.length)];
};