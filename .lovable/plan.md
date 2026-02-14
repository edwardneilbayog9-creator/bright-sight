

# Plan: Switch to New Keras Model

## Overview

Update the Python backend to use the new model file `fine_tuned_eye_model.keras` instead of `efficientnetv2_s_eye_model.h5`. This requires only changing the model file path -- the `.keras` format is natively supported by `tf.keras.models.load_model()` so no other code changes are needed.

## Changes

### 1. `python_backend/app.py`

**Line 30** -- Update `MODEL_PATH` to point to the new file:

```python
# Before
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'models', 'efficientnetv2_s_eye_model.h5')

# After
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'models', 'fine_tuned_eye_model.keras')
```

**Note:** The input size (256x256) and preprocessing will remain the same. If the new model was trained with a different input size, we may need to adjust `preprocess_image()` after testing. The `.keras` format works with the same `tf.keras.models.load_model()` call already in the code.

## What Stays the Same

- Model loading function (`load_model`) -- `tf.keras.models.load_model()` handles both `.h5` and `.keras` formats
- Preprocessing pipeline (256x256 resize, EfficientNetV2 preprocess_input)
- API endpoints and response format
- All frontend code

## After Implementation

Restart your Flask server and test `/predict` with a fundus image. If you see a shape mismatch error, the new model may expect a different input size, and we will adjust accordingly.

