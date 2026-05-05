#!/usr/bin/env node

import * as readline from 'readline';
import { getProcessOnPort, killProcess } from './port.js';

const args = process.argv.slice(2);
const ports = args.filter(a => !a.startsWith('--'));
const force = args.includes('--force');

if (ports.length === 0) {
  console.error('Usage: killport <port> [port2 ...] [--force]');
  process.exit(1);
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

for (const port of ports) {
  const proc = getProcessOnPort(port);

  if (!proc) {
    console.log(`Port ${port}: nothing running.`);
    continue;
  }

  console.log(`\nPort ${port} is in use:`);
  console.log(`  Process : ${proc.name}`);
  console.log(`  PID     : ${proc.pid}`);
  console.log(`  User    : ${proc.user}`);
  console.log(`  Command : ${proc.command}`);

  if (!force) {
    const answer = await ask('\nKill it? [y/N] ');
    if (answer !== 'y') {
      console.log('Aborted.');
      continue;
    }
  }

  const result = killProcess(proc.pid);

  if (result === 'sigterm') {
    console.log(`Process ${proc.pid} (${proc.name}) terminated.`);
  } else if (result === 'sigkill') {
    console.log(`Process ${proc.pid} (${proc.name}) force-killed.`);
  } else {
    console.error(`Failed to kill ${proc.pid}. Try running with sudo.`);
  }
}
