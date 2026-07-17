export type WebMcpJsonSchema = {
  type: "object";
  properties?: Record<string, Record<string, unknown>>;
  required?: string[];
};

export type WebMcpToolDefinition = {
  name: string;
  description: string;
  inputSchema: WebMcpJsonSchema;
  execute: (args: Record<string, unknown>) => unknown;
};

export type WebMcpRegisterOptions = {
  signal?: AbortSignal;
  exposedTo?: string[];
};

export type WebMcpModelContext = {
  registerTool: (tool: WebMcpToolDefinition, options?: WebMcpRegisterOptions) => void;
};

declare global {
  interface Document {
    modelContext?: WebMcpModelContext;
  }
}
