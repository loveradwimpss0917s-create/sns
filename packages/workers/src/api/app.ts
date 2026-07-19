import { Hono } from "hono";
import { cors } from "hono/cors";
import {
  audioAssets,
  compositions,
  editProjects,
  editTemplates,
  equipment,
  kpiSnapshots,
  locations,
  luts,
  posts,
  revenueEntries,
  series,
  shoots,
  shots,
  subtitleStyles,
  tags,
  weeklyGoals,
} from "@vlog/database";
import {
  audioAssetInputSchema,
  compositionInputSchema,
  editProjectInputSchema,
  editTemplateInputSchema,
  equipmentInputSchema,
  kpiSnapshotInputSchema,
  locationInputSchema,
  lutInputSchema,
  postInputSchema,
  revenueEntryInputSchema,
  seriesInputSchema,
  shootInputSchema,
  shotInputSchema,
  subtitleStyleInputSchema,
  weeklyGoalInputSchema,
} from "@vlog/shared";
import type { Env } from "../env";
import { crudRoutes } from "./crud";
import { aiRoutes } from "./routes/ai";
import { dashboardRoutes } from "./routes/dashboard";
import { assetsRoutes } from "./routes/assets";

/** The single Hono app powering both Pages Functions and any standalone Worker deploy. */
export const apiApp = new Hono<{ Bindings: Env }>();

apiApp.use("*", cors());
apiApp.get("/health", (c) => c.json({ ok: true }));

apiApp.route("/dashboard", dashboardRoutes);
apiApp.route("/ai", aiRoutes);
apiApp.route("/assets", assetsRoutes);

apiApp.route("/posts", crudRoutes(posts, postInputSchema, { orderByColumn: "createdAt" }));
apiApp.route("/series", crudRoutes(series, seriesInputSchema));
apiApp.route("/tags", crudRoutes(tags, seriesInputSchema.pick({ name: true })));

apiApp.route("/shoots", crudRoutes(shoots, shootInputSchema, { orderByColumn: "scheduledAt" }));
apiApp.route("/shots", crudRoutes(shots, shotInputSchema, { orderByColumn: "order" }));
apiApp.route("/locations", crudRoutes(locations, locationInputSchema));
apiApp.route("/equipment", crudRoutes(equipment, equipmentInputSchema));
apiApp.route("/compositions", crudRoutes(compositions, compositionInputSchema));

apiApp.route("/luts", crudRoutes(luts, lutInputSchema));
apiApp.route("/edit-templates", crudRoutes(editTemplates, editTemplateInputSchema));
apiApp.route("/subtitle-styles", crudRoutes(subtitleStyles, subtitleStyleInputSchema));
apiApp.route("/audio-assets", crudRoutes(audioAssets, audioAssetInputSchema));
apiApp.route("/edit-projects", crudRoutes(editProjects, editProjectInputSchema));

apiApp.route(
  "/kpi-snapshots",
  crudRoutes(kpiSnapshots, kpiSnapshotInputSchema, { orderByColumn: "capturedAt" }),
);
apiApp.route(
  "/weekly-goals",
  crudRoutes(weeklyGoals, weeklyGoalInputSchema, { orderByColumn: "weekStart" }),
);
apiApp.route(
  "/revenue-entries",
  crudRoutes(revenueEntries, revenueEntryInputSchema, { orderByColumn: "occurredAt" }),
);

export type ApiApp = typeof apiApp;
