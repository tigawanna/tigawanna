import { useSSQ } from "rakkasjs";
import { getFavDeps } from "../../state/pkgs/api";
import { Suspense } from "react";
import { Library } from "./Library";
import { logNormal } from "../../util/general";
import { SectionHeader } from "../parts/SectionHeader";


interface LibrariesProps {

}

export function Libraries({}:LibrariesProps){

const {data,refetch} = useSSQ(()=>{
        return getFavDeps(import.meta.env.RAKKAS_GH_PAT);
})

// logNormal("data  ==== ",data)
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

