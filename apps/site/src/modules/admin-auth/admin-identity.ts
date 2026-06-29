import { getServerEnv } from "@/lib/envs/server-env";

const defaultAdminEmail = "admin@backstage.local";

export function getAdminIdentity() {
  const email = getServerEnv().ADMIN_EMAIL.trim() || defaultAdminEmail;
  const name = email.split("@")[0]?.trim() || "Admin";

  return { email, name };
}
