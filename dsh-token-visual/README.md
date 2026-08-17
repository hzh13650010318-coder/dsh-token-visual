# dsh-token-visual

DeepSeek Harness 双端插件：在工作台显示 Token 余额，并提供「Token余额」设置页。

## 功能

- **余额胶囊**：输入栏模型选择框左侧的胶囊，显示当前模型的 API 余额（两位小数）。
  - 余额 ≥ 警戒值：浅绿色；余额 < 警戒值：红色。
  - 点击胶囊立即刷新余额；悬停显示详情。
- **自动取余额**：余额接口（baseURL）与 API Key 均自动取自工作台已配置的模型设置，无需手动配置。按 provider 自动识别：
  - **DeepSeek 官方**（`deepseek-official`）：`GET {baseURL}/user/balance`，人民币余额。
  - **Kimi / Moonshot**（baseURL `api.moonshot.cn/.ai` 或 route 含 `moonshot|kimi`）：`GET /v1/users/me/balance`。
  - **MiniMax**（baseURL `api.minimaxi.com`）：`GET /v1/token_plan/remains`。
  - **阶跃星辰 StepFun**（baseURL `api.stepfun.com`）：`GET /v1/accounts`。
  - **xAI / Grok**（baseURL `api.x.ai`）：`GET /v1/billing/credits`（美元）。
  - **OpenAI 官方**（route 为 `openai` 或 baseURL 为 `api.openai.com`）：`/dashboard/billing/subscription` + `/usage`，估算剩余额度（近 30 天用量）。
  - **智谱 Zhipu / GLM**（baseURL `open.bigmodel.cn`）：`GET /api/monitor/usage/quota/limit`（**配额**接口，非金额，显示剩余配额）。
  - **千问 / Qwen / DashScope**（route 含 `qwen|dashscope|tongyi` 或 baseURL 为 `dashscope.aliyuncs.com`）：探测千问官方 flat API（`cli.qianwenai.com` 的 `GetFundAccountAvailableAmount`）。千问未向 API Key 开放余额接口，若探测失败会明确提示"请登录官方控制台或使用官方 CLI 查看"。
  - **MiMo（小米）**（baseURL `*.xiaomimimo.com`）：Cookie 认证余额接口 `platform.xiaomimimo.com/api/v1/balance`（Cookie 约 1 天有效，设置页粘贴）。
  - **硅基流动 / SiliconFlow**（baseURL `api.siliconflow.cn`）：`GET /v1/user/info`。
  - **其他 OpenAI 兼容 provider**（自定义添加、自建网关等）：依次探测 `/user/balance`（DeepSeek 风格）与 OpenAI billing，能识别即显示余额。
  - 无法识别或未配置 baseURL 的 provider（如 pi-ai 代理路由）：显示红色「该模型尚不支持」。
- **消耗统计**：不限模型，拦截工作台所有模型调用的 token 用量。
- **配置页「Token余额」**（位于 **设置 → 插件 → 插件配置 → dsh-token-visual 卡片**，不再是独立的设置目录项）：
  - 模型选择器：按已配置的 provider/模型查看余额，不支持的模型显示红色「该模型尚不支持」。
  - 余额警戒值设置。
  - MiMo Cookie 配置（余额查询必需，约 1 天有效）。
  - 充值入口（各 provider 官方充值/账单页）。
  - 近 30 天 Token 每日消耗曲线。
  - 消耗日历（悬停日期高亮为圆形，显示当日消耗）。

## 安装

```bash
# 在 dsh 环境中（需 pnpm）
dsh plugin --profile web add /path/to/dsh-token-visual
# 重启 DeepSeek Harness
```

数据文件保存在工作区根目录 `token-quota.json`（警戒值、每日消耗、各 provider 余额缓存）。

## 结构

- `lib/index.js` — Host 半段（ESM）：余额拉取、用量统计、持久化，经 webServer 提供 `/api/token-quota/*` 路由。
- `lib/client.js` — Client 半段：胶囊 + 设置页。
- `cordis.patch.yml` — profile bundle 补丁，注册插件行。
