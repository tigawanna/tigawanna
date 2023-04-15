import tools from '../tools.json' 

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

