"use client"
import sdk from "@stackblitz/sdk";
import { useEffect } from "react";

interface stackblitzEmbedProps {
    repo: string;
    owner: string;

}

export function StackblitzEmbed({owner,repo}: stackblitzEmbedProps) {
    const selectedRepo = {
    github:`${owner}/${repo}`,
    openFile: 'README.md',
  }
    //   sdk.embedGithubProject("embed", selectedRepo.github, {
    //     height: 500,
    //     openFile: selectedRepo.openFile,
    //   });
useEffect(() => {
    sdk.embedGithubProject("embed", selectedRepo.github, {
      height: 1000,
      // openFile: selectedRepo.openFile,
    });
    
},[])

  return <div id="embed" className="p-5 w-[95%] h-full flex items-center justify-center"></div>;
}
