import { TRouteID } from "@/lib/tanstack/router/router-types";
import { getRouteApi } from "@tanstack/react-router";
import { ListPagination } from "./ReactresponsivePagination";

interface TSRListPaginationProps {
  routeID: TRouteID;
  totalPages: number;
}

export function TSRListPagination({ routeID, totalPages }: TSRListPaginationProps) {
  const routeApi = getRouteApi(routeID);
  const search = routeApi.useSearch();
  const navigate = routeApi.useNavigate();

  const currentPage = "page" in search ? (search.page ?? 1) : 1;
  const setPage = async (page: number) => {
    void navigate({
      search: {
        page: page,
      },
    });
  };
  if (totalPages <= 1) return null;
  return (
    <div className="w-full flex items-center justify-center">
      <ListPagination
        page={currentPage}
        totalPages={totalPages}
        onPageChange={setPage}
        data-test="backstage-journal-pagination"
      />
    </div>
  );
}
