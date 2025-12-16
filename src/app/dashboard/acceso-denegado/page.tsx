// app/dashboard/acceso-denegado/page.tsx
import Link from "next/link";
import { IconLock, IconHome } from "@tabler/icons-react";

export default function AccesoDenegadoPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-8">
      <div className="flex flex-col items-center gap-4 text-center max-w-md">
        <div className="rounded-full bg-destructive/10 p-6">
          <IconLock className="size-16 text-destructive" />
        </div>

        <h1 className="text-3xl font-bold">Acceso Denegado</h1>

        <p className="text-muted-foreground text-lg">
          No tienes los permisos necesarios para acceder a esta sección.
        </p>

        <p className="text-sm text-muted-foreground">
          Esta área está restringida solo para usuarios con rol de{" "}
          <span className="font-semibold text-blue-600">ADMINISTRADOR</span>.
        </p>

        <div className="flex gap-3 mt-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            <IconHome className="size-4" />
            Volver al Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
