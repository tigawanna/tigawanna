export type AiStorageType = "local" | "session";

export interface AiCredentials {
  apiKey: string;
  model: string;
}

export interface AiSettings extends AiCredentials {
  storageType: AiStorageType;
}

export const DEFAULT_CHAT_MODEL = "deepseek/deepseek-chat-v3-0324";
export const DEFAULT_EMBEDDING_MODEL = "openai/text-embedding-3-small";
