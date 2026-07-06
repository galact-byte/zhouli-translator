# 追加林黛玉腔调 — 执行计划

## 执行顺序

依赖关系：`prompt.ts` → `route.ts` → `page.tsx` → skill-package → README

## Step 1: lib/prompt.ts — 类型定义 + 指令表 + SYSTEM_PROMPT

**文件**: `lib/prompt.ts`

**改动内容**:
1. 新增 `Persona`, `DaiyuMode`, `DaiyuLevel` 类型定义
2. 新增 `daiyuModeInstructions` 记录
3. 新增 `daiyuLevelInstructions` 记录
4. 新增 `DAIYU_SYSTEM_PROMPT` 常量（开发计划第5节草稿，按实际字数调入）
5. 重构 `buildPerspectiveInstruction` — 加 `persona` 参数；抽离"好的方向示例"为 `personaExamples` 表
6. 重构 `buildUserPrompt` — 加 `persona` 参数；按 `persona` 分流拼装周礼版/黛玉版硬性要求
7. 导出 `DAIYU_SYSTEM_PROMPT`, `Persona`, `DaiyuMode`, `DaiyuLevel`

**验证**: `npm run typecheck` 通过

## Step 2: app/api/translate/route.ts — API 支持 persona

**文件**: `app/api/translate/route.ts`

**改动内容**:
1. 新增 `VALID_DAIYU_MODES` / `VALID_DAIYU_LEVELS` 常量
2. 请求体解析增加 `persona` 字段，缺省 `"zhouli"`
3. 根据 `persona` 选择 `SYSTEM_PROMPT` / `DAIYU_SYSTEM_PROMPT`
4. 根据 `persona` 选择 mode/level 验证集
5. 调用 `buildUserPrompt` 增加 `persona` 参数
6. 新增 `daiyuDemoResult()` 函数，四个语气各一段 Demo 文案
7. 无 API Key 时走对应 persona 的 demo 回退
8. function 返回值保持向下兼容（新增 `persona` 字段）

**验证**: 
- `npm run typecheck` 通过
- `curl -X POST "http://localhost:3000/api/translate" -d '{"text":"hello","mode":"playful","level":"light","persona":"daiyu"}'` 正确返回
- `curl` 不带 persona 返回周礼结果（向后兼容）
- 非法 persona 返回 400

## Step 3: app/page.tsx — UI 人设切换

**文件**: `app/page.tsx`

**改动内容**:
1. 新增 `persona` 状态（useState<Persona>("zhouli")）
2. 人设切换 Tab UI（两个 Tab）
3. 定义 `daiyuModes` 和 `daiyuLevels` 数组
4. 渲染时根据 `persona` 选择 modes/levels 数组
5. 切换 Tab 时重置 mode/level 默认值，保留 text
6. 结果标签联动变化
7. Demo 标签联动显示（大儒已阅 ↔ 潇湘馆演示）
8. 礼帖生成文案按 persona 分流
9. Skill 下载区保持现状（只下载周礼 Skill 或新增黛玉 Skill 下载按钮）

**验证**: 
- `npm run dev` 启动，手动测试 Tab 切换
- 切换后语气/篇幅文案正确联动
- 无 API Key 时 demo 回退正常
- 礼帖生成与当前一致

## Step 4: skill-package/speak-daiyu/ + public/downloads/

**新建文件**:
- `skill-package/speak-daiyu/SKILL.md`
- `skill-package/speak-daiyu/agents/openai.yaml`
- `public/downloads/speak-daiyu-SKILL.md`
- `public/downloads/speak-daiyu-skill.zip`

**内容**:
- SKILL.md: 照抄 speak-zhouli 结构，内容替换为黛玉腔 prompt 草稿
- openai.yaml: 照抄 speak-zhouli/agents/openai.yaml，修改 description 和 model 配置

**验证**: 访问 `/downloads/speak-daiyu-SKILL.md` 返回正确内容

## Step 5: scripts/ — batch 脚本支持 persona

**改动内容**:
- `scripts/run-zhouli-batch.mjs` 改造为支持 `--persona` 和 `persona` 字段
- 新增 `scripts/daiyu-batch-sample.json` 覆盖四种语气 + 三档篇幅

**验证**: 
```bash
ZHOULI_TEST_ENDPOINT=http://localhost:3000/api/translate \
  node scripts/run-zhouli-batch.mjs scripts/daiyu-batch-sample.json
```

## Step 6: README.md — 文档更新

**文件**: `README.md`

**改动内容**:
- Highlights 表格新增一行
- 新增"林黛玉腔调"章节
- 示例对照展示

## Step 7: 回归验证

```bash
npm run typecheck
npm run build
npm test
npm run public:audit
```

## 回滚点

| 改动 | 回滚方式 |
|------|----------|
| lib/prompt.ts | `git checkout -- lib/prompt.ts` |
| route.ts | `git checkout -- app/api/translate/route.ts` |
| page.tsx | `git checkout -- app/page.tsx` |
| skill-package + downloads | 删除对应文件 |
| scripts | `git checkout -- scripts/` |
| README.md | `git checkout -- README.md` |

每个 Step 完成后 `git add` 对应文件并 commit，确保单个步骤可以独立回滚。
