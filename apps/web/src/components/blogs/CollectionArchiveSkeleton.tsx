import { PageLoader } from "@/components/loading/PageLoader";

type CollectionArchiveSkeletonProps = {
  eyebrow?: string;
  title?: string;
  lead?: string;
  featured?: boolean;
};

/**
 * Index loading shell for `/blogs` and `/journals` — shared centered brand mark.
 */
export function CollectionArchiveSkeleton(_props: CollectionArchiveSkeletonProps = {}) {
  return <PageLoader label="Loading…" />;
}
