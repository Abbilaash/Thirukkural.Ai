const API_BASE_URL = 'http://localhost:5000/api';

export const chatApi = {
  // Send a message to the chat API
  async sendMessage(message, history = []) {
    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          history
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Get available emotions
  async getEmotions() {
    try {
      const response = await fetch(`${API_BASE_URL}/emotions`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching emotions:', error);
      throw error;
    }
  },

  // Get Kurals by emotion
  async getKuralsByEmotion(emotion) {
    try {
      const response = await fetch(`${API_BASE_URL}/kurals/${emotion}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching kurals:', error);
      throw error;
    }
  },

  // Get a random Kural
  async getRandomKural() {
    try {
      const response = await fetch(`${API_BASE_URL}/random`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching random kural:', error);
      throw error;
    }
  },

  // Health check
  async healthCheck() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error checking health:', error);
      throw error;
    }
  },

  // Quiz API endpoints
  async submitQuiz(answers) {
    try {
      const response = await fetch(`${API_BASE_URL}/quiz/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error submitting quiz:', error);
      throw error;
    }
  },

  async getQuizResponses() {
    try {
      const response = await fetch(`${API_BASE_URL}/quiz/responses`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching quiz responses:', error);
      throw error;
    }
  },

  async getQuizResponse(sessionId) {
    try {
      const response = await fetch(`${API_BASE_URL}/quiz/responses/${sessionId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching quiz response:', error);
      throw error;
    }
  },

  async getQuizAnalytics() {
    try {
      const response = await fetch(`${API_BASE_URL}/quiz/analytics`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching quiz analytics:', error);
      throw error;
    }
  },

  // Feedback API endpoints
  async submitFeedback(feedbackData) {
    try {
      const response = await fetch(`${API_BASE_URL}/feedback/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw error;
    }
  },

  async getFeedbackResponses() {
    try {
      const response = await fetch(`${API_BASE_URL}/feedback/responses`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching feedback responses:', error);
      throw error;
    }
  },

  async getFeedbackAnalytics() {
    try {
      const response = await fetch(`${API_BASE_URL}/feedback/analytics`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching feedback analytics:', error);
      throw error;
    }
  }
};
