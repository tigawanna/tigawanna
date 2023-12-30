import { GithubLanguages } from "@/components/shared/github-languages";



interface OneGithubRepoLanguagesProps {
  repo: string;
  owner: string;
}

export async function OneGithubRepoLanguages({ repo, owner }: OneGithubRepoLanguagesProps) {

  async function fetchLanguages() {
    try {
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/languages`);
      if (!response.ok) {
        throw new Error(`Failed to fetch repository: ${owner}/${repo}`);
      }
      const data = await response.json();
      return data as Record<string, number>;
    } catch (error) {
      return 
    }
  }
const data = await fetchLanguages();
// console.log("OneGithubrepolanguage data ==== ",data)
if(!data){
  return null
}

  return (
    <div className="bg-base-200 rounded-lg p-3 flex items-center justify-center">
      <GithubLanguages data={data} width={500} />
    </div>
  );
}
