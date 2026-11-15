"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { AlertCircle, AlertTriangle, ArrowRight, CheckCircle2, Eye, EyeOff, Loader2, Lock, type LucideIcon } from "lucide-react";
import type { FormState } from "@/lib/types";

/* Building blocks for the auth forms. Colours come from the --a-* tokens in globals.css. */

type FieldProps = {
  id: string;
  label: string;
  icon: LucideIcon;
  error?: string;
  /** Right side of the label row, e.g. "Forgot password?" */
  aside?: ReactNode;
  /** Right side inside the input, e.g. the show/hide button. */
  trailing?: ReactNode;
} & React.InputHTMLAttributes<HTMLInputElement>;

export function Field({ id, label, icon: Icon, error, aside, trailing, ...input }: FieldProps) {
  const errorId = `${id}-error`;
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <label htmlFor={id} className="text-[13px] font-medium text-[var(--a-text)]">
          {label}
        </label>
        {aside}
      </div>
      <div className="auth-input" data-invalid={error ? "" : undefined}>
        <Icon size={16} className="auth-input__icon" aria-hidden />
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          {...input}
        />
        {trailing}
      </div>
      {error && (
        <p id={errorId} className="mt-1.5 flex items-center gap-1.5 text-[13px] text-[var(--a-error)]">
          <AlertCircle size={13} className="shrink-0" aria-hidden />
          {error}
        </p>
      )}
    </div>
  );
}

export function PasswordInput({
  id = "password",
  name = "password",
  label = "Password",
  placeholder = "Enter your password",
  autoComplete = "current-password",
  error,
  aside,
  onValue,
}: {
  id?: string;
  name?: string;
  label?: string;
  placeholder?: string;
  autoComplete?: string;
  error?: string;
  aside?: ReactNode;
  onValue?: (value: string) => void;
}) {
  const [show, setShow] = useState(false);
  const [caps, setCaps] = useState(false);
  const checkCaps = (e: React.KeyboardEvent<HTMLInputElement>) => setCaps(e.getModifierState?.("CapsLock") ?? false);

  return (
    <div>
      <Field
        id={id}
        name={name}
        label={label}
        icon={Lock}
        type={show ? "text" : "password"}
        required
        maxLength={200}
        autoComplete={autoComplete}
        placeholder={placeholder}
        error={error}
        aside={aside}
        onKeyDown={checkCaps}
        onKeyUp={checkCaps}
        onBlur={() => setCaps(false)}
        onChange={(e) => onValue?.(e.target.value)}
        trailing={
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            aria-label={show ? "Hide password" : "Show password"}
            aria-pressed={show}
            aria-controls={id}
            className="auth-input__toggle"
          >
            <Eye size={16} className="auth-eye" data-hidden={show ? "" : undefined} aria-hidden />
            <EyeOff size={16} className="auth-eye" data-hidden={show ? undefined : ""} aria-hidden />
          </button>
        }
      />
      {caps && (
        <p className="mt-1.5 flex items-center gap-1.5 text-[13px] text-amber-600 dark:text-amber-400" role="status">
          <AlertTriangle size={13} aria-hidden /> Caps Lock is on
        </p>
      )}
    </div>
  );
}

/** 0–4 from length and variety. Guidance only; the server enforces 8+ characters. */
export function passwordScore(pw: string): number {
  if (pw.length < 8) return 0;
  let score = 1;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}
const LEVELS = ["Too short", "Weak", "Fair", "Good", "Strong"];

export function StrengthMeter({ password }: { password: string }) {
  const score = passwordScore(password);
  return (
    <div className="auth-strength" data-open={password ? "" : undefined} data-score={score}>
      {/* The collapsing row must carry no padding, or it leaves a gap while closed. */}
      <div>
        <div className="flex items-center gap-3 pt-2">
        <div className="grid flex-1 grid-cols-4 gap-1" aria-hidden>
          {[1, 2, 3, 4].map((i) => (
            <span key={i} className="auth-strength__bar" data-on={(score === 0 ? i === 1 : i <= score) ? "" : undefined} />
          ))}
        </div>
        <span className="auth-strength__label" aria-live="polite">
          {password ? LEVELS[score] : ""}
        </span>
        </div>
      </div>
    </div>
  );
}

/** Result of a server action: error (announced) or success. */
export function FormAlert({ state }: { state: FormState }) {
  if (state.status === "idle" || !state.message) return null;
  const ok = state.status === "success";
  const Icon = ok ? CheckCircle2 : AlertCircle;
  return (
    <div role={ok ? "status" : "alert"} className="auth-alert" data-tone={ok ? "success" : "error"}>
      <Icon size={16} className="mt-0.5 shrink-0" aria-hidden />
      <p>{state.message}</p>
    </div>
  );
}

export function SubmitButton({ pending, label, pendingLabel }: { pending: boolean; label: string; pendingLabel: string }) {
  return (
    <button type="submit" disabled={pending} aria-busy={pending} className="auth-button group">
      {pending ? (
        <>
          <Loader2 size={16} className="animate-spin motion-reduce:animate-none" aria-hidden />
          {pendingLabel}
        </>
      ) : (
        <>
          {label}
          <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
        </>
      )}
    </button>
  );
}
