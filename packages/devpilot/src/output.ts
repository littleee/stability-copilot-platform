import type {
  DevPilotAnnotation,
  DevPilotAnnotationStatus,
  DevPilotRect,
  DevPilotSelectionKind,
} from "./types";
import { isOpenDevPilotAnnotationStatus } from "./types";

export interface DevPilotExportPageContext {
  title: string;
  url: string;
  pathname: string;
  viewport: {
    width: number;
    height: number;
  };
}

export interface DevPilotExportSummary {
  total: number;
  open: number;
  pending: number;
  acknowledged: number;
  resolved: number;
  dismissed: number;
}

export interface DevPilotExportAnnotation {
  id: string;
  index: number;
  kind: DevPilotSelectionKind;
  status: DevPilotAnnotationStatus;
  comment: string;
  elementName: string;
  elementPath: string;
  selectedText?: string;
  nearbyText?: string;
  relatedElements?: string[];
  matchCount?: number;
  pageX: number;
  pageY: number;
  rect: DevPilotRect;
  createdAt: number;
  updatedAt: number;
  context?: import("./types").DevPilotElementContext;
  sourceHits?: string[];
}

export interface DevPilotExportPayload {
  schema: "devpilot.page-feedback/v1";
  copiedAt: string;
  page: DevPilotExportPageContext;
  summary: DevPilotExportSummary;
  annotations: DevPilotExportAnnotation[];
}

export interface DevPilotExportPayloadOptions {
  annotations: DevPilotAnnotation[];
  pathname: string;
  title?: string;
  url?: string;
  viewport?: {
    width: number;
    height: number;
  };
  copiedAt?: string;
}

