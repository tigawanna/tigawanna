"use client";

import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useConfig } from "@payloadcms/ui";

const TITLE_ACTIONS_SELECTOR = ".collection-list--blogs .list-header__title-actions";

/**
 * Subscribes to DOM mutations until Payload's list header actions row appears.
 */
function subscribeTitleActions(onStoreChange: () => void): () => void {
  if (typeof document === "undefined") return () => undefined;

  const observer = new MutationObserver(onStoreChange);
  observer.observe(document.body, { childList: true, subtree: true });
  return () => observer.disconnect();
}

/**
 * Reads the list header actions mount node from the DOM.
 */
function getTitleActionsSnapshot(): HTMLElement | null {
  if (typeof document === "undefined") return null;
  return document.querySelector(TITLE_ACTIONS_SELECTOR);
}

/**
 * Blogs list header link to the hardcoded `/admin/smart-draft` page.
 *
 * Payload has no TitleActions slot next to "Create New", so this is portaled
 * into `.list-header__title-actions`.
 */
export function AiDraftListAction() {
  const { config } = useConfig();
  const href = `${config.routes.admin}/smart-draft`;
  const titleActionsEl = useSyncExternalStore(
    subscribeTitleActions,
    getTitleActionsSnapshot,
    () => null,
  );

  if (!titleActionsEl) return null;

  return createPortal(
    <a href={href} className="btn btn--style-secondary btn--size-medium">
      Smart draft
    </a>,
    titleActionsEl,
  );
}
