import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";

/**
 * ffmpeg.wasm runs entirely in the browser (no server-side video processing
 * in a Cloudflare Worker), so the video editor works offline once loaded.
 * Uses the single-threaded core deliberately — the multi-threaded core needs
 * crossOriginIsolated (COOP/COEP headers) which this app doesn't set, and
 * iPhone Safari's SharedArrayBuffer support has historically been shaky.
 * Core files are fetched from a CDN on first use rather than bundled in the
 * repo/deploy — ffmpeg-core.wasm alone is ~30MB, well past what's sensible
 * to ship in a Cloudflare Pages build.
 */
const CORE_VERSION = "0.12.6";
const CORE_BASE_URL = `https://unpkg.com/@ffmpeg/core@${CORE_VERSION}/dist/umd`;

let loadPromise: Promise<FFmpeg> | null = null;

export function getFFmpeg(onLog?: (message: string) => void): Promise<FFmpeg> {
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    const ffmpeg = new FFmpeg();
    if (onLog) {
      ffmpeg.on("log", ({ message }) => onLog(message));
    }
    const [coreURL, wasmURL] = await Promise.all([
      toBlobURL(`${CORE_BASE_URL}/ffmpeg-core.js`, "text/javascript"),
      toBlobURL(`${CORE_BASE_URL}/ffmpeg-core.wasm`, "application/wasm"),
    ]);
    await ffmpeg.load({ coreURL, wasmURL });
    return ffmpeg;
  })();

  return loadPromise;
}

export function secondsToTimestamp(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toFixed(3).padStart(6, "0")}`;
}
