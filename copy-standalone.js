const fs = require('fs');
const path = require('path');

try {
  console.log('Copying static files to standalone directory...');
  // Copy .next/static to .next/standalone/.next/static
  const staticSrc = path.join(__dirname, '.next', 'static');
  const staticDest = path.join(__dirname, '.next', 'standalone', '.next', 'static');
  if (fs.existsSync(staticSrc)) {
    fs.cpSync(staticSrc, staticDest, { recursive: true, force: true });
  }

  // Copy public to .next/standalone/public
  const publicSrc = path.join(__dirname, 'public');
  const publicDest = path.join(__dirname, '.next', 'standalone', 'public');
  if (fs.existsSync(publicSrc)) {
    fs.cpSync(publicSrc, publicDest, { recursive: true, force: true });
  }
  console.log('Static files copied successfully!');
} catch (err) {
  console.error('Failed to copy static files:', err);
  process.exit(1);
}
