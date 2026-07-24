"use client";

import { useState, type FormEvent, useTransition } from "react";
import { toast } from "sonner";
import { sendContactMessage } from "@/actions/contact";
import { contactFormSchema, type ContactFormValues } from "./contact-schema";

const emptyValues: ContactFormValues = {
  name: "",
  contact: "",
  message: "",
};

const fieldClassName =
  "w-full rounded-none border border-base-content/15 bg-base-content/4 px-4 py-3 text-base text-base-content shadow-none outline-none transition-[border-color,box-shadow] placeholder:text-base-content/35 focus-visible:border-base-content/35 focus-visible:ring-1 focus-visible:ring-base-content/15";

/**
 * Contact form — validates on the client, submits via a Next.js server action.
 */
export function ContactForm() {
  const [values, setValues] = useState<ContactFormValues>(emptyValues);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof ContactFormValues, string>>>(
    {},
  );
  const [isPending, startTransition] = useTransition();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    event.stopPropagation();

    const parsed = contactFormSchema.safeParse(values);
    if (!parsed.success) {
      const nextErrors: Partial<Record<keyof ContactFormValues, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string" && !nextErrors[key as keyof ContactFormValues]) {
          nextErrors[key as keyof ContactFormValues] = issue.message;
        }
      }
      setFieldErrors(nextErrors);
      return;
    }

    setFieldErrors({});
    startTransition(async () => {
      try {
        await sendContactMessage(parsed.data);
        toast.success("Message sent", {
          description: "Thanks for reaching out, I'll get back to you soon.",
        });
        setValues(emptyValues);
      } catch (err: unknown) {
        toast.error("Failed to send message", {
          description: err instanceof Error ? err.message : "Unknown error",
        });
      }
    });
  }

  return (
    <form
      data-test="contact-form"
      onSubmit={onSubmit}
      className="mx-auto flex w-full max-w-xl flex-col gap-6 text-left"
    >
      <label className="flex flex-col gap-2 text-sm font-medium text-base-content/70">
        <span>Name</span>
        <input
          name="name"
          value={values.name}
          placeholder="Your name"
          autoComplete="name"
          className={fieldClassName}
          onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
        />
        {fieldErrors.name ? <span className="text-xs text-error">{fieldErrors.name}</span> : null}
      </label>

      <label className="flex flex-col gap-2 text-sm font-medium text-base-content/70">
        <span>Contact (optional)</span>
        <input
          id="contact-details"
          name="contact"
          value={values.contact ?? ""}
          placeholder="Email, phone, or anything to reach you"
          autoComplete="email"
          className={fieldClassName}
          onChange={(event) =>
            setValues((current) => ({ ...current, contact: event.target.value }))
          }
        />
      </label>

      <label className="flex flex-col gap-2 text-sm font-medium text-base-content/70">
        <span>Message</span>
        <textarea
          name="message"
          value={values.message}
          placeholder="What would you like to talk about?"
          rows={5}
          className={`${fieldClassName} min-h-36 resize-y leading-relaxed`}
          onChange={(event) =>
            setValues((current) => ({ ...current, message: event.target.value }))
          }
        />
        {fieldErrors.message ? (
          <span className="text-xs text-error">{fieldErrors.message}</span>
        ) : null}
      </label>

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 h-auto w-full justify-center rounded-full border border-landing-cream/15 bg-landing-cream px-6 py-3 text-sm font-medium text-landing-ink shadow-none transition-colors hover:bg-landing-cream-highlight disabled:opacity-40"
      >
        {isPending ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
