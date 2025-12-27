export interface Personality {
  type: string;
  description: string;
  traits: string[];
}

const SCORING_MAP: Record<number, Record<string, Partial<Record<string, number>>>> = {
  1: { A: { wisdom: 2 }, B: { compassion: 2 }, C: { harmony: 2 }, D: { strength: 2 } },
  2: { A: { wisdom: 2 }, B: { compassion: 1 }, C: { harmony: 1 }, D: { ego: 3, strength: 1 } },
  3: { A: { wisdom: 2 }, B: { strength: 2 }, C: { wisdom: 1 }, D: { compassion: 2 } },
  4: { A: { harmony: 2, compassion: 1 }, B: { compassion: 2, wisdom: 1 }, C: { harmony: 1 }, D: { ego: 3, strength: 1 } },
  5: { A: { strength: 2, ego: 1 }, B: { harmony: 2 }, C: { wisdom: 2 }, D: { compassion: 2 } },
  6: { A: { harmony: 2 }, B: { harmony: 1 }, C: { strength: 2 }, D: { wisdom: 2 } },
  7: { A: { strength: 2 }, B: { compassion: 1 }, C: { harmony: 1 }, D: { ego: 1 } },
  8: { A: { wisdom: 2 }, B: { compassion: 1 }, C: { strength: 2 }, D: { ego: 2 } },
  9: { A: { wisdom: 2 }, B: { compassion: 2 }, C: { ego: 2, strength: 1 }, D: { harmony: 2 } },
  10: { A: { ego: 2 }, B: { compassion: 2 }, C: { strength: 1 }, D: { wisdom: 1 } },
  11: { A: { wisdom: 2 }, B: { compassion: 2 }, C: { wisdom: 1 }, D: { harmony: 2 } },
  12: { A: { compassion: 2 }, B: { wisdom: 1 }, C: { harmony: 1 }, D: { strength: 2 } },
  13: { A: { strength: 2, ego: 1 }, B: { wisdom: 1 }, C: { harmony: 2 }, D: { harmony: 1 } },
  14: { A: { wisdom: 2, compassion: 1 }, B: { harmony: 1 }, C: { ego: 2 }, D: { compassion: 2 } },
  15: { A: { wisdom: 2 }, B: { compassion: 2 }, C: { ego: 2, strength: 2 }, D: { harmony: 2 } },
};

export const analyzePersonality = (answers: Record<string, string>): Personality => {
  let wisdom = 0;
  let compassion = 0;
  let strength = 0;
  let harmony = 0;
  let ego = 0;

  Object.entries(answers).forEach(([questionId, answer]) => {
    const qId = parseInt(questionId, 10);
    const map = SCORING_MAP[qId];
    if (map && map[answer]) {
      const scores = map[answer];
      if (scores.wisdom) wisdom += scores.wisdom;
      if (scores.compassion) compassion += scores.compassion;
      if (scores.strength) strength += scores.strength;
      if (scores.harmony) harmony += scores.harmony;
      if (scores.ego) ego += scores.ego;
    }
  });

  const scores = { wisdom, compassion, strength, harmony, ego };
  const maxScore = Math.max(...Object.values(scores));

  if (ego === maxScore || (ego > 5 && ego >= strength)) {
    return {
      type: 'The Ambitious Achiever',
      description: 'You are driven by success, status, and personal victory. Be mindful of pride.',
      traits: ['Ambitious', 'Prideful', 'Determined']
    };
  } else if (wisdom === maxScore) {
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
  const kuralsByType: Record<string, any[]> = {
    'The Ambitious Achiever': [
      {
        tamil: "குணம்நாடிக் குற்றமும் நாடி அவற்றுள் மிகைநாடி மிக்க கொளல்",
        english: "Weigh well the good and weigh well the bad; judge by that which prevails",
        emotion: "Caution",
        relevance: "Ambition must be tempered with judgment; see the whole picture, not just the victory."
      }
    ],
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

  const kurals = kuralsByType[personalityType] || kuralsByType['The Wise Seeker'];
  return kurals[Math.floor(Math.random() * kurals.length)];
};
