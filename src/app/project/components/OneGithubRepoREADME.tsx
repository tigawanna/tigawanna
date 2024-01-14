import { getGithubREADME } from "../helpers/getOneRepomarkdown";

interface OneGithubRepoREADMEProps {
  repo: string;
  owner: string;
}

export async function OneGithubRepoREADME({owner,repo}:OneGithubRepoREADMEProps){
    const data = await getGithubREADME({owner,repo}) 
   
    if (!data ) {
      return null;
    }

return (
 <div className='w-[95%] md:w-[85%]  h-full flex flex-col items-center justify-center 
 bg-base-200/30 p-5 rounded-xl '>
  <h2 className="text-4xl font-bold text-start w-full capitalize">{repo} readme</h2>
   <div className="markdown" dangerouslySetInnerHTML={{ __html: data}} />
 </div>
);
}
