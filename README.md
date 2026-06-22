# 合乎周礼

把寻常的话，翻译成“大周礼时代”流行的白话翻译腔。

## 本地运行

```bash
npm install
cp .env.example .env.local
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)。

如果没有配置 `DEEPSEEK_API_KEY`，项目会自动使用本地演示文案，便于先预览界面。

## 可下载 Skill

网站包含一份可独立安装的 `speak-zhouli` Skill：

- Skill 源文件：`skill-package/speak-zhouli/`
- 网站下载包：`public/downloads/speak-zhouli-skill.zip`
- 网站复制原文：`public/downloads/speak-zhouli-SKILL.md`
- 下载地址：`/downloads/speak-zhouli-skill.zip`
- 复制原文地址：`/downloads/speak-zhouli-SKILL.md`

网页里的“一键复制 Skill 全文”会读取 `speak-zhouli-SKILL.md`，并附上一句聊天框使用说明。用户复制后直接粘贴到任意 AI 聊天框即可使用；下载 ZIP 则适合放入 Codex 的 Skill 目录正式安装。

修改 Skill 后，需要同步原文并重新生成压缩包：

```bash
cp skill-package/speak-zhouli/SKILL.md public/downloads/speak-zhouli-SKILL.md
cd skill-package
zip -r -X ../public/downloads/speak-zhouli-skill.zip speak-zhouli
```

## DeepSeek 配置

在 `.env.local` 中填写：

```env
DEEPSEEK_API_KEY=sk-your-key-here
DEEPSEEK_MODEL=deepseek-v4-flash
MAX_OUTPUT_TOKENS=720
```

项目默认：

- 使用 `deepseek-v4-flash`
- 明确关闭思考模式，降低延迟与成本
- 用户输入限制为 300 字
- 输出上限为 720 tokens
- 固定提示词放在最前面，便于命中 DeepSeek 上下文缓存
- API Key 只在服务端使用，不会发送给浏览器

## 限流说明

当前包含轻量的内存限流：

- 每个 IP + 浏览器标识，10 分钟最多 12 次
- 每日最多 60 次

这适合单机 Node 部署和首轮测试。若部署在多实例 Serverless 环境并迎来较大流量，建议换成 Redis/Upstash 等共享限流存储，并在部署平台设置费用告警。

## 部署

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
