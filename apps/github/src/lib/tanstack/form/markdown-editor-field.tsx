import { ClientOnly } from "@/components/wrappers/ClientOnly";
import { Field, FieldContent, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { useTheme } from "@/lib/tanstack/router/use-theme";
import "@uiw/react-md-editor/markdown-editor.css";
import { lazy, Suspense } from "react";
import { FieldErrorMessage, type BaseFieldProps } from "./field-components";
import { useFieldContext } from "./form-context";

const LazyMDEditor = lazy(() => import("@uiw/react-md-editor/common"));

type MarkdownEditorFieldProps = BaseFieldProps & {
  /** Editor height in pixels. */
  height?: number;
};

/**
 * TanStack Form field wrapping `@uiw/react-md-editor` with live preview.
 * Client-only so the editor does not run during SSR.
 */
export function MarkdownEditorField({
  label,
  description,
  placeholder,
  className,
  orientation = "vertical",
  height = 360,
}: MarkdownEditorFieldProps) {
  const field = useFieldContext<string>();
  const errors = (field.state.meta.errors ?? []).filter(Boolean);
  const invalid = errors.length > 0;
  const fieldLabel = label || (field.name as string);
  const fieldPlaceholder = placeholder || `Enter ${fieldLabel}`;
  const { theme } = useTheme();
  const value = field.state.value ?? "";

  const fallback = (
    <Textarea
      id={field.name as string}
      name={field.name as string}
      placeholder={fieldPlaceholder}
      aria-invalid={invalid}
      className="font-mono text-sm"
      style={{ minHeight: height }}
      value={value}
      onBlur={field.handleBlur}
      onChange={(event) => field.handleChange(event.target.value)}
    />
  );

  return (
    <Field data-invalid={invalid} orientation={orientation} className={className}>
      <FieldLabel htmlFor={field.name as string}>{fieldLabel}</FieldLabel>
      {description ? <FieldDescription>{description}</FieldDescription> : null}
      <FieldContent>
        <div data-color-mode={theme} className="w-full overflow-hidden rounded-md">
          <ClientOnly fallback={fallback}>
            <Suspense fallback={fallback}>
              <LazyMDEditor
                id={field.name as string}
                value={value}
                height={height}
                preview="live"
                textareaProps={{
                  id: field.name as string,
                  name: field.name as string,
                  placeholder: fieldPlaceholder,
                  onBlur: field.handleBlur,
                }}
                onChange={(next) => field.handleChange(next ?? "")}
              />
            </Suspense>
          </ClientOnly>
        </div>
      </FieldContent>
      <FieldErrorMessage />
    </Field>
  );
}
