import type { AccessArgs } from "payload";

import type { User } from "@/payload-types";

/**
 * Returns true when the request has a logged-in Payload user.
 */
export const authenticated = ({ req: { user } }: AccessArgs<User>): boolean => {
  return Boolean(user);
};
