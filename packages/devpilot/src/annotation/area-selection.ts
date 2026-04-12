import type {
  DevPilotRect,
} from "../types";

export const ROOT_ATTR = "data-devpilot-root";
export const HOST_ATTR = "data-devpilot-host";

const AREA_MATCH_SELECTOR = [
  "button",
  "a",
  "input",
  "select",
  "textarea",
  "img",
  "p",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "li",
  "label",
  "td",
  "th",
  "[role='button']",
  "[role='link']",
  "[role='tab']",
  "[role='checkbox']",
  "[role='radio']",
  "[role='option']",
  "[role='switch']",
  "[role='combobox']",
  "[role='cell']",
  "[role='row']",
].join(", ");

const AREA_PREVIEW_SELECTOR = [
  "button",
  "a",
  "input",
  "select",
  "textarea",
  "img",
  "p",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "li",
  "label",
  "td",
  "th",
  "div",
  "span",
  "section",
  "article",
  "aside",
  "nav",
  "[role='button']",
  "[role='link']",
  "[role='tab']",
  "[role='checkbox']",
  "[role='radio']",
  "[role='option']",
  "[role='switch']",
  "[role='combobox']",
].join(", ");

const AREA_NESTED_CONTENT_SELECTOR = [
  "p",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "button",
  "a",
  "input",
  "select",
  "textarea",
  "label",
  "td",
  "th",
  "[role='button']",
  "[role='link']",
  "[role='tab']",
  "[role='checkbox']",
  "[role='radio']",
  "[role='option']",
  "[role='switch']",
  "[role='combobox']",
].join(", ");

const AREA_PREVIEW_MEANINGFUL_TAGS = new Set([
  "button",
  "a",
  "input",
  "select",
  "textarea",
  "img",
  "p",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "li",
  "label",
  "td",
  "th",
  "section",
  "article",
  "aside",
  "nav",
]);

const AREA_INTERACTIVE_ROLES = new Set([
  "button",
  "link",
  "tab",
  "checkbox",
  "radio",
  "option",
  "switch",
  "combobox",
  "cell",
  "row",
]);

const AREA_SEMANTIC_TAGS = new Set([
  "button",
  "input",
  "select",
  "textarea",
  "label",
  "a",
  "img",
  "td",
  "th",
  "li",
]);

const AREA_FRAGMENT_PATTERN =
  /(?:^|[\s:_-])(icon|icons|suffix|prefix|thumb|track|handle|arrow|caret|clear|close|loading|spinner|addon|append|prepend|indicator|decorator)(?:$|[\s:_-])/i;

export function toRect(rect: DOMRect): DevPilotRect {
  return {
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
  };
}

export function normalizeRect(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
): DevPilotRect {
  const left = Math.min(startX, endX);
  const top = Math.min(startY, endY);

  return {
    left,
    top,
    width: Math.abs(endX - startX),
    height: Math.abs(endY - startY),
  };
}

export function rectsIntersect(a: DevPilotRect, b: DevPilotRect): boolean {
  return !(
    a.left + a.width < b.left ||
    b.left + b.width < a.left ||
    a.top + a.height < b.top ||
    b.top + b.height < a.top
  );
}

export function getRectArea(rect: DevPilotRect): number {
  return Math.max(0, rect.width) * Math.max(0, rect.height);
}

export function getRectCenter(rect: DevPilotRect): { x: number; y: number } {
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
}

export function isPointInsideRect(
  point: { x: number; y: number },
  rect: DevPilotRect,
): boolean {
  return (
    point.x >= rect.left &&
    point.x <= rect.left + rect.width &&
    point.y >= rect.top &&
    point.y <= rect.top + rect.height
  );
}

export function getOverlapArea(a: DevPilotRect, b: DevPilotRect): number {
  const overlapX =
    Math.min(a.left + a.width, b.left + b.width) - Math.max(a.left, b.left);
  const overlapY =
    Math.min(a.top + a.height, b.top + b.height) - Math.max(a.top, b.top);

  if (overlapX <= 0 || overlapY <= 0) {
    return 0;
  }

  return overlapX * overlapY;
}

export function isWithinDevPilotTarget(target: EventTarget | null): boolean {
  return (
    target instanceof Element &&
    Boolean(target.closest(`[${ROOT_ATTR}]`) || target.closest(`[${HOST_ATTR}]`))
  );
}

