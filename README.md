# dsh-wsl-clock

DeepSeek Harness tool: **`clock_doctor`** — DeepSeek Harness tool: detect WSL clock drift versus Windows UTC.

Part of **[dsh-wsl-kit](https://github.com/173787247/dsh-wsl-kit)**.

[中文说明 → README.zh.md](./README.zh.md)

---

## Why

WSL clocks can drift after laptop sleep. TLS, npm, and Git then fail with time errors. This tool compares `date -u` with Windows UTC and advises `sudo hwclock -s` or a WSL restart — it never auto-fixes unless `allowFix` is enabled.

## Install

```sh
dsh plugin --profile web add github:173787247/dsh-wsl-clock
```

Restart `dsh web`. New session → Tools should list `clock_doctor`.

## Config

```yaml
- id: dsh-wsl-clock
  name: dsh-wsl-clock
  config:
        timeoutMs: 15000
        maxSkewSec: 2
        allowFix: false
```

| Key | Default | Meaning |
|-----|---------|---------|
| `timeoutMs` | `15000` | Tool timeout |
| `maxSkewSec` | `2` | Allowed absolute skew (seconds) |
| `allowFix` | `false` | Permit `sudo hwclock -s` when caller passes `fix: true` |

## Test

```sh
npm test
```

## License

MIT
