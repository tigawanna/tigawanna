import type { LessonItem, LessonPreviewItem } from "@/types/lessons";
import { convertMarkdownToHtmlWithShiki } from "@/lib/markdown/convert";
import { formatDisplayDate } from "@/utils/date-helpers";

export async function buildLessonPreviews(items: LessonItem[]): Promise<LessonPreviewItem[]> {
  return Promise.all(
    items.map(async (item) => ({
      id: item.id,
      collectionId: item.collectionId,
      collectionName: item.collectionName,
      created: item.created,
      createdLabel: formatDisplayDate(item.created),
      updated: item.updated,
      title: item.title,
      description: item.description,
      type: item.type,
      gist: item.gist,
      previewHtml: item.markdown ? await convertMarkdownToHtmlWithShiki(item.markdown) : null,
    })),
  );
}
