# dsh-wsl-clock

DeepSeek Harness 插件：检测休眠后 WSL2 时钟漂移（可导致 TLS/令牌异常）。

配套 **[dsh-wsl-kit](https://github.com/173787247/dsh-wsl-kit)**。

[English → README.md](./README.md)

## 安装

```sh
dsh plugin --profile web add github:173787247/dsh-wsl-clock
```

重启 `dsh web` 并开**新**会话。工具名：`clock_doctor`。

## 许可

MIT
