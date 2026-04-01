# Manual Cleanup Required

Due to PowerShell configuration, please run one of these commands manually:

## Option 1: Using Node.js (Recommended)
```bash
node cleanup_temp.js
```

## Option 2: Using Python
```bash
python cleanup_temp.py
```

## Option 3: Manual deletion
Delete these files manually:
- README.md
- QUICKSTART.md
- HUONG_DAN_CHAY.md
- HUONG_DAN_MO_APP.md
- DEBUG_LOCALSTORAGE.md
- UX_FIX_SUMMARY.md
- SUA_LOI_TENSORFLOW.md
- create-dirs.js
- create_dirs.py
- create_food_cv_structure.bat
- setup_food_cv.ps1
- setup_food_cv_complete.py
- calorie_db_cv.json
- class_names_cv.txt
- food_cv/README.md
- food_cv/model/__pycache__/ (folder)

## Files to check and delete if duplicates:
- requirements_cv.txt (DIFFERENT from food_cv/requirements.txt - TensorFlow 2.15 vs 2.13 - KEEP requirements_cv.txt for reference)
- train_cv.py (SIMILAR to food_cv/model/train.py but has minor differences - DELETE train_cv.py as it's redundant)

After cleanup, delete these temporary files:
- cleanup_temp.js
- cleanup_temp.py
- CLEANUP_INSTRUCTIONS.md (this file)
