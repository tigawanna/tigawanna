import { Suspense } from "react";
import { OneRepo, OneRepoSuspenseFallback } from "../components/OneRepo";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
export interface PageProps {
  params: { name: string };
}
export const revalidate = 60;
export default function OneProjectPage({ params }: PageProps) {
  return (
    <div className="w-full h-full min-h-screen flex flex-col  ">
      <Link className="hover:text-accent fixed top-[3%] left-[1%] z-50" href="/">
        <ChevronLeft className="size-20" />
      </Link>
      <Suspense fallback={<OneRepoSuspenseFallback />}>
        <OneRepo params={params?.name} />
      </Suspense>
    </div>
  );
}
