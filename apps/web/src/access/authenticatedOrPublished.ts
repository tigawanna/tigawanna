import type { Access } from "payload";

/**
 * Authenticated users see everything; anonymous readers only see published docs.
 */
export const authenticatedOrPublished: Access = ({ req: { user } }) => {
  if (user) {
    return true;
  }

  return {
    _status: {
      equals: "published",
    },
  };
};
