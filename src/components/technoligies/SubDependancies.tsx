import { IconContext, IconType } from "react-icons";
import { SiTailwindcss } from "react-icons/si";
import { SubDeps } from "./SubDeps";

interface SubDependanciesProps {
    sub_deps: string[]
}

export function SubDependancies({sub_deps}:SubDependanciesProps){

  
return (
 <div className='w-full h-full flex items-center justify-center'>
    <IconContext.Provider value={{ size: "40px", color: "#7CFC00", className: "m-2" }} >
    <SpecificSubDeps Icon={SiTailwindcss} sub_dep="tailwindcss" sub_deps={sub_deps} />
    {sub_deps.slice(0,10).map((sub_dep)=>{
        return <SubDeps sub_dep={sub_dep}/>
    })}
    \</IconContext.Provider>
 </div>
);
}


interface ISpecificSubDeps{
    sub_dep: string;
     sub_deps: string[];
      Icon: IconType
}

function SpecificSubDeps({sub_dep, sub_deps, Icon}:ISpecificSubDeps){
    if (sub_deps.includes(sub_dep)) {
        return (
        <div className="flex gap-1 items-center justify-center 
         border-2 border-green-400 rounded-lg text-base">
        <Icon/>
        <div>{sub_dep}</div>
        </div>)
    }
    return null
}
