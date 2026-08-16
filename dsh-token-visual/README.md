# dsh-token-visual

DeepSeek Harness 双端插件：在工作台显示 Token 余额，并提供「Token余额」设置页。

## 功能

- **余额胶囊**：输入栏模型选择框左侧的胶囊，显示当前模型的 API 余额（两位小数）。
  - 余额 ≥ 警戒值：浅绿色；余额 < 警戒值：红色。
  - 点击胶囊立即刷新余额；悬停显示详情。
- **自动取余额**：余额接口（baseURL）与 API Key 均自动取自工作台已配置的模型设置（DeepSeek 官方 `/user/balance`），无需手动配置。
- **设置页「Token余额」**：
  - 模型选择器：按已配置的 provider/模型查看余额，不支持的模型显示红色「该模型尚不支持」。
  - 余额警戒值设置。
  - 充值入口（DeepSeek 官方充值页）。
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
