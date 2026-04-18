import React from "react";

import { CollapseIcon } from "./icons";

type SseStatus = "disabled" | "connecting" | "connected" | "reconnecting";

interface SettingsPanelProps {
  panelLeft: number;
  panelBottom: number;
  syncEndpoint?: string;
  sessionId: string | null;
  sseStatus: SseStatus;
  stabilityCopilotEnabled: boolean;
  onToggleStabilityCopilot: () => void;
  onClose: () => void;
}

function getSseLabel(status: SseStatus): string {
  switch (status) {
    case "connected":
      return "已连接";
    case "reconnecting":
      return "重连中";
    case "connecting":
      return "连接中";
    default:
      return "未启用";
  }
}

function getLanguageName(language: string): string {
  const normalized = language.toLowerCase();

  if (normalized.startsWith("zh-cn") || normalized.startsWith("zh-sg") || normalized === "zh") {
    return "简体中文";
  }

  if (normalized.startsWith("zh-tw") || normalized.startsWith("zh-hk") || normalized.startsWith("zh-mo")) {
    return "繁體中文";
  }

  if (normalized.startsWith("en")) {
    return "English";
  }

  if (normalized.startsWith("ja")) {
    return "日本語";
  }

  if (normalized.startsWith("ko")) {
    return "한국어";
  }

  return language;
}

export function SettingsPanel({
  panelLeft,
  panelBottom,
  syncEndpoint,
  sessionId,
  sseStatus,
  stabilityCopilotEnabled,
  onToggleStabilityCopilot,
  onClose,
}: SettingsPanelProps) {
  const mcpStatus = syncEndpoint ? "connected" : "disabled";
  const mcpLabel = syncEndpoint ? "协作模式" : "本地模式";
  const browserLanguage =
    typeof navigator === "undefined" ? "zh-CN" : navigator.language || "zh-CN";
  const languageLabel = `${getLanguageName(browserLanguage)} (${browserLanguage})`;

  return (
    <section
      className="dl-session-panel dl-settings-panel"
      style={{ left: panelLeft, bottom: panelBottom }}
    >
      <div className="dl-session-header">
        <div className="dl-session-header-main">
          <h3 className="dl-session-title">设置</h3>
        </div>
        <button
          className="dl-toolbar-icon-button"
          data-kind="secondary"
          onClick={onClose}
          title="关闭设置"
        >
          <CollapseIcon />
        </button>
      </div>

      <div className="dl-session-body">
        <div className="dl-session-section">
          <div className="dl-session-section-header">
            <h4 className="dl-session-section-title">偏好</h4>
          </div>
          <div className="dl-session-detail">
            <div className="dl-detail-card">
              <div className="dl-settings-row">
                <div className="dl-settings-main">
                  <span className="dl-settings-name">界面语言</span>
                  <span className="dl-settings-value">当前跟随浏览器：{languageLabel}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="dl-session-section">
          <div className="dl-session-section-header">
            <h4 className="dl-session-section-title">功能</h4>
          </div>
          <div className="dl-session-detail">
            <div className="dl-detail-card">
              <label className="dl-settings-row dl-settings-switch-row" title="开启后将自动捕获 JS 异常、Promise 拒绝和接口失败">
                <span className="dl-settings-name">稳定性副驾</span>
                <span className="dl-switch">
                  <input
                    type="checkbox"
                    checked={stabilityCopilotEnabled}
                    onChange={onToggleStabilityCopilot}
                  />
                  <span className="dl-switch-track" aria-hidden="true">
                    <span className="dl-switch-thumb" aria-hidden="true" />
                  </span>
                </span>
              </label>
            </div>
          </div>
        </div>

        <div className="dl-session-section">
          <div className="dl-session-section-header">
            <h4 className="dl-session-section-title">连接</h4>
          </div>
          <div className="dl-session-detail">
            <div className="dl-detail-card">
              <div className="dl-settings-row">
                <div className="dl-settings-main">
                  <span className="dl-settings-name">MCP</span>
                  <span className="dl-settings-value">{mcpLabel}</span>
                </div>
                <span
                  className="dl-settings-indicator"
                  data-status={mcpStatus}
                  aria-hidden="true"
                />
              </div>
              <div className="dl-settings-row">
                <div className="dl-settings-main">
                  <span className="dl-settings-name">SSE</span>
                  <span className="dl-settings-value">{getSseLabel(sseStatus)}</span>
                </div>
                <span
                  className="dl-settings-indicator"
                  data-status={sseStatus}
                  aria-hidden="true"
                />
              </div>
            </div>

            <div className="dl-detail-card">
              <div className="dl-detail-meta">
                <div className="dl-detail-kv" style={{ gridColumn: "1 / -1" }}>
                  <strong>Endpoint</strong>
                  <span>{syncEndpoint || "未配置"}</span>
                </div>
                <div className="dl-detail-kv" style={{ gridColumn: "1 / -1" }}>
                  <strong>Session</strong>
                  <span>{sessionId || "未建立"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
