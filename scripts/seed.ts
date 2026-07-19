/**
 * Seeds sensible defaults from the design doc so a fresh deploy isn't a blank
 * slate: the 6 composition types (§4-4), the 3 default equipment presets
 * (§4-1〜4-3), and the standard subtitle style (§5-3).
 *
 * Requires the app to be running with real Cloudflare bindings:
 *   pnpm --filter @vlog/web dev:full
 * then, in another terminal:
 *   pnpm db:seed
 */

const BASE_URL = process.env.SEED_BASE_URL ?? "http://localhost:8788";

const compositions = [
  { name: "定点マスター", description: "三脚でキッチン全景。毎回同じ位置=チャンネルの顔" },
  { name: "真俯瞰", description: "ドリップ・離乳食・開封を真上から" },
  { name: "手元アップ48mm", description: "注ぐ・混ぜる・ボタンを押す" },
  { name: "窓・中庭越し", description: "手前に窓枠やグリーンを入れた額縁構図" },
  { name: "床レベル", description: "赤ちゃんの足・ハイハイ目線。顔は画角外" },
  { name: "歩きインサート", description: "廊下を進む主観。脇を締めて0.5xで" },
];

const equipment = [
  {
    name: "iPhone 16 Pro + Blackmagic Camera",
    category: "camera",
    settingsPreset: "4K 23.98fps / HEVC / Apple Log / SS1/50 / ISO400",
  },
  {
    name: "α7C",
    category: "camera",
    settingsPreset: "S-Log3 / S-Gamut3.Cine / 4K24p / SS1/50 / F2.8以下",
  },
  { name: "iPhone標準カメラ", category: "camera", settingsPreset: "ストーリーズ用の即撮り" },
];

const subtitleStyles = [
  {
    name: "標準クリーム",
    fontJa: "Noto Serif JP Light",
    fontEn: "Cormorant",
    colorHex: "#EFE6D8",
    positionPercent: 15,
    bilingual: true,
  },
];

async function post(resource: string, body: unknown) {
  const res = await fetch(`${BASE_URL}/api/${resource}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    console.error(`✗ ${resource}`, body, await res.text());
    return;
  }
  console.log(`✓ ${resource}: ${JSON.stringify(body).slice(0, 60)}`);
}

async function main() {
  for (const c of compositions) await post("compositions", c);
  for (const e of equipment) await post("equipment", e);
  for (const s of subtitleStyles) await post("subtitle-styles", s);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
