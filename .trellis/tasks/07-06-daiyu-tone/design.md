# 追加林黛玉腔调 — 技术设计

## 架构总览

```
用户浏览器 (page.tsx)            服务端 (route.ts)              DeepSeek API
┌────────────────────┐    POST    ┌──────────────────────┐    POST    ┌──────────┐
│ persona: "daiyu"   │ ────────→ │ persona 分流           │ ──────→  │ DeepSeek │
│ mode: "playful"    │           │ choose SYSTEM_PROMPT  │           │ (API)    │
│ level: "standard"  │           │ choose modeInstructions│           └──────────┘
│ text: "..."        │           │ choose levelInstructions│               ↑
└────────────────────┘    ←──── │ buildUserPrompt(...)   │    ←──────────┘
                              └──────────────────────┘
                                       ↑
                              ┌──────────────────────┐
                              │ lib/prompt.ts         │
                              │  - Persona 类型       │
                              │  - DaiyuMode/DaiyuLevel│
                              │  - DAIYU_SYSTEM_PROMPT│
                              │  - daiyuModeInstructions│
                              │  - daiyuLevelInstructions│
                              │  - buildPerspectiveInstr│
                              │  - buildUserPrompt     │
                              └──────────────────────┘
```

## 1. lib/prompt.ts 改动

### 1.1 类型新增

```ts
export type Persona = "zhouli" | "daiyu";
export type DaiyuMode = "playful" | "sharp" | "wistful" | "aloof";
export type DaiyuLevel = "light" | "standard" | "grand";
```

### 1.2 指令表新增

```ts
const daiyuModeInstructions: Record<DaiyuMode, string>;
const daiyuLevelInstructions: Record<DaiyuLevel, string>;
const DAIYU_SYSTEM_PROMPT: string;
```

内容来自开发计划第4-5节的完整草稿。

### 1.3 buildPerspectiveInstruction 重构

**签名变更**：
```ts
// 旧
function buildPerspectiveInstruction(text: string): string
// 新
function buildPerspectiveInstruction(text: string, persona: Persona): string
```

**内部逻辑**：所有分支判断条件不变。在每个分支末尾的"好的方向示例"字符串，改为从 `persona` 参数查表：

```ts
const personaExamples: Record<Persona, Record<string, string>> = {
  zhouli: {
    directedAttack: "我今日有怒，并非无端；只是眼前这番争执...",
    strongEmotion: "我今日不是无故动怒，而是此事已越过分寸...",
    // ...
  },
  daiyu: {
    directedAttack: "我原不曾要与你计较什么，只是方才这几句话...",
    strongEmotion: "我原也不是要生这样大的气，只是这一桩事...",
    // ...
  }
};
```

**向后兼容**：`buildUserPrompt` 内部调用时传入当前 persona。周礼腔调用时传 `"zhouli"`，产出不变。

### 1.4 buildUserPrompt 分流

```ts
// 旧
export function buildUserPrompt(text: string, mode: ZhouliMode, level: ZhouliLevel): string

// 新
export function buildUserPrompt(
  text: string,
  mode: ZhouliMode | DaiyuMode,
  level: ZhouliLevel | DaiyuLevel,
  persona: Persona = "zhouli",
): string
```

- `persona === "zhouli"` → 原有逻辑（modeInstructions + levelInstructions + 周礼版硬性要求 + buildPerspectiveInstruction(text, "zhouli")）
- `persona === "daiyu"` → daiyuModeInstructions + daiyuLevelInstructions + 黛玉版硬性要求 + buildPerspectiveInstruction(text, "daiyu")
- 缺省值为 `"zhouli"` 确保现有调用处不受影响

### 1.5 导出表

新增导出：
- `DAIYU_SYSTEM_PROMPT`
- `Persona` 类型
- `DaiyuMode` 类型
- `DaiyuLevel` 类型
- `daiyuModeInstructions`
- `daiyuLevelInstructions`

