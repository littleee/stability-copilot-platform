import React from "react";

import { getAnnotationKind } from "../output";
import { getAnnotationStatusLabel } from "../annotation/state";
import { formatTime } from "../shared/runtime";
import { useI18n } from "../i18n";
import type {
  DevPilotAnnotation,
  DevPilotAnnotationStatus,
} from "../types";
import { CollapseIcon } from "./icons";

type CopyState = "idle" | "copied" | "failed";

interface AnnotationSummary {
  open: number;
  acknowledged: number;
  total: number;
}

interface SessionPanelProps {
  panelLeft: number;
  panelBottom: number;
  copyState: CopyState;
  summary: AnnotationSummary;
  annotations: DevPilotAnnotation[];
  openAnnotations: DevPilotAnnotation[];
  activeAnnotationId: string | null;
  activeAnnotation: DevPilotAnnotation | null;
  onCopy: () => void;
  onClose: () => void;
  onSelectAnnotation: (annotationId: string) => void;
  onOpenAnnotationEditor: (annotation: DevPilotAnnotation) => void;
  onSetAnnotationStatus: (
    annotationId: string,
    nextStatus: DevPilotAnnotationStatus,
  ) => void;
  onDeleteAnnotation: (annotation: DevPilotAnnotation) => void;
}

