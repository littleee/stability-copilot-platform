import type {
  DevPilotStabilityContextSnapshot,
  DevPilotStabilityItem,
  DevPilotStabilitySeverity,
  DevPilotStabilityStatus,
} from "./types";

export interface DevPilotStabilityExportPageContext {
  title: string;
  url: string;
  pathname: string;
  viewport: {
    width: number;
    height: number;
  };
}

export interface DevPilotStabilityExportSummary {
  total: number;
  open: number;
  diagnosing: number;
  resolved: number;
  critical: number;
}

export interface DevPilotStabilityExportItem {
  id: string;
  index: number;
  title: string;
  status: DevPilotStabilityStatus;
  severity: DevPilotStabilitySeverity;
  symptom: string;
  reproSteps?: string;
  impact?: string;
  signals?: string;
  fixGoal?: string;
  context: DevPilotStabilityContextSnapshot;
  createdAt: number;
  updatedAt: number;
}

export interface DevPilotStabilityExportPayload {
  schema: "devpilot.stability-copilot/v1";
  copiedAt: string;
  page: DevPilotStabilityExportPageContext;
  summary: DevPilotStabilityExportSummary;
  items: DevPilotStabilityExportItem[];
}

export interface DevPilotStabilityExportPayloadOptions {
  items: DevPilotStabilityItem[];
  pathname: string;
  title?: string;
  url?: string;
  viewport?: {
    width: number;
    height: number;
  };
  copiedAt?: string;
}

export interface DevPilotStabilityRepairPayload {
  schema: "devpilot.fix-request/v1";
  requestedAt: string;
  page: DevPilotStabilityExportPageContext;
  issue: DevPilotStabilityExportItem;
  relatedAnnotations: string[];
}

export interface DevPilotStabilityRepairPayloadOptions {
  item: DevPilotStabilityItem;
  pathname: string;
  title?: string;
  url?: string;
  viewport?: {
    width: number;
    height: number;
  };
  requestedAt?: string;
  relatedAnnotations?: string[];
}

