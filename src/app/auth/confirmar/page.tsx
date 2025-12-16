import { RestorePasswordForm } from "@/components/restore-password-form";

export default function RestorePasswordPage({
  searchParams,
}: {
  searchParams: { token: string };
}) {
  const token = searchParams.token;

  if (!token) {
    return (
      <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm md:max-w-4xl text-center">
          <h1 className="text-2xl font-bold mb-4">Token no válido</h1>
          <p className="text-muted-foreground mb-6">
            El enlace de restablecimiento no es válido o ha expirado.
          </p>
          <a
            href="/request-password-reset"
            className="text-sm underline-offset-2 hover:underline"
          >
            Solicitar un nuevo enlace
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <RestorePasswordForm token={token} />
      </div>
    </div>
  );
}