import { ContentArticleSkeleton } from "@/components/blogs/ContentArticleSkeleton";

/**
 * Instant navigation shell for journal detail routes (App Router `loading.tsx`).
 */
export default function JournalDetailLoading() {
  return <ContentArticleSkeleton backLabel="Back to journals" showCover={false} />;
}
