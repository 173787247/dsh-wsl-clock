# dsh-wsl-clock

DeepSeek Harness 工具：**`clock_doctor`** — 检测 WSL 相对 Windows 的时钟漂移。

属于 **[dsh-wsl-kit](https://github.com/173787247/dsh-wsl-kit)**。

[English → README.md](./README.md)

---

## 为什么需要

笔记本休眠后 WSL 时钟可能漂移，导致 TLS / npm / Git 报时间错误。本工具对比 `date -u` 与 Windows UTC，建议 `sudo hwclock -s` 或重启 WSL；除非开启 `allowFix`，否则不会自动修复。

## 安装

```sh
dsh plugin --profile web add github:173787247/dsh-wsl-clock
```

重启 `dsh web`。新会话 → Tools 应出现 `clock_doctor`。

## 配置

```yaml
- id: dsh-wsl-clock
  name: dsh-wsl-clock
  config:
    timeoutMs: 15000
    maxSkewSec: 2
    allowFix: false
```

| 键 | 默认 | 含义 |
|----|------|------|
| `timeoutMs` | `15000` | 工具超时 |
| `maxSkewSec` | `2` | 允许的绝对偏差（秒） |
| `allowFix` | `false` | 调用方传 `fix: true` 时是否允许 `sudo hwclock -s` |

## 测试

```sh
npm test
```

## 许可

MIT
