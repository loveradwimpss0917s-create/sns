import type { APIRoute } from "astro";
import { apiApp } from "@vlog/workers";

export const prerender = false;

/**
 * Thin adapter: every /api/* request is forwarded to the shared Hono app in
 * @vlog/workers, which also powers the standalone report worker. Keeping the
 * route logic in one package means "Workers" stays a first-class layer in
 * the Feature-First layout even though it runs inside Pages Functions here.
 */
const handle: APIRoute = async ({ request, locals }) => {
  const url = new URL(request.url);
  url.pathname = url.pathname.replace(/^\/api/, "") || "/";
  const rewritten = new Request(url, request);
  return apiApp.fetch(rewritten, locals.runtime.env, locals.runtime.ctx);
};

export const GET = handle;
export const POST = handle;
export const PATCH = handle;
export const DELETE = handle;
export const PUT = handle;
