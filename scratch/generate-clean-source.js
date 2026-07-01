const fs = require('fs');
const path = require('path');

const rootDir = 'c:\\Users\\SONY\\Desktop\\aliemad94\\aliemad94';
const outputFilePath = path.join(rootDir, 'project_clean_source.md');

let markdownContent = `# Electoral System Clean Source Code\n\n`;
markdownContent += `This file contains the complete clean source code of the project, excluding node_modules, build outputs, and binary assets.\n\n`;

const includedExtensions = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.json', '.prisma', '.md', '.css', '.html', '.toml', '.dockerignore'
]);

const excludedDirs = new Set([
  'node_modules',
  '.git',
  '.next',
  'temp-skills',
  'db',
  'upload',
  'download',
  'public',
  'scratch'
]);

const excludedFiles = new Set([
  'package-lock.json',
  'project_full_source.md',
  'project_clean_source.md',
  'tsconfig.tsbuildinfo',
  '.env',
  'election-system.zip'
]);

function traverse(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  // Sort entries to make it deterministic
  entries.sort((a, b) => a.name.localeCompare(b.name));

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(rootDir, fullPath).replace(/\\/g, '/');

    if (entry.isDirectory()) {
      if (excludedDirs.has(entry.name)) continue;
      traverse(fullPath);
    } else {
      if (excludedFiles.has(entry.name)) continue;

      const ext = path.extname(entry.name).toLowerCase();
      const isConfigOrCode = includedExtensions.has(ext) || 
                             entry.name === 'Dockerfile' || 
                             entry.name === 'Caddyfile' ||
                             entry.name === '.gitignore' ||
                             entry.name.startsWith('.env.');

      if (!isConfigOrCode) continue;

      try {
        const stats = fs.statSync(fullPath);
        if (stats.size > 500 * 1024) {
          // Skip large files (e.g. documentation files or logs that might be too large)
          continue;
        }

        const content = fs.readFileSync(fullPath, 'utf8');
        let lang = 'txt';
        if (ext === '.ts') lang = 'ts';
        else if (ext === '.tsx') lang = 'tsx';
        else if (ext === '.js') lang = 'js';
        else if (ext === '.jsx') lang = 'jsx';
        else if (ext === '.json') lang = 'json';
        else if (ext === '.prisma') lang = 'prisma';
        else if (ext === '.md') lang = 'md';
        else if (ext === '.toml') lang = 'toml';
        else if (ext === '.css') lang = 'css';

        markdownContent += `## File: ${relPath}\n\n\`\`\`${lang}\n${content}\n\`\`\`\n\n`;
      } catch (err) {
        console.error(`Error reading ${relPath}:`, err.message);
      }
    }
  }
}

console.log('Generating clean project source markdown...');
traverse(rootDir);

fs.writeFileSync(outputFilePath, markdownContent, 'utf8');
console.log(`✅ Success! Generated clean source at: ${outputFilePath}`);