已有导出不变：
- `SYSTEM_PROMPT`, `ZhouliMode`, `ZhouliLevel`, `modeInstructions`, `levelInstructions`, `buildUserPrompt`

## 2. app/api/translate/route.ts 改动

### 2.1 请求体验证

```ts
type RequestBody = {
  text: string;
  mode: string;
  level: string;
  persona?: string;  // 新增，缺省 "zhouli"
};
```

校验：
- `persona` 取值必须为 `"zhouli"` 或 `"daiyu"`
- 非法值返回 400
- 缺省 `"zhouli"`（向后兼容）

### 2.2 API 响应分流

```ts
const isDaiyu = persona === "daiyu";

// 选择 system prompt
const systemPrompt = isDaiyu ? DAIYU_SYSTEM_PROMPT : SYSTEM_PROMPT;

// 选择 mode/level 验证集
const validModes = isDaiyu ? VALID_DAIYU_MODES : VALID_ZHOU_MODES;
const validLevels = isDaiyu ? VALID_DAIYU_LEVELS : VALID_ZHOU_LEVELS;

// 调用 buildUserPrompt
buildUserPrompt(text, mode, level, persona as Persona);
```

### 2.3 Demo 回退分流

```ts
if (!apiKey) {
  if (isDaiyu) {
    return NextResponse.json({
      result: daiyuDemoResult(text, mode as DaiyuMode, level as DaiyuLevel),
      model: "潇湘馆演示",
      demo: true,
      ...
    });
  }
  // 原有 zhouli demo
}
```

`daiyuDemoResult` 函数签名：
```ts
function daiyuDemoResult(text: string, mode: DaiyuMode, level: DaiyuLevel): string
```

四个语气各有对应的固定 demo 文案。

### 2.4 安全分流块（safety block）

`safetyBlockResult` 在 daiyu 模式下返回黛玉风格的拒绝措辞：
```ts
if (isDaiyu) {
  // 返回"带刺的清醒自白"风格拒绝文本
}
```

### 2.5 重要：不修改已有周礼逻辑

`directedAttackFallback`、`firstPersonWorkThanksFallback` 等后处理函数保持周礼逻辑不变。黛玉腔走 DeepSeek 原始输出即可（提示词约束程度足够），不需要这些 fallback 级后处理。

## 3. app/page.tsx 改动

### 3.1 Persona 状态

```ts
const [persona, setPersona] = useState<Persona>("zhouli");
```

### 3.2 Tab 栏

在输入面板上方加两个 Tab：
```
[ 周礼 ]  [ 黛玉 ]
```

点击切换后：
- `setPersona(id)`
- 不重置已输入的 `text`
- 重置 `result` 和 `error`
- 重置 `mode` 和 `level` 到各自 persona 的默认值

### 3.3 语气/篇幅文案联动切换

```tsx
const currentModes = persona === "zhouli" ? zhouliModes : daiyuModes;
const currentLevels = persona === "zhouli" ? zhouliLevels : daiyuLevels;
```

渲染时遍历 `currentModes` / `currentLevels` 取代硬编码。

### 3.4 结果标签联动

```tsx
{selectedMode.title} · {levels.find(...)?.title}
```

改为读取对应 persona 的 levels 数组。

### 3.5 Demo 状态标签

```tsx
{isDemo ? (isDaiyu ? "潇湘馆演示 · 配置 API 后启用大模型" : "本地演示 · 配置 API 后启用大模型") : ...}
```

### 3.6 黛玉腔卡片设计

黛玉腔的图片生成**不沿用周礼的"礼帖"气质**。周礼卡片像一份正式呈堂的礼法文书（暖金底色、浓重红印、贤者画作底纹）；黛玉卡片应该像**清代文人书房里一封随手写的私笺**——克制、清冷、不讨好任何人。

`downloadCard` 中的视觉和文案根据 `persona` 切换：

#### 视觉配色（黛玉 vs 周礼）

