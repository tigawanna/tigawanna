import { Button } from "@/components/ui/button";
import type { ComponentProps } from "react";
import { useFormContext } from "./form-context";

interface SubmitButtonProps {
  label?: string;
  className?: string;
  children?: React.ReactNode;
  variant?: ComponentProps<typeof Button>["variant"];
  size?: ComponentProps<typeof Button>["size"];
}

export function SubmitButton({
  label = "Submit",
  className,
  children,
  variant,
  size,
}: SubmitButtonProps) {
  const form = useFormContext();

  return (
    <form.Subscribe
      selector={(state) => ({
        isSubmitting: state.isSubmitting,
        canSubmit: state.canSubmit,
        isPristine: state.isPristine,
      })}
    >
      {({ isSubmitting, canSubmit, isPristine }) => (
        <Button
          type="submit"
          variant={variant}
          size={size}
          disabled={isSubmitting || !canSubmit || isPristine}
          className={className}
        >
          {children || (isSubmitting ? "Submitting..." : label)}
        </Button>
      )}
    </form.Subscribe>
  );
}
