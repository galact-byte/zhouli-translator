# Open Source Readiness

This repository is prepared for public release, but changing GitHub visibility
is a separate manual step.

## Public Release Boundary

Safe to publish:

- Next.js app source code.
- DeepSeek API integration code.
- Prompt construction logic.
- The downloadable `speak-zhouli` Skill package.
- Public images and static download files.
- README, license, and example environment variables.

Do not commit or publish:

- Real `.env`, `.env.local`, or `.dev.vars` files.
- API keys, Cloudflare API tokens, account IDs, service tokens, or session data.
- Private test logs under `test-runs/`.
- Local build output such as `.next/`, `.open-next/`, `.wrangler/`, and `node_modules/`.
- Production-only WAF, billing, alerting, or abuse-response notes.

## Pre-Public Checklist

Run these checks immediately before setting the GitHub repository public:

```bash
npm run public:audit
npm test
npm run typecheck
npm run build
git status --short
```

Expected state:

- `npm run public:audit` reports no obvious secrets in tracked text files.
- Tests, typecheck, and build pass.
- `git status --short` is clean after committing.
- GitHub repository visibility is still private until you explicitly change it.

## Suggested Announcement

```text
可以，仓库已经整理成可公开状态。
前端、生成逻辑、提示词结构和 Skill 都会放出来，方便大家学习和复现。
真实 API Key、线上账号配置和私有日志不会公开。
如果这个项目帮到你，欢迎给原视频和 GitHub 仓库点个赞或 Star。
```
