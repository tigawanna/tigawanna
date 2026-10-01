"use client";

import { Link, useConfig } from "@payloadcms/ui";
import { usePathname } from "next/navigation";

type AdminViewNavLinkProps = {
  /** Custom view path under the admin route, e.g. `/devto`. */
  viewPath: string;
  label: string;
};

/**
 * Sidebar link to a custom admin view (passed via `clientProps` in `afterNavLinks`).
 */
export function AdminViewNavLink({ viewPath, label }: AdminViewNavLinkProps) {
  const { config } = useConfig();
  const pathname = usePathname();
  const href = `${config.routes.admin}${viewPath}`;
  const active = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      className={active ? "nav__link active" : "nav__link"}
      href={href}
      prefetch={false}
      style={{ display: "block", marginTop: "0.25rem" }}
    >
      <span className="nav__link-label">{label}</span>
    </Link>
  );
}
