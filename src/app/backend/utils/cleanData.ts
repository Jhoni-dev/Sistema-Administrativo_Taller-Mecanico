
export const cleanData = {
    arrays_objects<T extends Record<string, unknown>>(data: T): Partial<T> {
        const cleaned = Object.fromEntries(
            Object.entries(data).filter(([__, v]) => {
                if (v === undefined || v === null) return false;
                if (typeof v === "string" && v.trim() === "") return false;
                if (Array.isArray(v)) return false;
                if (typeof v === "object") return false;
                return true;
            })
        );

        return cleaned as Partial<T>;
    },

    arrays<T extends Record<string, unknown>>(data: T): Partial<T> {
        const cleaned = Object.fromEntries(
            Object.entries(data).filter(([__, v]) => {
                if (v === undefined || v === null) return false;
                if (typeof v === "string" && v.trim() === "") return false;
                if (Array.isArray(v)) return false;
                if (typeof v === "object" && Object.keys(v).length === 0) return false;
                return true;
            })
        );

        return cleaned as Partial<T>;
    },

    object<T extends Record<string, unknown>>(data: T): Partial<T> {
        const cleaned = Object.fromEntries(
            Object.entries(data).filter(([__, v]) => {
                if (v === undefined || v === null) return false;
                if (typeof v === "string" && v.trim() === "") return false;
                if (Array.isArray(v) && v.length === 0) return false;
                if (typeof v === "object") return false;
                return true;
            })
        );

        return cleaned as Partial<T>;
    },

    cleanEmpty<T extends Record<string, unknown>>(data: T): Partial<T> {
        const cleaned = Object.fromEntries(
            Object.entries(data).filter(([__, v]) => {
                if (v === undefined || v === null) return false;
                if (typeof v === "string" && v.trim() === "") return false;
                if (Array.isArray(v) && v.length === 0) return false;
                if (typeof v === "object" && Object.keys(v).length === 0) return false;
                return true;
            })
        );

        return cleaned as Partial<T>;
    }
}