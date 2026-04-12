export type DevPilotStabilityStatus =
  | "open"
  | "diagnosing"
  | "resolved";

export type DevPilotStabilitySeverity =
  | "low"
  | "medium"
  | "high"
  | "critical";

export interface DevPilotStabilityContextSnapshot {
  capturedAt: number;
  title: string;
  url: string;
  pathname: string;
  viewport: {
    width: number;
    height: number;
  };
  sessionId?: string;
  userAgent?: string;
  openAnnotationCount: number;
  openAnnotationComments: string[];
}

export interface DevPilotStabilityItemRecord {
  id: string;
  sessionId: string;
  pathname: string;
  createdAt: number;
  updatedAt: number;
  status: DevPilotStabilityStatus;
  severity: DevPilotStabilitySeverity;
  title: string;
  symptom: string;
  reproSteps?: string;
  impact?: string;
  signals?: string;
  fixGoal?: string;
  context: DevPilotStabilityContextSnapshot;
}

export interface OpenStabilityItemsResponse {
  count: number;
  items: DevPilotStabilityItemRecord[];
}
