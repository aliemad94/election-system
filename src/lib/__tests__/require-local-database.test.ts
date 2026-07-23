import { spawnSync } from "node:child_process";
import path from "node:path";
import { describe, expect, it } from "vitest";

const guard = path.join(process.cwd(), "scripts", "require-local-database.js");

function runGuard(databaseUrl: string, destructive = false, confirmed = false) {
  return spawnSync(
    process.execPath,
    [guard, destructive ? "destructive" : "write"],
    {
      cwd: process.cwd(),
      encoding: "utf8",
      env: {
        ...process.env,
        NODE_ENV: "test",
        DATABASE_URL=[REDACTED]
        CONFIRM_DESTRUCTIVE_LOCAL_DB: confirmed ? "true" : "false",
      },
    }
  );
}

describe("local database safety guard", () => {
  it("rejects a localhost PostgreSQL database without an isolation marker", () => {
    const result = runGuard("postgresql://[REDACTED]");
    expect(result.status).toBe(2);
    expect(result.stderr).toContain("isolation marker");
  });

  it("allows a marked local database for non-destructive writes", () => {
    const result = runGuard("postgresql://[REDACTED]");
    expect(result.status).toBe(0);
  });

  it("requires explicit confirmation for destructive commands", () => {
    const unconfirmed = runGuard(
      "postgresql://[REDACTED]",
      true
    );
    const confirmed = runGuard(
      "postgresql://[REDACTED]",
      true,
      true
    );
    expect(unconfirmed.status).toBe(2);
    expect(unconfirmed.stderr).toContain("CONFIRM_DESTRUCTIVE_LOCAL_DB=true");
    expect(confirmed.status).toBe(0);
  });

  it("rejects remote PostgreSQL even when the database name looks isolated", () => {
    const result = runGuard("postgresql://[REDACTED]");
    expect(result.status).toBe(2);
    expect(result.stderr).toContain("remote host");
  });

  it("requires a marked SQLite filename inside the workspace", () => {
    expect(runGuard("file:./election_dev.db").status).toBe(0);
    expect(runGuard("file:./election.db").status).toBe(2);
    expect(runGuard("file:../election_dev.db").status).toBe(2);
  });
});
