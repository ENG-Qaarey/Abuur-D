"use client";

import { useActionState, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { ArrowLeft, Link2, Mail, ShieldCheck, User } from "lucide-react";
import { forgotPasswordAction, loginAction, registerAction } from "@/lib/actions/auth";
import { routes } from "@/lib/routes";
import { IDLE } from "@/lib/types";
import { CLAIM_KEY } from "@/components/landing/claim-link";
import { Field, FormAlert, PasswordInput, StrengthMeter, SubmitButton } from "./auth-ui";

export type AuthMode = "login" | "register" | "forgot";
type Errors = Partial<Record<string, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ------------------------------------------------------------------ validation */

function validate(mode: AuthMode, data: FormData): Errors {
  const v = (k: string) => String(data.get(k) ?? "");
  const errors: Errors = {};
  const email = v("email").trim();
  if (!email) errors.email = "Enter your email address.";
  else if (!EMAIL_RE.test(email)) errors.email = "Enter a valid email address, like name@example.com.";

  if (mode === "login" && !v("password")) errors.password = "Enter your password.";

  if (mode === "register") {
    const parts = v("fullName").trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) errors.fullName = "Enter your full name.";
    else if (parts.length < 2) errors.fullName = "Enter your first and last name.";
    if (v("password").length < 8) errors.password = "Use at least 8 characters.";
    if (!v("confirmPassword")) errors.confirmPassword = "Confirm your password.";
    else if (v("confirmPassword") !== v("password")) errors.confirmPassword = "The passwords don't match.";
    if (data.get("terms") !== "on") errors.terms = "Please accept the Terms and Privacy Policy to continue.";
  }
  return errors;
}

/**
 * Validates in the browser before the Server Action runs (the server validates again).
 * Blocks submission and focuses the first problem field when something is wrong.
 */
function useClientValidation(mode: AuthMode) {
  const [errors, setErrors] = useState<Errors>({});
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const next = validate(mode, new FormData(e.currentTarget));
    setErrors(next);
    const first = Object.keys(next)[0];
    if (first) {
      e.preventDefault();
      (e.currentTarget.elements.namedItem(first) as HTMLElement | null)?.focus();
    }
  };
  /** Clear a field's error as soon as the visitor edits it. */
  const clear = (name: string) => () => setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev));
  return { errors, onSubmit, clear };
}

/* ------------------------------------------------------------------ sign in */

function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, IDLE);
  const { errors, onSubmit, clear } = useClientValidation("login");
  return (
    <form action={action} onSubmit={onSubmit} noValidate className="space-y-4">
      <FormAlert state={state} />
      <Field
        id="email"
        name="email"
        type="email"
        label="Email address"
        icon={Mail}
        placeholder="Enter your email address"
        autoComplete="email"
        inputMode="email"
        autoCapitalize="none"
        spellCheck={false}
        maxLength={254}
        required
        defaultValue={state.fields?.email}
        error={errors.email}
        onInput={clear("email")}
      />
      <div onInput={clear("password")}>
        <PasswordInput
          error={errors.password}
          aside={
            <Link href={routes.forgotPassword} className="auth-link text-[13px]">
              Forgot password?
            </Link>
          }
        />
      </div>
      <div className="pt-2">
        <SubmitButton pending={pending} label="Sign in" pendingLabel="Signing in…" />
      </div>
      <p className="flex items-center justify-center gap-1.5 text-[13px] text-[var(--a-muted)]">
        <ShieldCheck size={14} className="text-[var(--a-success)]" aria-hidden />
        Your account is protected with secure authentication.
      </p>
    </form>
  );
}

/* ------------------------------------------------------------------ create account */

const subscribeNoop = () => () => {};
function readClaimedSlug(): string | null {
  try {
    const claimed = JSON.parse(localStorage.getItem(CLAIM_KEY) ?? "null") as { slug?: string } | null;
    return claimed?.slug ? claimed.slug.slice(0, 60) : null;
  } catch {
    return null;
  }
}

