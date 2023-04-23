import { IPkgJsons } from "../../state/pkgs/api";
import { IconContext } from "react-icons";
import { subDepsIcons } from "../../state/pkgs/subdeps";

interface LibraryProps {
    pkg:IPkgJsons
}

export function Library({pkg}:LibraryProps){
return (
    <div
        key={pkg._id}
        className="w-full md:w-[40%] h-[200px]  p-2 flex flex-col items-center
        border-2 border-green-500 rounded-xl shadow hover:brightness-150 shadow-green-300">

        <div className="w-full font-bold flex  items-center gap-2 p-1">
            <div className="text-4xl flex items-center justify-center gap-1">
                <IconContext.Provider
                    value={{ color: "#86efac", size: '40', className: "flex " }}>
                    <PkgIconComponent pkg={pkg._id} />
                </IconContext.Provider>
            </div>
        <div className="text-xl">{pkg._id}</div>
            <div className="p-2 border border-green-500 rounded-full">{pkg.repo_names.length} projects</div>
        </div>

        <div className=" flex flex-wrap gap-1">
            <h2 className="w-full text-bold text-green-200 p-1">Top Dependancies</h2>
            {
                pkg.top_favdeps.map((dep)=>{
                    console.log("dep === ",dep)
                    return (
                        <div className="flex items-center justify-center 
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
