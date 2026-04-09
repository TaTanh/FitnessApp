"""
train.py - Fine-tune MobileNetV2 on Food-101 dataset
Do an Nhap mon Thi Giac May Tinh

Usage:
    cd food_cv
    python model/train.py

Notes:
    - Requires ~4GB RAM for training
    - Training takes 3-4 hours on GPU, longer on CPU
    - Model saved to: food_cv/model/food101_model.h5
"""

import tensorflow as tf
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout
from tensorflow.keras.models import Model
import tensorflow_datasets as tfds
import os

# Configuration
IMG_SIZE = 224
BATCH_SIZE = 32
NUM_CLASSES = 101
EPOCHS_PHASE1 = 10
EPOCHS_PHASE2 = 10

print("=" * 60)
print("FOOD CALORIE ESTIMATOR - TRAINING")
print("Dataset: Food-101 (101 classes, 101,000 images)")
print("Model: MobileNetV2 (Transfer Learning)")
print("=" * 60)

# Load Food-101 dataset
print("\n[1/5] Loading Food-101 dataset...")
print("(This may take a while on first run - downloading ~5GB)")
(ds_train, ds_val), info = tfds.load(
    'food101',
    split=['train', 'validation'],
    as_supervised=True,
    with_info=True
)

num_train = info.splits['train'].num_examples
num_val = info.splits['validation'].num_examples
print(f"[OK] Train samples: {num_train}")
print(f"[OK] Validation samples: {num_val}")


def preprocess(image, label):
    """Resize and normalize image"""
    image = tf.image.resize(image, [IMG_SIZE, IMG_SIZE])
    image = tf.cast(image, tf.float32) / 255.0
    return image, label


def augment(image, label):
    """Data augmentation for better generalization"""
    image = tf.image.random_flip_left_right(image)
    image = tf.image.random_brightness(image, 0.2)
    image = tf.image.random_contrast(image, 0.8, 1.2)
    return image, label


# Prepare datasets
print("\n[2/5] Preparing datasets with augmentation...")
train_ds = (ds_train
            .map(preprocess, num_parallel_calls=tf.data.AUTOTUNE)
            .map(augment, num_parallel_calls=tf.data.AUTOTUNE)
            .shuffle(1000)
            .batch(BATCH_SIZE)
            .prefetch(tf.data.AUTOTUNE))

val_ds = (ds_val
          .map(preprocess, num_parallel_calls=tf.data.AUTOTUNE)
          .batch(BATCH_SIZE)
          .prefetch(tf.data.AUTOTUNE))

print("[OK] Datasets ready")

# Build model with Transfer Learning
print("\n[3/5] Building MobileNetV2 model...")
base_model = MobileNetV2(
    weights='imagenet',
    include_top=False,
    input_shape=(IMG_SIZE, IMG_SIZE, 3)
)
base_model.trainable = False  # Freeze base model initially

# Add classification head
x = base_model.output
x = GlobalAveragePooling2D()(x)
x = Dropout(0.3)(x)
x = Dense(256, activation='relu')(x)
x = Dropout(0.2)(x)
output = Dense(NUM_CLASSES, activation='softmax')(x)

model = Model(inputs=base_model.input, outputs=output)

total_params = model.count_params()
trainable_params = sum([tf.keras.backend.count_params(w) for w in model.trainable_weights])
print(f"[OK] Total params: {total_params:,}")
print(f"[OK] Trainable params: {trainable_params:,}")

# Phase 1: Train only top layers (faster, ~5 min/epoch)
print("\n[4/5] Phase 1: Training classification head...")
print("     (Base model frozen, only training top layers)")
model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)

# Callbacks
early_stop = tf.keras.callbacks.EarlyStopping(
    monitor='val_accuracy',
    patience=3,
    restore_best_weights=True
)

history1 = model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=EPOCHS_PHASE1,
    callbacks=[early_stop],
    verbose=1
)

phase1_acc = history1.history['val_accuracy'][-1]
print(f"\n[OK] Phase 1 complete. Val accuracy: {phase1_acc:.1%}")

# Phase 2: Fine-tune last 30 layers of base model
print("\n[5/5] Phase 2: Fine-tuning...")
print("     (Unfreezing last 30 layers of MobileNetV2)")
base_model.trainable = True
for layer in base_model.layers[:-30]:
    layer.trainable = False

# Re-compile with lower learning rate
model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=0.0001),
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)

trainable_params = sum([tf.keras.backend.count_params(w) for w in model.trainable_weights])
print(f"[OK] Trainable params now: {trainable_params:,}")

history2 = model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=EPOCHS_PHASE2,
    callbacks=[early_stop],
    verbose=1
)

phase2_acc = history2.history['val_accuracy'][-1]
print(f"\n[OK] Phase 2 complete. Val accuracy: {phase2_acc:.1%}")

# Save model
model_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(model_dir, 'food101_model.h5')
model.save(model_path)

print("\n" + "=" * 60)
print("TRAINING COMPLETE!")
print("=" * 60)
print(f"Model saved to: {model_path}")
print(f"Final validation accuracy: {phase2_acc:.1%}")
print("\nNext step: Run the server")
print("    cd food_cv")
print("    python server.py")
print("=" * 60)
