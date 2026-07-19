/** ブランドカラー (設計書 §1-5) — Tailwind config とサムネ/UIで共有する単一ソース。 */
export const BRAND_COLORS = {
  cream: "#EFE6D8", // メイン: くすみクリーム
  moss: "#4A5A48", // サブ: 深いモスグリーン
  ember: "#C97B4A", // アクセント: 焼けたオレンジ
  ink: "#2B2A28", // 文字色: 墨色
} as const;

export const PLATFORM_LABELS: Record<"youtube" | "instagram" | "tiktok", string> = {
  youtube: "YouTube",
  instagram: "Instagram",
  tiktok: "TikTok",
};

export const PLATFORM_COLORS: Record<"youtube" | "instagram" | "tiktok", string> = {
  youtube: "#C97B4A",
  instagram: "#4A5A48",
  tiktok: "#2B2A28",
};

/** 締めの定型文 (§1-7) */
export const SIGNOFF_PHRASE = "今日も、いい光でした。";
