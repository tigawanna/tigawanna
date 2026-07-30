import { PageLoader } from "@/components/loading/PageLoader";

type ContentArticleSkeletonProps = {
  backLabel?: string;
  showCover?: boolean;
};

/**
 * Article route loading shell — shared centered brand mark.
 */
export function ContentArticleSkeleton(_props: ContentArticleSkeletonProps = {}) {
  return <PageLoader label="Loading article…" />;
}