export function isWithinDevPilotEvent(event: Event): boolean {
  if (typeof event.composedPath === "function") {
    return event.composedPath().some(
      (node) =>
        node instanceof Element &&
        (node.hasAttribute(ROOT_ATTR) || node.hasAttribute(HOST_ATTR)),
    );
  }

  return isWithinDevPilotTarget(event.target);
}

export function describeElement(
  element: HTMLElement,
): { elementName: string; elementPath: string; nearbyText?: string } {
  const tagName = element.tagName.toLowerCase();
  const role = element.getAttribute("role");
  const text = (element.textContent || "").trim().replace(/\s+/g, " ");
  const label = [tagName, role ? `(${role})` : "", text ? ` ${text.slice(0, 36)}` : ""]
    .join("")
    .trim();

  const path = [];
  let current: HTMLElement | null = element;
  let depth = 0;
  while (current && depth < 5) {
    const part = current.tagName.toLowerCase();
    const id = current.id ? `#${current.id}` : "";
    const className =
      current.classList.length > 0
        ? `.${Array.from(current.classList).slice(0, 2).join(".")}`
        : "";
    path.unshift(`${part}${id}${className}`);
    current = current.parentElement;
    depth += 1;
  }

  return {
    elementName: label || tagName,
    elementPath: path.join(" > "),
    nearbyText: text || undefined,
  };
}

function getNormalizedElementText(element: HTMLElement): string {
  return (element.textContent || "").trim().replace(/\s+/g, " ");
}

function containsRect(outer: DevPilotRect, inner: DevPilotRect): boolean {
  return (
    outer.left <= inner.left &&
    outer.top <= inner.top &&
    outer.left + outer.width >= inner.left + inner.width &&
    outer.top + outer.height >= inner.top + inner.height
  );
}

function buildAreaPreviewPoints(rect: DevPilotRect): Array<[number, number]> {
  const left = rect.left;
  const top = rect.top;
  const right = rect.left + rect.width;
  const bottom = rect.top + rect.height;
  const midX = (left + right) / 2;
  const midY = (top + bottom) / 2;

  return [
    [left, top],
    [right, top],
    [left, bottom],
    [right, bottom],
    [midX, midY],
    [midX, top],
    [midX, bottom],
    [left, midY],
    [right, midY],
  ].map(([x, y]) => [
    Math.max(0, Math.min(window.innerWidth - 1, x)),
    Math.max(0, Math.min(window.innerHeight - 1, y)),
  ]);
}

function isAreaInteractiveLikeElement(element: HTMLElement): boolean {
  const role = element.getAttribute("role");
  const tabIndex = element.getAttribute("tabindex");
  const className =
    typeof element.className === "string" ? element.className : "";

  return (
    Boolean(role && AREA_INTERACTIVE_ROLES.has(role)) ||
    element.onclick !== null ||
    element.hasAttribute("data-clickable") ||
    (tabIndex !== null && tabIndex !== "-1") ||
    /(?:^|[\s:_-])(btn|button|switch|toggle|tab|menu-item|clickable)(?:$|[\s:_-])/i.test(
      className,
    )
  );
}

function isAreaIgnoredFragment(element: HTMLElement): boolean {
  if (
    element.getAttribute("aria-hidden") === "true" ||
    element.getAttribute("role") === "presentation"
  ) {
    return true;
  }

  const className =
    typeof element.className === "string" ? element.className : "";
  if (AREA_FRAGMENT_PATTERN.test(className) || AREA_FRAGMENT_PATTERN.test(element.id || "")) {
    return true;
  }

  const tagName = element.tagName.toLowerCase();
  return ["svg", "path", "i"].includes(tagName) && !getNormalizedElementText(element);
}

function hasNestedAreaContent(element: HTMLElement): boolean {
  return Boolean(element.querySelector(AREA_NESTED_CONTENT_SELECTOR));
}

function countMeaningfulAreaChildren(element: HTMLElement): number {
  return Array.from(element.children).filter((child) => {
    if (!(child instanceof HTMLElement)) {
      return false;
    }

    const tagName = child.tagName.toLowerCase();
    const text = getNormalizedElementText(child);
    return (
      AREA_PREVIEW_MEANINGFUL_TAGS.has(tagName) ||
      Boolean(text) ||
      Boolean(child.querySelector(AREA_MATCH_SELECTOR)) ||
      isAreaInteractiveLikeElement(child)
    );
  }).length;
}

