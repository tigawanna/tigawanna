"use client";

import { Highlight, themes } from "prism-react-renderer";
import { CopyButton } from "./CopyButton";

type Props = {
  code: string;
  language?: string;
};

/**
 * Client-side Prism highlighter for Lexical code blocks.
 */
export function Code({ code, language = "typescript" }: Props) {
  if (!code) return null;

  return (
    <div className="not-prose relative my-6 overflow-hidden rounded-xl border border-base-content/10 bg-base-200/60">
      <div className="flex items-center justify-between border-b border-base-content/10 px-4 py-2">
        <span className="text-[0.65rem] font-semibold tracking-[0.18em] text-base-content/50 uppercase">
          {language}
        </span>
        <CopyButton code={code} />
      </div>
      <Highlight code={code} language={language} theme={themes.vsDark}>
        {({ getLineProps, getTokenProps, tokens }) => (
          <pre className="overflow-x-auto p-4 text-sm leading-6">
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })}>
                <span className="mr-4 inline-block w-6 select-none text-right text-base-content/30">
                  {i + 1}
                </span>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  );
}
