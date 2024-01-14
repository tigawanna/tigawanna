"use client"
import sdk from "@stackblitz/sdk";
import { useEffect } from "react";

interface stackblitzEmbedProps {
    repo: string;
    owner: string;

}

export function StackblitzEmbed({owner,repo}: stackblitzEmbedProps) {
  const selectedRepo = {
    github: `${owner}/${repo}`,
    openFile: "README.md",
  };

  useEffect(() => {
    sdk.embedGithubProject("embed", selectedRepo.github, {
      height: 1000,
      clickToLoad: true,
      // openFile: selectedRepo.openFile,
    });
  }, [selectedRepo.github]);

  /**
   * Open the project in a new window on StackBlitz
   */
  function openProject() {
    sdk.openGithubProject(selectedRepo.github, {
      // openFile: selectedRepo.openFile,
    });
  }

  return (
  <div id="stackblitz" className="w-full h-full relative">
    <button className="btn btn-sm btn-outline hover:bg-secondary absolute top-[1%] right-[2%]" 
    onClick={openProject} >
      Open in new window
    </button>
    <div id="embed" className="mt-5 p-5 w-[95%] h-full flex items-center justify-center">B</div>

  </div>
  )
}
