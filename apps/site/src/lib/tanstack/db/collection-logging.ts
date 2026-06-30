import type {
  DeleteMutationFnParams,
  InsertMutationFnParams,
  UpdateMutationFnParams,
} from "@tanstack/db";

const LOG_PREFIX = "[TanStack DB]";

/**
 * Returns true when TanStack DB collection debug logging is enabled.
 */
export function isTanstackDbCollectionLoggingEnabled(): boolean {
  return import.meta.env.DEV;
}

/**
 * Logs a TanStack DB collection message when dev logging is enabled.
 */
export function logTanstackDbCollection(collectionId: string, message: string, data?: unknown) {
  if (!isTanstackDbCollectionLoggingEnabled()) {
    return;
  }

  if (data === undefined) {
    console.debug(`${LOG_PREFIX} ${collectionId} ${message}`);
    return;
  }

  console.debug(`${LOG_PREFIX} ${collectionId} ${message}`, data);
}

type MutationSummary = {
  key: unknown;
  type: string;
};

function summarizeMutations(mutations: Array<{ key: unknown; type: string }>): MutationSummary[] {
  return mutations.map((mutation) => ({
    key: mutation.key,
    type: mutation.type,
  }));
}

/**
 * Wraps a collection `onInsert` handler with start/success/error logging.
 */
export function withCollectionInsertLogging<T extends object, TKey extends string | number>(
  collectionId: string,
  handler: (params: InsertMutationFnParams<T, TKey>) => Promise<unknown>,
) {
  return async (params: InsertMutationFnParams<T, TKey>) => {
    const startedAt = performance.now();
    const mutations = summarizeMutations(params.transaction.mutations);

    logTanstackDbCollection(collectionId, "onInsert:start", {
      transactionId: params.transaction.id,
      mutations,
    });

    try {
      const result = await handler(params);
      logTanstackDbCollection(collectionId, "onInsert:success", {
        transactionId: params.transaction.id,
        mutations,
        durationMs: Math.round(performance.now() - startedAt),
        result,
      });
      return result;
    } catch (err: unknown) {
      logTanstackDbCollection(collectionId, "onInsert:error", {
        transactionId: params.transaction.id,
        mutations,
        durationMs: Math.round(performance.now() - startedAt),
        error: err,
      });
      throw err;
    }
  };
}

/**
 * Wraps a collection `onUpdate` handler with start/success/error logging.
 */
export function withCollectionUpdateLogging<T extends object, TKey extends string | number>(
  collectionId: string,
  handler: (params: UpdateMutationFnParams<T, TKey>) => Promise<unknown>,
) {
  return async (params: UpdateMutationFnParams<T, TKey>) => {
    const startedAt = performance.now();
    const mutations = summarizeMutations(params.transaction.mutations);

    logTanstackDbCollection(collectionId, "onUpdate:start", {
      transactionId: params.transaction.id,
      mutations,
    });

    try {
      const result = await handler(params);
      logTanstackDbCollection(collectionId, "onUpdate:success", {
        transactionId: params.transaction.id,
        mutations,
        durationMs: Math.round(performance.now() - startedAt),
        result,
      });
      return result;
    } catch (err: unknown) {
      logTanstackDbCollection(collectionId, "onUpdate:error", {
        transactionId: params.transaction.id,
        mutations,
        durationMs: Math.round(performance.now() - startedAt),
        error: err,
      });
      throw err;
    }
  };
}

/**
 * Wraps a collection `onDelete` handler with start/success/error logging.
 */
