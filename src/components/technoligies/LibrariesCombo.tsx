import { useSSQ } from "rakkasjs";
import { getGroupedPackages } from "../../state/user-tools/pkgs";
import { DepsComBo,  } from "../../state/user-tools/types";
import { SubDependancies } from "./SubDependancies";

interface LibrariesComboProps {
    lib_combo: DepsComBo
}

export function LibrariesCombo({lib_combo}:LibrariesComboProps){
    const { data } = useSSQ(()=>{
        return getGroupedPackages(lib_combo)
    },{
        key:lib_combo
    })
    // console.log("lib combo",lib_combo);
    // console.log("lib combo data", data[lib_combo]);
return (
 <div className=' min-h-[200px] md:max-w-[40%] flex flex-col items-center justify-evenly
    rounded-lg border border-green-400 shadow-md shadow-green-700  p-2 font-serif'>
    <div className="h-full flex items-center justify-center gap-1">
        <h2 className="text-lg font-bold text-center ">{data[lib_combo]?.count} </h2>
        <h2 className="text-xl text-center font-bold">{lib_combo} projects</h2>
    </div>
     
    <SubDependancies sub_deps={data[lib_combo].dependencies}/>
</div>
);
}
