# dsh-wsl-clock

## 兼容性

| 项 | 值 |
|----|----|
| **插件** | `dsh-wsl-clock` **0.2.0** |
| **最低 dsh** | ≥ **0.1.2**（Windows 中继 `:3081` 一次性 `?token=`） |
| **最新验证** | 以 [dsh-wsl-kit 兼容性](https://github.com/173787247/dsh-wsl-kit#compatibility-2026-09) 为准（当前 **`0.1.5-rc.1`**）— 套件唯一真源 |
| **套件档位** | `llm` / `full`（也可单独装） |
| **云端 Flash** | settings / `llm-deepseek` 使用 **`deepseek-flash`**（V4.1 Flash）；本插件不配置模型 id |
| **Agent Teams** | 上游实验包；本插件不依赖 |

套件版本地板：[`check-plugin-versions.sh`](https://github.com/173787247/dsh-wsl-kit/blob/master/scripts/check-plugin-versions.sh)。故障树：[TROUBLESHOOTING.zh.md](https://github.com/173787247/dsh-wsl-kit/blob/master/docs/TROUBLESHOOTING.zh.md)。

> **套件：** [dsh-wsl-kit](https://github.com/173787247/dsh-wsl-kit)

**`clock_doctor`**：WSL 与 Windows UTC 偏差（ok/warn/fail）。休眠后 skew 大会搞挂 TLS / GitHub App JWT。

```sh
dsh plugin --profile web add github:173787247/dsh-wsl-clock
npm test
```

MIT
