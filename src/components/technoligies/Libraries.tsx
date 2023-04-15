import { useSSQ } from "rakkasjs";
import { DepsComBo } from "../../state/user-tools/types";
import { LibrariesCombo } from "./LibrariesCombo";

interface LibrariesProps {

}

export function Libraries({}:LibrariesProps){
    // const { data } = useSSQ(() => {
    //     return getAllReposPkgJson()
    // })
const lib_combos: DepsComBo[] = ["React + Vite", "Rakkasjs", "Nextjs","React","Vite","Nodejs"]    
return (
 <div className='w-full h-full flex flex-wrap items-center justify-center gap-2 p-2'>
    {
        lib_combos.map((lib_combo)=>{
            return <LibrariesCombo key={lib_combo} lib_combo={lib_combo}/>
        })
    }

 </div>
);
}
