import type { StackTraceLine, StackTraceSegment } from "@/types/creature-feature";

const RAW_TRACE = [
  "tsc --noEmit",
  "audit.routes.ts:62:14 - error TS2322: Type",
  '  \'(c: Context<AppBindings, "/", { in: { query: { [x: string]: any;',
  "    page?: unknown; limit?: unknown; order?: unknown; search?: unknown;",
  "    sort?: unknown; entity?: unknown; action?: unknown } } }>)",
  "  => Promise<JSONRespondReturn<{ result: { page: number; perPage: number;",
  "    totalItems: number; totalPages: number; items: {",
  "      id: string; updated_at: Date | null; created_at: Date | null;",
  "      ipAddress: string | null; userId: string | null;",
  '      action: "UPDATE" | "DELETE" | "CREATE" | "LIST" | "LOGIN"',
  '        | "LOGOUT" | "PASSWORD_RESET" | "EMAIL_VERIFY";',
  "      table: string; oldData: Record<string, any> | null;",
  "      newData: Record<string, any> | null }[] }; error: null }, 200>",
  "  | JSONRespondReturn<{ result: null; error: {",
  '      readonly code: "parameters-required"; readonly message: string;',
  '      readonly data: Record<string, { code: "validation_failed";',
  "        message: string }> } }, 400>",
  "  | JSONRespondReturn<{ result: null; error: {",
  '      readonly code: "internal-server-error";',
  "      readonly message: string } }, 500>>'",
  '  is not assignable to type \'AppRouteHandler<{ path: "/";',
  '    method: "get"; tags: string[]; request: { query: ZodObject<',
  "      extendShape<{ page: ZodDefault<ZodNumber>;",
  "        limit: ZodDefault<ZodNumber>;",
  '        order: ZodDefault<ZodEnum<["asc", "desc"]>>;',
  "        search: ZodOptional<ZodString> }, {",
  '        sort: ZodOptional<ZodEnum<["created_at"]>>;',
  "        entity: ZodOptional<ZodEnum<any>>;",
  '        action: ZodOptional<ZodEnum<["LIST", "CREATE", "UPDATE"]>> }>>>\'.',
  "  Type 'Promise<JSONRespondReturn<...>>' is not assignable to type",
  "    'MaybePromise<RouteConfigToTypedResponse<...>>'.",
  "    Type 'JSONRespondReturn<{ result: {...}; error: null }, 200>'",
  "      is not assignable to type 'TypedResponse<{ result: {",
  "        items: { [x: string]: any; id?: undefined;",
  "          updated_at?: undefined; created_at?: undefined;",
  "          ipAddress?: undefined; userId?: undefined;",
  "          action?: undefined; table?: undefined;",
  '          oldData?: undefined; newData?: undefined }[] } }, 200, "json">\'.',
  "      The types of '_data.result.items' are incompatible between these types.",
  "        Type '{ id: string; updated_at: string | null; ... }[]'",
  "          is not assignable to type '{ [x: string]: any;",
  "            id?: undefined; updated_at?: undefined }[]'.",
  "          Types of property 'id' are incompatible.",
  "            Type 'string' is not assignable to type 'undefined'.",
  "Type instantiation is excessively deep and possibly infinite.",
];

const TAIL_TOKENS = [
  ">",
  "any",
  "}>",
  "null",
  ";",
  "ZodAny",
  "undefined",
  ")",
  "unknown",
  "}",
  "never",
  "...",
];

const HOT_PATTERNS: RegExp[] = [
  /error TS\d+:/,
  /is not assignable to type/,
  /is not assignable to parameter of type/,
  /is missing in type/,
  /are incompatible(?: between these types)?\.?/,
  /Type instantiation is excessively deep and possibly infinite\./,
  /Types of property '[^']+' are incompatible\./,
];

function leadingIndent(text: string): number {
  const match = text.match(/^\s*/);
  return match ? match[0].length : 0;
}

function segmentLine(text: string): StackTraceSegment[] {
  const trimmed = text.replace(/^\s+/, "");
  const segments: StackTraceSegment[] = [];
  let cursor = 0;

  while (cursor < trimmed.length) {
    let nearest: { index: number; length: number } | null = null;

    for (const pattern of HOT_PATTERNS) {
      const match = pattern.exec(trimmed.slice(cursor));
      if (match && (nearest === null || match.index < nearest.index)) {
        nearest = { index: match.index, length: match[0].length };
      }
    }

    if (!nearest) {
      segments.push({ text: trimmed.slice(cursor), tone: "base" });
      break;
    }

    if (nearest.index > 0) {
      segments.push({ text: trimmed.slice(cursor, cursor + nearest.index), tone: "base" });
    }
    segments.push({
      text: trimmed.slice(cursor + nearest.index, cursor + nearest.index + nearest.length),
      tone: "hot",
    });
    cursor += nearest.index + nearest.length;
  }

  return segments.length > 0 ? segments : [{ text: trimmed, tone: "base" }];
}

function buildTail(startId: number): StackTraceLine[] {
  const lines: StackTraceLine[] = [];
  const tailLength = 26;

  for (let step = 0; step < tailLength; step += 1) {
    const progress = step / (tailLength - 1);
    const drip = 1 - progress;
    if (Math.random() > 0.35 + drip * 0.55) {
      lines.push({
        id: startId + step,
        indent: 0,
        opacity: 0,
        segments: [{ text: "", tone: "dim" }],
      });
      continue;
    }
    const token = TAIL_TOKENS[Math.floor(Math.random() * TAIL_TOKENS.length)];
    const indent = Math.floor(progress * 14 + Math.random() * 6);
    lines.push({
      id: startId + step,
      indent,
      opacity: Math.max(0.04, drip * 0.7),
      segments: [{ text: token, tone: Math.random() > 0.8 ? "hot" : "dim" }],
    });
  }

  return lines;
}

export function getStackTraceLines(): StackTraceLine[] {
  const body: StackTraceLine[] = RAW_TRACE.map((text, index) => ({
    id: index,
    indent: Math.round(leadingIndent(text) / 2),
    opacity: 1,
    segments: segmentLine(text),
  }));

  return [...body, ...buildTail(body.length)];
}