function normalizeInlineText(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function getStatusCount(
  items: DevPilotStabilityItem[],
  status: DevPilotStabilityStatus,
): number {
  return items.filter((item) => item.status === status).length;
}

function createExportSummary(
  items: DevPilotStabilityItem[],
): DevPilotStabilityExportSummary {
  return {
    total: items.length,
    open: getStatusCount(items, "open"),
    diagnosing: getStatusCount(items, "diagnosing"),
    resolved: getStatusCount(items, "resolved"),
    critical: items.filter((item) => item.severity === "critical").length,
  };
}

function formatStatus(status: DevPilotStabilityStatus): string {
  switch (status) {
    case "diagnosing":
      return "diagnosing";
    case "resolved":
      return "resolved";
    default:
      return "open";
  }
}

function formatSeverity(severity: DevPilotStabilitySeverity): string {
  return severity;
}

export function createDevPilotStabilityExportPayload(
  options: DevPilotStabilityExportPayloadOptions,
): DevPilotStabilityExportPayload {
  const {
    items,
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
    schema: "devpilot.stability-copilot/v1",
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
    summary: createExportSummary(items),
    items: items.map((item, index) => ({
      id: item.id,
      index: index + 1,
      title: item.title,
      status: item.status,
      severity: item.severity,
      symptom: item.symptom,
      reproSteps: item.reproSteps,
      impact: item.impact,
      signals: item.signals,
      fixGoal: item.fixGoal,
      context: item.context,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    })),
  };
}

export function formatDevPilotStabilityExportJson(
  payload: DevPilotStabilityExportPayload,
): string {
  return JSON.stringify(payload, null, 2);
}

export function formatDevPilotStabilityExportMarkdown(
  payload: DevPilotStabilityExportPayload,
): string {
  const lines = [
    `## Stability Copilot: ${payload.page.pathname}`,
    `**Viewport:** ${payload.page.viewport.width}x${payload.page.viewport.height}`,
    `**Page:** ${normalizeInlineText(payload.page.title)}`,
    `**URL:** ${payload.page.url}`,
    `**Issues:** ${payload.summary.total} total · ${payload.summary.open} open · ${payload.summary.diagnosing} diagnosing · ${payload.summary.resolved} resolved · ${payload.summary.critical} critical`,
    "",
  ];

  payload.items.forEach((item) => {
    lines.push(`### ${item.index}. ${normalizeInlineText(item.title)}`);
    lines.push(`**Severity:** ${formatSeverity(item.severity)}`);
    lines.push(`**Status:** ${formatStatus(item.status)}`);
    lines.push(`**Symptom:** ${item.symptom.trim()}`);

    if (item.reproSteps) {
      lines.push(`**Repro Steps:** ${item.reproSteps.trim()}`);
    }

    if (item.impact) {
      lines.push(`**Impact:** ${item.impact.trim()}`);
    }

    if (item.signals) {
      lines.push(`**Signals:** ${item.signals.trim()}`);
    }

    if (item.fixGoal) {
      lines.push(`**Fix Goal:** ${item.fixGoal.trim()}`);
    }

    lines.push(`**Captured Page:** ${normalizeInlineText(item.context.title)} (${item.context.pathname})`);
    lines.push(`**Captured URL:** ${item.context.url}`);
    lines.push(`**Captured Viewport:** ${item.context.viewport.width}x${item.context.viewport.height}`);

    if (item.context.sessionId) {
      lines.push(`**Session ID:** ${item.context.sessionId}`);
    }

    lines.push(`**Open Annotations At Capture:** ${item.context.openAnnotationCount}`);

    if (item.context.openAnnotationComments.length > 0) {
      lines.push(
        `**Related Annotation Notes:** ${item.context.openAnnotationComments
          .map((entry) => normalizeInlineText(entry))
          .join(" | ")}`,
      );
    }

    lines.push("");
  });

  return lines.join("\n").trim();
}

export function createDevPilotStabilityRepairPayload(
  options: DevPilotStabilityRepairPayloadOptions,
): DevPilotStabilityRepairPayload {
  const {
    item,
    pathname,
    title,
    url,
    viewport,
    requestedAt,
    relatedAnnotations,
  } = options;
  const resolvedViewport = viewport || {
    width: typeof window === "undefined" ? 0 : window.innerWidth,
    height: typeof window === "undefined" ? 0 : window.innerHeight,
  };

  return {
    schema: "devpilot.fix-request/v1",
    requestedAt: requestedAt || new Date().toISOString(),
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
    issue: {
      id: item.id,
      index: 1,
      title: item.title,
      status: item.status,
      severity: item.severity,
      symptom: item.symptom,
      reproSteps: item.reproSteps,
      impact: item.impact,
      signals: item.signals,
      fixGoal: item.fixGoal,
      context: item.context,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    },
    relatedAnnotations: (relatedAnnotations || item.context.openAnnotationComments || [])
      .map((entry) => normalizeInlineText(entry))
      .filter(Boolean),
  };
}

export function formatDevPilotStabilityRepairMarkdown(
  payload: DevPilotStabilityRepairPayload,
): string {
  const { issue } = payload;
  const lines = [
    `## DevPilot Fix Request: ${payload.page.pathname}`,
    "This fix request was explicitly triggered by the user from DevPilot. You may now investigate and modify code.",
    `**Page:** ${normalizeInlineText(payload.page.title)}`,
    `**URL:** ${payload.page.url}`,
    `**Viewport:** ${payload.page.viewport.width}x${payload.page.viewport.height}`,
    "",
    `### Issue: ${normalizeInlineText(issue.title)}`,
    `**Severity:** ${formatSeverity(issue.severity)}`,
    `**Status:** ${formatStatus(issue.status)}`,
    `**Symptom:** ${issue.symptom.trim()}`,
  ];

  if (issue.reproSteps) {
    lines.push(`**Repro Steps:** ${issue.reproSteps.trim()}`);
  }

  if (issue.impact) {
    lines.push(`**Impact:** ${issue.impact.trim()}`);
  }

  if (issue.signals) {
    lines.push(`**Signals:** ${issue.signals.trim()}`);
  }

  if (issue.fixGoal) {
    lines.push(`**Fix Goal:** ${issue.fixGoal.trim()}`);
  }

  lines.push(`**Captured Page:** ${normalizeInlineText(issue.context.title)} (${issue.context.pathname})`);
  lines.push(`**Captured URL:** ${issue.context.url}`);
  lines.push(`**Open Annotations At Capture:** ${issue.context.openAnnotationCount}`);

  if (payload.relatedAnnotations.length > 0) {
    lines.push(`**Related Annotation Notes:** ${payload.relatedAnnotations.join(" | ")}`);
  }

  lines.push("");
  lines.push("### Repair Task");
  lines.push("1. Analyze the likely root cause in the codebase.");
  lines.push("2. Make the smallest safe code change that fixes the issue.");
  lines.push("3. Preserve existing behavior outside this bug fix.");
  lines.push("4. Summarize the changed files, validation results, and any remaining risks.");

  return lines.join("\n").trim();
}
