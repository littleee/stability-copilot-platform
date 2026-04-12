import type { DevPilotAnnotation, DevPilotAnnotationStatus } from "../types";

export function getAnnotationStatusLabel(
  status: DevPilotAnnotationStatus,
): string {
  switch (status) {
    case "acknowledged":
      return "处理中";
    case "resolved":
      return "已解决";
    case "dismissed":
      return "已忽略";
    default:
      return "待处理";
  }
}

export function sortAnnotationsByUpdatedAt(
  annotations: DevPilotAnnotation[],
): DevPilotAnnotation[] {
  return [...annotations].sort((a, b) => {
    if (b.updatedAt !== a.updatedAt) {
      return b.updatedAt - a.updatedAt;
    }

    return b.createdAt - a.createdAt;
  });
}

export function mergeRemoteAnnotations(
  localAnnotations: DevPilotAnnotation[],
  remoteAnnotations: DevPilotAnnotation[],
): DevPilotAnnotation[] {
  const merged = new Map<string, DevPilotAnnotation>();

  remoteAnnotations.forEach((annotation) => {
    merged.set(annotation.id, annotation);
  });

  localAnnotations.forEach((annotation) => {
    const remote = merged.get(annotation.id);
    if (!remote || annotation.updatedAt > remote.updatedAt) {
      merged.set(annotation.id, annotation);
    }
  });

  return sortAnnotationsByUpdatedAt(Array.from(merged.values()));
}
