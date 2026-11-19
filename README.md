# Billion-Context 侧边栏监控控制台插件

本插件是为 **Google Antigravity 2.0** 打造的原生 UI 扩展插件（Sidecar Panel），让您无需切出到外部浏览器，直接在 IDE 侧边栏中实时查看和管理 **Billion-Context** 智能上下文压缩看板。

---

## 🌟 核心功能

1. **原汁原味原生看板**：
   - 直接无缝内嵌 Billion-Context 官方 Web 控制面板（`http://127.0.0.1:8787/__bili/`）。
   - 实时查看当前会话的上下文压缩削减比例、Token 节省曲线、Turns 时间轴与快照。
2. **轻量快捷控制栏（Toolbar）**：
   - 🟢 **状态指示灯**：实时探测后台 `bili` 守护进程健康状态（在线/离线/检测中）。
   - 🔄 **一键刷新**：快速刷新看板数据。
   - ⚡ **一键重启**：通过本地 API 直接控制后台 systemd 服务重启。
   - ↗️ **外部打开**：一键在系统默认浏览器中打开独立网页。
3. **自愈与离线防护**：
   - 当检测到后台守护进程未启动时，自动弹出离线提示卡片，并提供【立即启动服务】按钮，一键拉起后台。

---

## 📂 插件目录结构

```text
billion-context/
├── plugin.json               # 插件主元数据配置
├── assets/
│   └── logo.svg              # 极客量子折叠风格 Logo
└── sidecars/
    └── panel/
        ├── sidecar.json      # 声明右侧辅助栏 UI (SIDECAR_UI_ENTRYPOINT_AUX_PANE)
        ├── package.json      # ES 模块支持
        ├── main.mjs          # Sidecar 后端 (状态探测 / 服务控制 API)
        ├── index.html        # 前端页面结构
        ├── styles.css        # 深色透明科技风样式
        └── app.js            # 前端交互与自动轮询逻辑
```

---

## 🚀 安装与启用

1. 插件已自动安装在 `~/.gemini/config/plugins/billion-context`。
2. 重启 Antigravity 客户端后：
   - 在任意对话界面的右上角点击 **⋮ (更多选项)** → **Extensions（扩展面板）**；
   - 点击 **Billion-Context 压缩监控**，即可直接在右侧边栏滑出监控控制面板！
