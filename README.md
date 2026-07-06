# 合乎周礼

<p align="center">
  <strong>把寻常的话，翻译成一本正经、略显荒唐、但又有礼有据的周礼白话翻译腔。</strong>
</p>

<p align="center">
  <a href="https://www.bilibili.com/video/BV12a7N6qE1g/">B站原视频</a>
  ·
  <a href="https://hehuzhouli.com">在线体验</a>
  ·
  <a href="#quick-start">快速开始</a>
  ·
  <a href="#speak-zhouli-skill">下载 Skill</a>
  ·
  <a href="#deployment">部署</a>
</p>

<p align="center">
  <img alt="License" src="https://img.shields.io/badge/license-MIT-black">
  <img alt="Official" src="https://img.shields.io/badge/official-hehuzhouli.com-8b1e1e">
  <a href="https://github.com/Aspirin0000/zhouli-translator">
    <img alt="Official GitHub repository" src="https://img.shields.io/badge/GitHub-official_repo-black?logo=github">
  </a>
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-black">
  <img alt="React" src="https://img.shields.io/badge/React-19-149eca">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178c6">
  <img alt="Cloudflare Workers" src="https://img.shields.io/badge/Cloudflare-Workers-f38020">
</p>

![合乎周礼界面预览](public/images/zhouli-assembly.webp)

## What Is This

`合乎周礼` 是一个中文梗文案生成器。它把普通中文改写成"大周礼时代"流行的
白话翻译腔：先讲一个看似古代的道理，再把现代小事放进礼法、名分、职分和体面里一本正经地论证。

