import { IconContext } from "react-icons";
import { subDepsIcons } from "../../state/user-tools/subdeps";


interface SubDependanciesProps {
    sub_deps: Set<string>
}

export function SubDependancies({sub_deps}:SubDependanciesProps){
const sub_deps_arr = Array.from(sub_deps);
//   console.log("sub_deps", sub_deps);
return (
 <div className='w-full h-full flex flex-wrap items-center justify-center gap-1 '>

    <IconContext.Provider value={{ size: "20px", color: "#7CFC00"}} >
        <div className='w-full h-full flex flex-wrap items-center justify-center gap-1'>
            
        {
            sub_deps_arr.map((sub_dep)=>{
                return <SpecificSubDeps sub_dep={sub_dep} sub_deps={sub_deps_arr} />
            })
        }
        </div>

    </IconContext.Provider>
 </div>
);
}


interface ISpecificSubDeps{
    sub_dep: string;
    sub_deps: string[];
    
}

function SpecificSubDeps({sub_dep, sub_deps}:ISpecificSubDeps){
    // @ts-ignore
  const Icon = subDepsIcons[sub_dep].icon;
        return (
    <div className="flex gap-1 items-center justify-center 
         border-2 border-green-400 rounded-lg text-lg">
        <Icon/>
        <div>{sub_dep}</div>
    </div>)
    
 
}
