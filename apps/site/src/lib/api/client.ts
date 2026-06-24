export type PaginatedResponse<T> = {
  items: T[];
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
};

export const honoClient = {} as {
  api: Record<string, { $get: (opts: unknown) => Promise<unknown> }>;
};
