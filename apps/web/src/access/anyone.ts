import type { Access } from "payload";

/**
 * Public read access — used for cached portfolio content (repositories).
 */
export const anyone: Access = () => true;
