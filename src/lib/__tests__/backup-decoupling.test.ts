import { describe, expect, it, afterEach } from "vitest";
import { encryptData, decryptData } from "@/lib/backup";

describe("Backup Encryption Key Decoupling", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("decrypts backup using independent BACKUP_ENCRYPTION_KEY even if JWT_SECRET changes", () => {
    process.env.BACKUP_ENCRYPTION_KEY = "independent-backup-key-123456789";
    process.env.JWT_SECRET = "jwt-key-a";

    const payload = JSON.stringify({ test: "electoral-data-backup" });
    const encrypted = encryptData(payload);

    // Rotate JWT_SECRET
    process.env.JWT_SECRET = "jwt-key-b";

    // Decryption MUST succeed because BACKUP_ENCRYPTION_KEY is independent!
    const decrypted = decryptData(encrypted);
    expect(decrypted).toBe(payload);
  });

  it("decrypts legacy backups after JWT rotation only with the explicitly retained legacy backup key", () => {
    // Legacy state: only JWT_SECRET set
    delete process.env.BACKUP_ENCRYPTION_KEY;
    process.env.JWT_SECRET = "jwt-key-old";

    const payload = JSON.stringify({ test: "legacy-backup-data" });
    const encrypted = encryptData(payload);

    // New state: independent backup key and a rotated JWT. The old JWT is kept
    // only as a backup-migration key, never as JWT_SECRET_PREVIOUS.
    process.env.BACKUP_ENCRYPTION_KEY = "new-backup-key-88888";
    process.env.JWT_SECRET = "jwt-key-new";
    process.env.BACKUP_LEGACY_ENCRYPTION_KEY = "jwt-key-old";

    // Decryption succeeds only through the explicit migration key.
    const decrypted = decryptData(encrypted);
    expect(decrypted).toBe(payload);
  });
});
