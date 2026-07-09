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

> **配色决策（实现中定稿）：朱砂红归周礼，黛青归黛玉。**
> 朱砂红 `#9e3228` 系列自此为周礼专用色。黛玉的强调色/印章色统一为 **黛青**（slate-green，`#45605a` 系列）——「黛」正是林黛玉名字里那味青黑色眉黛矿料，是她本人的颜色，而非「一种更冷的红」。
> 起因：原方案给黛玉印章/水印定的是暗朱砂（#8c4a42 / #7a5c5a），但页面主体已是冷青灰，一处暖红反成全屏唯一「跳色」；统一为黛青后既消除撞色，又强化了人设辨识。UI 层通过在 `[data-persona="daiyu"]` 下覆盖 `--red`（`#45605a`）/`--red-deep`（`#32463f`）/`--red-soft`（`#6d857e`）实现，所有 `var(--red)` 引用随之转冷；Hero 标题波浪底线的 SVG stroke 也覆盖为 `#45605a`（更细 2.4、更淡 opacity 0.34）。

| 要素 | 周礼（暖金 · 正式） | 黛玉（冷青 · 清寂） |
|------|---------------------------|---------------------------|
| 底色渐变 | #f7eedf → #dbc7a8（暖金色宣纸） | #ece5db → #d1c6b9（冷调古纸）|
| 底纹水印 | "礼" 字（#8c342a） | "颦" 字（#4d605a 黛青）|
| 左上印章 | "礼"（#9e3228） | "颦"（#45605a 黛青）|
| 右下印章 | "善"（#9e3228） | "潇"（#45605a 黛青）|
| 角落饰线 | 粗暖红 rgba(158,50,40,0.78) | 细黛青 rgba(69,96,90,0.78) |
| 卡片文字/英文标签 | 暖砖红 rgba(136,48,39,0.86) | 黛青 rgba(69,96,90,0.86) |
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

### 3.8 集会区标题文案（实现中修正）

集会区（assembly）h2 的黛玉分支由 `"有话，不如说到透亮"` 改为 `"有话，不如说得透彻"`。

原因：「亮」字读感偏暖、偏和气（那种「把话说开就都好了」的开阔明净属于周礼那条线——周礼版本句即「有话，请当众说个明白」）；`"说得透彻"` 与已确立的黛玉冷/锐声线一致（Hero 副标题「请颦卿替你说得透彻」、「说得一针见血」、「冷眼看人」），弥合了原本与 Hero「一针见血」接不上的断点。

### 3.9 黛玉腔防“对话化”（实现中修复的功能 bug）

**现象**：输入 `熊哥我做成了，这个要怎么描述` 时，黛玉腔输出的是“哦，你倒来问我了……你且先说给我听听”——把用户的话当成“对黛玉发问”并回复，而不是把这句话本身改写成黛玉腔。

**根因**：
1. `DAIYU_SYSTEM_PROMPT` 缺一条“你是在改写、不是在对话”的硬规矩（周礼腔提示词有等价条款，黛玉腔只在自检里轻提，压不住）。带称呼（“熊哥”）+ 问句（“怎么描述”）的输入会诱导模型进入“应答”模式。
2. `buildPerspectiveInstruction` 的 `isExpressionRequest` 正则缺 `描述/形容/描写` 变体，导致这类“求说法”未被识别，落到“第一人称代写”分支。

**修复**：
1. `DAIYU_SYSTEM_PROMPT` 新增规则 15.5：即使原话带称呼、像是在问你，也绝不能当成对你说的话来应答；严禁“你倒来问我了”“我替你想想”类回应/反问句；发言主体永远是原话说话人。
2. `isExpressionRequest` 正则补入 `怎么/如何/该/要描述`、`描写`、`形容` 变体（周礼黛玉共享，两边都受益）。

修复后 `熊哥我做成了，这个要怎么描述` 正确走“请求改述”分支，输出形如“我把这事做成了，只是不知该怎么与人说起才好”，可由用户直接发出。边缘已验：`我想描述一下我的愤怒`、`我做了个网站` 仍走第一人称代写，不误入请求模式。

### 3.10 中文提示词字符串坏字（反复出现的 pitfall）

**现象**：黛玉腔提示词字符串里混入一批形近/编码坏字，肉眼在长句中极难发现，且已连续出现两批：
- 第一批（前次已修）：`颦卵→颦卿`、`自嘶→自嘲`、`锻芒→锋芒`、`讄刺→讥刺`、`拟颇→拟颦`、`释顏→释颦`、`�`(U+FFFD)。
- 第二批（本次修）：`自嘐→自嘲`(×5)、`哭哭啄啄→哭哭啼啼`、`戈然而止→戛然而止`、`发氄→发飙`、`劝讫→劝诫`、`撞娇卖惨→撒娇卖惨`、`不撞泼→不撒泼`。

**根因**：`lib/prompt.ts` 内嵌大量中文长字符串（SYSTEM_PROMPT、视角指令），编辑时输入法/复制粘贴引入的坏字不影响 TS 类型与 build，typecheck/build 全绿也无法拦截，只影响送给模型的提示词语义。

**规避**：改动 `lib/prompt.ts` 的中文字符串后，除 typecheck+build 外，必须跑一次坏字扫描（见 spec `frontend/prompt-string-hygiene.md`）：扫 U+FFFD 与已知坏字部首（颇/嘶/啄/氄/嘐/讄/顏），全零方可提交。

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
