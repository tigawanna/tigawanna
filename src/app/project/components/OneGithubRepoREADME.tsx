import { getGithubREADME } from "../helpers/getOneRepomarkdown";

interface OneGithubRepoREADMEProps {
  repo: string;
  owner: string;
}

export async function OneGithubRepoREADME({
  owner,
  repo,
}: OneGithubRepoREADMEProps) {
  const data = await getGithubREADME({ owner, repo });

  if (!data) {
    return null;
  }

  // console.log("====== html  ======= ",data)
  return (
    <div
      id="readme"
      className="w-[95%] md:w-[85%]  h-full  
 bg-base-200/30 p-5 rounded-xl "
    >
      <h2 className="text-2xl font-bold text-start w-full capitalize">
        {repo} readme
      </h2>
      <div className="markdown" dangerouslySetInnerHTML={{ __html: data }} />
    </div>
  );
}