| 要素 | 周礼（暖金 · 正式） | 黛玉（冷青 · 清寂） |
|------|---------------------------|---------------------------|
| 底色渐变 | #f7eedf → #dbc7a8（暖金色宣纸） | #ece5db → #d1c6b9（冷调古纸）|
| 底纹水印 | "礼" 字（#8c342a） | "颦" 字（#7a5c5a 暗朱砂）|
| 左上印章 | "礼"（#9e3228） | "颦"（#8c4a42）|
| 右下印章 | "善"（#9e3228） | "潇"（#8c4a42）|
| 角落饰线 | 粗暖红 rgba(137,52,42,0.58) | 细灰褐 rgba(100,85,75,0.35) |
| 背景滤镜 | sepia(0.38) 暖化 | saturate(0.5) 去暖 + 灰度 |
| 整体气质 | 贤者集会 · 郑重入席 | 独坐书斋 · 随手写了几笔 |

#### 文案切换

- 主标题文字：`"合乎周礼"` ↔ `"潇湘评"`
- 副标题：`"把寻常的话，说得有礼有据"` ↔ `"把寻常的话，说得一针见血"`
- 英文标签：`"ZHOU LI · RITE NOTE"` ↔ `"DAI YU · REMARK"`
- 边栏：「言之成礼」↔ 「言之如匕」
- 底部标签：`"合乎周礼 · 礼官署录"` ↔ `"潇湘馆 · 颦卿偶记"`
- 底部正文：`"生成之文，可入席陈说"` ↔ `"句句性情，不与外人道"`
- 分类标签：`礼制 · ${title} · ${level}` ↔ `语式 · ${title} · ${level}`
- 底部附言：`"一言既出，众贤共阅"` ↔ `"非关风月，只问真心"`

`cardDownload.ts` 不变（只负责生成文件名）。

#### 设计原则

黛玉腔的卡片设计不做任何脸谱化装饰（无花瓣、无泪滴、无粉色渐变）。它的气质来自 **清代文人画的审美**：
- 曹雪芹所处的 18 世纪江南文人圈，审美以"淡、冷、疏"为上
- 潇湘馆是竹林掩映的书斋，不是花团锦簇的绣楼
- 卡片应该像黛玉自己写的诗稿：笔墨精当，该停就停，不铺张不讨好

### 3.7 示例文案列表

`examples` 数组可以保留。示例文本本身是中性的，无论周礼还是黛玉都能正常改写。也可以增加一个黛玉风格的示例，比如：
```
"天气冷冷热热的，叫人心里也不安定——这句话合潇湘馆的语境"
```

## 4. skill-package/speak-daiyu/ 新建

照抄 `speak-zhouli/` 的目录结构，内容替换：

### SKILL.md
- name: `speak-daiyu`
- description 改为黛玉腔介绍
- 工作步骤采用第5-7节草稿
- 选择辞气改为四种黛玉语气
- 篇幅格式沿用但文案改

### agents/openai.yaml
- 照抄 `speak-zhouli/agents/openai.yaml` 结构，修改 description 和 model 配置

## 5. public/downloads/ 发布

```bash
cp skill-package/speak-daiyu/SKILL.md public/downloads/speak-daiyu-SKILL.md
cd skill-package && zip -r -X ../public/downloads/speak-daiyu-skill.zip speak-daiyu
```

## 6. scripts/ 改造

`run-zhouli-batch.mjs` 增加 `--persona` 参数支持。

### 输入格式扩展

请求体增加 `persona` 字段：

```json
{
  "persona": "daiyu",
  "text": "...",
  "mode": "playful",
  "level": "standard"
}
```

### 输出格式

验证响应中返回 `persona` 字段或根据 system prompt 判断是否匹配。

新增 `scripts/daiyu-batch-sample.json` 示例文件，覆盖四种语气和三档篇幅的组合。

## 7. README.md 改动

- Highlights 表格新增一行：
  ```
  | 双人设 | 周礼腔 + 林黛玉腔，Tab 一键切换 |
  ```
- 新增"林黛玉腔调"章节：设计哲学、示例对照
- 示例对照展示同一个输入在两个 persona 下的不同输出
