import type { DevPilotAnnotationStatus } from "./annotations";
import type {
  DevPilotRepairRequest,
} from "./repair";

export type DevPilotMode = "annotate" | "stability" | "session";

export type DevPilotSelectionKind = "element" | "text" | "area";

export interface DevPilotRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface DevPilotSelection {
  kind: DevPilotSelectionKind;
  elementName: string;
  elementPath: string;
  rect: DevPilotRect;
  pageX: number;
  pageY: number;
  matchCount?: number;
  selectedText?: string;
  nearbyText?: string;
  relatedElements?: string[];
}

export interface DevPilotAnnotation {
  id: string;
  pathname: string;
  createdAt: number;
  updatedAt: number;
  kind?: DevPilotSelectionKind;
  status: DevPilotAnnotationStatus;
  comment: string;
  elementName: string;
  elementPath: string;
  matchCount?: number;
  selectedText?: string;
  nearbyText?: string;
  relatedElements?: string[];
  pageX: number;
  pageY: number;
  rect: DevPilotRect;
}

export interface DevPilotFeatureFlags {
  stability?: boolean;
  mcp?: boolean;
}

export interface ResolvedDevPilotFeatureFlags {
  stability: boolean;
  mcp: boolean;
}

export function resolveDevPilotFeatures(
  features: DevPilotFeatureFlags | undefined,
  endpoint?: string,
): ResolvedDevPilotFeatureFlags {
  return {
    stability: features?.stability ?? false,
    mcp: features?.mcp ?? Boolean(endpoint),
  };
}

export interface DevPilotMountOptions {
  endpoint?: string;
  defaultOpen?: boolean;
  features?: DevPilotFeatureFlags;
  onRepairRequest?: (
    request: DevPilotRepairRequest,
  ) => void | Promise<void>;
}

export interface DevPilotController {
  destroy: () => void;
}
