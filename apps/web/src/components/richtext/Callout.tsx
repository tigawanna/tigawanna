import type { ReactNode } from "react";
import { AlertTriangle, Ban, Info, Lightbulb, OctagonAlert, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import type { CalloutVariant } from "./prepare-article-content";

const VARIANT_UI: Record<
  CalloutVariant,
  {
    label: string;
    Icon: LucideIcon;
    frame: string;
    icon: string;
    labelClass: string;
  }
> = {
  note: {
    label: "Note",
    Icon: Info,
    frame: "border-info/35 bg-info/8",
    icon: "text-info",
    labelClass: "text-info",
  },
  tip: {
    label: "Tip",
    Icon: Lightbulb,
    frame: "border-success/35 bg-success/8",
    icon: "text-success",
    labelClass: "text-success",
  },
  warning: {
    label: "Warning",
    Icon: AlertTriangle,
    frame: "border-warning/40 bg-warning/10",
    icon: "text-warning",
    labelClass: "text-warning",
  },
  important: {
    label: "Important",
    Icon: OctagonAlert,
    frame: "border-accent/40 bg-accent/10",
    icon: "text-accent",
    labelClass: "text-accent",
  },
  caution: {
    label: "Caution",
    Icon: Ban,
    frame: "border-error/40 bg-error/10",
    icon: "text-error",
    labelClass: "text-error",
  },
};

type CalloutProps = {
  variant: CalloutVariant;
  children: ReactNode;
  className?: string;
  /** When false, skip the built-in label (content already includes one). */
  showLabel?: boolean;
};

/**
 * GFM-style alert / callout used for Note, Tip, Warning, Important, Caution.
 */
export function Callout({ variant, children, className, showLabel = true }: CalloutProps) {
  const ui = VARIANT_UI[variant];
  const Icon = ui.Icon;

  return (
    <aside
      data-test="richtext-callout"
      data-variant={variant}
      className={cn("not-prose my-7 overflow-hidden rounded-xl border", ui.frame, className)}
    >
      <div className="flex gap-3 px-4 py-3.5 sm:gap-3.5 sm:px-5 sm:py-4">
        <span
          className={cn(
            "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-base-100/40",
            ui.icon,
          )}
          aria-hidden="true"
        >
          <Icon className="size-4 stroke-[2.25]" />
        </span>
        <div className="min-w-0 flex-1 text-[0.95rem] leading-7 text-base-content/85 [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-3 [&_code]:rounded-md [&_code]:bg-base-100/50 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[0.86em] [&_p]:my-0 [&_p+p]:mt-2">
          {showLabel ? (
            <p
              className={cn(
                "mb-1 text-[0.7rem] font-semibold tracking-[0.18em] uppercase",
                ui.labelClass,
              )}
            >
              {ui.label}
            </p>
          ) : null}
          {children}
        </div>
      </div>
    </aside>
  );
}

/**
 * Maps Payload Banner block styles onto GFM callout variants.
 *
 * @param style - Banner `style` field value.
 */
export function bannerStyleToCallout(
  style: "info" | "warning" | "error" | "success" | null | undefined,
): CalloutVariant {
  switch (style) {
    case "warning":
      return "warning";
    case "error":
      return "caution";
    case "success":
      return "tip";
    case "info":
    default:
      return "note";
  }
}
