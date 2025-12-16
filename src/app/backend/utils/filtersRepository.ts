import { ISODate, ISOTime } from "../types/models/entity";

export function toLowerCaseDeepRecord<T extends Record<string, unknown>>(obj: T): T {
    const excludeKeys = ["password", "email", "estado", "state", "appointmentState", "role"];

    const transformValue = (value: unknown, key: string): unknown => {
        if (typeof value === "string" && !excludeKeys.includes(key)) {
            return value.toLowerCase();
        } else if (Array.isArray(value)) {
            return value.map((v) =>
                typeof v === "object" && v !== null
                    ? toLowerCaseDeepRecord(v as Record<string, unknown>)
                    : v
            );
        } else if (value !== null && typeof value === "object") {
            return toLowerCaseDeepRecord(value as Record<string, unknown>);
        }
        return value;
    };

    const entries = Object.entries(obj).map(([key, value]) => [key, transformValue(value, key)]);
    return Object.fromEntries(entries) as T;
}


export function selectFields(data: object): object {
    return Object.keys(data).reduce((acc, key) => {
        acc[key] = true;
        return acc;
    }, {} as Record<string, boolean>);
}

export function buildDynamicSelect(dataGroups: Record<string, unknown>): Record<string, unknown> {
    const select: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(dataGroups)) {
        if (!value || Object.keys(value).length === 0) continue;

        if (key.startsWith("client") || typeof value === "object") {
            select[key] = { select: selectFields(value) };
        } else {
            Object.assign(select, selectFields(value));
        }
    }

    return select;
}

export function filterCurrent(
  current: Date | null,
  date?: ISODate | null,
  time?: ISOTime | null
): Date | undefined {

  if (!current) return undefined;

  const updated = new Date(current.getTime());
  let changed = false;

  if (date) {
    const [y, m, d] = date.split("-").map(Number);
    updated.setFullYear(y, m - 1, d);
    changed = true;
  }

  if (time) {
    const [h, min] = time.split(":").map(Number);
    updated.setHours(h, min, 0, 0);
    changed = true;
  }
  if (!changed) return undefined;

  if (updated.getTime() === current.getTime()) {
    return undefined;
  }

  return updated;
}
