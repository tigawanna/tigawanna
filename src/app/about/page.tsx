import { GithubProjects } from "@/components/repos/GithubProjects";
import { getViewerPinnedRepos } from "@/state/api/repos";

interface aboutProps {

}

export default async function about({}:aboutProps){
const data = await getViewerPinnedRepos()
// console.log("viewer repo  === ",data)

if (data && ("errors" in data) || ("message" in data)){
   return null
}

return (
 <div className='w-full h-full flex items-center justify-center'>
    <GithubProjects data={data}/>
 </div>
);
}
