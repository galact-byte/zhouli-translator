import assert from "node:assert/strict";
import test from "node:test";

import { buildCardDownloadFilename } from "../lib/cardDownload";

test("builds distinct card download filenames for repeated exports", () => {
  const first = buildCardDownloadFilename(
    "成礼",
    new Date("2026-07-03T00:50:12+08:00"),
    "第一篇问礼结果",
  );
  const second = buildCardDownloadFilename(
    "成礼",
    new Date("2026-07-03T00:50:13+08:00"),
    "第二篇问礼结果",
  );

  assert.match(first, /^合乎周礼-成礼-20260703-005012-[a-z0-9]{6}\.png$/);
  assert.match(second, /^合乎周礼-成礼-20260703-005013-[a-z0-9]{6}\.png$/);
  assert.notEqual(first, second);
});

test("sanitizes level titles in card download filenames", () => {
  const filename = buildCardDownloadFilename(
    "大/礼?",
    new Date("2026-07-03T00:50:12+08:00"),
    "问礼结果",
  );

  assert.equal(filename.startsWith("合乎周礼-大礼-20260703-005012-"), true);
  assert.equal(filename.endsWith(".png"), true);
});
