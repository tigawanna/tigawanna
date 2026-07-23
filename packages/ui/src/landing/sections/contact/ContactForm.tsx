import { useMutation } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { useLandingRuntime } from "../../provider";
import { contactFormSchema, type ContactFormValues } from "./contact-schema";

const emptyValues: ContactFormValues = {
  name: "",
  contact: "",
  message: "",
};

/**
 * Contact form for the shared landing package.
 * Submits through `LandingProvider.sendContactMessage` from the host app.
 */
export function ContactForm() {
  const { sendContactMessage } = useLandingRuntime();
  const [values, setValues] = useState<ContactFormValues>(emptyValues);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof ContactFormValues, string>>>(
    {},
  );

  const mutation = useMutation({
    mutationFn: async (value: ContactFormValues) => sendContactMessage(value),
    onSuccess() {
      toast.success("Message sent", {
        description: "Thanks for reaching out, I'll get back to you soon.",
      });
      setValues(emptyValues);
      setFieldErrors({});
    },
    onError(err: unknown) {
      toast.error("Failed to send message", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    },
  });

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
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
    await mutation.mutateAsync(parsed.data);
  }

  return (
    <form
      data-test="contact-form"
      onSubmit={(event) => {
        void onSubmit(event);
      }}
      className="mx-auto flex w-full max-w-xl flex-col gap-6 text-left [&_input]:rounded-none [&_input]:border-0 [&_input]:border-b [&_input]:border-base-content/20 [&_input]:bg-transparent [&_input]:px-0 [&_input]:text-base-content [&_input]:shadow-none [&_input]:placeholder:text-base-content/35 [&_label]:text-sm [&_label]:font-medium [&_label]:text-base-content/70 [&_textarea]:min-h-32 [&_textarea]:rounded-none [&_textarea]:border-0 [&_textarea]:border-b [&_textarea]:border-base-content/20 [&_textarea]:bg-transparent [&_textarea]:px-0 [&_textarea]:text-base-content [&_textarea]:shadow-none [&_textarea]:placeholder:text-base-content/35"
    >
      <label className="flex flex-col gap-2">
        <span>Name</span>
        <input
          name="name"
          value={values.name}
          placeholder="Your name"
          onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
        />
        {fieldErrors.name ? <span className="text-xs text-error">{fieldErrors.name}</span> : null}
      </label>

      <label className="flex flex-col gap-2">
        <span>Contact (optional)</span>
        <input
          id="contact-details"
          name="contact"
          value={values.contact ?? ""}
          placeholder="Email, phone, or anything to reach you"
          onChange={(event) =>
            setValues((current) => ({ ...current, contact: event.target.value }))
          }
        />
      </label>

      <label className="flex flex-col gap-2">
        <span>Message</span>
        <textarea
          name="message"
          value={values.message}
          placeholder="What would you like to talk about?"
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
        disabled={mutation.isPending}
        className="mt-2 h-auto w-full justify-center rounded-full border border-landing-cream/15 bg-landing-cream px-6 py-3 text-sm font-medium text-landing-ink shadow-none transition-colors hover:bg-landing-cream-highlight disabled:opacity-40"
      >
        {mutation.isPending ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
