window.__ModuleLoader__.load({
	id: "dsh-bg-wall",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		var React = require("react");

		const CSS_TAG = "dsh-bg-wall";
		const VIDEO_TAG = "dsh-bg-wall-video";
		function styleEl() {
			return document.querySelector('style[data-plugin-css="' + CSS_TAG + '"]');
		}
		function videoEl() {
			return document.querySelector('video[data-plugin-video="' + VIDEO_TAG + '"]');
		}
		function clearBackgroundCss() {
			const el = styleEl();
			if (el) el.remove();
			const vid = videoEl();
			if (vid) vid.remove();
		}
		function setBackgroundCss(url, opacity, mediaType) {
			// Clear existing wallpaper first
			clearBackgroundCss();
			
			const isVideo = mediaType && mediaType.startsWith('video/');
			
			// Always create style element to clear surface backgrounds
			let el = document.createElement("style");
			el.dataset.pluginCss = CSS_TAG;
			document.head.appendChild(el);
			
			// Strip ALL surface backgrounds/borders/shadows site-wide so the raw
			// wallpaper shows through every pixel.
			const F = 'div:has(> [data-shell-overlay])';
			el.textContent =
				'html,body{background:transparent!important;margin:0;padding:0}'
				+ '*{background:transparent!important;border:0!important;outline:0!important;box-shadow:none!important;background-image:none!important}'
				
				// --- Frosted glass (毛玻璃) for floating panels, dialogs, cards ---
				// Settings panel & other dialogs:
				+ 'div[role="dialog"],div[role="alertdialog"]{backdrop-filter:blur(28px)saturate(180%)!important;background-color:rgba(245,245,250,0.82)!important;border:1px solid rgba(255,255,255,0.5)!important;box-shadow:0 12px 48px rgba(0,0,0,0.18)!important}'
				+ 'html.dark div[role="dialog"],html.dark div[role="alertdialog"],[data-dsw-theme="dark"] div[role="dialog"]{background-color:rgba(28,28,32,0.85)!important;border:1px solid rgba(255,255,255,0.12)!important;box-shadow:0 12px 48px rgba(0,0,0,0.5)!important}'
				// Settings overlay mask:
				+ 'div[role="presentation"]>div:first-child{background:rgba(0,0,0,0.2)!important;backdrop-filter:blur(4px)!important}'
				// Composer input card:
				+ '._4KQOPa_card{backdrop-filter:blur(24px)saturate(180%)!important;background-color:rgba(245,245,250,0.65)!important;border:1px solid rgba(255,255,255,0.4)!important;box-shadow:0 4px 24px rgba(0,0,0,0.12)!important}'
				+ 'html.dark ._4KQOPa_card,[data-dsw-theme="dark"] ._4KQOPa_card{background-color:rgba(28,28,32,0.75)!important;border:1px solid rgba(255,255,255,0.1)!important}'
				// Message bubbles:
				+ '.P5DUYG_bubble{backdrop-filter:blur(20px)!important;background-color:rgba(245,245,250,0.5)!important;border:1px solid rgba(255,255,255,0.3)!important}'
				+ 'html.dark .P5DUYG_bubble,[data-dsw-theme="dark"] .P5DUYG_bubble{background-color:rgba(28,28,32,0.6)!important;border:1px solid rgba(255,255,255,0.08)!important}'
				// Code blocks:
				+ '.FHeFyG_body,.g434Aa_code{backdrop-filter:blur(16px)!important;background-color:rgba(245,245,250,0.55)!important;border:1px solid rgba(255,255,255,0.25)!important}'
				+ 'html.dark .FHeFyG_body,html.dark .g434Aa_code,[data-dsw-theme="dark"] .FHeFyG_body,[data-dsw-theme="dark"] .g434Aa_code{background-color:rgba(15,15,20,0.75)!important;border:1px solid rgba(255,255,255,0.06)!important}'
				// Tool cards / workflow runs:
				+ '.Sug5jW_root,.B7Xr-G_panel{backdrop-filter:blur(20px)!important;background-color:rgba(245,245,250,0.5)!important;border:1px solid rgba(255,255,255,0.2)!important}'
				+ 'html.dark .Sug5jW_root,html.dark .B7Xr-G_panel,[data-dsw-theme="dark"] .Sug5jW_root,[data-dsw-theme="dark"] .B7Xr-G_panel{background-color:rgba(28,28,32,0.6)!important;border:1px solid rgba(255,255,255,0.06)!important}'
				
				// Restore icon/text coloring for visibility:
				+ '*[class] svg,[class] img:not([src]){color:var(--dsw-alias-label-primary)!important}';
			
			if (isVideo) {
				// Create video element for video wallpaper
				let vid = document.createElement('video');
				vid.dataset.pluginVideo = VIDEO_TAG;
				vid.src = url;
				vid.muted = true;
				vid.loop = true;
				vid.autoplay = true;
				vid.playsInline = true;
				vid.style.cssText = 'position:fixed!important;top:0!important;left:0!important;width:100vw!important;height:100vh!important;object-fit:cover!important;z-index:-1!important;pointer-events:none!important;opacity:' + opacity + '!important;';
				document.body.insertBefore(vid, document.body.firstChild);
			} else {
				// Add image wallpaper CSS
				el.textContent += F + '::before{content:""!important;position:absolute!important;inset:0!important;background-image:url("' + url + '")!important;background-size:cover!important;background-position:center!important;background-repeat:no-repeat!important;opacity:' + opacity + '!important;z-index:-1!important;pointer-events:none!important}';
			}
		}
		// Single source of truth for "what wallpaper should be on screen", driven by
		// the /dsh-bg/api/state payload shape. Usable from both the plugin lifecycle
		// (page load) and the settings component (live edits).
		function applyBackgroundFromState(lib) {
			const s = lib && lib.settings;
			if (!s || s.enabled === false || !s.current) { clearBackgroundCss(); return; }
			const img = (lib.images || []).find((i) => i.id === s.current);
			if (!img) { clearBackgroundCss(); return; }
			// static mode: frozen photo (first frame of animated files); dynamic mode: the live animated image plays
			const url = s.mode === "static" ? (img.staticUrl || img.url) : img.url;
			setBackgroundCss(url, typeof s.opacity === "number" ? s.opacity : 0.35, img.mediaType);
		}

		function api(path, body) {
			return fetch(path, body === undefined ? undefined : {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify(body)
			}).then((res) => res.json().then((j) => {
				if (!res.ok || j && j.ok === false && j.error) {
					throw new Error(j && j.error ? j.error : "HTTP " + res.status);
				}
				return j;
			}));
		}

		function row(children, gap) {
			return React.createElement("div", { style: { display: "flex", alignItems: "center", gap: gap || 10, flexWrap: "wrap" } }, children);
		}
		function btn(label, onClick, active, danger) {
			return React.createElement("button", {
				onClick,
				style: {
					padding: "5px 12px", borderRadius: 6, fontSize: 13, cursor: "pointer",
					border: "1px solid " + (active ? "var(--dsw-alias-brand-primary)" : "var(--dsw-alias-border-l2)"),
					background: "var(--dsw-alias-bg-layer-2)",
					color: active ? "var(--dsw-alias-brand-primary)" : "var(--dsw-alias-label-primary)",
					...(danger ? { borderColor: "var(--dsw-alias-state-error-primary)", color: "var(--dsw-alias-state-error-primary)" } : {}),
				},
			}, label);
		}

		function apply(ctx) {
			const BgWallSection = () => {
				const [lib, setLib] = React.useState(null);
				const [error, setError] = React.useState(null);
				const [busy, setBusy] = React.useState(false);
				const fileRef = React.useRef(null);

				React.useEffect(() => {
					let alive = true;
					api("/dsh-bg/api/state").then((res) => { if (alive) setLib(res); }).catch((e) => { if (alive) setError(String(e && e.message || e)); });
					return () => { alive = false; };
				}, []);

				const imgs = lib ? lib.images : [];
				const cur = lib ? lib.settings.current : null;
				const enabled = lib ? lib.settings.enabled !== false : true;
				const mode = lib ? (lib.settings.mode === "dynamic" ? "dynamic" : "static") : "static";
				const opacity = lib ? lib.settings.opacity : 0.35;

				// background layer css (mode + opacity): re-apply live while settings are open.
				// Deliberately NO unmount cleanup here — closing the settings panel must not
				// remove the wallpaper; the plugin-lifecycle effect in apply() owns removal.
				React.useEffect(() => { applyBackgroundFromState(lib); }, [lib]);

				const patch = (p) => {
					setLib((prev) => (prev ? { ...prev, settings: { ...prev.settings, ...p } } : prev));
					api("/dsh-bg/api/settings", { patch: p }).catch(() => {});
				};

				const onFile = (file) => {
					if (!file) return;
					if (file.size > 15 * 1024 * 1024) { setError("图片超过 15MB，请压缩后再试"); return; }
					setBusy(true);
					setError(null);
					const reader = new FileReader();
					reader.onload = () => {
						api("/dsh-bg/api/save", { dataUrl: String(reader.result), name: file.name }).then((res) => {
							if (res && res.ok) {
								setLib((prev) => ({
									...prev,
									images: prev.images.some((i) => i.id === res.image.id) ? prev.images : [...prev.images, res.image],
									settings: prev.settings.current ? prev.settings : { ...prev.settings, current: res.image.id },
								}));
							} else {
								setError((res && res.error) || "保存失败");
							}
						}).catch((e) => setError(String(e && e.message || e))).then(() => setBusy(false));
					};
					reader.onerror = () => { setError("读取文件失败"); setBusy(false); };
					reader.readAsDataURL(file);
				};

				const onRemove = (id) => {
					api("/dsh-bg/api/remove", { id }).then((res) => {
						if (res && res.ok) setLib({ images: res.images, settings: res.settings });
						else setError((res && res.error) || "删除失败");
					}).catch((e) => setError(String(e && e.message || e)));
				};

				const input = React.createElement("input", {
					ref: fileRef,
					type: "file",
					accept: "image/png,image/jpeg,image/webp,image/gif,video/mp4,video/webm",
					style: { display: "none" },
					onChange: (e) => { const f = e.target.files && e.target.files[0]; if (f) onFile(f); e.target.value = ""; },
				});

				const errEl = error ? React.createElement("div", { style: { color: "var(--dsw-alias-state-error-primary)", fontSize: 13, marginBottom: 8 } }, error) : null;

				const body = !lib ? React.createElement("div", { style: { fontSize: 13, color: "var(--dsw-alias-label-secondary)" } }, "加载中…") : [
					row([
						React.createElement("label", { style: { fontSize: 14, display: "flex", alignItems: "center", gap: 8, fontWeight: 600 } }, [
							React.createElement("input", { type: "checkbox", checked: enabled, onChange: (e) => patch({ enabled: e.target.checked }) }),
							enabled ? "✓ 背景已启用" : "背景已停用",
						]),
						!enabled ? React.createElement("span", { style: { fontSize: 12, color: "var(--dsw-alias-label-secondary)" } }, "（关闭后不显示背景图）") : null,
					]),
					row([
						React.createElement("span", { style: { fontSize: 13, color: "var(--dsw-alias-label-secondary)" } }, "模式："),
						btn("静态照片", () => patch({ mode: "static" }), mode === "static"),
						btn("动态实况", () => patch({ mode: "dynamic" }), mode === "dynamic"),
						React.createElement("span", { style: { fontSize: 12, color: "var(--dsw-alias-label-secondary)" } }, mode === "static" ? "（固定显示当前这张图，动图显示第一帧）" : "（动图像小视频一样播放，类似 Steam 动态壁纸；静态图则正常显示）"),
					]),
					row([
						React.createElement("span", { style: { fontSize: 13, color: "var(--dsw-alias-label-secondary)" } }, "当前背景："),
						React.createElement("span", { style: { fontSize: 13, fontWeight: 500 } }, (imgs.find((i) => i.id === cur) || {}).name || "无"),
					]),
					row([
						React.createElement("span", { style: { fontSize: 13 } }, "透明度"),
						React.createElement("input", {
							type: "range", min: 0, max: 1, step: 0.05, value: opacity,
							onChange: (e) => patch({ opacity: Number(e.target.value) }),
							style: { flex: 1, minWidth: 160 },
						}),
						React.createElement("span", { style: { fontSize: 13, minWidth: 40, textAlign: "right" } }, Math.round(opacity * 100) + "%"),
					]),
					React.createElement("div", { style: { display: "flex", gap: 10, flexWrap: "wrap", marginTop: 6 } },
						imgs.map((img) => React.createElement("div", {
							key: img.id,
							style: {
								width: 140, border: "1px solid " + (img.id === cur ? "var(--dsw-alias-brand-primary)" : "var(--dsw-alias-border-l2)"),
								borderRadius: 8, padding: 5, background: "var(--dsw-alias-bg-layer-2)",
							},
						}, [
							React.createElement(img.mediaType && img.mediaType.startsWith("video/") ? "video" : "img",
								img.mediaType && img.mediaType.startsWith("video/")
									? { src: img.url, muted: true, loop: true, autoPlay: true, playsInline: true, style: { width: "100%", height: 70, objectFit: "cover", borderRadius: 4, display: "block" } }
									: { src: img.url, alt: img.name, style: { width: "100%", height: 70, objectFit: "cover", borderRadius: 4, display: "block" } }),
							React.createElement("div", { style: { fontSize: 12, margin: "5px 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, img.name),
							row([
								img.id === cur
									? React.createElement("span", { style: { fontSize: 12, color: "var(--dsw-alias-brand-primary)" } }, "当前")
									: btn("设为背景", () => patch({ current: img.id })),
								btn("删除", () => onRemove(img.id), false, true),
							]),
						]))
					),
					row([
						btn(busy ? "保存中…" : "＋ 添加背景图", () => fileRef.current && fileRef.current.click()),
						input,
					]),
				];

				return React.createElement("div", {
					style: {
						padding: 16, borderRadius: 10, fontSize: 13, maxWidth: 760,
						background: "var(--dsw-alias-bg-layer-1)", border: "1px solid var(--dsw-alias-border-l1)",
						display: "flex", flexDirection: "column", gap: 10,
					},
				}, [
					React.createElement("div", { style: { fontWeight: 600, fontSize: 15, marginBottom: 4 } }, "🖼 动态背景设置"),
					errEl,
					body,
				]);
			};

			ctx.slots.inject("settings.section", () => ctx.slots.register(
				{ name: "settings.section", id: "bg-wall", order: 30, label: "动态背景" },
				BgWallSection
			));
			// Apply the wallpaper on plugin start (page load), independent of the
			// settings UI; remove it only when the plugin itself is torn down.
			ctx.effect(() => {
				let alive = true;
				api("/dsh-bg/api/state").then((res) => { if (alive) applyBackgroundFromState(res); }).catch(() => {});
				return () => { alive = false; clearBackgroundCss(); };
			}, "bg-wall: background lifecycle");
		}

		var inject = ["slots"];
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
