"use client";

import { useActionState, useEffect, useState, useSyncExternalStore } from "react";
import { CLAIM_KEY } from "@/components/landing/claim-link";
import { createBusinessAction } from "@/lib/actions/business";
import { IDLE } from "@/lib/types";
import { FormMessage } from "@/components/ui/form-message";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

const subscribeNoop = () => () => {};

function readClaimedName(): string | null {
  try {
    const claimed = JSON.parse(localStorage.getItem(CLAIM_KEY) ?? "null") as { name?: string } | null;
    return claimed?.name ? claimed.name.slice(0, 120) : null;
  } catch {
    return null;
  }
}

export function CreateBusinessForm() {
  const [state, formAction, pending] = useActionState(createBusinessAction, IDLE);
  const [typedName, setName] = useState<string | null>(null);
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);

  // Name claimed with "Claim your link" on the home page (null on the server, so HTML matches).
  const claimedName = useSyncExternalStore(subscribeNoop, readClaimedName, () => null);
  const name = typedName ?? claimedName ?? "";
  const shownSlug = slugTouched ? slug : slugify(name);

  // The hand-off is one-time: forget it once the business is created.
  useEffect(() => {
    if (state.status !== "success") return;
    try {
      localStorage.removeItem(CLAIM_KEY);
    } catch {
      // Storage blocked: nothing to clear.
    }
  }, [state]);

  // After a successful create, start the next form fresh. The uncontrolled
  // fields are cleared by remounting the form via its key.
  const [prevState, setPrevState] = useState(state);
  if (state !== prevState) {
    setPrevState(state);
    if (state.status === "success") {
      setName("");
      setSlug("");
      setSlugTouched(false);
    }
  }

  return (
    <form
      key={state.status === "success" ? state.message : "form"}
      action={formAction}
      className="space-y-5"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="cl-field">
          <label className="cl-label" htmlFor="biz-name">
            Business name
          </label>
          <input
            id="biz-name"
            name="name"
            required
            minLength={2}
            maxLength={120}
            className="cl-input"
            placeholder="Hodan Fashion"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="cl-field">
          <label className="cl-label" htmlFor="biz-slug">
            Store link
          </label>
          <div className="flex items-center gap-1 rounded-[0.625rem] border border-cl-border bg-cl-card pl-3 focus-within:border-cl-blue">
            <span className="shrink-0 text-sm text-cl-muted">abuur.so/</span>
            <input
              id="biz-slug"
              name="slug"
              required
              minLength={3}
              maxLength={60}
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
              title="Lowercase letters, digits and single dashes"
              className="cl-input !border-0 !pl-1 !shadow-none !ring-0"
              placeholder="hodan-fashion"
              value={shownSlug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value.toLowerCase());
              }}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="cl-field">
          <label className="cl-label" htmlFor="biz-phone">
            WhatsApp number for orders
          </label>
          <input
            id="biz-phone"
            name="phone"
            type="tel"
            maxLength={30}
            className="cl-input"
            placeholder="+252 61 000 0000"
          />
        </div>
        <div className="cl-field">
          <label className="cl-label" htmlFor="biz-address">
            Address <span className="font-normal text-cl-muted">(optional)</span>
          </label>
          <input
            id="biz-address"
            name="address"
            maxLength={500}
            className="cl-input"
            placeholder="Hodan district, Mogadishu"
          />
        </div>
      </div>

      <div className="cl-field">
        <label className="cl-label" htmlFor="biz-description">
          What do you sell? <span className="font-normal text-cl-muted">(optional)</span>
        </label>
        <textarea
          id="biz-description"
          name="description"
          rows={3}
          maxLength={2000}
          className="cl-input cl-textarea"
          placeholder="Women's clothing, garbasaar and accessories"
        />
      </div>

      <FormMessage state={state} />

      <button type="submit" disabled={pending} className="cl-btn cl-btn-primary w-full disabled:opacity-60 sm:w-auto">
        {pending ? "Creating…" : "Create business"}
      </button>
    </form>
  );
}
