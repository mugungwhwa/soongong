// SOO-95: 순공 현재 전체 화면 실렌더 캡처 (앱 모바일폭 + 웹 데스크톱폭)
// 사용: node scripts/soo95-capture.mjs  (dev 서버가 localhost:3000 에 떠 있어야 함)
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const BASE = process.env.SOO95_BASE || "http://localhost:3000";
const OUT = process.env.SOO95_OUT || "docs/ui-research/soo-95-compare/shots";
mkdirSync(OUT, { recursive: true });

// 캡처 대상: 순공 핵심 전체 화면
const SCREENS = [
  { id: "landing", path: "/", wait: 1200 },
  { id: "onboarding", path: "/onboarding", wait: 1200 },
  { id: "today", path: "/today", wait: 1500 },
  { id: "today-first", path: "/today?first=1", wait: 1500 },
  { id: "play", path: "/play/q-001", wait: 2000 },
  { id: "result", path: "/result", wait: 1500 },
  { id: "journey", path: "/journey", wait: 1500 },
  { id: "wrong-notes", path: "/wrong-notes", wait: 1500 },
  { id: "diary", path: "/diary", wait: 1500 },
  { id: "calendar", path: "/calendar", wait: 1500 },
];

const FORMATS = [
  { ff: "app", width: 390, height: 844, dsf: 2 },   // 모바일 폭 (iPhone 12/13/14)
  { ff: "web", width: 1440, height: 900, dsf: 1 },  // 데스크톱 폭
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.launch();
const results = [];
for (const fmt of FORMATS) {
  const ctx = await browser.newContext({
    viewport: { width: fmt.width, height: fmt.height },
    deviceScaleFactor: fmt.dsf,
  });
  const page = await ctx.newPage();
  for (const s of SCREENS) {
    const file = `${OUT}/${s.id}-${fmt.ff}.png`;
    try {
      const resp = await page.goto(BASE + s.path, { waitUntil: "networkidle", timeout: 30000 });
      const status = resp ? resp.status() : 0;
      await sleep(s.wait);
      await page.screenshot({ path: file, fullPage: true });
      results.push(`${status}  ${fmt.ff.padEnd(4)} ${s.id}`);
      console.log(`OK ${status} ${fmt.ff} ${s.id}`);
    } catch (e) {
      results.push(`ERR ${fmt.ff.padEnd(4)} ${s.id}: ${e.message.split("\n")[0]}`);
      console.log(`ERR ${fmt.ff} ${s.id}: ${e.message.split("\n")[0]}`);
    }
  }
  await ctx.close();
}
await browser.close();
console.log("\n=== SUMMARY ===");
console.log(results.join("\n"));
