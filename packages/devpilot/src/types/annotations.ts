export type DevPilotAnnotationStatus =
  | "pending"
  | "acknowledged"
  | "resolved"
  | "dismissed";

export const DEVPILOT_OPEN_ANNOTATION_STATUSES = [
  "pending",
  "acknowledged",
] as const;

export const DEVPILOT_CLOSED_ANNOTATION_STATUSES = [
  "resolved",
  "dismissed",
] as const;

export const DEVPILOT_ANNOTATION_STATUSES = [
  ...DEVPILOT_OPEN_ANNOTATION_STATUSES,
  ...DEVPILOT_CLOSED_ANNOTATION_STATUSES,
] as const;

export function isDevPilotAnnotationStatus(
  value: unknown,
): value is DevPilotAnnotationStatus {
  return (
    typeof value === "string" &&
    DEVPILOT_ANNOTATION_STATUSES.includes(
      value as DevPilotAnnotationStatus,
    )
  );
}

export function isOpenDevPilotAnnotationStatus(
  status: DevPilotAnnotationStatus,
): boolean {
  return (
    DEVPILOT_OPEN_ANNOTATION_STATUSES as readonly DevPilotAnnotationStatus[]
  ).includes(status);
}

export function isClosedDevPilotAnnotationStatus(
  status: DevPilotAnnotationStatus,
): boolean {
  return (
    DEVPILOT_CLOSED_ANNOTATION_STATUSES as readonly DevPilotAnnotationStatus[]
  ).includes(status);
}