在线版本：[hehuzhouli.com](https://hehuzhouli.com)

B站原视频：[B站原视频](https://www.bilibili.com/video/BV12a7N6qE1g/)

这是 [hehuzhouli.com](https://hehuzhouli.com) 原网站作者维护的官方开源仓库。
若你是从视频、网页、转载或镜像项目来到这里，这里就是原版网站对应的源码与
Skill 发布处。

这个仓库包含：

- Next.js 网站源码。
- `/api/translate` 服务端生成接口。
- DeepSeek Chat Completions 调用逻辑。
- 周礼体提示词构造与清洗规则。
- 可复制、可下载的 `speak-zhouli` 和 `speak-daiyu` Skill 包。
- 礼帖图片生成与下载逻辑。

仓库不包含真实 API Key、私有日志、线上账号凭据或生产平台的安全配置。

## Highlights

| Capability | Detail |
| --- | --- |
| 三档礼数 | 小礼、成礼、大礼，覆盖短评到长文 |
| 四种辞气 | 温言相劝、大儒辩经、强行圆场、痛心疾首 |
| 演示模式 | 没有 API Key 时仍可预览界面与交互 |
| Skill 分发 | 支持一键复制 Skill 全文和 ZIP 下载 |
| 双人设 | 周礼腔 + 林黛玉腔，Tab 一键切换 |
| 图片礼帖 | 将生成结果保存为适合传播的图片 |
| 公开前审计 | 内置脚本扫描明显密钥与私钥块 |

## Star History

<a href="https://github.com/Aspirin0000/zhouli-translator/stargazers">
  <img alt="诸贤赐星记" src="public/images/github-star-history-zhouli.svg">
</a>

## Example

Input:

```text
疯狂星期四，谁愿请我一食才合乎周礼
```

Output style:

```text
我听闻，古人设宴，并非只为一餐之饱，也是借饭食来观朋友情义。
今日正逢星期四，我开口求一食，看似嘴馋，其实是在给诸位一个行仁义、修情分的机会。
若有人愿意请客，便不是破费，而是以鸡会友，这难道不也合乎周礼吗？
```

## 林黛玉腔调

在现有周礼腔的基础上，项目新增了**林黛玉腔调**（Daiyu persona）选项，
用户可在界面上方 Tab 切换周礼/黛玉两套人设。

### 设计哲学

黛玉腔与周礼腔的根本区别在于笑点/共鸣机制：

- **周礼腔**靠**论证**：严密推导→荒唐结论。一本正经地建立类比，再层层推导。
- **黛玉腔**靠**戳破**：拒绝论证，一针见血。不绕弯子，直接说真话，然后一句"罢了"就收。

黛玉腔的内核不是"多愁善感"，而是**"太清醒，又拒绝表演"**。黛玉比所有人都看得透，
但不肯把这份聪明用来讨好和经营人缘——她的犀利、伤感、孤高，都是"拒绝表演"的不同侧面。

### 示例对照

Input:

```text
疯狂星期四，谁愿请我一食才合乎周礼
```

**周礼腔（小礼 · 强行圆场）：**

```text
我听闻，古人设宴，并非只为一餐之饱，也是借饭食来观朋友情义。
今日正逢星期四，我开口求一食，看似嘴馋，其实是在给诸位一个行仁义、修情分的机会。
若有人愿意请客，便不是破费，而是以鸡会友，这难道不也合乎周礼吗？
```

**黛玉腔（清怨 · 夹枪带棒）：**

```text
我原不是那等嘴馋要人请客的人，只是这话说出来，倒要看看谁肯搭这个茬儿。
罢了，没人应也不打紧，我自己去买便是——原也不指望谁能把我这点小心思放在眼里。
```

**黛玉腔（浅愁 · 孤高拒人）：**

```text
我原没指望谁请，不过白说一句，若真无人应，倒显得我巴巴儿地讨人嫌了。罢了，不说了。
```

### 四种语气

| 语气 | 定义 | 使用场景 |
|------|------|----------|
| 娇嗔打趣 | 机锋轻巧，底色是亲近不是攻击 | 关系亲近、可以卸下防备的语境 |
| 夹枪带棒 | 一针见血拆穿敷衍、冷落、虚伪 | 对方明显在敷衍或有优越感的场合 |
| 触景伤怀 | 由眼前小事清醒联想到命运处境 | 用户话里带无奈/孤独感的场合 |
| 孤高拒人 | 直接说真话，拒绝讨好或退让 | 用户想拒绝/划界限的场合 |

### 三档篇幅

| 档位 | 字数 | 说明 |
|------|------|------|
| 浅愁 | 70-130字 | 一两句戳破或自嘲，不展开完整情绪起伏 |
| 清怨 | 150-260字 | 一次转折，可选一句自造诗意小段 |
| 伤逝 | 280-450字 | 从小事清醒推到命运认知，1-2句自造诗意段 |

## Quick Start

Requirements:

- Node.js 20 or newer.
- A DeepSeek API key for real generation.

Run locally:

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

`.env.local`:

```env
DEEPSEEK_API_KEY=sk-your-key-here
DEEPSEEK_MODEL=deepseek-v4-flash
MAX_OUTPUT_TOKENS=720
```

If `DEEPSEEK_API_KEY` is missing, the app falls back to local demo output and
does not call DeepSeek.

## Project Structure

```text
app/
  api/translate/route.ts       Server-side generation endpoint
  page.tsx                     Main UI and card export flow
lib/
  prompt.ts                    Prompt assembly and perspective rules
  cardDownload.ts              Unique card download filenames
public/
  downloads/                   Public Skill assets
  images/                      README and website images
scripts/
  public-audit.mjs             Public-release secret scan
  run-zhouli-batch.mjs         Batch regression runner
skill-package/
  speak-zhouli/                Zhouli Skill source
  speak-daiyu/                 Daiyu Skill source
```

## DeepSeek Runtime

The production generation path:

1. The browser submits text, mode, level, persona, and a client id to `/api/translate`.
2. The server validates input length, mode, level, and persona.
3. A lightweight in-memory rate limiter checks the request.
4. The server builds a persona-specific system prompt plus a user prompt.
5. DeepSeek returns a candidate response.
6. The server cleans common failure patterns before returning JSON.

Default runtime choices:

- Model: `deepseek-v4-flash`.
- Thinking mode: disabled.
- User input limit: 300 Chinese characters.
- Output limit: configured by `MAX_OUTPUT_TOKENS`.
- API Key scope: server only, never sent to the browser.

For multi-instance production deployments, replace the in-memory rate limiter
with shared storage such as Redis, Upstash, D1, or KV, and configure platform
side abuse controls and billing alerts.

## Speak Zhouli Skill

The website ships standalone Skills:

| Asset | Path |
| --- | --- |
| Zhouli Skill source | `skill-package/speak-zhouli/` |
| Zhouli website copy | `public/downloads/speak-zhouli-SKILL.md` |
| Zhouli ZIP download | `public/downloads/speak-zhouli-skill.zip` |
| Daiyu Skill source | `skill-package/speak-daiyu/` |
| Daiyu website copy | `public/downloads/speak-daiyu-SKILL.md` |
| Daiyu ZIP download | `public/downloads/speak-daiyu-skill.zip` |

After editing any Skill source, rebuild the public assets:

```bash
cp skill-package/speak-zhouli/SKILL.md public/downloads/speak-zhouli-SKILL.md
cd skill-package && zip -r -X ../public/downloads/speak-zhouli-skill.zip speak-zhouli && cd ..

cp skill-package/speak-daiyu/SKILL.md public/downloads/speak-daiyu-SKILL.md
cd skill-package && zip -r -X ../public/downloads/speak-daiyu-skill.zip speak-daiyu && cd ..
```

## Quality Checks

Run the same checks used before release:

```bash
npm run public:audit
npm test
npm run typecheck
npm run build
```

`npm run public:audit` scans Git-tracked text files for obvious API keys,
literal bearer tokens, private key blocks, and Cloudflare credential
assignments. It is a guardrail, not a replacement for manual review.

Batch regression runner:

```bash
ZHOULI_TEST_ENDPOINT=http://localhost:3000/api/translate \
  node scripts/run-zhouli-batch.mjs
```

Use a private baseline by passing a compatible JSON file:

```bash
node scripts/run-zhouli-batch.mjs test-runs/your-baseline.json
```

Daiyu batch test:

```bash
ZHOULI_TEST_ENDPOINT=http://localhost:3000/api/translate \
  node scripts/run-zhouli-batch.mjs scripts/daiyu-batch-sample.json
```

`test-runs/` is ignored by Git and is intended for private regression samples
and real API outputs.

## Deployment

### Cloudflare Workers

This project has a server endpoint, so Cloudflare Workers + OpenNext is the
recommended Cloudflare path.

```bash
npm install
npx wrangler login
npx wrangler secret put DEEPSEEK_API_KEY
npm run deploy
```

Local Workers preview:

```bash
cp .env.example .dev.vars
npm run preview
```

Do not commit real `.env`, `.env.local`, or `.dev.vars` files. Production
secrets should be stored with the hosting platform's secret manager.

### Vercel

1. Import the repository into Vercel.
2. Add `DEEPSEEK_API_KEY`, `DEEPSEEK_MODEL`, and `MAX_OUTPUT_TOKENS`.
3. Deploy.

### Self-Hosted Node

```bash
npm install
npm run build
npm run start
```

For production, run behind HTTPS and a process manager such as PM2 or systemd.

## Security Notes

- Never commit real API keys or platform tokens.
- Keep private request logs and batch outputs outside Git.
- Add shared rate limiting before high-traffic public deployments.
- Configure billing alerts on the model provider and hosting platform.
- Review [OPEN_SOURCE.md](OPEN_SOURCE.md) before changing repository visibility.

## Contributing

Issues and pull requests are welcome. Useful contributions include:

- Better prompt tests and regression samples.
- More robust safety and perspective handling.
- UI accessibility fixes.
- Deployment recipes for other platforms.
- Documentation improvements for new users.

Please run `npm run public:audit`, `npm test`, `npm run typecheck`, and
`npm run build` before opening a pull request.

## License

MIT License. See [LICENSE](LICENSE).
