"""
predict.py - OpenCV preprocessing + MobileNetV2 inference
Do an Nhap mon Thi Giac May Tinh

OpenCV Pipeline (Phan Computer Vision chinh cua do an):
1. cv2.imread() - Doc anh
2. cv2.cvtColor(BGR2RGB) - Chuyen color space
3. cv2.resize() - Resize 224x224 voi INTER_AREA
4. Normalize / 255.0 - Chuan hoa pixel values
5. np.expand_dims() - Them batch dimension

Usage:
    from predict import predict_food, predict_from_bytes
    
    # From file path
    result = predict_food("path/to/food.jpg")
    
    # From bytes (web upload)
    result = predict_from_bytes(image_bytes)
"""

import cv2
import numpy as np
import json
import os

# Global model cache (lazy loading)
_model = None
_calorie_db = None
_class_names = None

IMG_SIZE = 224
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def load_resources():
    """Load model and data files (only once)"""
    global _model, _calorie_db, _class_names
    
    if _model is None:
        import tensorflow as tf
        
        # Suppress TF warnings
        tf.get_logger().setLevel('ERROR')
        os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
        
        model_path = os.path.join(BASE_DIR, 'model', 'food101_model.h5')
        
        if not os.path.exists(model_path):
            raise FileNotFoundError(
                f"Model not found: {model_path}\n"
                f"Please train the model first:\n"
                f"    cd food_cv\n"
                f"    python model/train.py"
            )
        
        print("[predict] Loading model from:", model_path)
        _model = tf.keras.models.load_model(model_path)
        print("[predict] Model loaded successfully!")
    
    if _calorie_db is None:
        db_path = os.path.join(BASE_DIR, 'data', 'calorie_db.json')
        with open(db_path, 'r', encoding='utf-8') as f:
            _calorie_db = json.load(f)
    
    if _class_names is None:
        names_path = os.path.join(BASE_DIR, 'data', 'class_names.txt')
        with open(names_path, 'r', encoding='utf-8') as f:
            _class_names = [line.strip() for line in f.readlines()]
    
    return _model, _calorie_db, _class_names


def preprocess_image_opencv(image_path: str) -> np.ndarray:
    """
    OpenCV preprocessing pipeline - PHAN CV CHINH CUA DO AN
    
    Pipeline chi tiet:
    1. cv2.imread() - Doc anh tu file (BGR format)
    2. cv2.cvtColor() - Chuyen BGR sang RGB 
       (OpenCV dung BGR mac dinh, nhung model can RGB)
    3. cv2.resize() - Resize ve 224x224 pixels
       (Su dung INTER_AREA cho anh thu nho - chat luong tot hon)
    4. Normalize - Chia cho 255 de dua ve [0, 1]
    5. expand_dims - Them chieu batch (1, 224, 224, 3)
    
    Args:
        image_path: Duong dan den file anh
        
    Returns:
        numpy array shape (1, 224, 224, 3), dtype float32
    """
    # 1. Doc anh (OpenCV tra ve BGR)
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError(f"Cannot read image: {image_path}")
    
    # 2. BGR -> RGB (MobileNetV2 can RGB)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    
    # 3. Resize ve 224x224 (MobileNetV2 input size)
    # INTER_AREA cho ket qua tot khi thu nho anh
    img = cv2.resize(img, (IMG_SIZE, IMG_SIZE), interpolation=cv2.INTER_AREA)
    
    # 4. Normalize [0, 255] -> [0, 1]
    img = img.astype(np.float32) / 255.0
    
    # 5. Them batch dimension: (224, 224, 3) -> (1, 224, 224, 3)
    img = np.expand_dims(img, axis=0)
    
    return img


def preprocess_from_bytes(image_bytes: bytes) -> np.ndarray:
    """
    Preprocess image from bytes (for web upload)
    
    Pipeline:
    1. np.frombuffer() - Convert bytes to numpy array
    2. cv2.imdecode() - Decode JPEG/PNG data
    3. Same as preprocess_image_opencv after that
    """
    # 1. Convert bytes to numpy array
    nparr = np.frombuffer(image_bytes, np.uint8)
    
    # 2. Decode image (auto-detect format)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Cannot decode image from bytes")
    
    # 3. BGR -> RGB
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    
    # 4. Resize
    img = cv2.resize(img, (IMG_SIZE, IMG_SIZE), interpolation=cv2.INTER_AREA)
    
    # 5. Normalize
    img = img.astype(np.float32) / 255.0
    
    # 6. Batch dimension
    img = np.expand_dims(img, axis=0)
    
    return img


