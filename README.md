# dsh-wsl-clock

DeepSeek Harness plugin: Detect WSL2 clock drift after host sleep that can break TLS and tokens.

Part of **[dsh-wsl-kit](https://github.com/173787247/dsh-wsl-kit)**.

[中文说明 → README.zh.md](./README.zh.md)

## Install

```sh
dsh plugin --profile web add github:173787247/dsh-wsl-clock
# or local:
dsh plugin --profile web add /absolute/path/to/dsh-wsl-clock
```

Restart `dsh web` and open a **new** session. Tool: `clock_doctor`.

## License

MIT
