import type { ReactNode } from "react";
import {
  AlertTriangle,
  CircleAlert,
  Info,
  Lightbulb,
  MessageSquareWarning,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";
import type { CalloutVariant } from "./prepare-article-content";

const VARIANT_UI: Record<
  CalloutVariant,
  {
    label: string;
    Icon: LucideIcon;
    /** Shared accent for rail + icon + title (via `currentColor`). */
    accent: string;
    /** Soft wash behind the alert body. */
    wash: string;
  }
> = {
  note: {
    label: "Note",
    Icon: Info,
    accent: "text-info",
    wash: "bg-info/8",
  },
  tip: {
    label: "Tip",
    Icon: Lightbulb,
    accent: "text-success",
    wash: "bg-success/8",
  },
  important: {
    label: "Important",
    Icon: MessageSquareWarning,
    // GFM Important is purple; theme has no purple token, so pin the classic alert hue.
    accent: "text-[oklch(0.72_0.14_300)]",
    wash: "bg-[oklch(0.72_0.14_300)]/10",
  },
  warning: {
    label: "Warning",
    Icon: AlertTriangle,
    accent: "text-warning",
    wash: "bg-warning/10",
  },
  caution: {
    label: "Caution",
    Icon: CircleAlert,
    accent: "text-error",
    wash: "bg-error/10",
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
 * GFM-style alert: colored leading edge, icon + title on one row, body below.
 * Rail, icon, and label all use the same `currentColor` so they stay in sync.
 */
export function Callout({ variant, children, className, showLabel = true }: CalloutProps) {
  const ui = VARIANT_UI[variant];
  const Icon = ui.Icon;

  return (
    <aside
      data-test="richtext-callout"
      data-variant={variant}
      className={cn(
        "not-prose my-6 flex overflow-hidden rounded-md",
        ui.wash,
        ui.accent,
        className,
      )}
    >
      {/* Leading accent — paints with the same currentColor as icon + title. */}
      <span className="w-1 shrink-0 self-stretch bg-current" aria-hidden="true" />

      <div className="min-w-0 flex-1 px-4 py-3 text-base-content sm:px-4 sm:py-3.5">
        {showLabel ? (
          <p
            className={cn(
              "mb-2 flex items-center gap-2 text-[0.95rem] leading-none font-semibold",
              ui.accent,
            )}
          >
            <Icon className="size-4 shrink-0 stroke-[2.25] text-current" aria-hidden="true" />
            <span className="text-current">{ui.label}</span>
          </p>
        ) : null}

        <div
          className={cn(
            "text-[0.95rem] leading-7 text-base-content/85",
            "[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-3",
            "[&_code]:rounded-md [&_code]:bg-base-100/45 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[0.86em]",
            "[&_p]:my-0 [&_p+p]:mt-2",
          )}
        >
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
