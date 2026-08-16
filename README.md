# dsh-bg-wall 🖼️

**Dynamic wallpaper plugin for DeepSeek Harness (DSH)** — turn the entire DSH window into your own canvas.

为 **DeepSeek Harness** 打造的动态壁纸插件：把整个 DSH 窗口变成你的个人画布。

![License](https://img.shields.io/badge/license-MIT-blue.svg) ![Version](https://img.shields.io/badge/version-1.0.0-green.svg)

---

## ✨ 特色 Features

### 1. 全窗口壁纸 Full-window wallpaper
不是边角——**整个窗口**（左侧边栏、中间对话区、右侧详情栏、输入框区域、标题栏下方）全部铺满你的壁纸，无黑边、无死角。

### 2. 视频动态壁纸 Video wallpaper 🎬
支持 **MP4 / WebM** 视频作为壁纸，**静音自动循环播放**，效果类似 Steam 动态壁纸——打开 DSH 就像打开了一个会动的桌面。

### 3. 多格式支持 Multi-format
- 静态图：**PNG / JPEG / WebP**
- 动图：**GIF / WebP**（可静态定格第一帧，也可动态播放）
- 视频：**MP4 / WebM**（循环播放）

### 4. 毛玻璃界面 Frosted-glass UI ✨
壁纸铺满后，**对话框、设置面板、输入框、消息气泡、代码块** 自动获得毛玻璃效果（高斯模糊 + 半透明 + 高亮描边），既能看到壁纸，文字依然清晰可读。

### 5. 透明度调节 Opacity control 🎚️
滑动条自由调节壁纸的浓淡程度，从若隐若现到完整呈现。

### 6. 深浅色主题自适应 Light/Dark adaptive 🌗
毛玻璃的底色会自动匹配深色/浅色主题，深色主题下是暗色毛玻璃，浅色主题下是亮色毛玻璃。

### 7. 本地存储 Local-first 🔒
壁纸文件保存在本地 `~/.dsh/bg-wall/` 目录，通过 `manifest.json` 管理，**不依赖任何外部服务**，数据完全在你自己的电脑上。

### 8. 设置面板管理 Built-in settings panel ⚙️
在 DSH 设置页新增「**动态背景**」栏目，可视化添加、设为背景、删除、切换模式、调透明度，操作直观。

---

## 📥 安装 Installation

> **先弄清三件事**（新手必读）：
> 1. DSH 的数据目录叫 **`.dsh`**，在 `C:\Users\你的用户名\.dsh`（下文用 `~/.dsh` 代替）。
> 2. DSH 的插件配置文件夹是 `~/.dsh/profiles/web/`，里面有 `package.json` 和 `cordis.patch.yml` 两个文件。
> 3. 你的系统里可能没有 `pnpm` 命令，但 DSH 自带 Node.js，可以用 `corepack pnpm` 代替。

### 方式一：本地文件依赖（推荐，新手照做即可）

**第 1 步 — 拿到插件源码**

把本仓库下载到你电脑上任意一个文件夹，例如：

```
E:\dp h\plugins\dsh-bg-wall
```

> 如果电脑装了 Git，也可以打开 PowerShell 输入：
> ```powershell
> git clone https://github.com/manbamax/dsh-bg-wall.git "E:\dp h\plugins\dsh-bg-wall"
> ```

**第 2 步 — 找到 DSH 的插件配置文件夹**

打开文件资源管理器，进入：

```
C:\Users\你的用户名\.dsh\profiles\web
```

> 把「你的用户名」换成你自己电脑的用户名，比如 `C:\Users\ZhuanZ（无密码）\.dsh\profiles\web`。

**第 3 步 — 编辑 `package.json`，声明插件依赖**

用记事本（右键 → 打开方式 → 记事本）打开 `package.json`，找到 `"dependencies"` 这一段，在里面加一行：

```json
{
  "name": "dsh-profile-web",
  "private": true,
  "dependencies": {
    "dsh-bg-wall": "file:E:/dp h/plugins/dsh-bg-wall"
  },
  "dsh": {
    "profile": {
      "bundles": ["@deepseek-ai/dsh-base", "@deepseek-ai/dsh-web-app"]
    }
  }
}
```

> ⚠️ 注意三点：
> - `file:` 后面跟的是**第 1 步你放源码的完整路径**；
> - Windows 路径里**正斜杠 `/` 和反斜杠 `\` 都可以**，但路径里有空格也没关系，照抄即可；
> - 如果 `dependencies` 里已有其他依赖，加个英文逗号再写新的一行。

**第 4 步 — 编辑 `cordis.patch.yml`，注册插件**

同样用记事本打开同目录下的 `cordis.patch.yml`，在文件**最末尾**追加：

```yaml
# 个人插件：动态背景图库（dsh-bg-wall）。删除本段即可卸载。
- insert:
    - id: bg-wall
      name: dsh-bg-wall
```

保存关闭。

**第 5 步 — 运行安装命令**

打开 PowerShell（开始菜单搜 PowerShell），粘贴这一整行回车：

```powershell
cd C:\Users\你的用户名\.dsh\profiles\web
corepack pnpm install
```

> 看到类似 `Done in xx.xs` 或 `dependencies resolved` 就说明装好了。如果报错，把错误信息截图发到仓库 Issues。

**第 6 步 — 重启 DSH**

完全退出 DSH（右上角关闭），再重新打开。服务端代码需要重启才会加载。

**第 7 步 — 打开设置使用**

DSH → 左下角 **设置** → 左侧栏出现「**动态背景**」栏目 → 点「＋ 添加背景图」选一张图片或视频 → 点「设为背景」。

> 🎉 搞定！你的整个 DSH 窗口现在都是你的壁纸了。

---

### 方式二：让另一个 DeepSeek Harness 自动安装（给 AI 的一句话提示词）

想把这插件交给**另一台电脑上的 DeepSeek Harness** 自动安装？直接复制下面这一句粘贴给它就行，它会自己完成全部安装：

> 请帮我在本机完美安装 DSH 动态壁纸插件 dsh-bg-wall：先检查 E:\dp h\plugins\dsh-bg-wall 目录是否存在，不存在就从 https://github.com/manbamax/dsh-bg-wall.git 克隆过来；然后在 ~/.dsh/profiles/web/package.json 的 dependencies 里确保有 "dsh-bg-wall": "file:E:/dp h/plugins/dsh-bg-wall"；再在 ~/.dsh/profiles/web/cordis.patch.yml 末尾追加注册段 `- insert:\n    - id: bg-wall\n      name: dsh-bg-wall`；然后在 ~/.dsh/profiles/web 目录执行 corepack pnpm install（系统没有 pnpm 的话用 corepack pnpm）；全部完成后告诉我重启 DSH 并到 设置 → 动态背景 里添加壁纸就能用了。

如果你想让它更友好一点，可以在上面那句后面再加上：

> 如果你不忙的话，可以送给我一颗小星星吗～⭐

---

## 🖱️ 使用说明 Usage

打开 DSH 设置 → **动态背景**：

| 操作 | 说明 |
| --- | --- |
| **＋ 添加背景图** | 选择图片（PNG/JPEG/WebP/GIF）或视频（MP4/WebM）上传 |
| **静态照片 / 动态实况** | 静态：动图/视频显示第一帧定格；动态：动图/视频实时播放 |
| **透明度** 滑动条 | 调节壁纸浓淡（0%–100%） |
| **设为背景** | 把选中项设为当前壁纸，立即生效 |
| **删除** | 移除某个背景项（同时删除本地文件） |

---

## ⚙️ 工作原理 How it works

- **服务端**（`lib/index.js`）：注册 `/dsh-bg/api/*` 接口（状态查询/保存/删除/设置）和 `/dsh-bg/<id>` 文件路由；媒体文件存储在 `~/.dsh/bg-wall/`，元数据写入 `manifest.json`。
- **客户端**（`lib/client.js`）：
  - 注入 `<style>` 清空所有表面背景色，让壁纸铺满全窗口；
  - 给浮动层（对话框、输入框卡片、消息气泡、代码块、工具卡片）应用 `backdrop-filter` 毛玻璃效果；
  - 图片壁纸用 `::before` 伪元素层；视频壁纸用全窗口 `<video>` 元素（`z-index:-1`、静音、循环、内联播放）。

**数据流**：设置面板 → `/dsh-bg/api/save`（base64 上传）→ 本地文件 + manifest → `/dsh-bg/<id>` 提供访问 → 客户端渲染为壁纸层。

---

## 📁 数据与目录 Data & Directories

```
~/.dsh/bg-wall/
├── manifest.json        # 媒体清单 + 设置
├── bgxxxxxx.jpg         # 上传的图片/视频文件
└── bgxxxxxx.static.png  # 动图/视频的静态第一帧（静态模式用）
```

---

## ⚠️ 注意事项 Notes

- **文件大小限制**：单次上传不超过 **15MB**。
- **视频建议**：推荐使用压缩过的 MP4（H.264 编码、1080p 以内、时长不宜过长），过大或过高的视频会占用较多内存和 CPU。
- **毛玻璃兼容性**：`backdrop-filter` 需要较新的浏览器内核（Chromium 76+ / Electron 较新版本），旧内核会退化为普通半透明。
- **类名依赖**：插件针对特定 DSH 构建的少量哈希类名（如 `_4KQOPa_card`、`P5DUYG_bubble`）做毛玻璃定位。若 DSH 升级后毛玻璃失效，需要更新这些选择器。

---

## 🧹 卸载 Uninstall

1. 删除 `~/.dsh/profiles/web/cordis.patch.yml` 中的 `bg-wall` 段；
2. 从 `~/.dsh/profiles/web/package.json` 移除 `dsh-bg-wall` 依赖，重新执行 `corepack pnpm install`；
3. 可选：删除 `~/.dsh/bg-wall/` 目录清理壁纸数据。

---

## 📄 License

[MIT](LICENSE) © 2026 manbamax
