# 追加林黛玉腔调

## Goal

在现有"合乎周礼"翻译器基础上，追加一个"林黛玉腔调"（Daiyu persona）选项，让用户选择用黛玉体的白话翻译腔改写中文。

## User Value

- 扩展项目的表达风格，从单一"周礼腔"变成多 persona 可切换
- 黛玉腔的受众与周礼腔有交叉但也有独立受众（《红楼梦》爱好者、反感论证式幽默但接受戳破式幽默的用户）
- 从"同一个梗"扩展到"同一种产品形态、不同人物声线"的复用模式

## Background & Confirmed Facts

### 项目架构

- `lib/prompt.ts` — 类型定义、SYSTEM_PROMPT、modeInstructions、levelInstructions、buildPerspectiveInstruction、buildUserPrompt
- `app/api/translate/route.ts` — API 端点，请求体验证、速率限制、安全审计、调用 DeepSeek
- `app/page.tsx` — 主 UI，包含 Textarea、四种语气选择、三档篇幅选择、结果展示、礼帖生成、Skill 下载
- `skill-package/speak-zhouli/` — SKILL.md + agents/openai.yaml
- `public/downloads/` — speak-zhouli-SKILL.md + speak-zhouli-skill.zip
- `scripts/` — batch 回归测试、公开审计脚本

### 周礼腔现有设计

- 四种语气：gentle（温言相劝）、debate（大儒辩经）、defend（强行圆场）、lament（痛心疾首）
- 三档篇幅：light（小礼 70-130字）、standard（成礼 150-260字）、grand（大礼 280-450字）
- SYSTEM_PROMPT 详细定义语言风格和约束
- buildPerspectiveInstruction 根据输入文本判定人称视角
- buildUserPrompt 拼装 mode 指令、level 指令、硬性要求、视角判定、原话

### 黛玉腔设计哲学（与周礼腔的根本区别）

周礼腔的笑点机制是**论证**：严密推导→荒唐结论。黛玉腔的机制是**戳破**：拒绝论证、一针见血。黛玉内核不是"多愁善感"，而是"太清醒，又拒绝表演"——她的犀利、伤感、孤高都是"拒绝表演"的不同侧面。

### 设计决策

| 决策 | 结论 |
|------|------|
| UI 方案 | Tab 切换。顶部两个 Tab（周礼/黛玉），联动切换语气、篇幅文案 |
| buildPerspectiveInstruction | 加 `persona` 参数复用判断逻辑，仅替换各分支末尾的示例措辞，不拆成独立函数 |
| Demo 回退 | 写独立的 `daiyuDemoResult`，四个语气各有固定黛玉体示例文案 |
| 卡片视觉 | 不沿用周礼暖金礼帖风格；改用冷调古纸配色、`颦`/`潇` 印章、暗朱砂水印，气质如清代文人私笺 |
| 任务结构 | 一个任务完成，不拆子任务 |

## Requirements

### R1: Persona UI 切换
- 用户在 UI 上可以切换"周礼"和"黛玉"两个人设（Tab 方案）
- 切换后语气选项文案、篇幅选项文案联动切换
- 当前选择的人设状态需持久化显示
- 切换不丢失已输入的原文

### R2: API 支持 persona 字段
- POST `/api/translate` 请求体新增 `persona` 字段，取值 `"zhouli"` 或 `"daiyu"`
- 缺省值为 `"zhouli"`（向后兼容）
- 根据 persona 选择对应的 SYSTEM_PROMPT、modeInstructions、levelInstructions
- 非法 persona 值返回 400 错误

### R3: 黛玉腔 Prompt 工程
- 定义 `DaiyuMode = "playful" | "sharp" | "wistful" | "aloof"` 四种语气
- 定义 `DaiyuLevel = "light" | "standard" | "grand"` 三档篇幅（浅愁 / 清怨 / 伤逝）
- 编写 `DAIYU_SYSTEM_PROMPT`、`daiyuModeInstructions`、`daiyuLevelInstructions`
- 重构 `buildPerspectiveInstruction` 增加 `persona` 参数
- 重构 `buildUserPrompt` 按 persona 分流拼装硬性要求
- 粗口输入时黛玉腔输出"带刺的清醒自白"，而非周礼腔的"体面斥责"

### R4: 黛玉腔 SKILL 包
- 新建 `skill-package/speak-daiyu/SKILL.md`（照抄 speak-zhouli 结构，内容替换）
- 新建 `skill-package/speak-daiyu/agents/openai.yaml`
- 发布到 `public/downloads/speak-daiyu-SKILL.md`
- 打包为 `public/downloads/speak-daiyu-skill.zip`

### R5: 黛玉腔 batch 测试
- `scripts/run-zhouli-batch.mjs` 改造为支持 `--persona` 参数
- 新增 `scripts/daiyu-batch-sample.json`

### R6: 文档更新
- README.md Highlights 表格新增一行（双人设）
- 新增"林黛玉腔调"章节：设计哲学、示例对照

## Acceptance Criteria

### AC1: UI
- [ ] 人设切换 Tab 可正常切换周礼/黛玉
- [ ] 切换后语气选项从 温言相劝/大儒辩经/强行圆场/痛心疾首 切换到 娇嗔打趣/夹枪带棒/触景伤怀/孤高拒人
- [ ] 切换后篇幅选项从 小礼/成礼/大礼 切换到 浅愁/清怨/伤逝
- [ ] 切换后结果标签联动变化
- [ ] 无 API Key 时黛玉腔也能正常走 demo 回退

### AC2: API
- [ ] `POST /api/translate` 支持 `persona: "daiyu"`，返回黛玉腔风格的改写结果
- [ ] `persona: "zhouli"` 或省略时，行为与当前完全一致（向后兼容）
- [ ] 非法 persona 值返回 400 错误

### AC3: Prompt
- [ ] 黛玉腔发出的 system prompt 内容与开发计划第5节草稿一致
- [ ] buildPerspectiveInstruction 重构后周礼腔行为不受影响
- [ ] 粗口输入时，黛玉腔输出"带刺的清醒自白"，不输出"体面斥责"

### AC4: SKILL 包
- [ ] `public/downloads/speak-daiyu-SKILL.md` 可访问
- [ ] `public/downloads/speak-daiyu-skill.zip` 可下载

### AC5: 已有功能不受影响
- [ ] 周礼腔的所有语气、篇幅、demo、安全审计、速率限制、图片生成功能不变
- [ ] `npm run build` 通过
- [ ] `npm run typecheck` 通过

## Out of Scope

- 不新增第三个人设（仅限于黛玉）
- 不修改现有周礼腔的 prompt 内容（仅重构 `buildPerspectiveInstruction` 的调用签名）
- 不修改速率限制机制
- 不修改安全审计（safety block）的检测逻辑，仅在输出端增加黛玉风格的拒绝措辞
- 卡片的 Canvas 绘制逻辑不变（文字换行、首字下沉、装饰结构），但配色方案、印章文字、水印字、分类标签文案按 persona 切换
