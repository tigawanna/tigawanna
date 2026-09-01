import { createFormHook } from "@tanstack/react-form";
import {
  CheckboxField,
  EmailField,
  FieldErrorMessage,
  PasswordField,
  RadioGroupField,
  SelectField,
  SwitchField,
  TextAreaField,
  TextField,
} from "./field-components";
import { SubmitButton } from "./form-components";
import { fieldContext, formContext } from "./form-context";
import { MarkdownEditorField } from "./markdown-editor-field";

export const { useAppForm, withForm, withFieldGroup } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    CheckboxField,
    FieldErrorMessage,
    TextField,
    PasswordField,
    TextAreaField,
    EmailField,
    SelectField,
    RadioGroupField,
    SwitchField,
    MarkdownEditorField,
  },
  formComponents: {
    SubmitButton,
  },
});

export * from "./field-components";
export * from "./form-components";
export * from "./markdown-editor-field";
export { useFieldContext, useFormContext } from "./form-context";
