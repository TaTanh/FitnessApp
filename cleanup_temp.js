const fs = require('fs');
const path = require('path');

const filesToDelete = [
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
    path.join('food_cv', 'README.md')
];

let deleted = 0;
filesToDelete.forEach(f => {
    try {
        if (fs.existsSync(f)) {
            fs.unlinkSync(f);
            console.log(`✓ Deleted ${f}`);
            deleted++;
        }
    } catch (err) {
        console.log(`✗ Failed to delete ${f}: ${err.message}`);
    }
});

// Delete __pycache__
const pycache = path.join('food_cv', 'model', '__pycache__');
try {
    if (fs.existsSync(pycache)) {
        fs.rmSync(pycache, { recursive: true, force: true });
        console.log(`✓ Deleted ${pycache}`);
        deleted++;
    }
} catch (err) {
    console.log(`✗ Failed to delete __pycache__: ${err.message}`);
}

console.log(`\n✅ Task 1 complete: Deleted ${deleted} items`);
