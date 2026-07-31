import type { AdminViewServerProps } from "payload";

import { DefaultTemplate } from "@payloadcms/next/templates";
import { redirect } from "next/navigation";

import { JobsProgressPanel } from "./JobsProgressPanel";

/**
 * Auth-gated admin page at `/admin/jobs-progress`.
 */
export function JobsProgressView({ initPageResult, params, searchParams }: AdminViewServerProps) {
  const { req, visibleEntities } = initPageResult;

  if (!req.user) {
    redirect(`${req.payload.config.routes.admin}/login`);
  }

  return (
    <DefaultTemplate
      i18n={req.i18n}
      params={params}
      payload={req.payload}
      permissions={initPageResult.permissions}
      req={req}
      searchParams={searchParams}
      user={req.user}
      visibleEntities={visibleEntities}
    >
      <JobsProgressPanel />
    </DefaultTemplate>
  );
}
