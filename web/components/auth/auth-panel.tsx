"use client";

import { GrainGradient } from "@paper-design/shaders-react";
import { ArrowLeft, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { useActionState, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { loginAction, registerAction } from "@/lib/actions/auth";
import { CONTACT_EMAIL, routes } from "@/lib/routes";
import { IDLE } from "@/lib/types";
import { FormMessage } from "@/components/ui/form-message";
import { BrandMark } from "@/components/landing/logo";

type AuthPanelProps = {
  mode?: "login" | "register";
};

const PROMO_POINTS = [
  "Your own online store link",
  "Orders delivered to your WhatsApp",
  "One dashboard for every order",
];

export default function AuthPanel({ mode = "register" }: AuthPanelProps) {
  const isRegister = mode === "register";
  const [state, formAction, pending] = useActionState(
    isRegister ? registerAction : loginAction,
    IDLE,
  );

  return (
    <section className="w-full bg-transparent text-black antialiased [font-synthesis:none] dark:text-white">
      <div className="grid min-h-0 gap-6 min-[900px]:grid-cols-2">
        {/* Left: form */}
        <div className="flex min-h-[440px] w-full min-w-0 flex-col items-start rounded-2xl border border-[#0d6efd]/25 bg-white px-6 py-7 shadow-[0_18px_48px_rgba(13,110,253,0.12)] dark:border-cl-border dark:bg-[#0b1220] dark:shadow-[0_18px_48px_rgba(0,0,0,0.45)] sm:px-8 lg:px-12 lg:py-10">
          <Link
            href={routes.home}
            className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-black/70 transition-colors hover:text-black dark:text-white/70 dark:hover:text-white"
          >
            <ArrowLeft size={18} />
            Back to home
          </Link>

          <div>
            <h1 className="text-[clamp(2rem,4vw,3.5rem)] font-semibold leading-[1.1] tracking-tight [overflow-wrap:break-word]">
              {isRegister ? "Open your store" : "Welcome back"}
            </h1>
            <p className="mt-2 text-base text-black/60 dark:text-white/55 sm:text-lg">
              {isRegister
                ? "Create your ABUUR account. It takes less than a minute."
                : "Sign in to manage your store, products and orders."}
            </p>
          </div>

          <form action={formAction} className="mt-8 w-full space-y-4">
            {isRegister && (
              <div className="grid gap-4 min-[600px]:grid-cols-2">
                <FieldBox name="firstName" label="First name" autoComplete="given-name" maxLength={80} />
                <FieldBox name="lastName" label="Last name" autoComplete="family-name" maxLength={80} />
              </div>
            )}

            <FieldBox name="email" label="Email" type="email" autoComplete="email" maxLength={254} />
            <FieldBox
              name="password"
              label={isRegister ? "Password (at least 8 characters)" : "Password"}
              type="password"
              autoComplete={isRegister ? "new-password" : "current-password"}
              minLength={isRegister ? 8 : 1}
              maxLength={200}
            />

            {isRegister ? (
              <div className="pt-1 text-sm leading-5 text-black/55 dark:text-white/50">
                <CheckboxLine name="terms" required>
                  I agree to ABUUR&apos;s{" "}
                  <Link
                    href={routes.terms}
                    className="font-medium text-[#0d6efd] underline underline-offset-2 dark:text-[#3b82f6]"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href={routes.privacy}
                    className="font-medium text-[#0d6efd] underline underline-offset-2 dark:text-[#3b82f6]"
                  >
                    Privacy Policy
                  </Link>
                </CheckboxLine>
              </div>
            ) : (
              <div className="flex justify-end text-sm">
                <a
                  href={`mailto:${CONTACT_EMAIL}?subject=Password%20reset%20request`}
                  className="font-medium text-[#0d6efd] hover:underline dark:text-[#3b82f6]"
                >
                  Forgot password?
                </a>
              </div>
            )}

            <FormMessage state={state} />

            <button
              type="submit"
              disabled={pending}
              className="mt-2 flex h-12 w-full items-center justify-center rounded-xl border border-[#0d6efd] bg-[#0d6efd] text-lg font-medium text-white transition-colors hover:bg-[#0b5ed7] disabled:cursor-wait disabled:opacity-70 dark:border-[#3b82f6] dark:bg-[#3b82f6] dark:hover:bg-[#2563eb]"
            >
              {pending
                ? isRegister
                  ? "Creating account…"
                  : "Signing in…"
                : isRegister
                  ? "Create account"
                  : "Sign in"}
            </button>
          </form>

          <p className="mt-5 w-full text-center text-sm text-black/55 dark:text-white/45">
            {isRegister ? (
              <>
                Already have an account?{" "}
                <Link href={routes.login} className="font-semibold text-black dark:text-white">
                  Sign in
                </Link>
              </>
            ) : (
              <>
                New to ABUUR?{" "}
                <Link href={routes.register} className="font-semibold text-black dark:text-white">
                  Create an account
                </Link>
              </>
            )}
          </p>
        </div>

        {/* Right: promo */}
        <div className="relative flex min-h-[440px] w-full min-w-0 items-stretch overflow-hidden rounded-2xl bg-black p-8 sm:p-10 lg:min-h-0">
          <GrainGradient
            speed={1}
            scale={1}
            rotation={0}
            offsetX={0}
            offsetY={0}
            softness={0.5}
            intensity={0.5}
            noise={0.25}
            shape="corners"
            frame={2854.5}
            colors={["#FFFFFF", "#3B82F6", "#2563EB", "#FFFFFF"]}
            colorBack="#00000000"
            className="absolute inset-0 bg-black"
          />

          <div className="relative z-10 flex h-full w-full flex-col">
            <BrandMark size={52} />
            <h2 className="mt-6 max-w-[620px] text-[clamp(2.25rem,4.5vw,4.5rem)] font-semibold leading-[1.05] tracking-tight text-white">
              Sell online,
              <br />
              order on WhatsApp
            </h2>

            <ul className="mt-auto space-y-3 pt-10">
              {PROMO_POINTS.map((point) => (
                <li
                  key={point}
                  className="flex w-fit items-center gap-3 rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-base font-medium text-white/90 backdrop-blur-md"
                >
                  <CheckCircle2 className="size-5 shrink-0 text-emerald-300" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function FieldBox({
  name,
  label,
  type = "text",
  autoComplete,
  minLength,
  maxLength,
}: {
  name: string;
  label: string;
  type?: string;
  autoComplete?: string;
  minLength?: number;
  maxLength?: number;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <label className="flex h-14 items-center justify-between gap-3 rounded-xl border border-[#0d6efd]/25 bg-white px-4 text-base focus-within:border-[#0d6efd] focus-within:ring-2 focus-within:ring-[#0d6efd]/20 dark:border-cl-border dark:bg-white/5">
      <span className="sr-only">{label}</span>
      <input
        name={name}
        type={inputType}
        required
        autoComplete={autoComplete}
        minLength={minLength}
        maxLength={maxLength}
        placeholder={label}
        className="min-w-0 w-full flex-1 bg-transparent text-black outline-none placeholder:text-black/40 dark:text-white dark:placeholder:text-white/40"
      />
      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          aria-label={showPassword ? "Hide password" : "Show password"}
          className="shrink-0 text-black/50 transition-colors hover:text-black dark:text-white/50 dark:hover:text-white"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      )}
    </label>
  );
}

function CheckboxLine({
  children,
  name,
  required,
}: {
  children: ReactNode;
  name: string;
  required?: boolean;
}) {
  return (
    <label className="flex items-start gap-3">
      <span className="relative mt-0.5 size-4 shrink-0">
        <input
          type="checkbox"
          name={name}
          required={required}
          className="peer size-full appearance-none rounded-[5px] border border-[#0d6efd]/40 bg-white checked:border-[#0d6efd] checked:bg-[#0d6efd] dark:border-cl-border dark:bg-white/5 dark:checked:border-[#3b82f6] dark:checked:bg-[#3b82f6]"
        />
        <svg
          viewBox="0 0 12 12"
          className="pointer-events-none absolute inset-0 hidden size-full p-0.5 text-white peer-checked:block"
          fill="none"
          aria-hidden="true"
        >
          <path d="M3 6.2 5 8.1 9 3.9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="leading-5">{children}</span>
    </label>
  );
}
