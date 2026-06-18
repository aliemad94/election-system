import fs from 'fs';
import path from 'path';

let inMemoryConfig = { enabled: true };
const configPath = path.join(process.cwd(), 'src/lib/config.json');

// Try loading existing configuration on initialization
try {
  if (fs.existsSync(configPath)) {
    const data = fs.readFileSync(configPath, 'utf8');
    inMemoryConfig = JSON.parse(data);
  }
} catch (error) {
  console.error('Failed to load system config from file:', error);
}

export function getSystemConfig(): { enabled: boolean } {
  return inMemoryConfig;
}

export function setSystemConfig(config: { enabled: boolean }) {
  inMemoryConfig = config;
  try {
    // Ensure directory exists (though src/lib always does)
    const dir = path.dirname(configPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
  } catch (error) {
    console.error('Failed to persist system config to file:', error);
  }
}
