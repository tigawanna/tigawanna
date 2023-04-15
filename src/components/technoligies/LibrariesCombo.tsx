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
return (
 <div className='w-full h-full flex flex-col items-center justify-center 
    rounded-lg border-4 border-green-400 p-5 '>
    <div className="w-full h-full flex flex-col items-center justify-center">
        <h2 className="font-bold">{lib_combo}</h2>
        <h2 className="text-xl font-bold rounded-full border">{data[lib_combo]?.count}</h2>
    </div>
    <SubDependancies sub_deps={data[lib_combo].dependencies}/>
    <SubDependancies sub_deps={data[lib_combo].devDependencies}/>
 </div>
);
}
