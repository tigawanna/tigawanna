import { Code } from "./Component.client";

export type CodeBlockProps = {
  code: string;
  language?: string | null;
  blockType: "code";
};

type Props = CodeBlockProps & {
  className?: string;
};

/**
 * Server wrapper for the highlighted code block.
 */
export function CodeBlock({ className, code, language }: Props) {
  return (
    <div className={className}>
      <Code code={code} language={language ?? "typescript"} />
    </div>
  );
}
