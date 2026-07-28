import type { AdminViewServerProps } from "payload";

import { DefaultTemplate } from "@payloadcms/next/templates";
import { redirect } from "next/navigation";

import { AiDraftForm } from "./AiDraftForm";

/**
 * Hardcoded Payload admin page at `/admin/smart-draft` (not a CMS collection document).
 */
export function AiDraftView({ initPageResult, params, searchParams }: AdminViewServerProps) {
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
      <AiDraftForm />
    </DefaultTemplate>
  );
}
