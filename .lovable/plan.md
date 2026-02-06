
# Plan: Refactor Backend from ViT (PyTorch) to EfficientNetV2-S (TensorFlow/Keras)

## Overview

Your new model `efficientnetv2_s_eye_model.h5` is a Keras/TensorFlow model (`.h5` format), which means the backend needs to switch its deep learning framework from **PyTorch + timm** to **TensorFlow/Keras**. The API endpoints and response format will remain identical, so the React frontend needs only minor text updates.

---

## What Changes and Why

| Area | Current (ViT) | New (EfficientNetV2-S) |
|------|---------------|----------------------|
| Model file | `best_enhanced_vit.pth` (PyTorch) | `efficientnetv2_s_eye_model.h5` (Keras) |
| Framework | PyTorch + timm | TensorFlow/Keras |
| Architecture | `vit_base_patch16_224` | `EfficientNetV2S` |
| Input size | 224x224 | 384x384 (EfficientNetV2-S default) |
| Preprocessing | PyTorch transforms + ImageNet normalization | `tf.keras.applications.efficientnet_v2.preprocess_input` |
| Inference | `torch.no_grad()` + `F.softmax()` | `model.predict()` (softmax built-in or applied) |

---

## Files to Modify

### 1. `python_backend/app.py` (Major Refactor)

The core backend file needs the following changes:

- **Imports**: Replace `torch`, `torchvision`, `timm` with `tensorflow`, `numpy`
- **Model path**: Point to `efficientnetv2_s_eye_model.h5` instead of `best_enhanced_vit.pth`
- **`load_model()` function**: Use `tf.keras.models.load_model()` instead of `timm.create_model()` + `torch.load()`
- **Preprocessing pipeline**: Replace PyTorch transforms with TensorFlow/Keras preprocessing:
  - Resize to 384x384 (EfficientNetV2-S standard input) or 224x224 depending on your training
  - Use `preprocess_input` from `tf.keras.applications.efficientnet_v2`
- **`predict_image()` function**: Replace PyTorch inference with `model.predict()`
- **Device handling**: Remove CUDA/torch device logic (TensorFlow handles GPU automatically)
- **Root endpoint**: Update description and model performance metrics to reflect EfficientNetV2-S
- **Docstrings**: Update all ViT references to EfficientNetV2-S

### 2. `python_backend/requirements.txt` (Dependency Swap)

Replace PyTorch dependencies with TensorFlow:

```text
# Remove:
torch>=2.0.0
torchvision>=0.15.0
timm==0.9.12

# Add:
tensorflow>=2.13.0
numpy>=1.24.0
```

### 3. `python_backend/README.md` (Documentation Update)

- Update all references from "Vision Transformer (ViT)" to "EfficientNetV2-S"
- Update model file name from `best_enhanced_vit.pth` to `efficientnetv2_s_eye_model.h5`
- Update directory structure example
- Update troubleshooting section

### 4. `src/components/landing/HeroSection.tsx` (Minor Text Update)

- Line 53: Change `"ViT Model"` title to `"EfficientNet Model"`
- Line 54: Change description from `"Vision Transformer architecture"` to `"EfficientNetV2-S architecture"`

### 5. `src/components/analysis/ImageUploader.tsx` (Minor Text Update)

- Line 101: Change `"Running ViT model inference"` to `"Running EfficientNet model inference"`

---

## Technical Details: New `app.py` Inference Logic

The key changes in the inference pipeline:

```python
# Loading the model
import tensorflow as tf

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'models', 'efficientnetv2_s_eye_model.h5')

def load_model():
    global model
    model = tf.keras.models.load_model(MODEL_PATH)

# Preprocessing
import numpy as np
from tensorflow.keras.applications.efficientnet_v2 import preprocess_input
from tensorflow.keras.preprocessing.image import img_to_array

def preprocess_image(image):
    image = image.resize((224, 224))  # Match your training input size
    img_array = img_to_array(image)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = preprocess_input(img_array)
    return img_array

# Inference
def predict_image(image):
    processed = preprocess_image(image)
    predictions = model.predict(processed)[0]
    predicted_idx = np.argmax(predictions)
    confidence = float(predictions[predicted_idx])
    # ... rest stays the same
```

---

## What Stays the Same

- **API endpoints**: `/predict`, `/health`, `/` remain identical
- **Response format**: Same JSON structure (classification, confidence, all_probabilities, preliminary_findings, review_urgency)
- **Frontend logic**: `src/pages/Analyze.tsx` needs zero changes -- it already handles the API response correctly
- **Disease classes**: Same 4 classes in the same order: `['cataract', 'diabetic_retinopathy', 'glaucoma', 'normal']`
- **CORS configuration**: No changes needed
- **Preliminary findings mapping**: No changes needed

---

## Important Note on Input Size

EfficientNetV2-S typically uses 384x384 input, but since your model was trained with a specific configuration, the plan will use 224x224 to match the training transforms visible in your notebook. If your EfficientNet training used a different size, this can be adjusted.

---

## Summary

| File | Change Type |
|------|------------|
| `python_backend/app.py` | Major refactor (framework swap) |
| `python_backend/requirements.txt` | Dependency swap (PyTorch to TensorFlow) |
| `python_backend/README.md` | Documentation update |
| `src/components/landing/HeroSection.tsx` | Text update (1 line) |
| `src/components/analysis/ImageUploader.tsx` | Text update (1 line) |
