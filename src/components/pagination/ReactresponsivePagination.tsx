"use client";
import ResponsivePagination from "react-responsive-pagination";
import { useQueryState, parseAsInteger } from "nuqs";
import { usePathname, useRouter } from "next/navigation";


interface ListingsPaginationProps {
  total_pages: number;
}

export function ListPagination({ total_pages }: ListingsPaginationProps) {
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const router = useRouter();
  const pathname = usePathname()
  return (
    <div className="flex w-full items-center justify-center">
      <ResponsivePagination
        current={page}
        total={total_pages}
        onPageChange={(e) => {
          setPage(e);
          router.push(`${pathname}?page=${e}`);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />
    </div>
  );
}
