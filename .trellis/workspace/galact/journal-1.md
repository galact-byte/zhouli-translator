# Journal - galact (Part 1)

> AI development session journal
> Started: 2026-07-06

---

## 2026-07-06 — daiyu-tone 收尾：黛青配色 + 文案

接续被中断的改色工作，完成黛玉人设的最后打磨：

- **酒砂→黛青**：确立「朱砂红归周礼、黛青归黛玉」。黛玉 `--red` 变量及所有硬编码砖红/暖中性色→黛青 `#45605a` 系（globals.css + page.tsx 卡片 canvas）。选 `黛`（眉黛矿料）因其是林黛玉名字本色。
- **Hero 底线**：黛玉模式下 SVG stroke `#9e3228`→`#45605a`，压细压淡（de-clash 用户指出的唯一跳色）。
- **文案**：集会区 h2 `说到透亮`→`说得透彻`（去暖「亮」，对齐 Hero 冷/锐声线）。
- **图片**：那抹红衣古画用户决定保留（当画眼），不再压冷。
- trellis-check → PASS；design.md §3.6/3.8 已同步更正（原写黛玉用 #8c4a42 印章，现正为黛青）。
- 验证：`npm run build` / `npm run typecheck` 均通过。

### 黛玉腔“对话化” bug 修复

用户手测发现：`熊哥我做成了，这个要怎么描述` → 黛玉腔回了“你倒来问我了……你且先说给我听听”（把输入当成对黛玉发问并应答，而非改写）。

根因两层：（a）`DAIYU_SYSTEM_PROMPT` 缺“改写而非对话”硬规矩（周礼腔有，黛玉腔无）；（b）`isExpressionRequest` 正则漏 `描述/形容/描写`，输入落到第一人称代写分支。

修：（1）DAIYU_SYSTEM_PROMPT 加规则 15.5（严禁回应/反问用户，发言主体恒为原话说话人）；（2）isExpressionRequest 正则补 描述/描写/形容 变体（共享，周礼黛玉均受益）。trellis-check → PASS（含边缘回归验证）；typecheck+build 通过。design.md §3.9 记录。



## Session 1: daiyu-tone 收尾：第二批坏字全量排查 + README 释颦纠错 + 提交归档

**Date**: 2026-07-09
**Task**: daiyu-tone 收尾：第二批坏字全量排查 + README 释颦纠错 + 提交归档
**Branch**: `merge/upstream-reli`

### Summary

全量排查 lib/prompt.ts 黛玉视角指令块，订正第二批编码坏字（自嘐→自嘲等7类）；补 title/favicon 联动与卡片拟颦/释颦文案；发现并修正 README「林黛玉腔调」章节的释礼/释颦错位示例；新增 prompt-string-hygiene spec 与 design §3.10 沉淀坏字 pitfall；.gitignore 追加忽略 AI 配置，AGENTS.md 停止跟踪。typecheck+build+坏字扫描全绿。

### Main Changes

(Add details)

### Git Commits

| Hash | Message |
|------|---------|
| `efa760c` | (see git log) |
| `d523b6e` | (see git log) |
| `3ab52b9` | (see git log) |

### Testing

- [OK] (Add test results)

### Status

[OK] **Completed**

### Next Steps

- None - task complete
