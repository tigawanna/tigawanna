/**
 * Shared view-transition name for a journal title (list card ↔ detail hero).
 */
export function journalTitleVtName(slug: string) {
  return `journal-title-${slug}`;
}

/** @deprecated Use {@link journalTitleVtName} */
export function lessonTitleVtName(lessonId: string) {
  return journalTitleVtName(lessonId);
}

/**
 * Shared view-transition name for a project hero image (card ↔ detail).
 */
export function projectImageVtName(nameWithOwner: string) {
  return `project-image-${nameWithOwner}`;
}
