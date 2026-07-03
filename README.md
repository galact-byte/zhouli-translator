# 合乎周礼

把寻常的话，翻译成“大周礼时代”流行的白话翻译腔。在线版本：
[hehuzhouli.com](https://hehuzhouli.com)。

这个仓库包含网站源码、DeepSeek 调用逻辑、提示词构造方式，以及可下载的
`speak-zhouli` Skill 包。仓库中不包含真实 API Key、私有日志或线上账号凭据。

## 功能

- 输入现代中文，生成“小礼 / 成礼 / 大礼”三档周礼体文案。
- 支持“温言相劝 / 大儒辩经 / 强行圆场 / 痛心疾首”四种辞气。
- 在没有配置 DeepSeek Key 时自动使用本地演示文案，便于预览界面。
- 提供一键复制和 ZIP 下载的 `speak-zhouli` Skill。
- 支持生成可保存的礼帖图片。

## 本地运行

```bash
npm install
cp .env.example .env.local
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)。

`.env.local` 示例：

```env
DEEPSEEK_API_KEY=sk-your-key-here
DEEPSEEK_MODEL=deepseek-v4-flash
MAX_OUTPUT_TOKENS=720
```

如果没有配置 `DEEPSEEK_API_KEY`，项目会走演示模式，不会请求 DeepSeek。

## DeepSeek 配置

项目默认：

- 使用 `deepseek-v4-flash`。
- 明确关闭思考模式，降低延迟与成本。
- 用户输入限制为 300 字。
- 输出上限由 `MAX_OUTPUT_TOKENS` 控制。
- 固定提示词放在最前面，便于命中上下文缓存。
- API Key 只在服务端使用，不会发送给浏览器。

生产环境请使用平台的 Secret 管理能力保存 `DEEPSEEK_API_KEY`，不要提交真实
`.env`、`.env.local` 或 `.dev.vars`。

## 可下载 Skill

网站包含一份可独立安装的 `speak-zhouli` Skill：

- Skill 源文件：`skill-package/speak-zhouli/`
- 网站下载包：`public/downloads/speak-zhouli-skill.zip`
- 网站复制原文：`public/downloads/speak-zhouli-SKILL.md`
- 下载地址：`/downloads/speak-zhouli-skill.zip`
- 复制原文地址：`/downloads/speak-zhouli-SKILL.md`

网页里的“一键复制 Skill 全文”会读取 `speak-zhouli-SKILL.md`，并附上一句聊天框
使用说明。用户复制后直接粘贴到任意 AI 聊天框即可使用；下载 ZIP 则适合放入
Codex 的 Skill 目录正式安装。

修改 Skill 后，需要同步原文并重新生成压缩包：

```bash
cp skill-package/speak-zhouli/SKILL.md public/downloads/speak-zhouli-SKILL.md
cd skill-package
zip -r -X ../public/downloads/speak-zhouli-skill.zip speak-zhouli
```

## 测试与公开前审计

```bash
npm run public:audit
npm test
npm run typecheck
npm run build
```

`npm run public:audit` 会扫描 Git 跟踪的文本文件，检查是否有明显的真实密钥、
Bearer Token 或私钥块。它不是安全审计的全部，但适合在公开仓库前做最后一道
机械检查。

公开仓库前还应确认：

- `git status --short` 干净。
- `.env.local`、`.dev.vars`、`test-runs/`、`.next/`、`.open-next/`、
  `.wrangler/`、`node_modules/` 没有被 Git 跟踪。
- GitHub visibility 仍由你手动切换；本仓库不会自动改成 public。

## 批量回归测试

公开仓库中提供了一个小样本：

```bash
ZHOULI_TEST_ENDPOINT=http://localhost:3000/api/translate \
  node scripts/run-zhouli-batch.mjs
```

如需使用自己的历史样本，可以传入同结构 JSON 文件：

```bash
node scripts/run-zhouli-batch.mjs test-runs/your-baseline.json
```

`test-runs/` 默认被忽略，适合存放私有回归样本和真实调用结果。

## 限流说明

当前包含轻量的内存限流，适合本地开发、单实例部署和早期验证。多实例
Serverless 或较大流量场景应改用 Redis、Upstash、D1、KV 等共享存储，并在部署
平台设置费用告警与额外防刷策略。

## 部署

### Cloudflare Workers

这个项目有 `/api/translate` 服务端接口，推荐用 Cloudflare Workers + OpenNext
部署，而不是只部署静态页面。

首次部署：

```bash
npm install
npx wrangler login
npx wrangler secret put DEEPSEEK_API_KEY
npm run deploy
```

部署成功后会得到一个 `workers.dev` 公网地址。生产环境建议绑定自定义域名，并
根据流量情况配置平台侧限流、告警和费用保护。

本地预览 Workers 运行时：

```bash
cp .env.example .dev.vars
npm run preview
```

注意不要把真实 `DEEPSEEK_API_KEY` 提交到 Git；生产环境使用 `wrangler secret put`
写入 Cloudflare Secret。

如果主要用户来自中国大陆普通网络，Cloudflare 可以作为快速上线验证版，但访问
速度和稳定性不能保证。更稳的大陆正式版通常需要国内云服务与域名备案。

### Vercel

1. 将项目推送至 GitHub。
2. 在 Vercel 导入仓库。
3. 添加 `DEEPSEEK_API_KEY` 等环境变量。
4. 点击 Deploy。

### 自有服务器

```bash
npm install
npm run build
npm run start
```

生产环境建议使用 PM2 或 systemd 托管，并在前方配置 Nginx 与 HTTPS。

## 许可证

MIT License。欢迎学习、修改和二次创作；如果项目对你有帮助，欢迎保留出处并
给原仓库一个 Star。
