import React, { useEffect, useState } from "react";

import { formatTime } from "../shared/runtime";
import {
  getStabilitySeverityLabel,
  getStabilityStatusLabel,
} from "../stability/state";
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

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function getCapturedAt(item: DevPilotStabilityItem): number {
  return item.context.capturedAt || item.createdAt;
}

function isNewItem(item: DevPilotStabilityItem): boolean {
  return Date.now() - getCapturedAt(item) < 5 * 60 * 1000;
}

function getIssueSummary(item: DevPilotStabilityItem): string {
  const type = inferIssueType(item);

  if (type === "Fetch") {
    return "页面请求失败，可能导致当前区域无法加载数据或完成操作。";
  }
  if (type === "Promise") {
    return "页面里的异步流程被中断，可能导致状态没有更新或交互停在中间态。";
  }
  if (type === "Error") {
    return "页面运行时出现错误，当前模块可能无法继续正常工作。";
  }
  return "页面运行时出现异常，建议尽快交给 AI 或开发者继续诊断。";
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
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

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
          <h3 className="dl-session-title">Stability Copilot</h3>
        </div>
        <button
          className="dl-toolbar-icon-button dl-stability-panel-close"
          data-kind="secondary"
          onClick={onClose}
          title="Close"
        >
          <CollapseIcon />
        </button>
      </div>

      {/* Section 1: Observation Status */}
      <div className="dl-stability-status-bar">
        <span className="dl-stability-status-dot" data-on />
        <span className="dl-stability-status-text">
          Watching for runtime issues
        </span>
        {lastCaptureTime ? (
          <span className="dl-stability-status-meta">
            Last captured {formatRelativeTime(lastCaptureTime)}
          </span>
        ) : null}
        <span className="dl-stability-status-meta">
          {openStabilityItems.length} open{" "}
          {openStabilityItems.length === 1 ? "issue" : "issues"}
        </span>
      </div>

      {/* Section 2: Issue Inbox */}
      <div className="dl-stability-inbox">
        <div className="dl-stability-inbox-header">
          <span className="dl-stability-inbox-title">Open Issues</span>
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
                No issues captured yet
              </div>
              <div className="dl-stability-empty-body">
                Stability Copilot is watching for JS errors, promise
                rejections, and failed requests.
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
                        New
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
                      {getStabilitySeverityLabel(item.severity)}
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
                {getStabilityStatusLabel(activeStabilityItem.status)}
              </span>
              <span
                className="dl-severity-pill"
                data-severity={activeStabilityItem.severity}
              >
                {getStabilitySeverityLabel(activeStabilityItem.severity)}
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
                <strong>Observed</strong>
                <span>{formatRelativeTime(getCapturedAt(activeStabilityItem))}</span>
              </div>
              <div className="dl-stability-action-summary-item">
                <strong>Page</strong>
                <span>{activeStabilityItem.context.pathname}</span>
              </div>
            </div>
            <div className="dl-stability-detail-actions">
              <button
                className="dl-popup-action dl-stability-primary-action"
                data-kind="primary"
                onClick={() => onCopyStabilityItem(activeStabilityItem)}
              >
                复制
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
              <span>技术细节</span>
              <span>{showTechnicalDetails ? "收起" : "展开"}</span>
            </button>
            {showTechnicalDetails ? (
              <div className="dl-detail-meta">
                <div
                  className="dl-detail-kv"
                  style={{ gridColumn: "1 / -1" }}
                >
                  <strong>Observed symptom</strong>
                  <span>{activeStabilityItem.symptom}</span>
                </div>
                {activeStabilityItem.signals ? (
                  <div
                    className="dl-detail-kv"
                    style={{ gridColumn: "1 / -1" }}
                  >
                    <strong>Signals</strong>
                    <span>{activeStabilityItem.signals}</span>
                  </div>
                ) : null}
                <div className="dl-detail-kv">
                  <strong>Page</strong>
                  <span>{activeStabilityItem.context.title}</span>
                </div>
                <div className="dl-detail-kv">
                  <strong>Path</strong>
                  <span>{activeStabilityItem.context.pathname}</span>
                </div>
                <div
                  className="dl-detail-kv"
                  style={{ gridColumn: "1 / -1" }}
                >
                  <strong>URL</strong>
                  <span>{activeStabilityItem.context.url}</span>
                </div>
                <div className="dl-detail-kv">
                  <strong>Viewport</strong>
                  <span>
                    {activeStabilityItem.context.viewport.width} ×{" "}
                    {activeStabilityItem.context.viewport.height}
                  </span>
                </div>
                <div className="dl-detail-kv">
                  <strong>Captured</strong>
                  <span>{formatTime(getCapturedAt(activeStabilityItem))}</span>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
