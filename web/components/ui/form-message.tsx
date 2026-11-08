import { AlertCircle, CheckCircle2 } from "lucide-react";
import type { FormState } from "@/lib/types";

/** Inline result message for a Server Action form, announced to screen readers. */
export function FormMessage({ state }: { state: FormState }) {
  if (state.status === "idle" || !state.message) return null;
  const success = state.status === "success";
  return (
    <p
      role={success ? "status" : "alert"}
      className={`flex items-start gap-2 rounded-lg border px-4 py-3 text-sm ${
        success
          ? "border-cl-success/40 bg-cl-success/10 text-cl-text"
          : "border-red-500/40 bg-red-500/10 text-cl-text"
      }`}
    >
      {success ? (
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cl-success" />
      ) : (
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
      )}
      <span>{state.message}</span>
    </p>
  );
}
