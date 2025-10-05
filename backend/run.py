#!/usr/bin/env python3
"""
Simple script to run the Flask backend server
"""

from app import app

if __name__ == '__main__':
    print("Starting Thirukkural.Ai Backend Server...")
    print("Server will be available at: http://localhost:5000")
    print("API endpoints:")
    print("  - POST /api/chat - Main chat endpoint")
    print("  - GET /api/emotions - Get available emotions")
    print("  - GET /api/kurals/<emotion> - Get Kurals by emotion")
    print("  - GET /api/random - Get random Kural")
    print("  - GET /api/health - Health check")
    print("\nPress Ctrl+C to stop the server")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