def predict_food(image_path: str, top_k: int = 3) -> dict:
    """
    Predict food class and calories from image file
    
    Args:
        image_path: Path to food image
        top_k: Number of top predictions to return
        
    Returns:
        dict with:
        - food_name: Ten mon an (human readable)
        - confidence: Do tin cay (%)
        - confidence_label: "high" / "medium" / "low"
        - estimated_kcal: Uoc tinh calo (~150g)
        - kcal_per_100g: Calo moi 100g
        - alternatives: Cac goi y khac
        - portion_note: Ghi chu ve khau phan
    """
    model, calorie_db, class_names = load_resources()
    
    # Preprocess with OpenCV
    img = preprocess_image_opencv(image_path)
    
    # Model inference
    predictions = model.predict(img, verbose=0)[0]
    
    # Validation: Check predictions shape
    if len(predictions) != len(class_names):
        print(f"[WARNING] Predictions shape mismatch: {len(predictions)} vs {len(class_names)} classes")
        if len(predictions) > len(class_names):
            predictions = predictions[:len(class_names)]
    
    # Get top-k predictions (ensure within bounds)
    top_k = min(top_k, len(predictions))
    top_indices = np.argsort(predictions)[::-1][:top_k]
    
    results = []
    for idx in top_indices:
        # Safety check
        if idx >= len(class_names):
            print(f"[ERROR] Index {idx} out of range for {len(class_names)} classes")
            continue
            
        food_name = class_names[idx]
        conf = float(predictions[idx])
        kcal = calorie_db.get(food_name, 200)  # Default 200 if not found
        
        results.append({
            "food": food_name.replace('_', ' ').title(),
            "food_key": food_name,
            "confidence": round(conf * 100, 1),
            "kcal_per_100g": kcal,
            "estimated_kcal": int(kcal * 1.5)  # Assume ~150g portion
        })
    
    # Safety: Ensure we have at least one result
    if not results:
        return {
            "food_name": "Unknown",
            "confidence": 0,
            "confidence_label": "low",
            "estimated_kcal": 200,
            "kcal_per_100g": 200,
            "alternatives": [],
            "portion_note": "Cannot classify this image"
        }
    
    # Top prediction
    top = results[0]
    
    # Confidence label
    if top["confidence"] > 70:
        conf_label = "high"
    elif top["confidence"] > 40:
        conf_label = "medium"
    else:
        conf_label = "low"
    
    return {
        "food_name": top["food"],
        "confidence": top["confidence"],
        "confidence_label": conf_label,
        "estimated_kcal": top["estimated_kcal"],
        "kcal_per_100g": top["kcal_per_100g"],
        "alternatives": results[1:],
        "portion_note": "Uoc tinh cho ~150g. Dieu chinh neu khau phan khac."
    }


def predict_from_bytes(image_bytes: bytes, top_k: int = 3) -> dict:
    """
    Predict food class and calories from image bytes
    (Same as predict_food but for web upload)
    """
    model, calorie_db, class_names = load_resources()
    
    # Preprocess from bytes
    img = preprocess_from_bytes(image_bytes)
    
    # Model inference
    predictions = model.predict(img, verbose=0)[0]
    
    # Validation: Check predictions shape
    if len(predictions) != len(class_names):
        print(f"[WARNING] Predictions shape mismatch: {len(predictions)} vs {len(class_names)} classes")
        # Adjust if needed
        if len(predictions) > len(class_names):
            predictions = predictions[:len(class_names)]
    
    # Get top-k (ensure within bounds)
    top_k = min(top_k, len(predictions))
    top_indices = np.argsort(predictions)[::-1][:top_k]
    
    results = []
    for idx in top_indices:
        # Safety check
        if idx >= len(class_names):
            print(f"[ERROR] Index {idx} out of range for {len(class_names)} classes")
            continue
            
        food_name = class_names[idx]
        conf = float(predictions[idx])
        kcal = calorie_db.get(food_name, 200)
        
        results.append({
            "food": food_name.replace('_', ' ').title(),
            "food_key": food_name,
            "confidence": round(conf * 100, 1),
            "kcal_per_100g": kcal,
            "estimated_kcal": int(kcal * 1.5)
        })
    
    # Safety: Ensure we have at least one result
    if not results:
        return {
            "food_name": "Unknown",
            "confidence": 0,
            "confidence_label": "low",
            "estimated_kcal": 200,
            "kcal_per_100g": 200,
            "alternatives": [],
            "portion_note": "Cannot classify this image"
        }
    
    top = results[0]
    
    if top["confidence"] > 70:
        conf_label = "high"
    elif top["confidence"] > 40:
        conf_label = "medium"
    else:
        conf_label = "low"
    
    return {
        "food_name": top["food"],
        "confidence": top["confidence"],
        "confidence_label": conf_label,
        "estimated_kcal": top["estimated_kcal"],
        "kcal_per_100g": top["kcal_per_100g"],
        "alternatives": results[1:],
        "portion_note": "Uoc tinh cho ~150g. Dieu chinh neu khau phan khac."
    }


# CLI interface
if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python predict.py <image_path>")
        print("Example: python predict.py test_pizza.jpg")
        sys.exit(1)
    
    image_path = sys.argv[1]
    
    if not os.path.exists(image_path):
        print(f"Error: File not found: {image_path}")
        sys.exit(1)
    
    print(f"Analyzing: {image_path}")
    print("-" * 40)
    
    result = predict_food(image_path)
    
    print(f"Food:       {result['food_name']}")
    print(f"Confidence: {result['confidence']}% ({result['confidence_label']})")
    print(f"Calories:   ~{result['estimated_kcal']} kcal (for ~150g)")
    print(f"Per 100g:   {result['kcal_per_100g']} kcal")
    
    if result['alternatives']:
        print("\nAlternatives:")
        for alt in result['alternatives']:
            print(f"  - {alt['food']}: {alt['confidence']}%")
