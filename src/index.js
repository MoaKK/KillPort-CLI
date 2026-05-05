#!/usr/bin/env node

import { execSync } from 'child_process';

const port = process.argv[2];

if (!port) {
  console.error('Usage: killport <port>');
  process.exit(1);
}

function getProcessOnPort(port) {
  try {
    const output = execSync(`lsof -i :${port} -sTCP:LISTEN -n -P`, {
      encoding: 'utf8',
    });
    const lines = output.trim().split('\n');
    if (lines.length < 2) return null;

    const parts = lines[1].split(/\s+/);
    return {
      name: parts[0],
      pid: parts[1],
      user: parts[2],
    };
  } catch {
    return null;
  }
}

const proc = getProcessOnPort(port);

if (!proc) {
  console.log(`Nothing is running on port ${port}.`);
  process.exit(0);
}

console.log(`Port ${port} is in use:`);
console.log(`  Process : ${proc.name}`);
console.log(`  PID     : ${proc.pid}`);
console.log(`  User    : ${proc.user}`);
