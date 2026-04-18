export type DevPilotStabilityStatus =
  | "open"
  | "diagnosing"
  | "resolved";

export type DevPilotStabilitySeverity =
  | "low"
  | "medium"
  | "high"
  | "critical";

export const DEVPILOT_STABILITY_STATUSES = [
  "open",
  "diagnosing",
  "resolved",
] as const;

export const DEVPILOT_STABILITY_SEVERITIES = [
  "low",
  "medium",
  "high",
  "critical",
] as const;

export function isDevPilotStabilityStatus(
  value: unknown,
): value is DevPilotStabilityStatus {
  return (
    typeof value === "string" &&
    DEVPILOT_STABILITY_STATUSES.includes(
      value as DevPilotStabilityStatus,
    )
  );
}

export function isDevPilotStabilitySeverity(
  value: unknown,
): value is DevPilotStabilitySeverity {
  return (
    typeof value === "string" &&
    DEVPILOT_STABILITY_SEVERITIES.includes(
      value as DevPilotStabilitySeverity,
    )
  );
}

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
  platform?: string;
  language?: string;
  screen?: {
    width: number;
    height: number;
  };
  referrer?: string;
  openAnnotationCount: number;
  openAnnotationComments: string[];
  openAnnotationSummaries?: Array<{
    elementName: string;
    elementPath: string;
    comment: string;
    kind?: string;
  }>;
}

export interface DevPilotStabilityItem {
  id: string;
  sessionId?: string;
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
