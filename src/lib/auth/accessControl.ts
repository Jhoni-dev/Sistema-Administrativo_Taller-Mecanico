export type UserRole = "MECANICO" | "ADMINISTRADOR";

interface AccessPayload {
  role?: UserRole;
}

export function checkAccess(path: string, payload: AccessPayload): { allowed: boolean; error?: string } {
  const role = payload.role || "MECANICO";

  if (path.startsWith("/backend/api/protected/admin")) {
    if (role !== "ADMINISTRADOR") {
      return { allowed: false, error: "Acceso restringido: solo administradores" };
    }
  }

  if (path.startsWith("/backend/api/protected/invoice/delete")) {
    if (role === "MECANICO") {
      return { allowed: false, error: "No tienes permiso para eliminar facturas" };
    }
  }

  return { allowed: true };
}
