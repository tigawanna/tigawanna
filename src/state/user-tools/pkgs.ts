import tools from '../tools.json' 
import PKGJSONS from '../../../user_packages.json' 
import { DepsComBo, Packageinfo, RequiredDecodedPackageJson, TPkgObjs, TPkgObjValue } from './types'
import { ISubDeps, subDepsArr, subDepsIcons } from './subdeps'


export function sanitizePackageNames(){
    const pkgslist = tools.map(x => x.value)
    const flat_pkgs = pkgslist.flat(1).map((item) => item.split('^')[0])
    const pkg_count = countPackages(flat_pkgs)
   const final_pkgs_list =  Object.entries(pkg_count).map(([key, value]) => {
    return {
            name: key,
            count: value
        }
    }).sort((a, b) => b.count - a.count)

    // console.log(final_pkgs_list)
    return final_pkgs_list.filter(x => x.count > 4)
}



interface PackageCount { [key: string]: number }

function countPackages(arr: string[]):PackageCount  {
    return arr.reduce((acc:PackageCount, curr) => {
        const pkgname = curr;
        acc[pkgname] = (acc[pkgname] || 0) + 1;
        return acc;
    }, {});
}





interface INoteWortyDependancies {
    pkg: RequiredDecodedPackageJson
    notable_deps_set: Set<string>
}

export function filterNoteWortyDependancies({pkg,notable_deps_set}:INoteWortyDependancies){
    const notable_deps:string[]=[]  
    // const notable_deps_set = new Set<string>()



    if (pkg.dependencies && notable_deps_set.size < subDepsArr.length){
    Object.keys(pkg.dependencies).map((key)=>{
        subDepsArr.map((sub)=>{

        if (key && key === sub ){
            // notable_deps.push(key.split('^')[0])
            notable_deps_set.add(key.split('^')[0])
        }
        })
    })
    }
    if (pkg.devDependencies && notable_deps_set.size < subDepsArr.length) {
        Object.keys(pkg.devDependencies).map((key) => {
            subDepsArr.map((sub) => {
                if (key && key === sub ) {
                    // notable_deps.push(key.split('^')[0])
                    notable_deps_set.add(key.split('^')[0])
                }
            })
        })
    }

    return notable_deps_set



}


export async function queryProjectByCondition(
    filterCondition:(pkg: RequiredDecodedPackageJson)=>{condition:boolean,combo:DepsComBo},
    pkgsjson: RequiredDecodedPackageJson[]){

    // console.log("top level  pkgsjson  ===>>>>>>>>>>===== ", pkgsjson)


    // @ts-ignore
    const newObj:TPkgObjs={
        "React + Vite":{
            name:"react+vite",
            dependencies:new Set<string>(),
            // devDependencies:[],
            count:0

        },
        React:{
            name:"react",
            dependencies:new Set<string>(),
            // devDependencies:[],
            count:0
        },
        Vite:{
            name:"vite",
            dependencies:new Set<string>(),
            // devDependencies:[],
            count:0
        },
        Rakkasjs:{
            name:"rakkasjs",
            dependencies:new Set<string>(),
            // devDependencies:[],
            count:0
        },
        Nextjs:{
            name:"nextjs",
            dependencies:new Set<string>(),
            // devDependencies:[],
            count:0
        },
        Nodejs: {
            name: "nodejs",
            dependencies: new Set<string>(),
            // devDependencies: [],
            count: 0
        }
    }

    pkgsjson.map((pkg) => {
        const {combo,condition} = filterCondition(pkg)
        // console.log("combo  === ", combo)
        function updateDeps(){
            // console.log("dependancies  === ", newObj[combo])
            if (newObj[combo].dependencies){
                return filterNoteWortyDependancies({pkg,notable_deps_set:new Set(newObj[combo].dependencies)})
            }
            return new Set<string>()
            
        }

        if (condition) {
            // console.log("condition  === ", condition)
            newObj[combo] = {
                name:combo,
                count: (newObj[combo]?.count ?? 0) + 1,
                dependencies: updateDeps(),
                // devDependencies: updateDeps("devDependencies")
            }
            
        }
    //  return newObj
    })

    return newObj

}

export async function getGroupedPackages(combo: DepsComBo) {
    const pkgsjson = PKGJSONS as any as RequiredDecodedPackageJson[]
    
    function filterCondition(pkg: RequiredDecodedPackageJson) {
        
            if (combo === "React + Vite" && 
            pkg.devDependencies?.vite && pkg.devDependencies["@vitejs/plugin-react"]) {
                return {combo,condition:true}
            }
            if (combo === "Vite" && pkg.devDependencies?.vite) {
                return { combo, condition: true }
            }
            if (combo === "Rakkasjs" && pkg.devDependencies?.rakkasjs) {
                return { combo, condition: true }
            }

            if (combo === "React" && pkg.dependencies?.react) {
                return { combo, condition: true }
            }
            if (combo === "Nextjs" && pkg.dependencies?.next) {
                return { combo, condition: true }
            }
               if (combo === "Nodejs" && 
               (pkg.devDependencies?.nodemon || pkg.dependencies?.nodemon || pkg.dependancies?.express)) {
              return { combo, condition: true }
            }
            return { combo, condition: false }
    }
// console.log(pkgsjson)
    return queryProjectByCondition(filterCondition,pkgsjson)
    .then(res=>{
        console.log("result === ",res)
        return res

    })
    .catch(err=>{
        console.log("error querying === ",err.message)
        throw err
    })
}




// groupPackages()
