import { useEffect, useRef, useState, type Dispatch, type MutableRefObject, type SetStateAction } from "react";

import { mergeRemoteAnnotations } from "../annotation/state";
import { mergeRemoteRepairRequests } from "../repair/state";
import { mergeRemoteStabilityItems } from "../stability/state";
import { clearSessionId, loadSessionId, saveSessionId } from "../storage";
import {
  ensureRemoteSession,
  getRemoteSession,
  syncRemoteAnnotation,
  syncRemoteStabilityItem,
  updateRemoteAnnotation,
  updateRemoteStabilityItem,
} from "../sync";
import type {
  DevPilotAnnotation,
  DevPilotRepairRequestRecord,
  DevPilotStabilityItem,
} from "../types";

type UseRemoteSessionSyncArgs = {
  pathname: string;
  syncEndpoint?: string;
  stabilityEnabled: boolean;
  annotations: DevPilotAnnotation[];
  stabilityItems: DevPilotStabilityItem[];
  setAnnotations: Dispatch<SetStateAction<DevPilotAnnotation[]>>;
  setStabilityItems: Dispatch<SetStateAction<DevPilotStabilityItem[]>>;
  setRepairRequests: Dispatch<SetStateAction<DevPilotRepairRequestRecord[]>>;
};

type UseRemoteSessionSyncResult = {
  currentSessionId: string | null;
  currentSessionIdRef: MutableRefObject<string | null>;
  annotationsRef: MutableRefObject<DevPilotAnnotation[]>;
};

function mergeIfChanged<T>(current: T[], next: T[]): T[] {
  return JSON.stringify(next) === JSON.stringify(current) ? current : next;
}

export function useRemoteSessionSync({
  pathname,
  syncEndpoint,
  stabilityEnabled,
  annotations,
  stabilityItems,
  setAnnotations,
  setStabilityItems,
  setRepairRequests,
}: UseRemoteSessionSyncArgs): UseRemoteSessionSyncResult {
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(() =>
    loadSessionId(pathname),
  );
  const annotationsRef = useRef<DevPilotAnnotation[]>(annotations);
  const stabilityItemsRef = useRef<DevPilotStabilityItem[]>(stabilityItems);
  const currentSessionIdRef = useRef<string | null>(currentSessionId);

  useEffect(() => {
    annotationsRef.current = annotations;
  }, [annotations]);

  useEffect(() => {
    stabilityItemsRef.current = stabilityItems;
  }, [stabilityItems]);

  useEffect(() => {
    currentSessionIdRef.current = currentSessionId;
  }, [currentSessionId]);

  useEffect(() => {
    if (!syncEndpoint) {
      clearSessionId(pathname);
      setCurrentSessionId(null);
      setRepairRequests([]);
      return;
    }

    let cancelled = false;

    ensureRemoteSession(syncEndpoint, {
      pageKey: `${window.location.origin}${pathname}`,
      pathname,
      url: window.location.href,
      title: document.title || pathname,
    })
      .then((session) => {
        if (cancelled) {
          return;
        }

        setCurrentSessionId(session.id);
        saveSessionId(pathname, session.id);
      })
      .catch((error) => {
        console.warn("[DevPilot] Failed to ensure remote session:", error);
      });

    return () => {
      cancelled = true;
    };
  }, [pathname, setRepairRequests, syncEndpoint]);

  useEffect(() => {
    if (!syncEndpoint || !currentSessionId) {
      return;
    }

    let cancelled = false;
    let syncing = false;

    const syncNow = async () => {
      if (syncing) {
        return;
      }

      syncing = true;

      try {
        let remoteSession = await getRemoteSession(syncEndpoint, currentSessionId);
        if (cancelled) {
          return;
        }

        const localAnnotationsSnapshot = annotationsRef.current;
        const localStabilitySnapshot = stabilityItemsRef.current;
        const remoteAnnotationsById = new Map(
          remoteSession.annotations.map((annotation) => [annotation.id, annotation]),
        );
        const remoteStabilityById = new Map(
          remoteSession.stabilityItems.map((item) => [item.id, item]),
        );

        let pushedLocalChanges = false;

        for (const annotation of localAnnotationsSnapshot) {
          const remote = remoteAnnotationsById.get(annotation.id);
          if (!remote) {
            await syncRemoteAnnotation(syncEndpoint, currentSessionId, annotation);
            pushedLocalChanges = true;
            continue;
          }

          if (annotation.updatedAt > remote.updatedAt) {
            await updateRemoteAnnotation(syncEndpoint, annotation.id, annotation);
            pushedLocalChanges = true;
          }
        }

        if (stabilityEnabled) {
          for (const item of localStabilitySnapshot) {
            const remote = remoteStabilityById.get(item.id);
            if (!remote) {
              await syncRemoteStabilityItem(syncEndpoint, currentSessionId, item);
              pushedLocalChanges = true;
              continue;
            }

            if (item.updatedAt > remote.updatedAt) {
              await updateRemoteStabilityItem(syncEndpoint, item.id, item);
              pushedLocalChanges = true;
            }
          }
        }

        if (pushedLocalChanges) {
          remoteSession = await getRemoteSession(syncEndpoint, currentSessionId);
          if (cancelled) {
            return;
          }
        }

        setAnnotations((current) =>
          mergeIfChanged(current, mergeRemoteAnnotations(current, remoteSession.annotations)),
        );

        if (stabilityEnabled) {
          setStabilityItems((current) =>
            mergeIfChanged(current, mergeRemoteStabilityItems(current, remoteSession.stabilityItems)),
          );
        }

        setRepairRequests((current) =>
          mergeIfChanged(current, mergeRemoteRepairRequests(current, remoteSession.repairRequests || [])),
        );
      } catch (error) {
        console.warn("[DevPilot] Failed to sync DevPilot session state:", error);
      } finally {
        syncing = false;
      }
    };

    void syncNow();
    const intervalId = window.setInterval(() => {
      void syncNow();
    }, 2500);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [
    currentSessionId,
    setAnnotations,
    setRepairRequests,
    setStabilityItems,
    stabilityEnabled,
    syncEndpoint,
  ]);

  return {
    currentSessionId,
    currentSessionIdRef,
    annotationsRef,
  };
}
