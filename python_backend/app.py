"""
Eye Disease Detection Flask Backend
Uses EfficientNetV2-S (TensorFlow/Keras) for fundus image classification
"""

import os
import io
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import numpy as np

app = Flask(__name__)

# Configure CORS for frontend access
CORS(app, origins=[
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:8080",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:8080",
    "https://*.lovable.app",
])

# Disease classes - must match training order
CLASSES = ['cataract', 'diabetic_retinopathy', 'glaucoma', 'normal']
NUM_CLASSES = len(CLASSES)

# Model path
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'models', 'fine_tuned_eye_model.keras')

# Global model variable
model = None

# Preliminary findings mapping based on classification
PRELIMINARY_FINDINGS = {
    'diabetic_retinopathy': [
        {'finding': 'Possible hemorrhages detected', 'detected': True},
        {'finding': 'Microaneurysms may be present', 'detected': True},
        {'finding': 'Vascular abnormalities noted', 'detected': True},
        {'finding': 'Optic disk abnormality', 'detected': False},
        {'finding': 'Hard exudates observed', 'detected': True},
    ],
    'glaucoma': [
        {'finding': 'Optic disk abnormality noted', 'detected': True},
        {'finding': 'Cup-to-disk ratio may be elevated', 'detected': True},
        {'finding': 'Nerve fiber layer changes suspected', 'detected': True},
        {'finding': 'Possible hemorrhages detected', 'detected': False},
        {'finding': 'Peripapillary atrophy observed', 'detected': True},
    ],
    'cataract': [
        {'finding': 'Lens opacity detected', 'detected': True},
        {'finding': 'Crystalline lens changes observed', 'detected': True},
        {'finding': 'Reduced image clarity due to media opacity', 'detected': True},
        {'finding': 'Optic disk abnormality', 'detected': False},
    ],
    'normal': [
        {'finding': 'No significant abnormalities detected', 'detected': True},
        {'finding': 'Retinal structures appear normal', 'detected': True},
        {'finding': 'Optic disk appears healthy', 'detected': True},
        {'finding': 'Vascular pattern within normal limits', 'detected': True},
    ],
}


def load_model():
    """Load the trained EfficientNetV2-S model"""
    global model

    if not os.path.exists(MODEL_PATH):
        print(f"Warning: Model file not found at {MODEL_PATH}")
        print("The server will run in demo mode with random predictions.")
        return False

    try:
        import tensorflow as tf
        model = tf.keras.models.load_model(MODEL_PATH)
        print(f"EfficientNetV2-S model loaded successfully from {MODEL_PATH}")
        return True

    except Exception as e:
        print(f"Error loading model: {str(e)}")
        model = None
        return False


def is_fundus_image_opencv(image: Image.Image) -> tuple[bool, str]:
    """
    Uses OpenCV heuristics to determine if an image is likely a fundus image.
    Returns (True, "") if it passes, or (False, "reason") if it fails.
    """
    try:
        import cv2
    except ImportError:
        print("Warning: cv2 not installed, bypassing OpenCV validation.")
        return True, ""

    try:
        # Convert PIL to OpenCV format (BGR)
        cv_img = cv2.cvtColor(np.array(image.convert('RGB')), cv2.COLOR_RGB2BGR)
        
        # Resize to standard size for faster/consistent processing
        cv_img = cv2.resize(cv_img, (512, 512))
        
        # Check 1: Red channel dominance
        # Fundus images are typically heavily red/orange
        b, g, r = cv2.split(cv_img)
        mean_r = np.mean(r)
        mean_g = np.mean(g)
        mean_b = np.mean(b)
        
        # In a typical fundus image, Red is significantly higher than Blue
        if mean_r < mean_b or mean_r < mean_g - 25: 
            return False, "Color profile does not match a typical fundus image."
            
        # Check 2: Circular Field of View (FOV)
        gray = cv2.cvtColor(cv_img, cv2.COLOR_BGR2GRAY)
        
        # Apply a threshold to isolate the illuminated FOV
        _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        # Find contours
        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        if not contours:
            return False, "Could not detect a clear field of view."
            
        # Get the largest contour
        largest_contour = max(contours, key=cv2.contourArea)
        area = cv2.contourArea(largest_contour)
        
        total_area = 512 * 512
        if area < total_area * 0.10:
            return False, "Illuminated area is too small."
            
        # Check circularity
        perimeter = cv2.arcLength(largest_contour, True)
        if perimeter == 0:
            return False, "Invalid shape detected."
            
        circularity = 4 * np.pi * (area / (perimeter * perimeter))
        
        # A perfect circle has circularity of 1. Fundus FOV is usually > 0.6
        if circularity < 0.35:
            return False, "Shape is not circular enough."
        
        return True, ""
        
    except Exception as e:
        print(f"OpenCV validation error: {e}")
        return True, ""


