# killport-cli

Kill whatever is running on a port, without digging through `lsof` output yourself.

## Install

```bash
npm install -g @moakk/killport-cli
```

## Usage

```bash
killport 3000
```

```bash
killport 3000 8080 5432
```

Skip the confirmation prompt:

```bash
killport 3000 --force
```

## What it shows

```
Port 3000 is in use:
  Process : node
  PID     : 12345
  User    : bob
  Command : /usr/local/bin/node server.js

Kill it? [y/N]
```

## Notes

- Tries SIGTERM first, falls back to SIGKILL if the process doesn't exit within 2 seconds
- If you get a permission error, re-run with `sudo`
- macOS and Linux only (uses `lsof` and `ps` under the hood)

## License

ISC
