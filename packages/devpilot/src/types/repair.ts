import type { DevPilotStabilityItem, DevPilotStabilitySeverity } from "./stability";

export type DevPilotRepairRequestStatus =
  | "requested"
  | "accepted"
  | "completed"
  | "dismissed";

export interface DevPilotRepairRequestRecord {
  id: string;
  sessionId?: string;
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

export interface DevPilotRepairRequest {
  item: DevPilotStabilityItem;
  prompt: string;
  endpoint?: string;
  sessionId?: string;
}
