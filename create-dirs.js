const fs = require('fs');
const path = require('path');

const baseDir = __dirname;
const dirs = [
  path.join(baseDir, 'src'),
  path.join(baseDir, 'src', 'components'),
  path.join(baseDir, 'src', 'utils')
];

dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created: ${dir}`);
  } else {
    console.log(`Already exists: ${dir}`);
  }
});

console.log('Directory creation complete!');
