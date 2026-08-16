import { readFileSync, writeFileSync, mkdirSync, existsSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

export const name = "bg-wall";
export const inject = ["webServer"];

const MEDIA_EXT = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "image/gif": "gif", "video/mp4": "mp4", "video/webm": "webm" };
const ANIMATED_TYPES = new Set(["image/gif", "image/webp"]);
const VIDEO_TYPES = new Set(["video/mp4", "video/webm"]);
const DEFAULT_SETTINGS = { enabled: true, mode: "static", opacity: 0.35, current: null };

// sharp is used to freeze the first frame of animated images; absent -> static mode falls back to the original file.
const sharpLoader = import("sharp").then((m) => m.default).catch(() => null);

export function apply(ctx) {
	const webServer = ctx.webServer;
	const baseDir = join(process.env.DSH_HOME || join(homedir(), ".dsh"), "bg-wall");
	mkdirSync(baseDir, { recursive: true });
	const manifestPath = join(baseDir, "manifest.json");

	const imageMap = new Map();
	let images = [];
	let settings = { ...DEFAULT_SETTINGS };

	function loadManifest() {
		if (!existsSync(manifestPath)) return;
		try {
			const data = JSON.parse(readFileSync(manifestPath, "utf8"));
			if (Array.isArray(data.images)) {
				images = data.images.filter((i) => i && typeof i.id === "string" && typeof i.file === "string");
				for (const img of images) imageMap.set(img.id, img);
			}
			if (data.settings && typeof data.settings === "object") settings = { ...DEFAULT_SETTINGS, ...data.settings };
		} catch (error) {
			console.error(`[bg-wall] manifest load failed: ${String(error)}`);
		}
	}
	function saveManifest() {
		writeFileSync(manifestPath, JSON.stringify({ images, settings }, null, 2));
	}
	loadManifest();

	const toJson = (img) => ({
		id: img.id, name: img.name, mediaType: img.mediaType,
		width: img.width, height: img.height, addedAt: img.addedAt, url: `/dsh-bg/${img.id}`,
		staticUrl: img.staticFile ? `/dsh-bg/${img.id}?static=1` : `/dsh-bg/${img.id}`,
	});

	function json(res, status, body) {
		res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
		res.end(JSON.stringify(body));
	}
	function readBody(req) {
		return new Promise((resolve, reject) => {
			const chunks = [];
			req.on("data", (c) => chunks.push(c));
			req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
			req.on("error", reject);
		});
	}

	// ---- /dsh-bg/api/* JSON routes ----
	ctx.effect(() => webServer.register({
		kind: "prefix",
		path: "/dsh-bg/api",
		handler: async (req, res) => {
			try {
				const pathname = new URL(req.url || "/", "http://x").pathname;
				const route = pathname.replace(/^\/dsh-bg\/api\/?/, "").split("/")[0];
				if (route === "state" && req.method === "GET") {
					json(res, 200, { images: images.map(toJson), settings });
					return;
				}
				if (req.method !== "POST") return json(res, 405, { ok: false, error: "method not allowed" });
				const body = JSON.parse(await readBody(req) || "{}");

				if (route === "save") {
					const dataUrl = body.dataUrl;
					if (typeof dataUrl !== "string" || (!dataUrl.startsWith("data:image/") && !dataUrl.startsWith("data:video/"))) return json(res, 400, { ok: false, error: "invalid media data" });
					const comma = dataUrl.indexOf(",");
					const meta = dataUrl.slice(0, comma);
					const m = /^data:((?:image|video)\/[a-z0-9+]+);/i.exec(meta);
					const mediaType = m && MEDIA_EXT[m[1]] ? m[1] : "image/png";
					const bytes = Buffer.from(dataUrl.slice(comma + 1), "base64");
					if (bytes.length === 0) return json(res, 400, { ok: false, error: "empty image data" });
					const id = "bg" + Date.now().toString(36) + Math.floor(Math.random() * 46656).toString(36);
					const file = `${id}.${MEDIA_EXT[mediaType]}`;
					writeFileSync(join(baseDir, file), bytes);

					// For potentially-animated formats, freeze the first frame so "static" mode can show it still.
					let staticFile = null;
					if (ANIMATED_TYPES.has(mediaType)) {
						try {
							const sharp = await sharpLoader;
							if (sharp) {
								const staticBuf = await sharp(bytes).png().toBuffer();
								staticFile = `${id}.static.png`;
								writeFileSync(join(baseDir, staticFile), staticBuf);
							}
						} catch (error) {
							console.error(`[bg-wall] static frame generation failed: ${String(error && error.message || error)}`);
						}
					}

					const img = {
						id, name: typeof body.name === "string" ? body.name : `背景图 ${images.length + 1}`,
						mediaType, width: 0, height: 0, addedAt: Date.now(), file,
						...(staticFile ? { staticFile } : {}),
					};
					if (!imageMap.has(id)) {
						images.push(img);
						imageMap.set(id, img);
					}
					if (settings.current === null) settings.current = id;
					saveManifest();
					json(res, 200, { ok: true, image: toJson(img) });
					return;
				}
				if (route === "remove") {
					const img = imageMap.get(body.id);
					if (!img) return json(res, 404, { ok: false, error: "image not found" });
					try { unlinkSync(join(baseDir, img.file)); } catch { /* file already gone */ }
					if (img.staticFile) { try { unlinkSync(join(baseDir, img.staticFile)); } catch { /* already gone */ } }
					images = images.filter((i) => i.id !== img.id);
					imageMap.delete(img.id);
					if (settings.current === img.id) settings.current = images.length > 0 ? images[0].id : null;
					saveManifest();
					json(res, 200, { ok: true, images: images.map(toJson), settings });
					return;
				}
				if (route === "settings") {
					const patch = body.patch || {};
					if (typeof patch.enabled === "boolean") settings.enabled = patch.enabled;
					if (patch.mode === "static" || patch.mode === "dynamic") settings.mode = patch.mode;
					if (typeof patch.opacity === "number") settings.opacity = Math.min(1, Math.max(0, patch.opacity));
					if (typeof patch.current === "string") settings.current = imageMap.has(patch.current) ? patch.current : null;
					else if (patch.current === null) settings.current = null;
					saveManifest();
					json(res, 200, { ok: true, settings });
					return;
				}
				json(res, 404, { ok: false, error: `unknown route ${route}` });
			} catch (error) {
				json(res, 500, { ok: false, error: String(error && error.message || error) });
			}
		},
	}));

	// ---- /dsh-bg/<id> image route ----
	ctx.effect(() => webServer.register({
		kind: "prefix",
		path: "/dsh-bg",
		handler: async (req, res) => {
			try {
				const pathname = new URL(req.url || "/", "http://x").pathname;
				const url = new URL(req.url || "/", "http://x");
				const id = pathname.split("/").filter(Boolean)[1] || "";
				const img = imageMap.get(id);
				if (!img) {
					res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
					res.end("not found");
					return;
				}
				// ?static=1 serves the frozen first frame (animated images); otherwise the original file.
				const staticRequested = url.searchParams.get("static") === "1";
				const serveFile = staticRequested && img.staticFile ? img.staticFile : img.file;
				const contentType = staticRequested && img.staticFile ? "image/png" : img.mediaType;
				const bytes = readFileSync(join(baseDir, serveFile));
				res.writeHead(200, {
					"content-type": contentType,
					"cache-control": "public, max-age=86400",
					"content-length": String(bytes.length),
				});
				res.end(bytes);
			} catch (error) {
				res.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
				res.end(`error: ${String(error && error.message || error)}`);
			}
		},
	}));

	console.log(`[bg-wall] ready, ${images.length} image(s), data at ${baseDir}`);
}
