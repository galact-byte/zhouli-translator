import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import test from "node:test";

const pageSource = () =>
  readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
const layoutSource = () =>
  readFileSync(new URL("../app/layout.tsx", import.meta.url), "utf8");
const packageSource = () =>
  readFileSync(new URL("../package.json", import.meta.url), "utf8");
const readmeSource = () =>
  readFileSync(new URL("../README.md", import.meta.url), "utf8");
const skillSource = () =>
  readFileSync(new URL("../skill-package/speak-zhouli/SKILL.md", import.meta.url), "utf8");
const publicSkillSource = () =>
  readFileSync(new URL("../public/downloads/speak-zhouli-SKILL.md", import.meta.url), "utf8");

test("website copy presents ask and explain as paired directions", () => {
  const source = pageSource();

  assert.match(source, /问礼释礼/);
  assert.match(source, /问礼成文，释礼还意/);
  assert.match(source, /将白话化为周礼，也把周礼翻回人话/);
  assert.match(source, /isPlainDirection \? "释礼" : "成礼"/);
  assert.match(source, /今日还可\$\{isPlainDirection \? "释礼" : "问礼"\}/);
  assert.match(source, /分钟后再\$\{isPlainDirection \? "释礼" : "问礼"\}/);
});

test("card export uses direction-aware title, footer, and filename semantics", () => {
  const source = pageSource();

  assert.match(source, /cardMainTitle = isPlainDirection \? "释礼还意" : "言之成礼"/);
  assert.match(source, /cardFooterTitle = isPlainDirection \? "合乎周礼 · 释礼署录" : "合乎周礼 · 礼官署录"/);
  assert.match(source, /cardDownloadTitle = isPlainDirection \? `释礼-\$\{levelTitle\}` : `问礼-\$\{levelTitle\}`/);
});

test("public docs and metadata describe bidirectional translation", () => {
  assert.match(layoutSource(), /问礼成文，释礼还意/);
  assert.match(packageSource(), /问礼与释礼/);

  const readme = readmeSource();
  assert.match(readme, /问礼 \+ 释礼/);
  assert.match(readme, /释礼示例/);
  assert.match(readme, /周礼体翻回直接人话/);
  assert.match(readme, /direction, plainMode/);
});

test("published Skill text and zip include the explain-zhouli workflow", () => {
  const source = skillSource();
  const publicCopy = publicSkillSource();
  const zipped = execFileSync(
    "unzip",
    ["-p", "public/downloads/speak-zhouli-skill.zip", "speak-zhouli/SKILL.md"],
    { cwd: new URL("..", import.meta.url), encoding: "utf8" },
  );

  assert.match(source, /## 释礼/);
  assert.match(source, /翻回人话/);
  assert.match(source, /不要以“这段话的意思是”开头/);
  assert.equal(publicCopy, source);
  assert.equal(zipped, source);
});
