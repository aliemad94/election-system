// fix-user-any.js — Replace user: any and { user }: any with AuthenticatedUser
const fs = require('fs');
const path = require('path');

const apiDir = path.join(__dirname, '..', 'src', 'app', 'api');

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else if (entry.name.endsWith('.ts')) files.push(full);
  }
  return files;
}

let fixedCount = 0;

for (const file of walk(apiDir)) {
  let content = fs.readFileSync(file, 'utf8');
  
  let hasChange = false;
  let newContent = content;

  // 1. Replace { user }: any with { user }: { user: AuthenticatedUser }
  if (newContent.includes('{ user }: any')) {
    newContent = newContent.replace(/\{ user \}: any/g, '{ user }: { user: AuthenticatedUser }');
    hasChange = true;
  }

  // 2. Replace user: any with user: AuthenticatedUser (often in parameters or destructured contexts)
  if (newContent.includes('user: any')) {
    newContent = newContent.replace(/\buser:\s*any\b/g, 'user: AuthenticatedUser');
    hasChange = true;
  }

  if (hasChange) {
    // Add import if not already present
    if (!newContent.match(/import.*AuthenticatedUser/)) {
      if (newContent.includes('import { NextRequest, NextResponse } from "next/server";')) {
        newContent = newContent.replace(
          'import { NextRequest, NextResponse } from "next/server";',
          'import { NextRequest, NextResponse } from "next/server";\nimport type { AuthenticatedUser } from "@/lib/auth-guard";'
        );
      } else if (newContent.includes('import { NextResponse, NextRequest } from "next/server";')) {
        newContent = newContent.replace(
          'import { NextResponse, NextRequest } from "next/server";',
          'import { NextResponse, NextRequest } from "next/server";\nimport type { AuthenticatedUser } from "@/lib/auth-guard";'
        );
      } else {
        // Find first import line and insert after it
        const lines = newContent.split('\n');
        let insertIdx = -1;
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].trim().startsWith('import ')) {
            insertIdx = i;
            break;
          }
        }
        if (insertIdx !== -1) {
          lines.splice(insertIdx + 1, 0, 'import type { AuthenticatedUser } from "@/lib/auth-guard";');
          newContent = lines.join('\n');
        } else {
          newContent = 'import type { AuthenticatedUser } from "@/lib/auth-guard";\n' + newContent;
        }
      }
    }

    fs.writeFileSync(file, newContent, 'utf8');
    fixedCount++;
    console.log('Fixed:', path.relative(__dirname, file));
  }
}

console.log(`\nTotal files fixed: ${fixedCount}`);
