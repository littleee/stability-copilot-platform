import type {
  DevPilotAnnotation,
  DevPilotStabilityItem,
} from "./types";
import { getAnnotationKind } from "./output";
import type { DevPilotExportAnnotation } from "./output";
import type {
  DevPilotStabilityExportItem,
} from "./stability-output";

export type DevPilotTaskType = "annotation" | "stability" | "repair";

export interface DevPilotTaskPacketPageContext {
  title: string;
  url: string;
  pathname: string;
  viewport: { width: number; height: number };
}

export interface DevPilotTaskPacketTask {
  type: DevPilotTaskType;
  title: string;
  description: string;
  desiredOutcome: string;
}

export interface DevPilotTaskPacketEvidence {
  annotations: DevPilotExportAnnotation[];
  stabilityItems?: DevPilotStabilityExportItem[];
  runtimeSignals?: string[];
}

export interface DevPilotTaskPacketContext {
  viewport: { width: number; height: number };
  platform?: string;
  language?: string;
  screen?: { width: number; height: number };
  referrer?: string;
}

export interface DevPilotTaskPacket {
  schema: "devpilot.task-packet/v1";
  generatedAt: string;
  page: DevPilotTaskPacketPageContext;
  task: DevPilotTaskPacketTask;
  evidence: DevPilotTaskPacketEvidence;
  sourceHits?: string[];
  context?: DevPilotTaskPacketContext;
}

export interface DevPilotTaskPacketOptions {
  type: DevPilotTaskType;
  taskTitle: string;
  description: string;
  desiredOutcome: string;
  annotations: DevPilotAnnotation[];
  stabilityItems?: DevPilotStabilityItem[];
  pathname: string;
  pageTitle?: string;
  url?: string;
  viewport?: { width: number; height: number };
  platform?: string;
  language?: string;
  screen?: { width: number; height: number };
  referrer?: string;
  runtimeSignals?: string[];
}

