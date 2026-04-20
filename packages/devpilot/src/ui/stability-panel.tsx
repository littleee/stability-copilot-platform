import React, { useEffect, useState } from "react";

import { formatTime } from "../shared/runtime";
import {
  getStabilitySeverityLabel,
  getStabilityStatusLabel,
} from "../stability/state";
import { useI18n } from "../i18n";
import type {
  DevPilotStabilityItem,
} from "../types";
import { CollapseIcon } from "./icons";

interface StabilityPanelProps {
  panelLeft: number;
  panelBottom: number;
  openStabilityItems: DevPilotStabilityItem[];
  stabilityActiveId: string | null;
  activeStabilityItem: DevPilotStabilityItem | null;
  onClose: () => void;
  onSelectStabilityItem: (itemId: string) => void;
  onCopyStabilityItem: (item: DevPilotStabilityItem) => void;
}

function inferIssueType(item: DevPilotStabilityItem): string {
  const symptom = item.symptom.toLowerCase();
  const signals = (item.signals || "").toLowerCase();
  const combined = `${symptom} ${signals}`;

  if (
    combined.includes("typeerror") ||
    combined.includes("referenceerror") ||
    combined.includes("uncaught")
  ) {
    return "Error";
  }
  if (
    combined.includes("fetch") ||
    combined.includes("request") ||
    combined.includes("network") ||
    combined.includes("http")
  ) {
    return "Fetch";
  }
  if (combined.includes("promise") || combined.includes("unhandledrejection")) {
    return "Promise";
  }
  if (item.id.startsWith("sti_obs")) {
    return "Runtime";
  }
  return "Issue";
}

function getCapturedAt(item: DevPilotStabilityItem): number {
  return item.context.capturedAt || item.createdAt;
}

function isNewItem(item: DevPilotStabilityItem): boolean {
  return Date.now() - getCapturedAt(item) < 5 * 60 * 1000;
}

