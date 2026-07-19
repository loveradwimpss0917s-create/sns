export const PLATFORMS = ["youtube", "instagram", "tiktok"] as const;
export type Platform = (typeof PLATFORMS)[number];

export const POST_STATUSES = ["draft", "scheduled", "published"] as const;
export type PostStatus = (typeof POST_STATUSES)[number];

export const SHOOT_STATUSES = ["planned", "in_progress", "done"] as const;
export type ShootStatus = (typeof SHOOT_STATUSES)[number];

export const EDIT_STATUSES = ["not_started", "editing", "rendering", "done"] as const;
export type EditStatus = (typeof EDIT_STATUSES)[number];

export const ASSET_KINDS = ["video", "photo", "lut", "preset", "thumbnail", "bgm", "se"] as const;
export type AssetKind = (typeof ASSET_KINDS)[number];

export const REVENUE_SOURCES = [
  "amazon",
  "rakuten",
  "sponsorship",
  "lut_sale",
  "preset_sale",
  "ad_revenue",
] as const;
export type RevenueSource = (typeof REVENUE_SOURCES)[number];

export const AI_KINDS = [
  "planning",
  "title",
  "description",
  "ig_caption",
  "tiktok_caption",
  "hashtags",
  "seo",
  "analysis",
  "improvement",
] as const;
export type AiKind = (typeof AI_KINDS)[number];

export const AI_PROVIDERS = ["workers-ai", "claude", "openai", "gemini"] as const;
export type AiProvider = (typeof AI_PROVIDERS)[number];

export interface WithTimestamps {
  createdAt: string;
  updatedAt: string;
}

export interface Post extends WithTimestamps {
  id: string;
  platform: Platform;
  status: PostStatus;
  title: string;
  body: string | null;
  hashtags: string[];
  seriesId: string | null;
  scheduledAt: string | null;
  publishedAt: string | null;
  thumbnailAssetId: string | null;
  durationSeconds: number | null;
  url: string | null;
  notes: string | null;
  tagIds: string[];
}

export interface Series extends WithTimestamps {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
}

export interface Tag extends WithTimestamps {
  id: string;
  name: string;
}

export interface Location extends WithTimestamps {
  id: string;
  name: string;
  notes: string | null;
}

export interface Equipment extends WithTimestamps {
  id: string;
  name: string;
  category: string | null;
  settingsPreset: string | null;
}

export interface Composition extends WithTimestamps {
  id: string;
  name: string;
  description: string | null;
}

export interface Shoot extends WithTimestamps {
  id: string;
  title: string;
  postId: string | null;
  locationId: string | null;
  scheduledAt: string | null;
  status: ShootStatus;
  weather: string | null;
  notes: string | null;
}

export interface Shot extends WithTimestamps {
  id: string;
  shootId: string;
  order: number;
  description: string;
  compositionId: string | null;
  equipmentId: string | null;
  isBroll: boolean;
  soundNotes: string | null;
  checked: boolean;
}

export interface Lut extends WithTimestamps {
  id: string;
  name: string;
  baseEmulation: string | null;
  assetId: string | null;
  isForSale: boolean;
  priceJpy: number | null;
  notes: string | null;
}

export interface EditTemplate extends WithTimestamps {
  id: string;
  name: string;
  structure: string | null;
}

export interface SubtitleStyle extends WithTimestamps {
  id: string;
  name: string;
  fontJa: string | null;
  fontEn: string | null;
  colorHex: string | null;
  positionPercent: number | null;
  bilingual: boolean;
}

export interface AudioAsset extends WithTimestamps {
  id: string;
  name: string;
  kind: "bgm" | "se" | "ambient";
  license: string | null;
  assetId: string | null;
}

export interface EditProject extends WithTimestamps {
  id: string;
  postId: string;
  templateId: string | null;
  lutId: string | null;
  subtitleStyleId: string | null;
  bgmAssetId: string | null;
  exportPreset: string | null;
  status: EditStatus;
}

export interface Asset extends WithTimestamps {
  id: string;
  kind: AssetKind;
  r2Key: string;
  fileName: string;
  mimeType: string | null;
  sizeBytes: number | null;
  width: number | null;
  height: number | null;
  durationSeconds: number | null;
  postId: string | null;
  shootId: string | null;
}

export interface KpiSnapshot extends WithTimestamps {
  id: string;
  platform: Platform;
  capturedAt: string;
  followers: number | null;
  views: number | null;
  retentionRate: number | null;
  ctr: number | null;
  saveRate: number | null;
  commentRate: number | null;
  watchTimeMinutes: number | null;
  postId: string | null;
}

export interface WeeklyGoal extends WithTimestamps {
  id: string;
  weekStart: string;
  goal: string;
  achieved: boolean;
}

export interface RevenueEntry extends WithTimestamps {
  id: string;
  source: RevenueSource;
  amountJpy: number;
  occurredAt: string;
  postId: string | null;
  memo: string | null;
}

export interface AiGeneration extends WithTimestamps {
  id: string;
  kind: AiKind;
  provider: AiProvider;
  prompt: string;
  result: string;
  postId: string | null;
}