function normalizeInlineText(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function computeSourceHitsFromAnnotations(annotations: DevPilotExportAnnotation[]): string[] {
  const hits = new Set<string>();
  annotations.forEach((annotation) => {
    const ctx = annotation.context;
    if (ctx?.componentHints) {
      ctx.componentHints.forEach((name: string) => {
        hits.add(`component:${name}`);
        hits.add(`candidate:src/components/${name}.tsx`);
        hits.add(`candidate:src/${name}.tsx`);
        hits.add(`candidate:app/components/${name}.tsx`);
        hits.add(`candidate:pages/${name}.tsx`);
      });
    }
    if (ctx?.sourceHints) {
      ctx.sourceHints.forEach((file: string) => hits.add(`file:${file}`));
    }
    annotation.sourceHits?.forEach((hit: string) => hits.add(hit));
  });
  return Array.from(hits).slice(0, 12);
}

function toExportAnnotation(annotation: DevPilotAnnotation, index: number): DevPilotExportAnnotation {
  return {
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
    sourceHits: [], // computed later
  };
}

function toExportStabilityItem(item: DevPilotStabilityItem, index: number): DevPilotStabilityExportItem {
  return {
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
  };
}

export function createDevPilotTaskPacket(options: DevPilotTaskPacketOptions): DevPilotTaskPacket {
  const resolvedViewport = options.viewport || {
    width: typeof window === "undefined" ? 0 : window.innerWidth,
    height: typeof window === "undefined" ? 0 : window.innerHeight,
  };

  const exportAnnotations = options.annotations.map((a, i) => toExportAnnotation(a, i));
  exportAnnotations.forEach((annotation) => {
    annotation.sourceHits = computeSourceHitsFromAnnotations([annotation]);
  });

  const allSourceHits = computeSourceHitsFromAnnotations(exportAnnotations);

  const exportStabilityItems = options.stabilityItems?.map((item, i) =>
    toExportStabilityItem(item, i),
  );

  return {
    schema: "devpilot.task-packet/v1",
    generatedAt: new Date().toISOString(),
    page: {
      title:
        options.pageTitle ||
        (typeof document === "undefined" ? "Untitled Page" : document.title || "Untitled Page"),
      url:
        options.url ||
        (typeof window === "undefined" ? options.pathname : window.location.href),
      pathname: options.pathname,
      viewport: resolvedViewport,
    },
    task: {
      type: options.type,
      title: options.taskTitle,
      description: options.description,
      desiredOutcome: options.desiredOutcome,
    },
    evidence: {
      annotations: exportAnnotations,
      stabilityItems: exportStabilityItems,
      runtimeSignals: options.runtimeSignals,
    },
    sourceHits: allSourceHits,
    context: {
      viewport: resolvedViewport,
      platform: options.platform,
      language: options.language,
      screen: options.screen,
      referrer: options.referrer,
    },
  };
}

export function formatDevPilotTaskPacketJson(packet: DevPilotTaskPacket): string {
  return JSON.stringify(packet, null, 2);
}

export function formatDevPilotTaskPacketMarkdown(packet: DevPilotTaskPacket): string {
  const lines = [
    `# DevPilot Task Packet`,
    `**Schema:** ${packet.schema}`,
    `**Generated:** ${packet.generatedAt}`,
    ``,
    `## Page Context`,
    `**Page:** ${normalizeInlineText(packet.page.title)}`,
    `**URL:** ${packet.page.url}`,
    `**Path:** ${packet.page.pathname}`,
    `**Viewport:** ${packet.page.viewport.width}x${packet.page.viewport.height}`,
    ``,
    `## Task`,
    `**Type:** ${packet.task.type}`,
    `**Title:** ${packet.task.title}`,
    `**Description:** ${packet.task.description}`,
    `**Desired Outcome:** ${packet.task.desiredOutcome}`,
    ``,
  ];

  if (packet.evidence.annotations.length > 0) {
    lines.push(`## Evidence: Annotations (${packet.evidence.annotations.length})`);
    packet.evidence.annotations.forEach((annotation) => {
      lines.push(`### ${annotation.index}. ${normalizeInlineText(annotation.elementName)}`);
      lines.push(`- **Status:** ${annotation.status}`);
      lines.push(`- **Type:** ${annotation.kind || "element"}`);
      lines.push(`- **Path:** \`${normalizeInlineText(annotation.elementPath)}\``);
      if (annotation.comment) {
        lines.push(`- **Comment:** ${annotation.comment}`);
      }
      if (annotation.selectedText) {
        lines.push(`- **Selected Text:** "${normalizeInlineText(annotation.selectedText)}"`);
      }
      if (annotation.context?.componentHints?.length) {
        lines.push(`- **Components:** ${annotation.context.componentHints.join(", ")}`);
      }
      if (annotation.sourceHits?.length) {
        lines.push(`- **Source Hits:**`);
        annotation.sourceHits.forEach((hit) => lines.push(`  - ${hit}`));
      }
      lines.push("");
    });
  }

  if (packet.evidence.stabilityItems?.length) {
    lines.push(`## Evidence: Stability Issues (${packet.evidence.stabilityItems.length})`);
    packet.evidence.stabilityItems.forEach((item) => {
      lines.push(`### ${item.index}. ${normalizeInlineText(item.title)}`);
      lines.push(`- **Severity:** ${item.severity}`);
      lines.push(`- **Symptom:** ${item.symptom}`);
      if (item.reproSteps) lines.push(`- **Repro:** ${item.reproSteps}`);
      if (item.fixGoal) lines.push(`- **Fix Goal:** ${item.fixGoal}`);
      lines.push("");
    });
  }

  if (packet.sourceHits && packet.sourceHits.length > 0) {
    lines.push(`## Source Hits`);
    packet.sourceHits.forEach((hit: string) => lines.push(`- ${hit}`));
    lines.push("");
  }

  lines.push(`## Instructions for AI`);
  lines.push(`1. Analyze the evidence above to understand the issue.`);
  lines.push(`2. Use the source hits to locate relevant code files.`);
  lines.push(`3. Make the smallest safe change that achieves the desired outcome.`);
  lines.push(`4. Preserve existing behavior outside the fix scope.`);
  lines.push(`5. Summarize changed files and any remaining risks.`);

  return lines.join("\n").trim();
}
