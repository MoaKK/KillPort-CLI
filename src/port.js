import { execSync } from 'child_process';

export function getProcessOnPort(port) {
  try {
    const output = execSync(`lsof -i :${port} -n -P`, { encoding: 'utf8' });
    const lines = output.trim().split('\n').filter(l => l.trim());
    if (lines.length < 2) return null;

    const parts = lines[1].split(/\s+/);
    const pid = parts[1];

    let command = parts[0];
    try {
      command = execSync(`ps -p ${pid} -o command=`, { encoding: 'utf8' }).trim();
    } catch {
      // fallback to lsof name if ps fails
    }

    return {
      name: parts[0],
      pid,
      user: parts[2],
      command,
    };
  } catch {
    return null;
  }
}

export function killProcess(pid) {
  try {
    execSync(`kill -15 ${pid}`);

    const deadline = Date.now() + 2000;
    while (Date.now() < deadline) {
      try {
        execSync(`kill -0 ${pid}`, { stdio: 'ignore' });
      } catch {
        return 'sigterm';
      }
    }

    execSync(`kill -9 ${pid}`);
    return 'sigkill';
  } catch {
    return 'failed';
  }
}
