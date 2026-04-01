import os
import shutil

files_to_delete = [
    'README.md',
    'QUICKSTART.md',
    'HUONG_DAN_CHAY.md',
    'HUONG_DAN_MO_APP.md',
    'DEBUG_LOCALSTORAGE.md',
    'UX_FIX_SUMMARY.md',
    'SUA_LOI_TENSORFLOW.md',
    'create-dirs.js',
    'create_dirs.py',
    'create_food_cv_structure.bat',
    'setup_food_cv.ps1',
    'setup_food_cv_complete.py',
    'calorie_db_cv.json',
    'class_names_cv.txt',
    r'food_cv\README.md'
]

deleted = []
for f in files_to_delete:
    if os.path.exists(f):
        os.remove(f)
        deleted.append(f)
        print(f'✓ Deleted {f}')

# Delete __pycache__
pycache = r'food_cv\model\__pycache__'
if os.path.exists(pycache):
    shutil.rmtree(pycache)
    print(f'✓ Deleted {pycache}')

print(f'\n✅ Total deleted: {len(deleted) + 1} items')
