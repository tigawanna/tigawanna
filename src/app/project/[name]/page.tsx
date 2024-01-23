
import { Suspense } from "react"
import { OneRepo, OneRepoSuspenseFallback } from "../components/OneRepo"
export interface PageProps {
  params: { name: string };
//   searchParams: {
//     q?: string;
//     p?: number;
//   };
}
export const revalidate = 60;
export default function OneProjectPage({params}:PageProps) {

return (
<div className="w-full h-full min-h-screen flex flex-col  ">
<Suspense fallback={<OneRepoSuspenseFallback/>}>
    <OneRepo params={params?.name}/>
</Suspense>
</div>
)}