export function StabilityPanel({
  panelLeft,
  panelBottom,
  openStabilityItems,
  stabilityActiveId,
  activeStabilityItem,
  onClose,
  onSelectStabilityItem,
  onCopyStabilityItem,
}: StabilityPanelProps) {
  const { t, locale } = useI18n();
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  function formatRelativeTime(timestamp: number): string {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return t("stability.justNow");
    if (minutes < 60) return t("stability.minutesAgo", { n: minutes });
    if (hours < 24) return t("stability.hoursAgo", { n: hours });
    return t("stability.daysAgo", { n: Math.floor(hours / 24) });
  }

  function getIssueSummary(item: DevPilotStabilityItem): string {
    const type = inferIssueType(item);

    if (type === "Fetch") {
      return t("stability.issueFetch");
    }
    if (type === "Promise") {
      return t("stability.issuePromise");
    }
    if (type === "Error") {
      return t("stability.issueError");
    }
    return t("stability.issueGeneric");
  }

  const lastCaptureTime =
    [...openStabilityItems].reduce<number>(
      (latest, item) => Math.max(latest, getCapturedAt(item)),
      0,
    ) || null;

  useEffect(() => {
    setShowTechnicalDetails(false);
  }, [stabilityActiveId]);

  return (
    <section
      className="dl-session-panel dl-stability-panel"
      style={{ left: panelLeft, bottom: panelBottom }}
    >
      {/* Header */}
      <div className="dl-session-header dl-stability-panel-header">
        <div className="dl-session-header-main">
          <h3 className="dl-session-title">{t("stability.title")}</h3>
        </div>
        <button
          className="dl-toolbar-icon-button dl-stability-panel-close"
          data-kind="secondary"
          onClick={onClose}
          title={t("stability.close")}
        >
          <CollapseIcon />
        </button>
      </div>

      {/* Section 1: Observation Status */}
      <div className="dl-stability-status-bar">
        <span className="dl-stability-status-dot" data-on />
        <span className="dl-stability-status-text">
          {t("stability.watching")}
        </span>
        {lastCaptureTime ? (
          <span className="dl-stability-status-meta">
            {t("stability.lastCaptured")} {formatRelativeTime(lastCaptureTime)}
          </span>
        ) : null}
        <span className="dl-stability-status-meta">
          {openStabilityItems.length} {openStabilityItems.length === 1 ? t("stability.issue") : t("stability.issues")}
        </span>
      </div>

      {/* Section 2: Issue Inbox */}
      <div className="dl-stability-inbox">
        <div className="dl-stability-inbox-header">
          <span className="dl-stability-inbox-title">{t("stability.openIssues")}</span>
          <span className="dl-stability-inbox-count">
            {openStabilityItems.length}
          </span>
        </div>
        <div
          className={`dl-stability-inbox-list ${
            openStabilityItems.length === 0
              ? "dl-stability-inbox-list-empty"
              : ""
          }`}
        >
          {openStabilityItems.length === 0 ? (
            <div className="dl-stability-empty">
              <div className="dl-stability-empty-title">
                {t("stability.noIssues")}
              </div>
              <div className="dl-stability-empty-body">
                {t("stability.watchingDescription")}
              </div>
            </div>
          ) : (
            <>
              {openStabilityItems.map((item) => (
                <div
                  key={item.id}
                  className={`dl-stability-inbox-item ${
                    item.id === stabilityActiveId
                      ? "dl-stability-inbox-item-active"
                      : ""
                  } ${isNewItem(item) ? "dl-stability-inbox-item-new" : ""}`}
                  onClick={() => onSelectStabilityItem(item.id)}
                >
                  <div className="dl-stability-inbox-item-main">
                    <span className="dl-stability-inbox-item-type">
                      {inferIssueType(item)}
                    </span>
                    <span className="dl-stability-inbox-item-title">
                      {item.title}
                    </span>
                    {isNewItem(item) ? (
                      <span className="dl-stability-inbox-item-new-badge">
                        {t("stability.new")}
                      </span>
                    ) : null}
                  </div>
                  <div className="dl-stability-inbox-item-meta">
                    <span>{formatRelativeTime(getCapturedAt(item))}</span>
                    <span>{item.pathname}</span>
                    <span
                      className="dl-severity-pill"
                      data-severity={item.severity}
                    >
                      {getStabilitySeverityLabel(item.severity, t)}
                    </span>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Section 3 & 4: Selected Issue Detail + Primary Actions */}
      {activeStabilityItem ? (
        <div className="dl-stability-detail">
          <div className="dl-detail-card">
            <div className="dl-stability-meta">
              <span
                className="dl-status-pill"
                data-status={activeStabilityItem.status}
              >
                {getStabilityStatusLabel(activeStabilityItem.status, t)}
              </span>
              <span
                className="dl-severity-pill"
                data-severity={activeStabilityItem.severity}
              >
                {getStabilitySeverityLabel(activeStabilityItem.severity, t)}
              </span>
            </div>
            <h4 className="dl-detail-title">{activeStabilityItem.title}</h4>
            <div className="dl-stability-detail-summary">
              {getIssueSummary(activeStabilityItem)}
            </div>
          </div>

          {/* Primary Action Area */}
          <div className="dl-detail-card">
            <div className="dl-stability-action-summary">
              <div className="dl-stability-action-summary-item">
                <strong>{t("stability.observed")}</strong>
                <span>{formatRelativeTime(getCapturedAt(activeStabilityItem))}</span>
              </div>
              <div className="dl-stability-action-summary-item">
                <strong>{t("stability.page")}</strong>
                <span>{activeStabilityItem.context.pathname}</span>
              </div>
            </div>
            <div className="dl-stability-detail-actions">
              <button
                className="dl-popup-action dl-stability-primary-action"
                data-kind="primary"
                onClick={() => onCopyStabilityItem(activeStabilityItem)}
              >
                {t("stability.copy")}
              </button>
            </div>
          </div>

          {/* Technical details */}
          <div className="dl-detail-card">
            <button
              className="dl-stability-technical-toggle"
              onClick={() =>
                setShowTechnicalDetails((current) => !current)
              }
            >
              <span>{t("stability.technicalDetails")}</span>
              <span>{showTechnicalDetails ? t("stability.collapse") : t("stability.expand")}</span>
            </button>
            {showTechnicalDetails ? (
              <div className="dl-detail-meta">
                <div
                  className="dl-detail-kv"
                  style={{ gridColumn: "1 / -1" }}
                >
                  <strong>{t("stability.observedSymptom")}</strong>
                  <span>{activeStabilityItem.symptom}</span>
                </div>
                {activeStabilityItem.signals ? (
                  <div
                    className="dl-detail-kv"
                    style={{ gridColumn: "1 / -1" }}
                  >
                    <strong>{t("stability.signals")}</strong>
                    <span>{activeStabilityItem.signals}</span>
                  </div>
                ) : null}
                <div className="dl-detail-kv">
                  <strong>{t("stability.page")}</strong>
                  <span>{activeStabilityItem.context.title}</span>
                </div>
                <div className="dl-detail-kv">
                  <strong>{t("stability.path")}</strong>
                  <span>{activeStabilityItem.context.pathname}</span>
                </div>
                <div
                  className="dl-detail-kv"
                  style={{ gridColumn: "1 / -1" }}
                >
                  <strong>{t("stability.url")}</strong>
                  <span>{activeStabilityItem.context.url}</span>
                </div>
                <div className="dl-detail-kv">
                  <strong>{t("stability.viewport")}</strong>
                  <span>
                    {activeStabilityItem.context.viewport.width} ×{" "}
                    {activeStabilityItem.context.viewport.height}
                  </span>
                </div>
                <div className="dl-detail-kv">
                  <strong>{t("stability.captured")}</strong>
                  <span>{formatTime(getCapturedAt(activeStabilityItem), locale)}</span>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
