import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const repo = process.env.STAR_HISTORY_REPO || "Aspirin0000/zhouli-translator";
const outputPath =
  process.env.STAR_HISTORY_OUTPUT ||
  path.join("public", "images", "github-star-history.svg");
const timeZone = "Asia/Shanghai";

async function requestJson(url, accept = "application/vnd.github+json") {
  const response = await fetch(url, {
    headers: {
      Accept: accept,
      "User-Agent": "zhouli-translator-star-history",
    },
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${url}`);
  }

  return response.json();
}

async function fetchAllStargazers() {
  const stargazers = [];
  let page = 1;

  while (true) {
    const url = `https://api.github.com/repos/${repo}/stargazers?per_page=100&page=${page}`;
    const items = await requestJson(url, "application/vnd.github.star+json");
    stargazers.push(...items);

    if (items.length < 100) break;
    page += 1;
  }

  return stargazers
    .filter((item) => typeof item.starred_at === "string")
    .sort((a, b) => Date.parse(a.starred_at) - Date.parse(b.starred_at));
}

function escapeXml(value) {
  return String(value).replace(/[&<>"']/g, (char) => {
    switch (char) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      default:
        return "&apos;";
    }
  });
}

function formatDate(value, options = {}) {
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone,
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    ...options,
  })
    .format(value)
    .replace(/\//g, "-");
}

function niceMax(value) {
  if (value <= 10) return 10;
  if (value <= 50) return Math.ceil(value / 10) * 10;
  if (value <= 200) return Math.ceil(value / 25) * 25;
  return Math.ceil(value / 100) * 100;
}

function buildTicks(min, max, count) {
  return Array.from({ length: count }, (_, index) => {
    if (count === 1) return min;
    return min + ((max - min) * index) / (count - 1);
  });
}

function buildSvg({ repoInfo, stargazers, generatedAt }) {
  const width = 920;
  const height = 520;
  const margin = { top: 78, right: 42, bottom: 78, left: 72 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  const starTimes = stargazers.map((item) => Date.parse(item.starred_at));
  const starCount = repoInfo.stargazers_count ?? stargazers.length;
  const firstTime = starTimes.at(0) ?? Date.parse(repoInfo.created_at);
  const latestTime = starTimes.at(-1) ?? generatedAt.getTime();
  const rangePadding = Math.max(2 * 60 * 60 * 1000, (latestTime - firstTime) * 0.08);
  const minTime = Math.min(firstTime, latestTime) - rangePadding;
  const maxTime = Math.max(generatedAt.getTime(), latestTime + rangePadding);
  const yMax = niceMax(Math.max(1, starCount));

  const x = (time) => margin.left + ((time - minTime) / (maxTime - minTime)) * chartWidth;
  const y = (value) => margin.top + chartHeight - (value / yMax) * chartHeight;

  const linePoints = [[x(minTime), y(0)]];
  stargazers.forEach((item, index) => {
    linePoints.push([x(Date.parse(item.starred_at)), y(index + 1)]);
  });
  linePoints.push([x(maxTime), y(stargazers.length || 0)]);

  const areaPoints = [
    `${x(minTime).toFixed(2)},${y(0).toFixed(2)}`,
    ...linePoints.map(([pointX, pointY]) => `${pointX.toFixed(2)},${pointY.toFixed(2)}`),
    `${x(maxTime).toFixed(2)},${y(0).toFixed(2)}`,
  ].join(" ");
  const polylinePoints = linePoints
    .map(([pointX, pointY]) => `${pointX.toFixed(2)},${pointY.toFixed(2)}`)
    .join(" ");

  const xTicks = buildTicks(minTime, maxTime, 5);
  const yTicks = buildTicks(0, yMax, 6);
  const updatedText = formatDate(generatedAt, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc">
  <title id="title">GitHub Star History for ${escapeXml(repo)}</title>
  <desc id="desc">${escapeXml(repo)} has ${starCount} GitHub stars. Chart generated from public GitHub stargazer timestamps.</desc>
  <defs>
    <linearGradient id="line" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0%" stop-color="#8b1e1e"/>
      <stop offset="55%" stop-color="#d94b39"/>
      <stop offset="100%" stop-color="#f38020"/>
    </linearGradient>
    <linearGradient id="area" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0%" stop-color="#d94b39" stop-opacity="0.24"/>
      <stop offset="100%" stop-color="#d94b39" stop-opacity="0"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="14" stdDeviation="18" flood-color="#3b2a20" flood-opacity="0.14"/>
    </filter>
  </defs>
  <rect width="${width}" height="${height}" rx="18" fill="#fffaf0"/>
  <rect x="18" y="18" width="${width - 36}" height="${height - 36}" rx="15" fill="#ffffff" stroke="#eadcc6" filter="url(#shadow)"/>
  <text x="${margin.left}" y="50" fill="#211d18" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif" font-size="24" font-weight="700">GitHub Star History</text>
  <text x="${margin.left}" y="74" fill="#7a6d5b" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif" font-size="13">${escapeXml(repo)} · ${starCount} stars · updated ${escapeXml(updatedText)} CST</text>
  ${yTicks
    .map((tick) => {
      const tickY = y(tick);
      return `<line x1="${margin.left}" y1="${tickY.toFixed(2)}" x2="${width - margin.right}" y2="${tickY.toFixed(2)}" stroke="#efe5d5"/>
  <text x="${margin.left - 14}" y="${(tickY + 4).toFixed(2)}" text-anchor="end" fill="#7a6d5b" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif" font-size="12">${Math.round(tick)}</text>`;
    })
    .join("\n  ")}
  ${xTicks
    .map((tick) => {
      const tickX = x(tick);
      return `<line x1="${tickX.toFixed(2)}" y1="${margin.top}" x2="${tickX.toFixed(2)}" y2="${height - margin.bottom}" stroke="#f4eadb"/>
  <text x="${tickX.toFixed(2)}" y="${height - 42}" text-anchor="middle" fill="#7a6d5b" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif" font-size="12">${escapeXml(formatDate(new Date(tick)))}</text>`;
    })
    .join("\n  ")}
  <line x1="${margin.left}" y1="${height - margin.bottom}" x2="${width - margin.right}" y2="${height - margin.bottom}" stroke="#6c5840" stroke-width="1.4"/>
  <line x1="${margin.left}" y1="${margin.top}" x2="${margin.left}" y2="${height - margin.bottom}" stroke="#6c5840" stroke-width="1.4"/>
  <polygon points="${areaPoints}" fill="url(#area)"/>
  <polyline points="${polylinePoints}" fill="none" stroke="url(#line)" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="${x(latestTime).toFixed(2)}" cy="${y(stargazers.length || 0).toFixed(2)}" r="6" fill="#f38020" stroke="#ffffff" stroke-width="3"/>
  <text x="${width - margin.right}" y="54" text-anchor="end" fill="#8b1e1e" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif" font-size="40" font-weight="800">${starCount}</text>
  <text x="${width - margin.right}" y="76" text-anchor="end" fill="#7a6d5b" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif" font-size="13">stars</text>
  <text x="${width / 2}" y="${height - 14}" text-anchor="middle" fill="#a6947d" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif" font-size="11">Generated from public GitHub stargazer timestamps</text>
</svg>
`;
}

const repoInfo = await requestJson(`https://api.github.com/repos/${repo}`);
const stargazers = await fetchAllStargazers();
const svg = buildSvg({ repoInfo, stargazers, generatedAt: new Date() });

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, svg, "utf8");

console.log(`Wrote ${outputPath} with ${repoInfo.stargazers_count ?? stargazers.length} stars.`);