function normalizeInlineText(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function getStatusCount(
  annotations: DevPilotAnnotation[],
  status: DevPilotAnnotationStatus,
): number {
  return annotations.filter((item) => item.status === status).length;
}

export function getAnnotationKind(
  annotation: DevPilotAnnotation,
): DevPilotSelectionKind {
  if (annotation.kind) {
    return annotation.kind;
  }

  if (annotation.selectedText) {
    return "text";
  }

  if (annotation.relatedElements?.length) {
    return "area";
  }

  return "element";
}

function formatAnnotationKind(kind: DevPilotSelectionKind): string {
  switch (kind) {
    case "area":
      return "Area Annotation";
    case "text":
      return "Text Annotation";
    default:
      return "Element Annotation";
  }
}

function createExportSummary(
  annotations: DevPilotAnnotation[],
): DevPilotExportSummary {
  return {
    total: annotations.length,
    open: annotations.filter((item) => isOpenDevPilotAnnotationStatus(item.status))
      .length,
    pending: getStatusCount(annotations, "pending"),
    acknowledged: getStatusCount(annotations, "acknowledged"),
    resolved: getStatusCount(annotations, "resolved"),
    dismissed: getStatusCount(annotations, "dismissed"),
  };
}

function formatAnnotationStatus(status: DevPilotAnnotationStatus): string {
  switch (status) {
    case "acknowledged":
      return "acknowledged";
    case "resolved":
      return "resolved";
    case "dismissed":
      return "dismissed";
    default:
      return "pending";
  }
}

function getAnnotationHeading(annotation: DevPilotExportAnnotation): string {
  if (annotation.kind === "area") {
    return normalizeInlineText(annotation.elementName);
  }

  const pathTail = annotation.elementPath
    .split(">")
    .map((part) => part.trim())
    .filter(Boolean)
    .at(-1);

  if (pathTail) {
    return pathTail;
  }

  return normalizeInlineText(annotation.elementName);
}

function computeSourceHits(annotation: DevPilotExportAnnotation): string[] {
  const hits = new Set<string>();
  const ctx = annotation.context;

  if (ctx?.componentHints) {
    ctx.componentHints.forEach((name) => {
      hits.add(`component:${name}`);
    });
  }

  if (ctx?.sourceHints) {
    ctx.sourceHints.forEach((file) => {
      hits.add(`file:${file}`);
    });
  }

  if (ctx?.dataAttributes) {
    Object.entries(ctx.dataAttributes).forEach(([key, value]) => {
      if (key.includes("source") || key.includes("file")) {
        hits.add(`file:${value}`);
      }
      if (key.includes("component")) {
        hits.add(`component:${value}`);
      }
    });
  }

  // Derive candidate file paths from component names
  if (ctx?.componentHints) {
    ctx.componentHints.forEach((name) => {
      hits.add(`candidate:src/components/${name}.tsx`);
      hits.add(`candidate:src/${name}.tsx`);
      hits.add(`candidate:app/components/${name}.tsx`);
      hits.add(`candidate:pages/${name}.tsx`);
    });
  }

  return Array.from(hits).slice(0, 10);
}

export function createDevPilotExportPayload(
  options: DevPilotExportPayloadOptions,
): DevPilotExportPayload {
  const {
    annotations,
    pathname,
    title,
    url,
    viewport,
    copiedAt,
  } = options;
  const resolvedViewport = viewport || {
    width: typeof window === "undefined" ? 0 : window.innerWidth,
    height: typeof window === "undefined" ? 0 : window.innerHeight,
  };

  return {
    schema: "devpilot.page-feedback/v1",
    copiedAt: copiedAt || new Date().toISOString(),
    page: {
      title:
        title ||
        (typeof document === "undefined" ? "Untitled Page" : document.title || "Untitled Page"),
      url:
        url ||
        (typeof window === "undefined" ? pathname : window.location.href),
      pathname,
      viewport: resolvedViewport,
    },
    summary: createExportSummary(annotations),
    annotations: annotations.map((annotation, index) => {
      const exportAnnotation: DevPilotExportAnnotation = {
        id: annotation.id,
        index: index + 1,
        kind: getAnnotationKind(annotation),
        status: annotation.status,
        comment: annotation.comment,
        elementName: annotation.elementName,
        elementPath: annotation.elementPath,
        selectedText: annotation.selectedText,
        nearbyText: annotation.nearbyText,
        relatedElements: annotation.relatedElements,
        matchCount: annotation.matchCount,
        pageX: annotation.pageX,
        pageY: annotation.pageY,
        rect: annotation.rect,
        createdAt: annotation.createdAt,
        updatedAt: annotation.updatedAt,
        context: annotation.context,
      };
      exportAnnotation.sourceHits = computeSourceHits(exportAnnotation);
      return exportAnnotation;
    }),
  };
}

export function formatDevPilotExportJson(
  payload: DevPilotExportPayload,
): string {
  return JSON.stringify(payload, null, 2);
}

export function formatDevPilotExportMarkdown(
  payload: DevPilotExportPayload,
): string {
  const lines = [
    `## Page Feedback: ${payload.page.pathname}`,
    `**Viewport:** ${payload.page.viewport.width}x${payload.page.viewport.height}`,
    `**Page:** ${normalizeInlineText(payload.page.title)}`,
    `**URL:** ${payload.page.url}`,
    `**Annotations:** ${payload.summary.total} total · ${payload.summary.open} open · ${payload.summary.pending} pending · ${payload.summary.acknowledged} acknowledged · ${payload.summary.resolved} resolved · ${payload.summary.dismissed} dismissed`,
    "",
  ];

  payload.annotations.forEach((annotation) => {
    lines.push(`### ${annotation.index}. ${getAnnotationHeading(annotation)}`);
    lines.push(`**Type:** ${formatAnnotationKind(annotation.kind)}`);
    lines.push(`**Status:** ${formatAnnotationStatus(annotation.status)}`);
    lines.push(`**Element:** ${normalizeInlineText(annotation.elementName)}`);
    lines.push(`**Location:** \`${normalizeInlineText(annotation.elementPath)}\``);

    if (annotation.selectedText) {
      lines.push(`**Selected:** "${normalizeInlineText(annotation.selectedText)}"`);
    }

    if (annotation.nearbyText) {
      lines.push(`**Context:** ${normalizeInlineText(annotation.nearbyText)}`);
    }

    if (annotation.kind === "area") {
      lines.push(
        `**Matched elements:** ${annotation.matchCount || annotation.relatedElements?.length || 0}`,
      );
      lines.push(
        `**Area:** ${Math.round(annotation.rect.width)}x${Math.round(annotation.rect.height)}px`,
      );
    }

    if (annotation.relatedElements?.length) {
      lines.push(
        `**Related:** ${annotation.relatedElements
          .map((item) => normalizeInlineText(item))
          .join(" | ")}`,
      );
    }

    if (annotation.context) {
      const ctx = annotation.context;
      if (ctx.selectorCandidates && ctx.selectorCandidates.length > 0) {
        lines.push(
          `**Selectors:** \`${ctx.selectorCandidates.slice(0, 4).join("` `")}\``
        );
      }
      if (ctx.cssClasses && ctx.cssClasses.length > 0) {
        lines.push(
          `**Classes:** \`${ctx.cssClasses.slice(0, 6).join("` `")}\``
        );
      }
      if (ctx.componentHints && ctx.componentHints.length > 0) {
        lines.push(
          `**Components:** ${ctx.componentHints.join(", ")}`
        );
      }
      if (ctx.nearbyElements && ctx.nearbyElements.length > 0) {
        lines.push(
          `**Nearby:** ${ctx.nearbyElements.map((item) => normalizeInlineText(item)).join(" | ")}`
        );
      }
      if (ctx.computedStyleSnapshot && Object.keys(ctx.computedStyleSnapshot).length > 0) {
        const styleEntries = Object.entries(ctx.computedStyleSnapshot).slice(0, 6);
        lines.push(
          `**Styles:** ${styleEntries.map(([k, v]) => `${k}: ${v}`).join("; ")}`
        );
      }
    }

    if (annotation.sourceHits && annotation.sourceHits.length > 0) {
      lines.push(`**Source Hits:**`);
      annotation.sourceHits.forEach((hit) => lines.push(`  - ${hit}`));
    }

    lines.push(`**Feedback:** ${annotation.comment.trim()}`);
    lines.push("");
  });

  return lines.join("\n").trim();
}