def preprocess_image(image: Image.Image) -> np.ndarray:
    """Preprocess a fundus image for EfficientNetV2-S inference"""
    from tensorflow.keras.applications.efficientnet_v2 import preprocess_input
    from tensorflow.keras.preprocessing.image import img_to_array

    # Resize to match training input size
    image = image.resize((224, 224))
    img_array = img_to_array(image)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = preprocess_input(img_array)
    return img_array


def get_review_urgency(classification: str, confidence: float) -> str:
    """Determine review urgency based on classification and confidence.
    Only two levels are supported: 'urgent' and 'routine'."""
    if classification == 'normal':
        return 'routine'

    if confidence >= 0.85 and classification in ['diabetic_retinopathy', 'glaucoma']:
        return 'urgent'
    return 'routine'


def predict_image(image: Image.Image) -> dict:
    """Run inference on a fundus image using EfficientNetV2-S"""
    global model

    # If model not loaded, return mock prediction
    if model is None:
        import random
        idx = random.randint(0, NUM_CLASSES - 1)
        probs = [0.05] * NUM_CLASSES
        probs[idx] = random.uniform(0.75, 0.98)
        total = sum(probs)
        probs = [p / total for p in probs]

        classification = CLASSES[idx]
        confidence = probs[idx]

        return {
            'classification': classification,
            'confidence': round(confidence, 4),
            'all_probabilities': {CLASSES[i]: round(probs[i], 4) for i in range(NUM_CLASSES)},
            'preliminary_findings': PRELIMINARY_FINDINGS.get(classification, []),
            'review_urgency': get_review_urgency(classification, confidence),
            'demo_mode': True
        }

    # Preprocess image
    if image.mode != 'RGB':
        image = image.convert('RGB')

    input_array = preprocess_image(image)

    # Run inference
    predictions = model.predict(input_array, verbose=0)[0]

    # Get prediction
    predicted_idx = int(np.argmax(predictions))
    predicted_class = CLASSES[predicted_idx]
    confidence_value = round(float(predictions[predicted_idx]), 4)

    # Build response
    all_probs = {CLASSES[i]: round(float(predictions[i]), 4) for i in range(NUM_CLASSES)}

    return {
        'classification': predicted_class,
        'confidence': confidence_value,
        'all_probabilities': all_probs,
        'preliminary_findings': PRELIMINARY_FINDINGS.get(predicted_class, []),
        'review_urgency': get_review_urgency(predicted_class, confidence_value),
        'demo_mode': False
    }


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'model_architecture': 'EfficientNetV2-S',
        'classes': CLASSES
    })


@app.route('/predict', methods=['POST'])
def predict():
    """Prediction endpoint for fundus image classification"""

    # Check if image was uploaded
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400

    file = request.files['image']

    if file.filename == '':
        return jsonify({'error': 'No image file selected'}), 400

    try:
        # Read and process image
        image_bytes = file.read()
        image = Image.open(io.BytesIO(image_bytes))

        # Validate image using OpenCV heuristics
        is_fundus, reason = is_fundus_image_opencv(image)
        if not is_fundus:
            return jsonify({'error': f'Image validation failed: {reason} Please upload a clear fundus image.'}), 400

        # Run prediction
        result = predict_image(image)

        return jsonify(result)

    except Exception as e:
        print(f"Prediction error: {str(e)}")
        return jsonify({'error': f'Prediction failed: {str(e)}'}), 500


@app.route('/', methods=['GET'])
def index():
    """Root endpoint"""
    return jsonify({
        'name': 'Eye Disease Detection API',
        'version': '2.0.0',
        'description': 'EfficientNetV2-S-based fundus image classification',
        'endpoints': {
            '/predict': 'POST - Upload fundus image for classification',
            '/health': 'GET - Health check'
        },
        'supported_diseases': CLASSES,
    })


if __name__ == '__main__':
    # Load model on startup
    load_model()

    # Get port from environment or use default
    port = int(os.environ.get('PORT', 5000))

    # Run the server
    app.run(
        host='0.0.0.0',
        port=port,
        debug=os.environ.get('FLASK_DEBUG', 'false').lower() == 'true'
    )
