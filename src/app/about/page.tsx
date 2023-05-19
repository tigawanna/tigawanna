import { GithubProjects } from "@/components/repos/GithubProjects";
import { getViwerPinnedRepos } from "@/state/api/repos";

interface aboutProps {

}

export default async function about({}:aboutProps){
const data = await getViwerPinnedRepos()
return (
 <div className='w-full h-full flex items-center justify-center'>
    <GithubProjects data={data}/>
 </div>
);
}
