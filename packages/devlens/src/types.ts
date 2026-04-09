export type DevLensMode = "annotate" | "stability" | "session";

export type DevLensAnnotationStatus = "pending" | "resolved";

export type DevLensSelectionKind = "element" | "text" | "area";

export interface DevLensRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface DevLensSelection {
  kind: DevLensSelectionKind;
  elementName: string;
  elementPath: string;
  rect: DevLensRect;
  pageX: number;
  pageY: number;
  matchCount?: number;
  selectedText?: string;
  nearbyText?: string;
  relatedElements?: string[];
}

export interface DevLensAnnotation {
  id: string;
  pathname: string;
  createdAt: number;
  updatedAt: number;
  kind?: DevLensSelectionKind;
  status: DevLensAnnotationStatus;
  comment: string;
  elementName: string;
  elementPath: string;
  matchCount?: number;
  selectedText?: string;
  nearbyText?: string;
  relatedElements?: string[];
  pageX: number;
  pageY: number;
  rect: DevLensRect;
}

export interface DevLensMountOptions {
  appId?: string;
  appName?: string;
  endpoint?: string;
  defaultOpen?: boolean;
}

export interface DevLensController {
  destroy: () => void;
}
