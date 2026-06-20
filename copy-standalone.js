const fs = require('fs');
const path = require('path');

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Copy public directory (if it exists)
copyDir(path.join(__dirname, 'public'), path.join(__dirname, '.next', 'standalone', 'public'));

// Copy static files
copyDir(path.join(__dirname, '.next', 'static'), path.join(__dirname, '.next', 'standalone', '.next', 'static'));

console.log('✅ Standalone static files copied successfully.');