function isAreaStructuredContainer(
  element: HTMLElement,
  elementRect: DevPilotRect,
  selectionRect: DevPilotRect,
): boolean {
  const tagName = element.tagName.toLowerCase();

  if (!["div", "section", "article", "aside", "nav", "form"].includes(tagName)) {
    return false;
  }

  if (elementRect.width < 120 || elementRect.height < 44) {
    return false;
  }

  if (
    elementRect.width > window.innerWidth * 0.96 ||
    elementRect.height > window.innerHeight * 0.82
  ) {
    return false;
  }

  if (getRectArea(elementRect) >= getRectArea(selectionRect) * 0.98) {
    return false;
  }

  const meaningfulChildren = countMeaningfulAreaChildren(element);
  const descendantCount = element.querySelectorAll(AREA_MATCH_SELECTOR).length;
  const hasTableLikeDescendant = Boolean(
    element.querySelector("table, thead, tbody, tr"),
  );

  return meaningfulChildren >= 2 && (descendantCount >= 2 || hasTableLikeDescendant);
}

function shouldIncludeAreaPreviewElement(
  element: HTMLElement,
  elementRect: DevPilotRect,
  selectionRect: DevPilotRect,
): boolean {
  if (isAreaIgnoredFragment(element)) {
    return false;
  }

  const tagName = element.tagName.toLowerCase();
  const text = getNormalizedElementText(element);
  const isInteractive = isAreaInteractiveLikeElement(element);

  if (AREA_PREVIEW_MEANINGFUL_TAGS.has(tagName)) {
    return true;
  }

  if (tagName === "div" || tagName === "span") {
    if ((Boolean(text) || isInteractive) && !hasNestedAreaContent(element)) {
      return true;
    }

    return isAreaStructuredContainer(element, elementRect, selectionRect);
  }

  return isAreaStructuredContainer(element, elementRect, selectionRect);
}

function shouldIncludeCommittedAreaElement(element: HTMLElement): boolean {
  if (isAreaIgnoredFragment(element)) {
    return false;
  }

  const tagName = element.tagName.toLowerCase();
  const role = element.getAttribute("role");

  if (AREA_SEMANTIC_TAGS.has(tagName) || (role && AREA_INTERACTIVE_ROLES.has(role))) {
    return true;
  }

  if (tagName === "div" || tagName === "span") {
    return isAreaInteractiveLikeElement(element) && !hasNestedAreaContent(element);
  }

  return false;
}

export function collectAreaPreviewRects(rect: DevPilotRect): DevPilotRect[] {
  const candidateElements = new Set<HTMLElement>();
  const samplePoints = buildAreaPreviewPoints(rect);

  samplePoints.forEach(([x, y]) => {
    document.elementsFromPoint(x, y).forEach((element) => {
      if (element instanceof HTMLElement) {
        candidateElements.add(element);
      }
    });
  });

  document.querySelectorAll<HTMLElement>(AREA_PREVIEW_SELECTOR).forEach((element) => {
    const elementRect = toRect(element.getBoundingClientRect());
    const center = getRectCenter(elementRect);
    const overlapArea = getOverlapArea(rect, elementRect);
    const overlapRatio = overlapArea / Math.max(1, getRectArea(elementRect));

    if (isPointInsideRect(center, rect) || overlapRatio > 0.5) {
      candidateElements.add(element);
    }
  });

  const allMatching: DevPilotRect[] = [];
  const sortedCandidates = Array.from(candidateElements).sort((a, b) => {
    const aRect = toRect(a.getBoundingClientRect());
    const bRect = toRect(b.getBoundingClientRect());
    return getRectArea(bRect) - getRectArea(aRect);
  });

  sortedCandidates.forEach((element) => {
    if (element.closest(`[${ROOT_ATTR}]`) || element.closest(`[${HOST_ATTR}]`)) {
      return;
    }

    const elementRect = toRect(element.getBoundingClientRect());
    if (
      elementRect.width > window.innerWidth * 0.8 &&
      elementRect.height > window.innerHeight * 0.5
    ) {
      return;
    }
    if (elementRect.width < 10 || elementRect.height < 10) {
      return;
    }
    if (!rectsIntersect(rect, elementRect)) {
      return;
    }
    if (!shouldIncludeAreaPreviewElement(element, elementRect, rect)) {
      return;
    }

    const dominated = allMatching.some((existingRect) =>
      containsRect(existingRect, elementRect),
    );

    if (!dominated) {
      allMatching.push(elementRect);
    }
  });

  return allMatching.sort((a, b) => {
    if (Math.abs(a.top - b.top) > 8) {
      return a.top - b.top;
    }

    if (Math.abs(a.left - b.left) > 8) {
      return a.left - b.left;
    }

    return getRectArea(a) - getRectArea(b);
  });
}

