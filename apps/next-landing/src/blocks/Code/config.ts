import type { Block } from "payload";

/** Languages allowed on the Code block select — keep in sync with Prism highlighting. */
export const CODE_BLOCK_LANGUAGES = [
  { label: "TypeScript", value: "typescript" },
  { label: "JavaScript", value: "javascript" },
  { label: "TSX", value: "tsx" },
  { label: "JSX", value: "jsx" },
  { label: "CSS", value: "css" },
  { label: "HTML", value: "html" },
  { label: "JSON", value: "json" },
  { label: "Bash", value: "bash" },
  { label: "Shell", value: "shell" },
  { label: "SQL", value: "sql" },
  { label: "GraphQL", value: "graphql" },
  { label: "YAML", value: "yaml" },
  { label: "Markdown", value: "markdown" },
  { label: "Kotlin", value: "kotlin" },
  { label: "Java", value: "java" },
  { label: "XML", value: "xml" },
  { label: "Diff", value: "diff" },
  { label: "Dockerfile", value: "dockerfile" },
  { label: "Plain text", value: "plaintext" },
] as const;

export type CodeBlockLanguage = (typeof CODE_BLOCK_LANGUAGES)[number]["value"];

export const Code: Block = {
  slug: "code",
  interfaceName: "CodeBlock",
  fields: [
    {
      name: "language",
      type: "select",
      defaultValue: "typescript",
      options: [...CODE_BLOCK_LANGUAGES],
    },
    {
      name: "code",
      type: "code",
      label: false,
      required: true,
    },
  ],
};
