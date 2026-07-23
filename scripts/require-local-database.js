#!/usr/bin/env node
"use strict";

const path = require("node:path");

const databaseUrl = process.env.DATABASE_URL;
const operation = process.argv[2] || "write";
const isolatedNamePattern = /(?:^|[_-])(dev|test|testing|local|sandbox|scratch|temporary)(?:$|[_-])/i;

function fail(message) {
  console.error(`BLOCKED: ${message}`);
  process.exit(2);
}

if (process.env.NODE_ENV === "production") {
  fail("this command is disabled when NODE_ENV=production");
}

if (!databaseUrl) {
  fail("DATABASE_URL is required and must point to an isolated local database");
}

if (databaseUrl.startsWith("file:")) {
  const rawPath = decodeURIComponent(databaseUrl.slice("file:".length).split("?")[0]);
  if (rawPath === ":memory:") {
    console.log("PASS: in-memory SQLite database confirmed.");
    process.exit(0);
  }
  const resolvedPath = path.resolve(process.cwd(), rawPath);
  const relativePath = path.relative(process.cwd(), resolvedPath);
  const databaseName = path.basename(resolvedPath, path.extname(resolvedPath));
  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    fail("SQLite database must be located inside the project workspace");
  }
  if (!isolatedNamePattern.test(databaseName)) {
    fail("SQLite filename must contain an isolation marker such as dev, test, local, or sandbox");
  }
  if (
    operation === "destructive" &&
    process.env.CONFIRM_DESTRUCTIVE_LOCAL_DB !== "true"
  ) {
    fail("set CONFIRM_DESTRUCTIVE_LOCAL_DB=true for destructive local database commands");
  }
  console.log(`PASS: isolated local SQLite database confirmed (${relativePath}).`);
  process.exit(0);
}

let parsed;
try {
  parsed = new URL(databaseUrl);
} catch {
  fail("DATABASE_URL is not a valid URL");
}

if (!["postgresql:", "postgres:"].includes(parsed.protocol)) {
  fail("only local PostgreSQL or SQLite is allowed");
}

const localHosts = new Set(["localhost", "127.0.0.1", "::1"]);
if (!localHosts.has(parsed.hostname)) {
  fail(`refusing destructive development command against remote host ${parsed.hostname}`);
}

const databaseName = decodeURIComponent(parsed.pathname.replace(/^\/+/, ""));
if (!databaseName || !isolatedNamePattern.test(databaseName)) {
  fail("PostgreSQL database name must contain an isolation marker such as dev, test, local, or sandbox");
}

if (
  operation === "destructive" &&
  process.env.CONFIRM_DESTRUCTIVE_LOCAL_DB !== "true"
) {
  fail("set CONFIRM_DESTRUCTIVE_LOCAL_DB=true for destructive local database commands");
}

console.log(
  `PASS: isolated local PostgreSQL database confirmed (${parsed.hostname}/${databaseName}).`
);
