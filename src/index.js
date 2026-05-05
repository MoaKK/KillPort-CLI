#!/usr/bin/env node

import { execSync } from 'child_process';
import * as readline from 'readline';

const args = process.argv.slice(2);
const port = args.find(a => !a.startsWith('--'));
const force = args.includes('--force');

if (!port) {
  console.error('Usage: killport <port> [--force]');
  process.exit(1);
}

function getProcessOnPort(port) {
  try {
    const output = execSync(`lsof -i :${port} -n -P`, { encoding: 'utf8' });
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

    // Wait up to 2s for the process to exit, then SIGKILL
    const deadline = Date.now() + 2000;
    while (Date.now() < deadline) {
      try {
        execSync(`kill -0 ${pid}`, { stdio: 'ignore' }); // still alive
      } catch {
        return 'sigterm'; // process is gone
      }
    }

    execSync(`kill -9 ${pid}`);
    return 'sigkill';
  } catch {
    return 'failed';
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

if (!force) {
  const answer = await ask('\nKill it? [y/N] ');
  if (answer !== 'y') {
    console.log('Aborted.');
    process.exit(0);
  }
}

const result = killProcess(proc.pid);

if (result === 'sigterm') {
  console.log(`Process ${proc.pid} (${proc.name}) terminated.`);
} else if (result === 'sigkill') {
  console.log(`Process ${proc.pid} (${proc.name}) force-killed.`);
} else {
  console.error(`Failed to kill ${proc.pid}. Try running with sudo.`);
  process.exit(1);
}
