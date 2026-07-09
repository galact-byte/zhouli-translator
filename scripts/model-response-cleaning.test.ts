import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { buildUserPrompt } from "../lib/prompt.ts";
import { cleanModelResponseText } from "../lib/output.ts";

test("cleans Daiyu model meta preamble and unwraps quoted result", () => {
  const raw = [
    "原话太短，又是正向感叹，我按“娇嗔打趣”档位来写（对方是亲近可拌嘴的人）：",
    "",
    "“好什么好，你倒先乐起来了。我倒瞧着，这好的里头，未必没有几分别人瞧不见的酸处。罢了，你高兴就成，横竖我也是替你欢喜的。”",
  ].join("\n");

  assert.equal(
    cleanModelResponseText(raw),
    "好什么好，你倒先乐起来了。我倒瞧着，这好的里头，未必没有几分别人瞧不见的酸处。罢了，你高兴就成，横竖我也是替你欢喜的。",
  );
});

test("Daiyu prompt forbids talking about prompt decisions", () => {
  const prompt = buildUserPrompt("那太好了", "playful", "light", "daiyu");

  assert.match(prompt, /原话太短/);
  assert.match(prompt, /档位/);
  assert.match(prompt, /不要解释为什么这样写/);
});

test("API sanitizes Daiyu output instead of returning raw model text", () => {
  const routeSource = readFileSync(
    new URL("../app/api/translate/route.ts", import.meta.url),
    "utf8",
  );

  assert.match(routeSource, /cleanModelResponseText/);
  assert.match(routeSource, /isDaiyu \? cleanModelResponseText\(rawText\)/);
  assert.doesNotMatch(routeSource, /isDaiyu \? rawText : cleanGeneratedText/);
});
