import { ContentArticleSkeleton } from "@/components/blogs/ContentArticleSkeleton";

/**
 * Instant navigation shell for blog detail routes (App Router `loading.tsx`).
 */
export default function BlogDetailLoading() {
  return <ContentArticleSkeleton backLabel="Back to blogs" showCover />;
}
