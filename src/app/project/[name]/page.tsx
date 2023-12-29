
import { Suspense } from "react"
import { OneRepo } from "../components/OneRepo"
export interface PageProps {
  params: { name: string };
//   searchParams: {
//     q?: string;
//     p?: number;
//   };
}
export default function OneProjectPage({params}:PageProps) {

return (
<div className="w-full h-full min-h-screen flex flex-col  ">
<Suspense fallback="...">
    <OneRepo params={params?.name}/>
</Suspense>
</div>
)}
