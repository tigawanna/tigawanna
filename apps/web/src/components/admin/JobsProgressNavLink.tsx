"use client";

import { Link, useConfig } from "@payloadcms/ui";
import { usePathname } from "next/navigation";

/**
 * Sidebar link to the Jobs progress admin view.
 */
export function JobsProgressNavLink() {
  const { config } = useConfig();
  const pathname = usePathname();
  const href = `${config.routes.admin}/jobs-progress`;
  const active = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      className={active ? "nav__link active" : "nav__link"}
      href={href}
      prefetch={false}
      style={{ display: "block", marginTop: "0.25rem" }}
    >
      <span className="nav__link-label">Jobs progress</span>
    </Link>
  );
}
