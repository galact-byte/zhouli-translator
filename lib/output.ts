const LEADING_META_LINE_PATTERNS = [
  /^(?:原话|输入|用户原话|用户输入|这句(?:话)?|这段(?:话|文字)?|这条(?:内容)?).{0,120}(?:太短|正向|负向|感叹|请求|提问|改写|转换|翻译|档位|模式|风格|来写|处理|输出|提示词).*[：:]?$/u,
  /^(?:我按|这里按|这边按|按照|按).{0,80}(?:档位|模式|风格|语气|人设).{0,80}(?:写|处理|改写|转换).*[：:]?$/u,
  /^(?:改写|转换|翻译|输出|结果|成稿)(?:结果)?(?:如下|是|为)?[：:]?$/u,
  /^以下(?:是|为)?.{0,40}(?:改写|转换|翻译|输出|结果|成稿).*[：:]?$/u,
  /^好的?[，,。\s]*(?:我来|可以|这就|按).{0,80}(?:改写|转换|翻译|写成|处理).*[：:]?$/u,
];

function isMetaLine(line: string) {
  const compact = line.trim();

  if (!compact) return true;

  return LEADING_META_LINE_PATTERNS.some((pattern) => pattern.test(compact));
}

function stripLeadingMetaLines(value: string) {
  const lines = value.replace(/\r\n/g, "\n").split("\n");
  let start = 0;

  while (start < lines.length && isMetaLine(lines[start])) {
    start += 1;
  }

  return lines.slice(start).join("\n").trim();
}

function unwrapWholeResultQuote(value: string) {
  const text = value.trim();
  const quotePairs: Array<[string, string]> = [
    ["“", "”"],
    ["‘", "’"],
    ['"', '"'],
    ["'", "'"],
  ];

  for (const [open, close] of quotePairs) {
    if (text.startsWith(open) && text.endsWith(close)) {
      return text.slice(open.length, -close.length).trim();
    }
  }

  return text;
}

export function cleanModelResponseText(value: string) {
  let text = value
    .replace(/\*\*([^*\n]+)\*\*/g, "$1")
    .replace(/`([^`\n]+)`/g, "$1")
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/^\s*[-*]\s+/gm, "")
    .replace(/^\s*\d+[.、]\s+/gm, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  for (let index = 0; index < 3; index += 1) {
    const before = text;
    text = unwrapWholeResultQuote(stripLeadingMetaLines(text));
    if (text === before) break;
  }

  return text.trim();
}
