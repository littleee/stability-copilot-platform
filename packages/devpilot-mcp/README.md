# @littleee/devpilot-mcp

`@littleee/devpilot-mcp` 是 `DevPilot` 的本地 bridge 与 MCP 服务包。

它会同时提供两层能力：

- 本地 HTTP bridge，供浏览器侧 `DevPilot` 同步 session / annotation / thread
- MCP stdio server，供 Claude / Cursor 等 AI agent 读取和回写标注状态

在当前版本里，`devpilot-mcp` 也负责：

- stability item 的持久化与查询
- repair request 的显式流转
- SSE 事件流，让 agent 可以 watch 新 annotation / stability / repair request

## 安装

```bash
npm install @littleee/devpilot-mcp
```

## 启动

```bash
npx @littleee/devpilot-mcp server --port 5213
```

也可以只启动 MCP stdio，并指向一个已存在的 HTTP bridge：

```bash
npx @littleee/devpilot-mcp server --mcp-only --http-url http://localhost:5213
```

如果你希望把本地 bridge 常驻运行，再让不同 agent 单独连接，也可以只启动 HTTP：

```bash
npx @littleee/devpilot-mcp server --http-only --port 5213
```

## 浏览器接入

在业务页面里把 `DevPilot` 挂到同一个本地 bridge：

```ts
import { mountDevPilot } from "@littleee/devpilot";

mountDevPilot({
  endpoint: "http://localhost:5213",
  features: {
    mcp: true,
    stability: true,
  },
});
```

## 当前 HTTP API

- `GET /health`
- `POST /sessions/ensure`
- `GET /sessions`
- `GET /sessions/:id`
- `GET /sessions/:id/pending`
- `POST /sessions/:id/annotations`
- `GET /sessions/:id/stability`
- `GET /sessions/:id/stability/open`
- `POST /sessions/:id/stability`
- `GET /sessions/:id/repair-requests`
- `GET /sessions/:id/repair-requests/open`
- `POST /sessions/:id/repair-requests`
- `GET /pending`
- `GET /stability/open`
- `GET /repair-requests/open`
- `GET /events`
- `GET /sessions/:id/events`
- `GET /annotations/:id`
- `PATCH /annotations/:id`
- `DELETE /annotations/:id`
- `POST /annotations/:id/thread`
- `GET /stability/:id`
- `PATCH /stability/:id`
- `DELETE /stability/:id`
- `GET /repair-requests/:id`
- `PATCH /repair-requests/:id`

## 当前 MCP Tools

- `devpilot_list_sessions`
- `devpilot_get_session`
- `devpilot_get_pending`
- `devpilot_get_all_pending`
- `devpilot_list_stability_items`
- `devpilot_get_session_stability_items`
- `devpilot_get_stability_item`
- `devpilot_acknowledge`
- `devpilot_resolve`
- `devpilot_dismiss`
- `devpilot_reply`
- `devpilot_diagnose_stability_item`
- `devpilot_resolve_stability_item`
- `devpilot_watch_annotations`
- `devpilot_watch_stability_items`
- `devpilot_list_repair_requests`
- `devpilot_get_repair_request`
- `devpilot_accept_repair_request`
- `devpilot_complete_repair_request`
- `devpilot_dismiss_repair_request`
- `devpilot_watch_repair_requests`
