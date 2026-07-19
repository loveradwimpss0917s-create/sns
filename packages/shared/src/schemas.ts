import { z } from "zod";
import { AI_KINDS, ASSET_KINDS, PLATFORMS, POST_STATUSES, REVENUE_SOURCES } from "./types";

export const postInputSchema = z.object({
  platform: z.enum(PLATFORMS),
  status: z.enum(POST_STATUSES).default("draft"),
  title: z.string().min(1).max(200),
  body: z.string().max(5000).optional(),
  hashtags: z.array(z.string()).max(30).default([]),
  seriesId: z.string().optional(),
  scheduledAt: z.string().datetime().optional(),
  durationSeconds: z.number().int().positive().optional(),
  notes: z.string().max(2000).optional(),
  tagIds: z.array(z.string()).default([]),
});
export type PostInput = z.infer<typeof postInputSchema>;

export const seriesInputSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  color: z.string().max(20).optional(),
});

export const shootInputSchema = z.object({
  title: z.string().min(1).max(200),
  postId: z.string().optional(),
  locationId: z.string().optional(),
  scheduledAt: z.string().datetime().optional(),
  status: z.enum(["planned", "in_progress", "done"]).default("planned"),
  weather: z.string().max(50).optional(),
  notes: z.string().max(2000).optional(),
});

export const shotInputSchema = z.object({
  shootId: z.string(),
  order: z.number().int().default(0),
  description: z.string().min(1).max(500),
  compositionId: z.string().optional(),
  equipmentId: z.string().optional(),
  isBroll: z.boolean().default(false),
  soundNotes: z.string().max(500).optional(),
  checked: z.boolean().default(false),
});

export const locationInputSchema = z.object({
  name: z.string().min(1).max(100),
  notes: z.string().max(1000).optional(),
});

export const equipmentInputSchema = z.object({
  name: z.string().min(1).max(100),
  category: z.string().max(50).optional(),
  settingsPreset: z.string().max(2000).optional(),
});

export const compositionInputSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

export const lutInputSchema = z.object({
  name: z.string().min(1).max(100),
  baseEmulation: z.string().max(100).optional(),
  assetId: z.string().optional(),
  isForSale: z.boolean().default(false),
  priceJpy: z.number().int().nonnegative().optional(),
  notes: z.string().max(1000).optional(),
});

export const editTemplateInputSchema = z.object({
  name: z.string().min(1).max(100),
  structure: z.string().max(4000).optional(),
});

export const subtitleStyleInputSchema = z.object({
  name: z.string().min(1).max(100),
  fontJa: z.string().max(100).optional(),
  fontEn: z.string().max(100).optional(),
  colorHex: z.string().max(20).optional(),
  positionPercent: z.number().int().min(0).max(100).optional(),
  bilingual: z.boolean().default(true),
});

export const audioAssetInputSchema = z.object({
  name: z.string().min(1).max(150),
  kind: z.enum(["bgm", "se", "ambient"]),
  license: z.string().max(200).optional(),
  assetId: z.string().optional(),
});

export const editProjectInputSchema = z.object({
  postId: z.string(),
  templateId: z.string().optional(),
  lutId: z.string().optional(),
  subtitleStyleId: z.string().optional(),
  bgmAssetId: z.string().optional(),
  exportPreset: z.string().max(100).optional(),
  status: z.enum(["not_started", "editing", "rendering", "done"]).default("not_started"),
});

export const assetInputSchema = z.object({
  kind: z.enum(ASSET_KINDS),
  r2Key: z.string().min(1),
  fileName: z.string().min(1),
  mimeType: z.string().optional(),
  sizeBytes: z.number().int().nonnegative().optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  durationSeconds: z.number().int().positive().optional(),
  postId: z.string().optional(),
  shootId: z.string().optional(),
});

export const kpiSnapshotInputSchema = z.object({
  platform: z.enum(PLATFORMS),
  capturedAt: z.string().datetime(),
  followers: z.number().int().nonnegative().optional(),
  views: z.number().int().nonnegative().optional(),
  retentionRate: z.number().min(0).max(1).optional(),
  ctr: z.number().min(0).max(1).optional(),
  saveRate: z.number().min(0).max(1).optional(),
  commentRate: z.number().min(0).max(1).optional(),
  watchTimeMinutes: z.number().int().nonnegative().optional(),
  postId: z.string().optional(),
});

export const weeklyGoalInputSchema = z.object({
  weekStart: z.string().datetime(),
  goal: z.string().min(1).max(300),
  achieved: z.boolean().default(false),
});

export const revenueEntryInputSchema = z.object({
  source: z.enum(REVENUE_SOURCES),
  amountJpy: z.number().int(),
  occurredAt: z.string().datetime(),
  postId: z.string().optional(),
  memo: z.string().max(500).optional(),
});

export const aiGenerationRequestSchema = z.object({
  kind: z.enum(AI_KINDS),
  context: z.string().min(1).max(4000),
  postId: z.string().optional(),
});
export type AiGenerationRequest = z.infer<typeof aiGenerationRequestSchema>;
