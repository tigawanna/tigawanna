import { getStaticLessonById, STATIC_LESSONS } from "@/data/portfolio/static";
import type { LessonItem, LessonsPage, LessonsPreviewPage } from "@/types/lessons";
import { createServerFn } from "@tanstack/react-start";

const emptyPage: LessonsPage = {
  page: 0,
  perPage: 0,
  totalPages: 0,
  totalItems: 0,
  items: [],
};

function getPbUrl() {
  return process.env.PB_URL ?? "";
}

async function fetchLessonsPage(page: number, perPage: number): Promise<LessonsPage> {
  const pbUrl = getPbUrl();
  if (!pbUrl) {
    const totalItems = STATIC_LESSONS.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
    const safePage = Math.min(Math.max(page, 1), totalPages);
    const start = (safePage - 1) * perPage;
    return {
      page: safePage,
      perPage,
      totalPages,
      totalItems,
      items: STATIC_LESSONS.slice(start, start + perPage),
    };
  }

  try {
    const endpoint = `${pbUrl}/api/collections/portfolio_milestones/records?sort=-created,id&page=${page}&perPage=${perPage}`;
    const res = await fetch(endpoint);
    if (!res.ok) {
      return emptyPage;
    }
    return (await res.json()) as LessonsPage;
  } catch {
    return emptyPage;
  }
}

export const getLessons = createServerFn({ method: "GET" })
  .inputValidator((input: { page?: number; perPage?: number }) => input)
  .handler(async ({ data: { page = 1, perPage = 6 } }) => fetchLessonsPage(page, perPage));

export const getLessonsPreview = createServerFn({ method: "GET" })
  .inputValidator((input: { page?: number; perPage?: number }) => input)
  .handler(async ({ data: { page = 1, perPage = 6 } }) => {
    const result = await fetchLessonsPage(page, perPage);
    if (!result.items.length) {
      return { ...result, items: [] } satisfies LessonsPreviewPage;
    }

    const { convertMarkdownToHtml } = await import("@/lib/markdown/convert");
    const items = result.items.map((item) => ({
      id: item.id,
      collectionId: item.collectionId,
      collectionName: item.collectionName,
      created: item.created,
      updated: item.updated,
      title: item.title,
      description: item.description,
      type: item.type,
      gist: item.gist,
      previewHtml: item.markdown ? convertMarkdownToHtml(item.markdown) : null,
    }));

    return { ...result, items } satisfies LessonsPreviewPage;
  });

async function fetchLesson(id: string): Promise<LessonItem | null> {
  const pbUrl = getPbUrl();
  if (!pbUrl) {
    return getStaticLessonById(id);
  }

  try {
    const endpoint = `${pbUrl}/api/collections/portfolio_milestones/records/${id}`;
    const res = await fetch(endpoint);
    if (!res.ok) {
      return null;
    }
    return (await res.json()) as LessonItem;
  } catch {
    return null;
  }
}

export const getLesson = createServerFn({ method: "GET" })
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data: { id } }) => fetchLesson(id));

export const getLessonMarkdownHtml = createServerFn({ method: "GET" })
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data: { id } }) => {
    const lesson = await fetchLesson(id);
    if (!lesson?.markdown) {
      return null;
    }

    const { convertMarkdownToHtml } = await import("@/lib/markdown/convert");
    return convertMarkdownToHtml(lesson.markdown);
  });
