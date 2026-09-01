import { registerLandingWebMcpTools } from "@/lib/webmcp/register-landing-tools";
import type { GithubRepoNode } from "@/types/github";
import { useEffect, useRef } from "react";

export function useWebMcpLandingTools(getProjects: () => GithubRepoNode[]) {
  const getProjectsRef = useRef(getProjects);
  getProjectsRef.current = getProjects;

  useEffect(() => {
    const controller = new AbortController();

    registerLandingWebMcpTools({
      signal: controller.signal,
      getProjects: () => getProjectsRef.current(),
    });

    return () => {
      controller.abort();
    };
  }, []);
}
