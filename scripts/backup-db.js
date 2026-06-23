// ====================================================================
// نسخ احتياطي تلقائي لقاعدة البيانات — يُشغّل يومياً عبر cron
// Railway cron job: node scripts/backup-db.js
// ====================================================================
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const BACKUP_DIR = path.join(__dirname, '..', 'backups');
const DB_URL = process.env.DATABASE_URL || '';
const MAX_BACKUPS = 7; // الاحتفاظ بآخر 7 نسخ

if (!DB_URL) {
  console.error('[Backup] DATABASE_URL not set');
  process.exit(1);
}

// استخراج بيانات الاتصال من DATABASE_URL
const url = new URL(DB_URL);
const dbName = url.pathname.slice(1);
const host = url.hostname;
const port = url.port || '5432';
const user = url.username;
const pass = url.password;

const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const fileName = `backup_${timestamp}.sql.gz`;
const filePath = path.join(BACKUP_DIR, fileName);

try {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  console.log(`[Backup] Starting backup to ${filePath}...`);

  execSync(
    `pg_dump -h ${host} -p ${port} -U ${user} -d ${dbName} --no-owner --no-acl | gzip > "${filePath}"`,
    {
      env: { ...process.env, PGPASSWORD: pass },
      stdio: 'pipe',
      timeout: 300000, // 5 minutes
    }
  );

  const size = fs.statSync(filePath).size;
  console.log(`[Backup] Done: ${fileName} (${(size / 1024).toFixed(1)} KB)`);

  // حذف النسخ القديمة (أكثر من MAX_BACKUPS)
  const files = fs.readdirSync(BACKUP_DIR)
    .filter(f => f.startsWith('backup_') && f.endsWith('.gz'))
    .sort();
  while (files.length > MAX_BACKUPS) {
    const old = files.shift();
    fs.unlinkSync(path.join(BACKUP_DIR, old));
    console.log(`[Backup] Removed old: ${old}`);
  }
} catch (err) {
  console.error('[Backup] Failed:', err.message);
  process.exit(1);
}
