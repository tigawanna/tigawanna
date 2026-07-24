/**
 * Shared view-transition name for a lesson title (list card ↔ detail hero).
 */
export function lessonTitleVtName(lessonId: string) {
  return `lesson-title-${lessonId}`;
}

/**
 * Shared view-transition name for a project hero image (card ↔ detail).
 */
export function projectImageVtName(nameWithOwner: string) {
  return `project-image-${nameWithOwner}`;
}
