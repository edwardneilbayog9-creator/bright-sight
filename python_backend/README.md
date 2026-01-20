# Eye Disease Detection Flask Backend

This Flask server provides the backend inference API for the Eye Disease Pre-Diagnosis System using a Vision Transformer (ViT) model.

## Setup

### 1. Create Virtual Environment

```bash
cd python_backend
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Place Your Model

Place your `best_enhanced_vit.pth` model file in the `models/` directory:

```
python_backend/
├── models/
│   └── best_enhanced_vit.pth
├── app.py
├── requirements.txt
└── README.md
```

### 4. Run the Server

```bash
python app.py
```

The server will start at `http://localhost:5000`

## API Endpoints

### POST /predict

Upload a fundus image for classification.

**Request:**
- Content-Type: multipart/form-data
- Body: `image` (file)

**Response:**
```json
{
  "classification": "cataract",
  "confidence": 0.87,
  "all_probabilities": {
    "cataract": 0.87,
    "diabetic_retinopathy": 0.08,
    "glaucoma": 0.03,
    "normal": 0.02
  }
}
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "model_loaded": true
}
```

## Model Architecture

The system uses an Enhanced Vision Transformer (ViT) model trained on fundus images to classify:
- Cataract
- Diabetic Retinopathy
- Glaucoma
- Normal/Healthy

## CORS Configuration

The server is configured to accept requests from:
- http://localhost:5173 (Vite dev server)
- http://localhost:3000
- Any lovable.app subdomain

## Troubleshooting

### Model Not Loading
- Ensure `best_enhanced_vit.pth` is in the `models/` directory
- Check that the model architecture matches the one defined in `app.py`

### CUDA/GPU Issues
- The server will automatically use GPU if available
- Set `CUDA_VISIBLE_DEVICES=""` to force CPU usage

### Port Already in Use
- Change the port in `app.py` or use: `python app.py --port 5001`
