const messages = {
  en: {
    "hero.title": "Turn browser issues into AI-ready frontend tasks.",
    "hero.subtitle":
      "DevPilot helps teams annotate real pages, capture runtime issues, and hand clean task packets to Claude, Codex, and connected MCP workflows.",
    "toc.release": "Release",
    "toc.what": "What is DevPilot",
    "toc.modes": "Modes",
    "toc.quickstart": "Quick Start",
    "toc.mcp": "MCP Bridge",
    "toc.workflow": "Typical Workflow",
    "toc.links": "Links",
    "release.title": "Public Beta Release",
    "release.body1":
      "DevPilot is now available as a public beta for teams who want a practical browser-to-code workflow.",
    "release.body2":
      "The current release sharpens the product around annotate -> copy to AI, while keeping Stability Copilot and MCP-connected repair flows available as optional power-ups.",
    "release.item1":
      "Richer AI task packets with selectors, nearby context, grouped elements, and source hints.",
    "release.item2":
      "Optional Stability Copilot for runtime issues such as JS errors, failed fetches, and rejected promises.",
    "release.item3":
      "A companion MCP bridge for Claude, Codex, and other compatible coding agents.",
    "what.title": "What is DevPilot",
    "what.body1":
      "DevPilot is a browser-native frontend copilot. It lets you annotate real pages, copy AI-ready task packets, and optionally connect an MCP bridge for synchronized issue handling and repair workflows.",
    "what.body2":
      "The product is designed as one workflow with two modes: local mode works immediately, connected mode adds collaboration and AI repair orchestration.",
    "modes.localTitle": "Local Mode",
    "modes.localBody":
      "Use DevPilot as a browser annotation tool on its own. Create element, text, or area annotations, then copy them straight into Claude, Codex, Cursor, or another AI tool.",
    "modes.connectedTitle": "Connected Mode",
    "modes.connectedBody":
      "Connect DevPilot to the MCP bridge to sync sessions, stream updates over SSE, track stability items, and hand structured repair requests to AI agents.",
    "quickstart.title": "Quick Start",
    "quickstart.body":
      "In beta, the simplest workflow is: annotate on the page, then use Copy to AI to send a clean task packet to your coding assistant.",
    "mcp.title": "MCP Bridge",
    "mcp.body1":
      "The MCP bridge starts a local HTTP bridge and MCP server for connected workflows.",
    "mcp.body2":
      "If port 5213 is available, it uses that by default. If 5213 is already occupied and you did not pass --port, it automatically falls back to the next available port.",
    "workflow.title": "Typical Workflow",
    "workflow.step1": "Open DevPilot on a real page and create an annotation.",
    "workflow.step2":
      "Copy the generated task packet into Claude, Codex, or another coding agent.",
    "workflow.step3":
      "Optionally enable Stability Copilot to auto-capture runtime failures.",
    "workflow.step4":
      "Connect the MCP bridge when you want synchronized sessions and repair flows.",
    "links.title": "Links",
    "links.repo": "GitHub repository",
    "links.release": "DevPilot v0.2.0 Beta release",
    "links.mcpRelease": "DevPilot MCP v0.1.0 Beta release",
  },
  zh: {
    "hero.title": "把浏览器里的问题，变成 AI 可执行的前端任务。",
    "hero.subtitle":
      "DevPilot 帮团队在真实页面里标注问题、捕获运行时异常，并把干净的任务包交给 Claude、Codex 和接入 MCP 的工作流。",
    "toc.release": "发布说明",
    "toc.what": "产品介绍",
    "toc.modes": "产品模式",
    "toc.quickstart": "快速开始",
    "toc.mcp": "MCP Bridge",
    "toc.workflow": "典型流程",
    "toc.links": "相关链接",
    "release.title": "公开 Beta 发布",
    "release.body1":
      "DevPilot 现在已经可以作为公开 Beta 提供给想要打通浏览器到代码工作流的团队试用。",
    "release.body2":
      "这一版把主流程收到了 标注 -> 复制给 AI，同时把稳定性副驾和 MCP 连接修复流保留为可选增强能力。",
    "release.item1":
      "更丰富的 AI 任务包，包含 selector、附近上下文、分组元素和源码线索。",
    "release.item2":
      "可选的稳定性副驾，自动捕获 JS 错误、请求失败和 Promise 拒绝。",
    "release.item3":
      "配套的 MCP bridge，可连接 Claude、Codex 和其他兼容 agent。",
    "what.title": "什么是 DevPilot",
    "what.body1":
      "DevPilot 是一个浏览器原生的前端工程副驾。它让你可以在真实页面里标注问题、复制 AI 可读任务包，并在需要时接入 MCP bridge 获得同步和修复工作流。",
    "what.body2":
      "它是一个产品，两种模式：本地模式可以直接使用，连接模式则增加协作与 AI 修复编排能力。",
    "modes.localTitle": "本地模式",
    "modes.localBody":
      "把 DevPilot 当成浏览器标注工具单独使用。你可以创建元素、文本和区域标注，然后直接复制给 Claude、Codex、Cursor 或其他 AI 工具。",
    "modes.connectedTitle": "连接模式",
    "modes.connectedBody":
      "把 DevPilot 接到 MCP bridge 后，可以同步会话、通过 SSE 接收更新、追踪稳定性问题，并把结构化修复请求交给 AI agent。",
    "quickstart.title": "快速开始",
    "quickstart.body":
      "在当前 Beta 里，最简单的主流程就是：在页面中标注，然后点击 Copy to AI，把任务包交给编码助手。",
    "mcp.title": "MCP Bridge",
    "mcp.body1": "MCP bridge 会启动本地 HTTP bridge 和 MCP server，用于连接模式。",
    "mcp.body2":
      "默认优先使用 5213 端口；如果 5213 已被占用且你没有显式传入 --port，它会自动回退到下一个可用端口。",
    "workflow.title": "典型使用流程",
    "workflow.step1": "在真实页面中打开 DevPilot，创建一条标注。",
    "workflow.step2": "把生成的任务包复制到 Claude、Codex 或其他 coding agent。",
    "workflow.step3": "按需开启稳定性副驾，自动捕获运行时异常。",
    "workflow.step4": "需要同步会话和修复流时，再接入 MCP bridge。",
    "links.title": "相关链接",
    "links.repo": "GitHub 仓库",
    "links.release": "DevPilot v0.2.0 Beta 发布说明",
    "links.mcpRelease": "DevPilot MCP v0.1.0 Beta 发布说明",
  },
};

function applyLanguage(language) {
  const dictionary = messages[language] ?? messages.en;
  document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    const key = node.getAttribute("data-i18n");
    if (!key) return;
    const value = dictionary[key];
    if (value) {
      node.textContent = value;
    }
  });

  document.getElementById("lang-zh")?.classList.toggle("active", language === "zh");
  document.getElementById("lang-en")?.classList.toggle("active", language === "en");
  localStorage.setItem("devpilot-docs-lang", language);
}

document.getElementById("lang-zh")?.addEventListener("click", () => applyLanguage("zh"));
document.getElementById("lang-en")?.addEventListener("click", () => applyLanguage("en"));

const browserLanguage = navigator.language.toLowerCase().startsWith("zh") ? "zh" : "en";
const initialLanguage = localStorage.getItem("devpilot-docs-lang") || browserLanguage;
applyLanguage(initialLanguage);