function RegisterForm() {
  const [state, action, pending] = useActionState(registerAction, IDLE);
  const { errors, onSubmit, clear } = useClientValidation("register");
  const [password, setPassword] = useState("");
  const claimedSlug = useSyncExternalStore(subscribeNoop, readClaimedSlug, () => null);

  return (
    <form action={action} onSubmit={onSubmit} noValidate className="space-y-4">
      {claimedSlug && (
        <p className="flex items-center gap-2 rounded-lg bg-[var(--a-primary-soft)] px-3 py-2 text-[13px] text-[var(--a-text)]">
          <Link2 size={14} className="shrink-0 text-[var(--a-primary)]" aria-hidden />
          <span className="truncate">
            You&apos;ll claim <strong className="font-semibold">abuur.so/{claimedSlug}</strong> after signing up.
          </span>
        </p>
      )}
      <FormAlert state={state} />
      <Field
        id="fullName"
        name="fullName"
        label="Full name"
        icon={User}
        placeholder="Enter your full name"
        autoComplete="name"
        maxLength={161}
        required
        defaultValue={state.fields?.fullName}
        error={errors.fullName}
        onInput={clear("fullName")}
      />
      <Field
        id="email"
        name="email"
        type="email"
        label="Email address"
        icon={Mail}
        placeholder="Enter your email address"
        autoComplete="email"
        inputMode="email"
        autoCapitalize="none"
        spellCheck={false}
        maxLength={254}
        required
        defaultValue={state.fields?.email}
        error={errors.email}
        onInput={clear("email")}
      />
      <div onInput={clear("password")}>
        <PasswordInput
          placeholder="At least 8 characters"
          autoComplete="new-password"
          error={errors.password}
          onValue={setPassword}
        />
        <StrengthMeter password={password} />
      </div>
      <div onInput={clear("confirmPassword")}>
        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          label="Confirm password"
          placeholder="Enter your password again"
          autoComplete="new-password"
          error={errors.confirmPassword}
        />
      </div>
      <div>
        <label className="flex cursor-pointer items-start gap-2.5 text-[13px] leading-5 text-[var(--a-muted)]">
          <input
            type="checkbox"
            name="terms"
            required
            className="auth-check mt-0.5 h-4 w-4 shrink-0"
            aria-invalid={errors.terms ? true : undefined}
            aria-describedby={errors.terms ? "terms-error" : undefined}
            onChange={clear("terms")}
          />
          <span>
            I agree to the{" "}
            <Link href={routes.terms} className="auth-link">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href={routes.privacy} className="auth-link">
              Privacy Policy
            </Link>
            .
          </span>
        </label>
        {errors.terms && (
          <p id="terms-error" className="mt-1.5 pl-[26px] text-[13px] text-[var(--a-error)]">
            {errors.terms}
          </p>
        )}
      </div>
      <div className="pt-2">
        <SubmitButton pending={pending} label="Create account" pendingLabel="Creating account…" />
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------ forgot password */

function ForgotForm() {
  const [state, action, pending] = useActionState(forgotPasswordAction, IDLE);
  const { errors, onSubmit, clear } = useClientValidation("forgot");
  const sent = state.status === "success";

  return (
    <div className="space-y-5">
      {sent ? (
        <FormAlert state={state} />
      ) : (
        <form action={action} onSubmit={onSubmit} noValidate className="space-y-4">
          <FormAlert state={state} />
          <Field
            id="email"
            name="email"
            type="email"
            label="Email address"
            icon={Mail}
            placeholder="Enter your email address"
            autoComplete="email"
            inputMode="email"
            autoCapitalize="none"
            spellCheck={false}
            maxLength={254}
            required
            defaultValue={state.fields?.email}
            error={errors.email}
            onInput={clear("email")}
          />
          {/* Honeypot: hidden from people, bots fill it in. */}
          <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
            <label htmlFor="website">Website</label>
            <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
          </div>
          <div className="pt-2">
            <SubmitButton pending={pending} label="Request reset" pendingLabel="Sending request…" />
          </div>
        </form>
      )}
      <Link href={routes.login} className="auth-link inline-flex items-center gap-1.5 text-sm">
        <ArrowLeft size={15} aria-hidden />
        Back to sign in
      </Link>
    </div>
  );
}

export function AuthForm({ mode }: { mode: AuthMode }) {
  if (mode === "register") return <RegisterForm />;
  if (mode === "forgot") return <ForgotForm />;
  return <LoginForm />;
}
