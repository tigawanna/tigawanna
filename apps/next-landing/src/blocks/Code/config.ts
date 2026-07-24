import type { Block } from "payload";

export const Code: Block = {
  slug: "code",
  interfaceName: "CodeBlock",
  fields: [
    {
      name: "language",
      type: "select",
      defaultValue: "typescript",
      options: [
        { label: "TypeScript", value: "typescript" },
        { label: "JavaScript", value: "javascript" },
        { label: "TSX", value: "tsx" },
        { label: "JSX", value: "jsx" },
        { label: "CSS", value: "css" },
        { label: "HTML", value: "html" },
        { label: "JSON", value: "json" },
        { label: "Bash", value: "bash" },
        { label: "SQL", value: "sql" },
        { label: "Plain text", value: "plaintext" },
      ],
    },
    {
      name: "code",
      type: "code",
      label: false,
      required: true,
    },
  ],
};