export function withCollectionDeleteLogging<T extends object, TKey extends string | number>(
  collectionId: string,
  handler: (params: DeleteMutationFnParams<T, TKey>) => Promise<unknown>,
) {
  return async (params: DeleteMutationFnParams<T, TKey>) => {
    const startedAt = performance.now();
    const mutations = summarizeMutations(params.transaction.mutations);

    logTanstackDbCollection(collectionId, "onDelete:start", {
      transactionId: params.transaction.id,
      mutations,
    });

    try {
      const result = await handler(params);
      logTanstackDbCollection(collectionId, "onDelete:success", {
        transactionId: params.transaction.id,
        mutations,
        durationMs: Math.round(performance.now() - startedAt),
        result,
      });
      return result;
    } catch (err: unknown) {
      logTanstackDbCollection(collectionId, "onDelete:error", {
        transactionId: params.transaction.id,
        mutations,
        durationMs: Math.round(performance.now() - startedAt),
        error: err,
      });
      throw err;
    }
  };
}

/**
 * Wraps a query collection `queryFn` with fetch logging and result counts.
 */
export function withCollectionQueryLogging<T>(
  collectionId: string,
  queryFn: () => Promise<T>,
): () => Promise<T> {
  return async () => {
    const startedAt = performance.now();
    logTanstackDbCollection(collectionId, "queryFn:start");

    try {
      const data = await queryFn();
      logTanstackDbCollection(collectionId, "queryFn:success", {
        durationMs: Math.round(performance.now() - startedAt),
        resultSummary: summarizeQueryResult(data),
      });
      return data;
    } catch (err: unknown) {
      logTanstackDbCollection(collectionId, "queryFn:error", {
        durationMs: Math.round(performance.now() - startedAt),
        error: err,
      });
      throw err;
    }
  };
}

function summarizeQueryResult(data: unknown) {
  if (Array.isArray(data)) {
    return { kind: "array" as const, count: data.length };
  }

  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    if (Array.isArray(record.repos)) {
      return { kind: "repos" as const, count: record.repos.length };
    }
    if (Array.isArray(record.data)) {
      return { kind: "data" as const, count: record.data.length };
    }
  }

  return { kind: "unknown" as const };
}

type CollectionWithLogging = {
  id?: string;
  subscribeChanges: (callback: (changes: Array<{ type: string; key: unknown }>) => void) => {
    unsubscribe: () => void;
  };
  on: (
    event: "status:change",
    callback: (event: { previousStatus: string; status: string }) => void,
  ) => () => void;
  utils?: {
    refetch?: (opts?: { throwOnError?: boolean }) => Promise<unknown>;
  };
};

/**
 * Attaches change and status listeners to a collection in dev mode.
 *
 * @param collection - TanStack DB collection instance.
 * @param collectionId - Label used in log output.
 */
export function attachTanstackDbCollectionLogging(
  collection: CollectionWithLogging,
  collectionId: string,
) {
  if (!isTanstackDbCollectionLoggingEnabled()) {
    return;
  }

  const changeSubscription = collection.subscribeChanges((changes) => {
    logTanstackDbCollection(collectionId, "changes", {
      count: changes.length,
      changes: changes.map((change) => ({
        type: change.type,
        key: change.key,
      })),
    });
  });

  collection.on("status:change", (event) => {
    logTanstackDbCollection(collectionId, "status:change", {
      from: event.previousStatus,
      to: event.status,
    });
  });

  const utils = collection.utils;
  if (utils?.refetch) {
    const originalRefetch = utils.refetch.bind(utils);
    utils.refetch = async (opts?: { throwOnError?: boolean }) => {
      const startedAt = performance.now();
      logTanstackDbCollection(collectionId, "refetch:start");
      try {
        const result = await originalRefetch(opts);
        logTanstackDbCollection(collectionId, "refetch:success", {
          durationMs: Math.round(performance.now() - startedAt),
          resultSummary: summarizeQueryResult(result),
        });
        return result;
      } catch (err: unknown) {
        logTanstackDbCollection(collectionId, "refetch:error", {
          durationMs: Math.round(performance.now() - startedAt),
          error: err,
        });
        throw err;
      }
    };
  }

  logTanstackDbCollection(collectionId, "logging:attached");

  return () => {
    changeSubscription.unsubscribe();
  };
}
