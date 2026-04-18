export type DevPilotAnnotationStatus =
  | "pending"
  | "acknowledged"
  | "resolved"
  | "dismissed";

export type DevPilotSelectionKind = "element" | "text" | "area";

export interface DevPilotRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface DevPilotElementContext {
  cssClasses?: string[];
  selectorCandidates?: string[];
  nearbyElements?: string[];
  computedStyleSnapshot?: Record<string, string>;
  componentHints?: string[];
  sourceHints?: string[];
  dataAttributes?: Record<string, string>;
}

export interface DevPilotAnnotationReply {
  id: string;
  annotationId: string;
  role: "human" | "agent";
  content: string;
  createdAt: number;
}

export interface DevPilotAnnotationRecord {
  id: string;
  sessionId: string;
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
  context?: DevPilotElementContext;
  resolvedAt?: number;
  resolvedBy?: "human" | "agent";
  deletedAt?: number;
  deletedBy?: "human" | "agent";
  replies?: DevPilotAnnotationReply[];
}

export interface PendingAnnotationsResponse {
  count: number;
  annotations: DevPilotAnnotationRecord[];
}
