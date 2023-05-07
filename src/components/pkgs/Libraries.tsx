import { IPkgJsons, IPkgJsonsError, getFavDeps } from "./helpers";
import { Suspense } from "react";
import { Library } from "./Library";
import { SectionHeader } from "../shared/SectionHeader";


interface LibrariesProps {
    data: IPkgJsons[] | IPkgJsonsError
}

export function Libraries({data}:LibrariesProps){

if(data&& "error" in data){
    return null
} 

return (
<Suspense fallback="...">  
 <div className='w-full h-full flex flex-wrap items-center justify-center gap-5  '>
<SectionHeader heading='Github Projects Breakdown' />

    {
        data&&data?.map((pkg)=>{
            return (<Library key={pkg._id} pkg={pkg}/>)
        })
    }
 </div>
 </Suspense>
);
}

