import { useAppForm } from "@/lib/tanstack/form";
import { sendContactMessage } from "@/routes/-components/landing/sections/contact/contact.functions";
import {
  contactFormSchema,
  type ContactFormValues,
} from "@/routes/-components/landing/sections/contact/contact-schema";
import { formOptions } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";

const formOpts = formOptions({
  defaultValues: {
    name: "",
    contact: "",
    message: "",
  } satisfies ContactFormValues,
});

export function ContactForm() {
  const mutation = useMutation({
    mutationFn: async (value: ContactFormValues) => {
      return sendContactMessage({ data: value });
    },
    onSuccess() {
      toast.success("Message sent", {
        description: "Thanks for reaching out, I'll get back to you soon.",
      });
    },
    onError(err: unknown) {
      toast.error("Failed to send message", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    },
  });

  const form = useAppForm({
    ...formOpts,
    validators: {
      onSubmit: contactFormSchema,
    },
    onSubmit: async ({ value, formApi }) => {
      await mutation.mutateAsync(value);
      formApi.reset();
    },
  });

  return (
    <form
      data-test="contact-form"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void form.handleSubmit();
      }}
      className="mx-auto flex w-full max-w-xl flex-col gap-6 text-left [&_input]:rounded-none [&_input]:border-0 [&_input]:border-b [&_input]:border-base-content/20 [&_input]:bg-transparent [&_input]:px-0 [&_input]:text-base-content [&_input]:shadow-none [&_input]:placeholder:text-base-content/35 [&_label]:text-sm [&_label]:font-medium [&_label]:text-base-content/70 [&_textarea]:min-h-32 [&_textarea]:rounded-none [&_textarea]:border-0 [&_textarea]:border-b [&_textarea]:border-base-content/20 [&_textarea]:bg-transparent [&_textarea]:px-0 [&_textarea]:text-base-content [&_textarea]:shadow-none [&_textarea]:placeholder:text-base-content/35"
    >
      <form.AppField
        name="name"
        validators={{ onChange: z.string().min(2, "Please enter your name") }}
      >
        {(field) => <field.TextField label="Name" placeholder="Your name" />}
      </form.AppField>

      <form.AppField name="contact">
        {(field) => (
          <field.TextField
            id="contact-details"
            label="Contact (optional)"
            placeholder="Email, phone, or anything to reach you"
          />
        )}
      </form.AppField>

      <form.AppField
        name="message"
        validators={{ onChange: z.string().min(10, "Please write at least a few words") }}
      >
        {(field) => (
          <field.TextAreaField label="Message" placeholder="What would you like to talk about?" />
        )}
      </form.AppField>

      <form.AppForm>
        <form.SubmitButton
          label="Send message"
          className="btn btn-ghost w-full justify-start px-0 text-base-content underline-offset-4 hover:underline"
        />
      </form.AppForm>
    </form>
  );
}
