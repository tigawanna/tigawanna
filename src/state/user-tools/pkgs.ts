import tools from '../tools.json' 
import PKGJSONS from '../../../user_packages.json' 
import { DepsComBo, Packageinfo, RequiredDecodedPackageJson, TPkgObjs, TPkgObjValue } from './types'


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







export async function queryBuilder(pkgsjson: RequiredDecodedPackageJson[]){

function depsToArray(dependacies:{[key:string]:string}){
   return Object.keys((dependacies)).map((key)=>{
    return key.split('^')[0]
    })
}

    type TPkg_json_obj = {
        [key: string]: {
            name: string,
            dependencies: string[],
            devDependencies: string[],
            count: number
        }
    }

    const pkg_json_obj: TPkg_json_obj = {}

    pkgsjson.map((pkg) => {

        if (pkg.devDependencies?.rakkas ) {
            const existingDeps = pkg_json_obj["rakkas"]?.dependencies ?? [];
            const existingDevDeps = pkg_json_obj["rakkas"]?.devDependencies ?? [];

            pkg_json_obj["rakkas"] = {
                name: pkg.name,
                dependencies: [...existingDeps, ...depsToArray(pkg.dependencies)],
                devDependencies: [...existingDevDeps, ...depsToArray(pkg.devDependencies)],
                count: (pkg_json_obj["rakkas"]?.count ?? 0) + 1
            }
            return
        }

        if (pkg.devDependencies?.vite && pkg.dependencies["@vitejs/plugin-react"]) {
            const existingDeps = pkg_json_obj["react+vite"]?.dependencies ?? [];
            const existingDevDeps = pkg_json_obj["react+vite"]?.devDependencies ?? [];
            pkg_json_obj["react+vite"] = {
                name: pkg.name,
                dependencies: [...existingDeps, ...depsToArray(pkg.dependencies)],
                devDependencies: [...existingDevDeps, ...depsToArray(pkg.devDependencies)],
                count: (pkg_json_obj["react+vite"]?.count ?? 0) + 1
            }
            return
        }

        if (pkg.dependencies?.react){
            const existingDeps = pkg_json_obj["react"]?.dependencies ?? [];
            const existingDevDeps = pkg_json_obj["react"]?.devDependencies ?? [];
            pkg_json_obj["react"] = {
                name: pkg.name,
                dependencies: [...existingDeps, ...depsToArray(pkg.dependencies)],
                devDependencies: [...existingDevDeps, ...depsToArray(pkg.devDependencies)],
                count: (pkg_json_obj["react"]?.count ?? 0) + 1
            }
            return
        }

        if (pkg.devDependencies?.vite) {
            const existingDeps = pkg_json_obj["vite"]?.dependencies ?? [];
            const existingDevDeps = pkg_json_obj["vite"]?.devDependencies ?? [];
            pkg_json_obj["vite"] = {
                name: pkg.name,
                dependencies: [...existingDeps, ...depsToArray(pkg.dependencies)],
                devDependencies: [...existingDevDeps, ...depsToArray(pkg.devDependencies)],
                 count: (pkg_json_obj["vite"]?.count ?? 0) + 1
            }
            return
        }
    })
  return pkg_json_obj
}




export async function queryProjectsByCondition(
    filterCondition: (pkg: RequiredDecodedPackageJson) => { condition: boolean, combo: DepsComBo },
    pkgsjson: RequiredDecodedPackageJson[])
    : Promise<Packageinfo[]> {
    return pkgsjson.reduce((acc: Packageinfo[], pkg: RequiredDecodedPackageJson) => {
        if (filterCondition(pkg).condition) {
            acc.push({
                name: pkg.name,
                version: pkg.version,
                type: pkg.type,
                scripts: pkg.scripts,
                dependencies: pkg.dependencies,
                devDependencies: pkg.devDependencies
            });
        }
        return acc;
    }, []);
}




export async function queryProjectByCondition(
    filterCondition:(pkg: RequiredDecodedPackageJson)=>{condition:boolean,combo:DepsComBo},
    pkgsjson: RequiredDecodedPackageJson[]){

    // console.log("top level  pkgsjson  ===>>>>>>>>>>===== ", pkgsjson)


    // @ts-ignore
    const newObj:TPkgObjs={
        "React + Vite":{
            name:"react+vite",
            dependencies:[],
            devDependencies:[],
            count:0

        },
        React:{
            name:"react",
            dependencies:[],
            devDependencies:[],
            count:0
        },
        Vite:{
            name:"vite",
            dependencies:[],
            devDependencies:[],
            count:0
        },
        Rakkasjs:{
            name:"rakkasjs",
            dependencies:[],
            devDependencies:[],
            count:0
        },
        Nextjs:{
            name:"nextjs",
            dependencies:[],
            devDependencies:[],
            count:0
        }
    }

    pkgsjson.map((pkg) => {
        const {combo,condition} = filterCondition(pkg)
        // console.log("combo  === ", combo)
        function updateDeps( deps_key: "dependencies" |"devDependencies"){
            // console.log("dependancies  === ", newObj[combo])
            if (newObj[combo][deps_key]){
                return newObj[combo][deps_key].concat(Object.keys(pkg[deps_key]).map((key) => key.split('^')[0]))
            }
            return []
            
        }

        if (condition) {
            // console.log("condition  === ", condition)
            newObj[combo] = {
                name:combo,
                count: (newObj[combo]?.count ?? 0) + 1,
                dependencies: updateDeps("dependencies"),
                devDependencies: updateDeps("devDependencies")
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