export function SessionPanel({
  panelLeft,
  panelBottom,
  copyState,
  summary,
  annotations,
  openAnnotations,
  activeAnnotationId,
  activeAnnotation,
  onCopy,
  onClose,
  onSelectAnnotation,
  onOpenAnnotationEditor,
  onSetAnnotationStatus,
  onDeleteAnnotation,
}: SessionPanelProps) {
  const { t, locale } = useI18n();

  return (
    <section
      className="dl-session-panel"
      style={{ left: panelLeft, bottom: panelBottom }}
    >
      <div className="dl-session-header">
        <div>
          <h3 className="dl-session-title">{t("session.title")}</h3>
          <p className="dl-session-subtitle">
            {t("session.subtitle")}
          </p>
        </div>
        <div className="dl-session-header-actions">
          <button
            className="dl-popup-action"
            data-kind={
              copyState === "failed"
                ? "danger"
                : copyState === "copied"
                  ? "primary"
                  : "ghost"
            }
            disabled={openAnnotations.length === 0}
            onClick={onCopy}
            title={t("session.copyTooltip")}
          >
            {copyState === "copied"
              ? t("session.copied")
              : copyState === "failed"
                ? t("session.copyFailed")
                : t("session.copyCurrent")}
          </button>
          <button
            className="dl-toolbar-icon-button"
            data-kind="secondary"
            onClick={onClose}
            title={t("session.close")}
          >
            <CollapseIcon />
          </button>
        </div>
      </div>
      <div className="dl-summary-grid">
        <div className="dl-summary-card">
          <span className="dl-summary-label">{t("session.open")}</span>
          <span className="dl-summary-value">{summary.open}</span>
        </div>
        <div className="dl-summary-card">
          <span className="dl-summary-label">{t("session.acknowledged")}</span>
          <span className="dl-summary-value">{summary.acknowledged}</span>
        </div>
        <div className="dl-summary-card">
          <span className="dl-summary-label">{t("session.total")}</span>
          <span className="dl-summary-value">{summary.total}</span>
        </div>
      </div>
      <div className="dl-session-body">
        <div className="dl-session-section">
          <div className="dl-session-section-header">
            <h4 className="dl-session-section-title">{t("session.pending")}</h4>
            <span className="dl-session-section-count">{openAnnotations.length}</span>
          </div>
          <div className="dl-session-list">
            {openAnnotations.length === 0 ? (
              <div className="dl-session-empty">
                {annotations.length === 0
                  ? t("session.emptyNoAnnotations")
                  : t("session.emptyNoPending")}
              </div>
            ) : (
              openAnnotations.map((annotation) => (
                <article
                  key={annotation.id}
                  className="dl-annotation-card"
                  data-status={annotation.status}
                  data-selected={annotation.id === activeAnnotationId}
                  onClick={() => onSelectAnnotation(annotation.id)}
                >
                  <div className="dl-annotation-main">
                    <div className="dl-annotation-top">
                      <span className="dl-status-pill" data-status={annotation.status}>
                        {getAnnotationStatusLabel(annotation.status, t)}
                      </span>
                    </div>
                    <div className="dl-annotation-comment">{annotation.comment}</div>
                    <div className="dl-annotation-meta">
                      {annotation.elementName}
                      <br />
                      {annotation.elementPath}
                    </div>
                  </div>
                  <div className="dl-annotation-side">
                    <span className="dl-annotation-time">
                      {formatTime(annotation.updatedAt, locale)}
                    </span>
                    <span className="dl-annotation-chevron">›</span>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>

        <div className="dl-session-section">
          <div className="dl-session-section-header">
            <h4 className="dl-session-section-title">{t("session.detailTitle")}</h4>
            <span className="dl-section-note">
              {t("session.detailNote")}
            </span>
          </div>
          <div className="dl-session-detail">
            {activeAnnotation ? (
              <>
                <div className="dl-detail-card">
                  <h4 className="dl-detail-title">{t("session.currentAnnotation")}</h4>
                  <div className="dl-detail-body">{activeAnnotation.comment}</div>
                  {getAnnotationKind(activeAnnotation) === "text" &&
                  activeAnnotation.selectedText ? (
                    <>
                      <div className="dl-section-note">{t("session.selectedText")}</div>
                      <div className="dl-detail-quote">
                        {activeAnnotation.selectedText}
                      </div>
                    </>
                  ) : null}
                </div>

                <div className="dl-detail-card">
                  <h4 className="dl-detail-title">{t("session.elementContext")}</h4>
                  <div className="dl-detail-meta">
                    <div className="dl-detail-kv">
                      <strong>{t("session.elementSummary")}</strong>
                      <span>{activeAnnotation.elementName}</span>
                    </div>
                    <div className="dl-detail-kv">
                      <strong>{t("session.status")}</strong>
                      <span>{getAnnotationStatusLabel(activeAnnotation.status, t)}</span>
                    </div>
                    <div className="dl-detail-kv" style={{ gridColumn: "1 / -1" }}>
                      <strong>{t("session.elementPath")}</strong>
                      <span>{activeAnnotation.elementPath}</span>
                    </div>
                    {activeAnnotation.nearbyText ? (
                      <div className="dl-detail-kv" style={{ gridColumn: "1 / -1" }}>
                        <strong>{t("session.nearbyText")}</strong>
                        <span>{activeAnnotation.nearbyText}</span>
                      </div>
                    ) : null}
                    {activeAnnotation.relatedElements?.length ? (
                      <div className="dl-detail-kv" style={{ gridColumn: "1 / -1" }}>
                        <strong>{t("session.matchedElements")}</strong>
                        <div className="dl-detail-chip-list">
                          {activeAnnotation.relatedElements.map((item) => (
                            <span key={item} className="dl-detail-chip">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null}
                    <div className="dl-detail-kv">
                      <strong>{t("session.createdAt")}</strong>
                      <span>{formatTime(activeAnnotation.createdAt, locale)}</span>
                    </div>
                    <div className="dl-detail-kv">
                      <strong>{t("session.updatedAt")}</strong>
                      <span>{formatTime(activeAnnotation.updatedAt, locale)}</span>
                    </div>
                    {getAnnotationKind(activeAnnotation) === "area" ? (
                      <div className="dl-detail-kv">
                        <strong>{t("session.areaSize")}</strong>
                        <span>
                          {Math.round(activeAnnotation.rect.width)} ×{" "}
                          {Math.round(activeAnnotation.rect.height)}
                        </span>
                      </div>
                    ) : null}
                    {getAnnotationKind(activeAnnotation) === "area" ? (
                      <div className="dl-detail-kv">
                        <strong>{t("session.matchCount")}</strong>
                        <span>
                          {activeAnnotation.matchCount ||
                            activeAnnotation.relatedElements?.length ||
                            0}{" "}
                          {t("session.elementUnit")}
                        </span>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="dl-detail-card">
                  <h4 className="dl-detail-title">{t("session.actions")}</h4>
                  <div className="dl-detail-actions">
                    <button
                      className="dl-popup-action"
                      data-kind="primary"
                      onClick={() => onOpenAnnotationEditor(activeAnnotation)}
                    >
                      {t("session.edit")}
                    </button>
                    {activeAnnotation.status === "pending" ? (
                      <button
                        className="dl-popup-action"
                        data-kind="ghost"
                        onClick={() =>
                          onSetAnnotationStatus(activeAnnotation.id, "acknowledged")
                        }
                      >
                        {t("session.markAcknowledged")}
                      </button>
                    ) : null}
                    {activeAnnotation.status === "acknowledged" ? (
                      <button
                        className="dl-popup-action"
                        data-kind="ghost"
                        onClick={() =>
                          onSetAnnotationStatus(activeAnnotation.id, "pending")
                        }
                      >
                        {t("session.reopen")}
                      </button>
                    ) : null}
                    <button
                      className="dl-popup-action"
                      data-kind="primary"
                      onClick={() =>
                        onSetAnnotationStatus(activeAnnotation.id, "resolved")
                      }
                    >
                      {t("session.resolve")}
                    </button>
                    <button
                      className="dl-popup-action"
                      data-kind="danger"
                      onClick={() =>
                        onSetAnnotationStatus(activeAnnotation.id, "dismissed")
                      }
                    >
                      {t("session.dismiss")}
                    </button>
                    <button
                      className="dl-popup-action"
                      data-kind="danger"
                      onClick={() => onDeleteAnnotation(activeAnnotation)}
                    >
                      {t("session.delete")}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="dl-detail-empty">
                {t("session.emptyDetail")}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
