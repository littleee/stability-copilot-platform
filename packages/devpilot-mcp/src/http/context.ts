import type { IncomingMessage, ServerResponse } from "node:http";

import type { DevPilotStore } from "../store.js";
import type { DevPilotEventStreamHub } from "./events.js";

export interface HttpRouteContext {
  req: IncomingMessage;
  res: ServerResponse;
  url: URL;
  pathname: string;
  store: DevPilotStore;
  events: DevPilotEventStreamHub;
}

export type HttpRouteHandler = (
  context: HttpRouteContext,
) => Promise<boolean>;
