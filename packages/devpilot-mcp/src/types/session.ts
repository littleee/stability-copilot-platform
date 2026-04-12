import type {
  DevPilotAnnotationRecord,
} from "./annotation.js";
import type {
  DevPilotRepairRequestRecord,
} from "./repair.js";
import type {
  DevPilotStabilityItemRecord,
} from "./stability.js";

export interface DevPilotSessionRecord {
  id: string;
  pageKey: string;
  pathname: string;
  url: string;
  title: string;
  status: "active" | "closed";
  createdAt: number;
  updatedAt: number;
}

export interface DevPilotSessionWithAnnotations extends DevPilotSessionRecord {
  annotations: DevPilotAnnotationRecord[];
  stabilityItems: DevPilotStabilityItemRecord[];
  repairRequests: DevPilotRepairRequestRecord[];
}

export interface DevPilotEnsureSessionInput {
  pageKey: string;
  pathname: string;
  url: string;
  title: string;
}