export function collectAreaMatches(
  rect: DevPilotRect,
): Array<{ element: HTMLElement; rect: DevPilotRect }> {
  const allMatching: Array<{ element: HTMLElement; rect: DevPilotRect }> = [];
  const selector = `${AREA_MATCH_SELECTOR}, div, span`;

  document.querySelectorAll<HTMLElement>(selector).forEach((element) => {
    if (element.closest(`[${ROOT_ATTR}]`) || element.closest(`[${HOST_ATTR}]`)) {
      return;
    }

    const elementRect = toRect(element.getBoundingClientRect());
    if (
      elementRect.width > window.innerWidth * 0.8 &&
      elementRect.height > window.innerHeight * 0.5
    ) {
      return;
    }
    if (elementRect.width < 10 || elementRect.height < 10) {
      return;
    }
    if (!rectsIntersect(rect, elementRect)) {
      return;
    }
    if (!shouldIncludeCommittedAreaElement(element)) {
      return;
    }

    allMatching.push({ element, rect: elementRect });
  });

  return allMatching
    .filter(
      ({ element }) =>
        !allMatching.some(
          ({ element: other }) => other !== element && element.contains(other),
        ),
    )
    .sort((a, b) => {
      if (Math.abs(a.rect.top - b.rect.top) > 8) {
        return a.rect.top - b.rect.top;
      }

      if (Math.abs(a.rect.left - b.rect.left) > 8) {
        return a.rect.left - b.rect.left;
      }

      return getRectArea(a.rect) - getRectArea(b.rect);
    });
}

function getUnionRect(rects: DevPilotRect[]): DevPilotRect | null {
  if (rects.length === 0) {
    return null;
  }

  const left = Math.min(...rects.map((item) => item.left));
  const top = Math.min(...rects.map((item) => item.top));
  const right = Math.max(...rects.map((item) => item.left + item.width));
  const bottom = Math.max(...rects.map((item) => item.top + item.height));

  return {
    left,
    top,
    width: right - left,
    height: bottom - top,
  };
}

export function describeAreaDraftPreview(rect: DevPilotRect): {
  matchRects: DevPilotRect[];
  matchCount: number;
} {
  const matchRects = collectAreaPreviewRects(rect);

  return {
    matchRects,
    matchCount: matchRects.length,
  };
}

export function describeCommittedAreaSelection(rect: DevPilotRect): {
  rect: DevPilotRect;
  elementName: string;
  elementPath: string;
  nearbyText?: string;
  relatedElements?: string[];
  matchRects: DevPilotRect[];
  matchCount: number;
} {
  const matches = collectAreaMatches(rect);
  const snappedRect = getUnionRect(matches.map((item) => item.rect)) || rect;

  const relatedElements = Array.from(
    new Set(
      matches
        .map(({ element }) => describeElement(element).elementName)
        .filter(Boolean),
    ),
  ).slice(0, 6);

  const kindCounter = new Map<string, number>();
  matches.forEach(({ element }) => {
    const tagName = element.tagName.toLowerCase();
    const role = element.getAttribute("role");
    const token = role ? `${tagName}(${role})` : tagName;
    kindCounter.set(token, (kindCounter.get(token) || 0) + 1);
  });

  const groupedKinds = Array.from(kindCounter.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([token, count]) => `${token} ×${count}`);

  const nearbyText = Array.from(
    new Set(
      matches
        .map(({ element }) =>
          (element.textContent || "").trim().replace(/\s+/g, " "),
        )
        .filter((value) => value.length > 0),
    ),
  )
    .slice(0, 3)
    .join(" · ");

  return {
    rect: snappedRect,
    elementName:
      matches.length > 0 ? `区域标注 · ${matches.length} 个元素` : "区域标注",
    elementPath:
      groupedKinds.length > 0
        ? groupedKinds.join(" · ")
        : `区域 ${Math.round(snappedRect.width)}×${Math.round(snappedRect.height)}`,
    nearbyText: nearbyText || undefined,
    relatedElements,
    matchRects: matches.map((item) => item.rect),
    matchCount: matches.length,
  };
}
