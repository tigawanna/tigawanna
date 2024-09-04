"use client";

import { useEffect, useRef, useState } from "react";
import { useFormState} from "react-dom";
import { SectionHeader } from "../shared/SectionHeader";
import { SubmitButton } from "./SubmitButton";
import {
  type ContactFormState,
  sendEmailwithBrevoSmtpAction,
} from "./utils/brevo-nodemailer";
import { testAction } from "./utils/test-action";

type ContactMeFormProps = {};

export function ContactMeForm({}: ContactMeFormProps) {

  const [formState, formAction] = useFormState<ContactFormState>(
    // @ts-expect-error
    sendEmailwithBrevoSmtpAction,
    {
      message: "",
      error: false,
      success: false,
      fieldValues: {
        sender_name: "",
        sender_email: "",
        sender_message: "",
      },
    },
  );
  const [status, setStatus] = useState({
    error: formState.error,
    success: formState.success,
  });
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (formState?.success) {
      formRef.current?.reset();
    }
    setStatus((prev) => {
      return { error: formState.error, success: formState.success };
    });
    const messageTimeout = setTimeout(() => {
      if (formState?.error) {
        setStatus((prev) => {
          return { ...prev, error: false };
        });
      }
      if (formState?.success) {
        setStatus((prev) => {
          return { ...prev, success: false };
        });
      }
    }, 8000);
    return () => {
      clearTimeout(messageTimeout);
    };
  }, [formState]);

  return (
    <div className="w-full h-full min-h-screen flex flex-col items-center justify-center lg:px-[10%]  rounded-lg  animate-in fade-in zoom-in duration-500 ">
      <SectionHeader heading="Talk to me" id="contact" />
      <form
        id="contact-form"
        ref={formRef}
        action={formAction}
        className="flex flex-col justify-center items-center gap-4 w-[95%] md:w-[70%] lg:w-[60%] min-w-[60%] h-fit glass p-5 rounded-xl "
      >
        {status?.error && (
          <div
            className="bg-base-300 text-error border border-error p-2 
          text-balance rounded-xl animate-in fade-in zoom-in duration-700"
          >
            {formState?.message}
          </div>
        )}
        {status?.success && (
          <div
            className="bg-base-300 text-success p-2 border border-success text-center text-balance 
         rounded-xl animate-in fade-in zoom-in duration-700"
          >
            {formState?.message}
          </div>
        )}

        <div className="w-full flex flex-col gap-1">
          <label
            htmlFor="sender_name"
            className="bg-base-200 rounded-xl p-1 w-fit"
          >
            Name
          </label>
          <input
            id="sender_name"
            type="text"
            placeholder="name"
            name="sender_name"
            className="input"
          />
        </div>

        <div className="w-full flex flex-col gap-1">
          <label
            htmlFor="sender_message"
            className="bg-base-200 rounded-xl p-1 w-fit"
          >
            Message
          </label>
          <textarea
            id="sender_message"
            name="sender_message"
            required
            className="textarea min-h-40"
            placeholder="Message"
          />
        </div>

        <div className="w-full flex flex-col gap-1">
          <label
            htmlFor="sender_contact"
            className="text-xs bg-base-200 rounded-xl p-1 w-fit"
          >
            How can i reach you (optional)
          </label>
          <input
            id="sender_contact"
            placeholder="contact information"
            type="text"
            name="sender_contct"
            className="input"
          />
        </div>
        <SubmitButton />
      </form>
    </div>
  );
}
