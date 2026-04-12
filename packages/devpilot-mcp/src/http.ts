import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from "node:http";

import { createStore, type DevPilotStore } from "./store.js";
import { HttpRouteHandler } from "./http/context.js";
import { createEventStreamHub } from "./http/events.js";
import { handleAnnotationRoutes } from "./http/routes/annotations.js";
import { handleRepairRequestRoutes } from "./http/routes/repair-requests.js";
import { handleSessionRoutes } from "./http/routes/sessions.js";
import { handleStabilityRoutes } from "./http/routes/stability.js";
import { sendError, setCorsHeaders } from "./http/shared.js";

const ROUTES: HttpRouteHandler[] = [
  handleSessionRoutes,
  handleAnnotationRoutes,
  handleStabilityRoutes,
  handleRepairRequestRoutes,
];

export function createHttpHandler(store: DevPilotStore) {
  const events = createEventStreamHub(store);

  return async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
    setCorsHeaders(res);

    if (req.method === "OPTIONS") {
      res.statusCode = 204;
      res.end();
      return;
    }

    const url = new URL(req.url || "/", "http://localhost");
    const { pathname } = url;

    try {
      for (const route of ROUTES) {
        const handled = await route({
          req,
          res,
          url,
          pathname,
          store,
          events,
        });
        if (handled) {
          return;
        }
      }

      sendError(res, 404, "Not found");
    } catch (error) {
      sendError(res, 500, (error as Error).message);
    }
  };
}

export function startHttpServer(port = 5213, store = createStore()) {
  const server = createServer(createHttpHandler(store));
  server.listen(port, () => {
    console.error(`[devpilot-mcp] HTTP server listening on http://localhost:${port}`);
  });
  return { server, store };
}
