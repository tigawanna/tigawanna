import config from "@payload-config";
import { headers as getHeaders } from "next/headers";
import { getPayload, type Payload, type TypedUser } from "payload";

/**
 * Resolves Payload + logged-in admin user from request cookies.
 * Returns null when unauthenticated.
 */
export async function requirePayloadUser(): Promise<{
  payload: Payload;
  user: TypedUser;
} | null> {
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: await getHeaders() });
  if (!user) return null;
  return { payload, user };
}
