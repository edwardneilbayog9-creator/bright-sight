"""
Eye Disease Detection Flask Backend
Uses Vision Transformer (ViT) for fundus image classification
"""

import os
import io
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import torch
import torch.nn.functional as F
from torchvision import transforms
import timm

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

# Device configuration
DEVICE = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
print(f"Using device: {DEVICE}")

# Model path
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'models', 'best_enhanced_vit.pth')

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
    """Load the trained ViT model"""
    global model
    
    if not os.path.exists(MODEL_PATH):
        print(f"Warning: Model file not found at {MODEL_PATH}")
        print("The server will run in demo mode with random predictions.")
        return False
    
    try:
        # Create model with same architecture as training (V3)
        # Standard ViT without custom head - matches the training notebook
        model = timm.create_model('vit_base_patch16_224', pretrained=False, num_classes=NUM_CLASSES)
        
        # Load state dict
        state_dict = torch.load(MODEL_PATH, map_location=DEVICE, weights_only=False)
        
        # Handle different save formats
        if 'model_state_dict' in state_dict:
            model.load_state_dict(state_dict['model_state_dict'])
        elif 'state_dict' in state_dict:
            model.load_state_dict(state_dict['state_dict'])
        else:
            model.load_state_dict(state_dict)
        
        model = model.to(DEVICE)
        model.eval()
        print(f"Model loaded successfully from {MODEL_PATH}")
        return True
        
    except Exception as e:
        print(f"Error loading model: {str(e)}")
        model = None
        return False


# Image preprocessing pipeline - matches training transforms
preprocess = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


def get_review_urgency(classification: str, confidence: float) -> str:
    """Determine review urgency based on classification and confidence"""
    if classification == 'normal':
        return 'routine'
    
    if confidence >= 0.85:
        if classification in ['diabetic_retinopathy', 'glaucoma']:
            return 'urgent'
        return 'priority'
    elif confidence >= 0.70:
        return 'priority'
    else:
        return 'routine'


def predict_image(image: Image.Image) -> dict:
    """Run inference on a fundus image"""
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
    
    input_tensor = preprocess(image).unsqueeze(0).to(DEVICE)
    
    # Run inference
    with torch.no_grad():
        outputs = model(input_tensor)
        probabilities = F.softmax(outputs, dim=1)[0]
    
    # Get prediction
    confidence, predicted_idx = torch.max(probabilities, 0)
    predicted_class = CLASSES[predicted_idx.item()]
    confidence_value = round(confidence.item(), 4)
    
    # Build response
    all_probs = {CLASSES[i]: round(probabilities[i].item(), 4) for i in range(NUM_CLASSES)}
    
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
        'device': str(DEVICE),
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
        'version': '1.0.0',
        'description': 'Vision Transformer-based fundus image classification',
        'endpoints': {
            '/predict': 'POST - Upload fundus image for classification',
            '/health': 'GET - Health check'
        },
        'supported_diseases': CLASSES,
        'model_performance': {
            'cataract': {'precision': 0.90, 'recall': 0.93, 'f1': 0.92},
            'diabetic_retinopathy': {'precision': 1.00, 'recall': 0.99, 'f1': 0.99},
            'glaucoma': {'precision': 0.82, 'recall': 0.82, 'f1': 0.82},
            'normal': {'precision': 0.84, 'recall': 0.81, 'f1': 0.83},
        }
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
