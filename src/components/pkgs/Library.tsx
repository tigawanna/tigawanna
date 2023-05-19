"use client"
import { IPkgJsons } from "./helpers";
import { IconContext } from "react-icons/lib";
import { subDepsIcons } from "./subdeps";


interface LibraryProps {
    pkg:IPkgJsons
}

export function Library({pkg}:LibraryProps){
return (
    <div
        key={pkg._id}
        className="w-full md:w-[95%] lg:w-[30%] lg:h-[250px]  px-2 py-5 md:py-2 flex flex-col items-center text-slate-200 font-normal
        border-2 border-green-500 rounded-xl shadow hover:brightness-150 shadow-green-300">

        
        <div className="w-full font-bold flex flex-wrap items-center gap-2 p-1">
            <div className="text-4xl flex items-center justify-center gap-1">
                <IconContext.Provider
                    value={{ color: "#86efac", size: '40', className: "flex " }}>
                    <PkgIconComponent pkg={pkg._id} />
                </IconContext.Provider>
            </div>
            <div className="text-lg">{pkg._id}</div>
            <div className="px-2 py-[2px] bg-green-800 border border-green-500 rounded-lg truncate text-sm font-normal">
                {pkg.repo_names.length} projects
            </div>
        </div>


        <div className="w-full flex flex-wrap gap-1">
            <h2 className="w-full text-bold text-green-200 p-1">Top Dependancies</h2>
            {
                pkg.top_favdeps.map((dep,idx)=>{
                    // console.log("dep === ",dep)
                    return (
                        <div 
                        key={dep+idx}
                        className="flex items-center justify-center text-xs md:text-sm font-normal
                         px-2 border border-green-600 rounded-lg">
                            {dep}
                        </div>
                    )
                })
            }
        </div>


    </div>
);
}

interface IPkgIconComponent {
    pkg: string
}
export function PkgIconComponent({ pkg }: IPkgIconComponent) {
    // console.log("deps  === ",pkg)
    const ReactIcon = subDepsIcons['react'].icon
    const RelayIcon = subDepsIcons['relay'].icon
    const NextjsIcon = subDepsIcons['nextjs'].icon
    const NodejsIcon = subDepsIcons['nodejs'].icon
    const ViteIcon = subDepsIcons['vite'].icon
    const JsIcon = subDepsIcons['javascript'].icon
    const TsIcon = subDepsIcons['typescript'].icon

    // const AnyIcon = subDepsIcons[pkg].icon
    // console.log("AnyIcon === ",AnyIcon)

    if (pkg === "React+Relay") {
        return (<> <ReactIcon /> + <RelayIcon /> </>)
    }

    if (pkg === "Rakkasjs") {
        return (<><ReactIcon /> + <ViteIcon /></>)
    }

    if (pkg === "Nextjs") {
        return (<><NextjsIcon /></>)
    }

    if (pkg === "Nodejs") {
        return (<><NodejsIcon /></>)
    }
    if (pkg === "React+Vite") {
        return (<><ReactIcon /> + <ViteIcon /></>)
    }
    if (pkg === "Others") {
        return (<><JsIcon />/<TsIcon /></>)
    }
    // if(AnyIcon){
    //     return (<><AnyIcon /></>)
    // }
    return null
}
