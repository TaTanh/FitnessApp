"""
server.py - Flask REST API for Food Calorie Estimator
Do an Nhap mon Thi Giac May Tinh

Usage:
    cd food_cv
    python server.py

Endpoints:
    GET  /health            - Health check
    POST /predict           - Predict from image file (multipart/form-data)
    POST /predict-base64    - Predict from base64 string (JSON)
    
Server runs at: http://localhost:5001
"""

import sys

# Check Python version before importing anything else
if sys.version_info >= (3, 12):
    print("\n" + "=" * 60)
    print("❌ ERROR: Python 3.12+ is not supported")
    print("=" * 60)
    print("TensorFlow 2.13.0 requires Python 3.10 or 3.11")
    print("\nCurrent version:", f"Python {sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}")
    print("\nPlease:")
    print("  1. Install Python 3.11 from: https://www.python.org/downloads/")
    print("  2. Or use pyenv: pyenv local 3.11.0")
    print("  3. Then run: python server.py")
    print("=" * 60)
    sys.exit(1)

if sys.version_info < (3, 10):
    print("\n" + "=" * 60)
    print("⚠️  WARNING: Python version may be too old")
    print("=" * 60)
    print("Recommended: Python 3.10 or 3.11")
    print(f"Current: Python {sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}")
    print("\nThe server may still work, but some dependencies might fail.")
    print("=" * 60)
    print()

# Version check passed
print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor} — OK")
print()

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import uuid
import base64

# Add model directory to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'model'))
from predict import predict_food, predict_from_bytes

app = Flask(__name__)

# CORS configuration for production deployment
# Allow both localhost (dev) and Vercel (production)
CORS(app, resources={
    r"/*": {
        "origins": [
            "http://localhost:5173",  # Local Vite dev server
            "http://localhost:4173",  # Local Vite preview
            "https://*.vercel.app",   # Vercel preview deployments
            "https://*.vercel.app",   # Your production domain
        ],
        "methods": ["GET", "POST"],
        "allow_headers": ["Content-Type"]
    }
})

# Upload folder for temporary files
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@app.route('/health', methods=['GET'])
def health():
    """
    GET /health
    
    Health check endpoint
    Returns model info and status
    """
    return jsonify({
        "status": "ok",
        "model": "food101-mobilenetv2",
        "classes": 101,
        "input_size": 224,
        "description": "Food-101 classifier with calorie estimation"
    })


@app.route('/predict', methods=['POST'])
def predict():
    """
    POST /predict
    Content-Type: multipart/form-data
    Body: image file in 'image' field
    
    Example (curl):
        curl -X POST -F "image=@food.jpg" http://localhost:5001/predict
        
    Example (JavaScript fetch):
        const formData = new FormData();
        formData.append('image', blob, 'food.jpg');
        const res = await fetch('http://localhost:5001/predict', {
            method: 'POST',
            body: formData
        });
        const data = await res.json();
    """
    if 'image' not in request.files:
        return jsonify({
            "error": "No image provided",
            "usage": "POST /predict with multipart/form-data, field name 'image'"
        }), 400
    
    file = request.files['image']
    
    try:
        # Method 1: Read bytes directly (faster, no disk I/O)
        image_bytes = file.read()
        result = predict_from_bytes(image_bytes)
        return jsonify(result)
        
    except Exception as e:
        # Method 2: Fallback - save to file then predict
        try:
            file.seek(0)
            filename = f"{uuid.uuid4()}.jpg"
            filepath = os.path.join(UPLOAD_FOLDER, filename)
            file.save(filepath)
            
            result = predict_food(filepath)
            
            # Cleanup temp file
            if os.path.exists(filepath):
                os.remove(filepath)
            
            return jsonify(result)
            
        except Exception as e2:
            return jsonify({
                "error": str(e2),
                "type": "prediction_error"
            }), 500


@app.route('/predict-base64', methods=['POST'])
def predict_base64():
    """
    POST /predict-base64
    Content-Type: application/json
    Body: {"image": "base64_encoded_image_data"}
    
    The image field can be:
    - Pure base64 string
    - Data URL format: "data:image/jpeg;base64,/9j/4AAQ..."
    
    Example (JavaScript):
        const base64 = canvas.toDataURL('image/jpeg');
        const res = await fetch('http://localhost:5001/predict-base64', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({image: base64})
        });
    """
    data = request.get_json()
    
    if not data or 'image' not in data:
        return jsonify({
            "error": "No image data provided",
            "usage": "POST JSON with 'image' field containing base64 data"
        }), 400
    
    try:
        # Get base64 string
        image_data = data['image']
        
        # Remove data URL prefix if present
        # e.g., "data:image/jpeg;base64,/9j/4AAQ..." -> "/9j/4AAQ..."
        if ',' in image_data:
            image_data = image_data.split(',')[1]
        
        # Decode base64 to bytes
        image_bytes = base64.b64decode(image_data)
        
        # Predict
        result = predict_from_bytes(image_bytes)
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            "error": str(e),
            "type": "prediction_error"
        }), 500


@app.errorhandler(404)
def not_found(e):
    return jsonify({
        "error": "Endpoint not found",
        "available_endpoints": [
            "GET /health",
            "POST /predict (multipart/form-data)",
            "POST /predict-base64 (JSON)"
        ]
    }), 404


@app.errorhandler(500)
def server_error(e):
    return jsonify({
        "error": "Internal server error",
        "message": str(e)
    }), 500


def print_banner():
    port = int(os.environ.get('PORT', 5001))
    print("=" * 55)
    print("   FOOD CALORIE ESTIMATOR - API SERVER")
    print("   Do an Nhap mon Thi Giac May Tinh")
    print("=" * 55)
    print()
    print("Endpoints:")
    print("  GET  /health            Health check")
    print("  POST /predict           Predict from image file")
    print("  POST /predict-base64    Predict from base64")
    print()
    print(f"Server: http://localhost:{port}")
    print()
    print("Test with curl:")
    print(f'  curl -X POST -F "image=@pizza.jpg" http://localhost:{port}/predict')
    print()
    print("=" * 55)
    print("Press Ctrl+C to stop server")
    print()


if __name__ == '__main__':
    print_banner()
    
    # Get port from environment variable (Render sets PORT automatically)
    # Fallback to 5001 for local development
    PORT = int(os.environ.get('PORT', 5001))
    
    # Run Flask server
    # host='0.0.0.0' allows connections from other devices on network
    # port from PORT env var (production) or 5001 (local)
    # debug=False for production-like behavior
    app.run(
        host='0.0.0.0',
        port=PORT,
        debug=False,
        threaded=True
    )
