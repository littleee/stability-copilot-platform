import type {
  DevPilotStabilityItem,
  DevPilotStabilitySeverity,
  DevPilotStabilityStatus,
} from "../types";

export type DevPilotStabilityDraft = {
  title: string;
  severity: DevPilotStabilitySeverity;
  symptom: string;
  reproSteps: string;
  impact: string;
  signals: string;
  fixGoal: string;
};

export function getDefaultStabilityDraft(): DevPilotStabilityDraft {
  return {
    title: "",
    severity: "high",
    symptom: "",
    reproSteps: "",
    impact: "",
    signals: "",
    fixGoal: "",
  };
}

export function getStabilityStatusLabel(
  status: DevPilotStabilityStatus,
): string {
  switch (status) {
    case "diagnosing":
      return "排查中";
    case "resolved":
      return "已解决";
    default:
      return "待处理";
  }
}

export function getStabilitySeverityLabel(
  severity: DevPilotStabilitySeverity,
): string {
  switch (severity) {
    case "low":
      return "低";
    case "medium":
      return "中";
    case "critical":
      return "紧急";
    default:
      return "高";
  }
}

export function sortStabilityItemsByUpdatedAt(
  items: DevPilotStabilityItem[],
): DevPilotStabilityItem[] {
  return [...items].sort((a, b) => {
    if (b.updatedAt !== a.updatedAt) {
      return b.updatedAt - a.updatedAt;
    }

    return b.createdAt - a.createdAt;
  });
}

export function mergeRemoteStabilityItems(
  localItems: DevPilotStabilityItem[],
  remoteItems: DevPilotStabilityItem[],
): DevPilotStabilityItem[] {
  const merged = new Map<string, DevPilotStabilityItem>();

  remoteItems.forEach((item) => {
    merged.set(item.id, item);
  });

  localItems.forEach((item) => {
    const remote = merged.get(item.id);
    if (!remote || item.updatedAt > remote.updatedAt) {
      merged.set(item.id, item);
    }
  });

  return sortStabilityItemsByUpdatedAt(Array.from(merged.values()));
}
