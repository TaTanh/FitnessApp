"""
train.py - Fine-tune MobileNetV2 on Food-101 dataset
Nhập môn Thị Giác Máy Tính
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
print("Dataset: Food-101")
print("Model: MobileNetV2 (Transfer Learning)")
print("=" * 60)

# Load Food-101 dataset
print("\n[1/5] Loading Food-101 dataset...")
(ds_train, ds_val), info = tfds.load(
    'food101',
    split=['train', 'validation'],
    as_supervised=True,
    with_info=True
)

num_train = info.splits['train'].num_examples
num_val = info.splits['validation'].num_examples
print(f"✓ Train samples: {num_train}")
print(f"✓ Validation samples: {num_val}")

# Preprocessing functions
def preprocess(image, label):
    """Basic preprocessing"""
    image = tf.image.resize(image, [IMG_SIZE, IMG_SIZE])
    image = tf.cast(image, tf.float32) / 255.0
    return image, label

def augment(image, label):
    """Data augmentation"""
    image = tf.image.random_flip_left_right(image)
    image = tf.image.random_brightness(image, 0.2)
    image = tf.image.random_contrast(image, 0.8, 1.2)
    return image, label

# Prepare datasets
print("\n[2/5] Preparing datasets...")
train_ds = (ds_train
            .map(preprocess, num_parallel_calls=tf.data.AUTOTUNE)
            .map(augment, num_parallel_calls=tf.data.AUTOTUNE)
            .batch(BATCH_SIZE)
            .prefetch(tf.data.AUTOTUNE))

val_ds = (ds_val
          .map(preprocess, num_parallel_calls=tf.data.AUTOTUNE)
          .batch(BATCH_SIZE)
          .prefetch(tf.data.AUTOTUNE))

print("✓ Datasets ready with augmentation")

# Build model
print("\n[3/5] Building MobileNetV2 model...")
base_model = MobileNetV2(
    weights='imagenet',
    include_top=False,
    input_shape=(IMG_SIZE, IMG_SIZE, 3)
)
base_model.trainable = False  # Freeze base layers initially

x = base_model.output
x = GlobalAveragePooling2D()(x)
x = Dropout(0.3)(x)
x = Dense(256, activation='relu')(x)
x = Dropout(0.2)(x)
output = Dense(NUM_CLASSES, activation='softmax')(x)

model = Model(inputs=base_model.input, outputs=output)

print(f"✓ Model architecture:")
print(f"  - Base: MobileNetV2 (ImageNet pretrained)")
print(f"  - Custom head: GlobalAvgPool → Dropout → Dense(256) → Dense({NUM_CLASSES})")
print(f"  - Total params: {model.count_params():,}")

# Phase 1: Train only top layers
print("\n[4/5] Phase 1: Training top layers...")
print(f"Epochs: {EPOCHS_PHASE1}, Learning rate: 0.001")

model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)

history1 = model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=EPOCHS_PHASE1,
    verbose=1
)

val_acc1 = history1.history['val_accuracy'][-1]
print(f"✓ Phase 1 complete. Val accuracy: {val_acc1:.1%}")

# Phase 2: Fine-tune last layers
print("\n[5/5] Phase 2: Fine-tuning last 30 layers...")
base_model.trainable = True
for layer in base_model.layers[:-30]:
    layer.trainable = False

trainable_count = sum([1 for l in model.layers if l.trainable])
print(f"Trainable layers: {trainable_count}")

model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=0.0001),
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)

history2 = model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=EPOCHS_PHASE2,
    verbose=1
)

val_acc2 = history2.history['val_accuracy'][-1]
print(f"✓ Phase 2 complete. Val accuracy: {val_acc2:.1%}")

# Save model
model_path = 'food101_model.h5'
model.save(model_path)
print(f"\n✓ Model saved to: {model_path}")

# Summary
print("\n" + "=" * 60)
print("TRAINING COMPLETE!")
print("=" * 60)
print(f"Final validation accuracy: {val_acc2:.1%}")
print(f"Model ready for inference: {model_path}")
print("\nNext steps:")
print("1. Move model to: food_cv/model/food101_model.h5")
print("2. Test inference: python predict.py")
print("3. Start server: python server.py")
