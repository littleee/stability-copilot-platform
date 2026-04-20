import type {
  DevPilotStabilityItem,
  DevPilotStabilitySeverity,
  DevPilotStabilityStatus,
} from "../types";
import type { I18nContextValue } from "../i18n/context";

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
  t: I18nContextValue["t"],
): string {
  switch (status) {
    case "diagnosing":
      return t("stabilityState.diagnosing");
    case "resolved":
      return t("stabilityState.resolved");
    default:
      return t("stabilityState.open");
  }
}

export function getStabilitySeverityLabel(
  severity: DevPilotStabilitySeverity,
  t: I18nContextValue["t"],
): string {
  switch (severity) {
    case "low":
      return t("stabilityState.low");
    case "medium":
      return t("stabilityState.medium");
    case "critical":
      return t("stabilityState.critical");
    default:
      return t("stabilityState.high");
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
