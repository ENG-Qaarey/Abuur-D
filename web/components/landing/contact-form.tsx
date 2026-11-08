"use client";

import { useActionState, useEffect, useRef } from "react";
import { contactAction } from "@/lib/actions/contact";
import { IDLE } from "@/lib/types";
import { FormMessage } from "@/components/ui/form-message";

const TOPICS = [
  { value: "SALES", label: "I want to open a store" },
  { value: "SUPPORT", label: "Help with my account or store" },
  { value: "PARTNERSHIP", label: "Partnership" },
  { value: "OTHER", label: "Something else" },
] as const;

export function ContactForm() {
  const [state, formAction, pending] = useActionState(contactAction, IDLE);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
  }, [state]);

  return (
    <div className="cl-card cl-panel p-6 sm:p-8">
      <h3 className="text-xl font-semibold text-cl-text">Send us a message</h3>
      <p className="mt-2 text-sm text-cl-muted">
        Tell us about your business and we&apos;ll get back to you by email or phone.
      </p>

      <form ref={formRef} action={formAction} className="mt-6 space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="cl-field">
            <label className="cl-label" htmlFor="contact-name">
              Full name
            </label>
            <input
              id="contact-name"
              name="name"
              type="text"
              autoComplete="name"
              required
              minLength={2}
              maxLength={120}
              className="cl-input"
              placeholder="Hodan Ali"
            />
          </div>
          <div className="cl-field">
            <label className="cl-label" htmlFor="contact-business">
              Business name <span className="font-normal text-cl-muted">(optional)</span>
            </label>
            <input
              id="contact-business"
              name="businessName"
              type="text"
              autoComplete="organization"
              maxLength={120}
              className="cl-input"
              placeholder="Hodan Fashion"
            />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="cl-field">
            <label className="cl-label" htmlFor="contact-email">
              Email address
            </label>
            <input
              id="contact-email"
              name="email"
              type="email"
              autoComplete="email"
              maxLength={254}
              className="cl-input"
              placeholder="you@example.com"
            />
          </div>
          <div className="cl-field">
            <label className="cl-label" htmlFor="contact-phone">
              Phone / WhatsApp
            </label>
            <input
              id="contact-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              pattern="\+?[0-9 ()\-]{6,30}"
              className="cl-input"
              placeholder="+252 61 000 0000"
            />
          </div>
        </div>
        <p className="-mt-2 text-xs text-cl-muted">Give us at least an email or a phone number.</p>

        <div className="cl-field">
          <label className="cl-label" htmlFor="contact-topic">
            Topic
          </label>
          <select id="contact-topic" name="topic" required defaultValue="SALES" className="cl-input cl-select">
            {TOPICS.map((topic) => (
              <option key={topic.value} value={topic.value}>
                {topic.label}
              </option>
            ))}
          </select>
        </div>

        <div className="cl-field">
          <label className="cl-label" htmlFor="contact-message">
            Message
          </label>
          <textarea
            id="contact-message"
            name="message"
            required
            minLength={10}
            maxLength={2000}
            rows={5}
            className="cl-input cl-textarea"
            placeholder="What do you sell, and how can we help?"
          />
        </div>

        {/* Honeypot: hidden from people, bots fill it in. */}
        <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label htmlFor="contact-website">Website</label>
          <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>

        <FormMessage state={state} />

        <button type="submit" disabled={pending} className="cl-btn cl-btn-primary w-full disabled:opacity-60 sm:w-auto">
          {pending ? "Sending…" : "Send message"}
        </button>
      </form>
    </div>
  );
}
