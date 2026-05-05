#!/usr/bin/env node

import { execSync } from 'child_process';
import * as readline from 'readline';

const port = process.argv[2];

if (!port) {
  console.error('Usage: killport <port>');
  process.exit(1);
}

function getProcessOnPort(port) {
  try {
    const output = execSync(`lsof -i :${port} -n -P`, {
      encoding: 'utf8',
    });
    const lines = output.trim().split('\n').filter(l => l.trim());
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


function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

function killProcess(pid) {
  try {
    execSync(`kill -15 ${pid}`);
    return true;
  } catch {
    return false;
  }
}

const proc = getProcessOnPort(port);

if (!proc) {
  console.log(`Nothing is running on port ${port}.`);
  process.exit(0);
}

console.log(`\nPort ${port} is in use:`);
console.log(`  Process : ${proc.name}`);
console.log(`  PID     : ${proc.pid}`);
console.log(`  User    : ${proc.user}`);

const answer = await ask('\nKill it? [y/N] ');

if (answer !== 'y') {
  console.log('Aborted.');
  process.exit(0);
}

const killed = killProcess(proc.pid);
if (killed) {
  console.log(`Process ${proc.pid} (${proc.name}) terminated.`);
} else {
  console.error(`Failed to kill ${proc.pid}. Try running with sudo.`);
  process.exit(1);
}
