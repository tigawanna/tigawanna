import { Button } from "@/components/ui/button";
import { unwrapUnknownError } from "@/utils/errors";
import { AppConfig } from "@/utils/system";
import { Check, Copy, Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ContactForm } from "./ContactForm";
import { LandingSection, OrganicDivider, ScrollReveal, SectionEyebrow } from "./LandingPrimitives";

export function LandingCTA() {
  const [emailCopied, setEmailCopied] = useState(false);

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(AppConfig.links.email);
      setEmailCopied(true);
      toast.success("Email copied");
      window.setTimeout(() => setEmailCopied(false), 2000);
    } catch (err: unknown) {
      toast.error("Could not copy email", {
        description: unwrapUnknownError(err).message,
      });
    }
  }

  return (
    <LandingSection id="contact" tone="base" className="pb-12 text-base-content md:pb-16">
      <OrganicDivider tone="base" />
      <OrganicDivider tone="base" flip />

      <div className="container relative z-10">
        <ScrollReveal>
          <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2.5rem] border border-primary/20 bg-primary/10 p-6 shadow-2xl shadow-black/20 backdrop-blur-md md:p-10">
            <div className="absolute top-0 right-0 size-72 -translate-y-1/2 translate-x-1/3 rounded-full bg-primary/20 blur-3xl" />
            <div className="absolute bottom-0 left-0 size-64 -translate-x-1/2 translate-y-1/2 rounded-full bg-accent/15 blur-3xl" />

            <div className="relative z-10 grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
              <div>
                <SectionEyebrow>Contact</SectionEyebrow>
                <h2 className="font-serif text-5xl leading-none font-semibold tracking-[-0.045em] md:text-7xl">
                  Let&apos;s make the next system less haunted.
                </h2>
                <p className="mt-6 text-lg leading-8 text-base-content/70">
                  Open to projects, collaborations, and useful conversations about TypeScript,
                  product architecture, and web systems.
                </p>

                <div
                  data-test="contact-email-copy"
                  className="mt-8 inline-flex max-w-full items-stretch overflow-hidden rounded-xl border border-base-content/15 bg-base-100/40"
                >
                  <a
                    href={AppConfig.links.emailTo}
                    className="inline-flex min-w-0 items-center gap-2 px-4 py-3 text-sm text-base-content/80 transition-colors hover:text-base-content"
                  >
                    <Mail className="size-4 shrink-0" />
                    <span className="truncate">{AppConfig.links.email}</span>
                  </a>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    data-test="contact-email-copy-button"
                    aria-label="Copy email address"
                    className="h-auto shrink-0 rounded-none border-l border-base-content/15 px-4 py-3"
                    onClick={copyEmail}
                  >
                    {emailCopied ? <Check className="size-4" /> : <Copy className="size-4" />}
                    {emailCopied ? "Copied" : "Copy"}
                  </Button>
                </div>
              </div>

              <div className="rounded-[2rem] border border-base-content/10 bg-base-300/80 p-5 text-base-content shadow-xl shadow-black/15 md:p-7">
                <ContactForm />
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </LandingSection>
  );
}
