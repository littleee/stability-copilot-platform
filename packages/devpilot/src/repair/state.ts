import type {
  DevPilotRepairRequestRecord,
  DevPilotRepairRequestStatus,
} from "../types";

export function getRepairRequestStatusLabel(
  status: DevPilotRepairRequestStatus,
): string {
  switch (status) {
    case "accepted":
      return "已接单";
    case "completed":
      return "已完成";
    case "dismissed":
      return "已关闭";
    default:
      return "待处理";
  }
}

export function sortRepairRequestsByUpdatedAt(
  items: DevPilotRepairRequestRecord[],
): DevPilotRepairRequestRecord[] {
  return [...items].sort((a, b) => {
    if (b.updatedAt !== a.updatedAt) {
      return b.updatedAt - a.updatedAt;
    }

    return b.createdAt - a.createdAt;
  });
}

export function mergeRemoteRepairRequests(
  localItems: DevPilotRepairRequestRecord[],
  remoteItems: DevPilotRepairRequestRecord[],
): DevPilotRepairRequestRecord[] {
  const merged = new Map<string, DevPilotRepairRequestRecord>();

  remoteItems.forEach((item) => {
    merged.set(item.id, item);
  });

  localItems.forEach((item) => {
    const remote = merged.get(item.id);
    if (!remote || item.updatedAt > remote.updatedAt) {
      merged.set(item.id, item);
    }
  });

  return sortRepairRequestsByUpdatedAt(Array.from(merged.values()));
}
