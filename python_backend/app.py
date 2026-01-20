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
import torch.nn as nn
import torch.nn.functional as F
from torchvision import transforms
import timm

app = Flask(__name__)

# Configure CORS for frontend access
CORS(app, origins=[
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
    "https://*.lovable.app",
])

# Disease classes
CLASSES = ['cataract', 'diabetic_retinopathy', 'glaucoma', 'normal']
NUM_CLASSES = len(CLASSES)

# Device configuration
DEVICE = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
print(f"Using device: {DEVICE}")

# Model path
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'models', 'best_enhanced_vit.pth')

# Global model variable
model = None


class EnhancedViT(nn.Module):
    """Enhanced Vision Transformer for Eye Disease Classification"""
    
    def __init__(self, num_classes=4, pretrained=True):
        super(EnhancedViT, self).__init__()
        
        # Load pretrained ViT
        self.vit = timm.create_model('vit_base_patch16_224', pretrained=pretrained)
        
        # Get the number of features from the ViT head
        num_features = self.vit.head.in_features
        
        # Replace the head with custom classifier
        self.vit.head = nn.Sequential(
            nn.LayerNorm(num_features),
            nn.Dropout(0.3),
            nn.Linear(num_features, 512),
            nn.GELU(),
            nn.Dropout(0.2),
            nn.Linear(512, 256),
            nn.GELU(),
            nn.Dropout(0.1),
            nn.Linear(256, num_classes)
        )
    
    def forward(self, x):
        return self.vit(x)


def load_model():
    """Load the trained ViT model"""
    global model
    
    if not os.path.exists(MODEL_PATH):
        print(f"Warning: Model file not found at {MODEL_PATH}")
        print("The server will run in demo mode with random predictions.")
        return False
    
    try:
        model = EnhancedViT(num_classes=NUM_CLASSES, pretrained=False)
        
        # Load state dict
        state_dict = torch.load(MODEL_PATH, map_location=DEVICE)
        
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


# Image preprocessing pipeline
preprocess = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


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
        
        return {
            'classification': CLASSES[idx],
            'confidence': probs[idx],
            'all_probabilities': {CLASSES[i]: probs[i] for i in range(NUM_CLASSES)},
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
    
    # Build response
    all_probs = {CLASSES[i]: round(probabilities[i].item(), 4) for i in range(NUM_CLASSES)}
    
    return {
        'classification': predicted_class,
        'confidence': round(confidence.item(), 4),
        'all_probabilities': all_probs,
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
        'supported_diseases': CLASSES
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
