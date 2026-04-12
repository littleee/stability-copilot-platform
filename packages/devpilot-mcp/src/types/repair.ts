import type { DevPilotStabilitySeverity } from "./stability.js";

export type DevPilotRepairRequestStatus =
  | "requested"
  | "accepted"
  | "completed"
  | "dismissed";

export interface DevPilotRepairRequestRecord {
  id: string;
  sessionId: string;
  stabilityItemId?: string;
  pathname: string;
  createdAt: number;
  updatedAt: number;
  status: DevPilotRepairRequestStatus;
  title: string;
  severity?: DevPilotStabilitySeverity;
  prompt: string;
  requestedBy: "human" | "agent";
  completedAt?: number;
  completedBy?: "human" | "agent";
  resultSummary?: string;
}

export interface OpenRepairRequestsResponse {
  count: number;
  items: DevPilotRepairRequestRecord[];
}
