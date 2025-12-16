"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/usercontext";

interface RoleGuardProps {
  allowedRoles: string[];
  children: React.ReactNode;
  redirectTo?: string;
}

export function RoleGuard({
  allowedRoles,
  children,
  redirectTo = "/dashboard/acceso-denegado",
}: RoleGuardProps) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) return; // Espera que se cargue el usuario
    if (!allowedRoles.includes(user.role)) {
      router.replace(redirectTo); // 🚫 Redirige si no tiene el rol permitido
    }
  }, [user, router, allowedRoles, redirectTo]);

  if (!user || !allowedRoles.includes(user.role)) return null;

  return <>{children}</>;
}
