import { useSSQ } from "rakkasjs";
import { getFavDeps } from "../../state/pkgs/api";
import { Suspense } from "react";
import { Library } from "./Library";


interface LibrariesProps {

}

export function Libraries({}:LibrariesProps){
    const {data,refetch} = useSSQ(()=>{
        return getFavDeps(import.meta.env.RAKKAS_GH_PAT);
    })

return (
<Suspense fallback="Loading...">  
 <div className='w-full h-full flex flex-wrap items-center justify-center gap-2 p-2'>
<h2 className="w-full text-3xl p-5 md:text-4xl text-slate-400 font-bold">Github Projects Breakdown</h2>
    {
        data?.map((pkg)=>{
            return (<Library key={pkg._id} pkg={pkg}/>)
        })
    }
 </div>
 </Suspense>
);
}

