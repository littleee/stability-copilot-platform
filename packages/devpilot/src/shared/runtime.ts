import type { DevPilotRect } from "../types";

export function ensureWithinViewport(
  rect: DevPilotRect,
  width: number,
  height: number,
): { left: number; top: number } {
  const margin = 16;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  let left = rect.left;
  let top = rect.top + rect.height + 12;

  if (left + width + margin > viewportWidth) {
    left = viewportWidth - width - margin;
  }
  if (left < margin) {
    left = margin;
  }

  if (top + height + margin > viewportHeight) {
    top = rect.top - height - 12;
  }
  if (top < margin) {
    top = Math.min(viewportHeight - height - margin, margin);
  }

  return { left, top };
}

export function ensurePopupPositionFromPoint(
  pageX: number,
  pageY: number,
  width: number,
  height: number,
): { left: number; top: number } {
  const anchorRect: DevPilotRect = {
    left: pageX - window.scrollX - 14,
    top: pageY - window.scrollY - 14,
    width: 28,
    height: 28,
  };

  return ensureWithinViewport(anchorRect, width, height);
}

export function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function createScopedId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

export function createId(): string {
  return createScopedId("ann");
}

export function trimObservationText(
  value: string,
  maxLength = 280,
): string {
  const normalized = value.trim().replace(/\s+/g, " ");
  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 1)}…`;
}

export function normalizeObservationReason(value: unknown): string {
  if (value instanceof Error) {
    return value.message || value.name || "Unknown error";
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (value && typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return Object.prototype.toString.call(value);
    }
  }

  return "Unknown error";
}

export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall back to a legacy copy path below.
    }
  }

  if (typeof document === "undefined") {
    return false;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  textarea.style.top = "0";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  textarea.setSelectionRange(0, textarea.value.length);

  try {
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    textarea.remove();
  }
}

export function getDefaultFloatingPosition() {
  const margin = 24;
  const size = 44;
  return {
    left: Math.max(margin, window.innerWidth - margin - size),
    top: Math.max(margin, window.innerHeight - margin - size),
  };
}

export function clampFloatingPosition(
  position: { left: number; top: number },
  width: number,
  height: number,
) {
  const margin = 16;
  const maxLeft = Math.max(margin, window.innerWidth - width - margin);
  const maxTop = Math.max(margin, window.innerHeight - height - margin);

  return {
    left: Math.min(Math.max(position.left, margin), maxLeft),
    top: Math.min(Math.max(position.top, margin), maxTop),
  };
}
