import { RequestPasswordResetForm } from "@/components/request-password-reset-form";

export default function RequestPasswordResetPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <RequestPasswordResetForm />
      </div>
    </div>
  );
}