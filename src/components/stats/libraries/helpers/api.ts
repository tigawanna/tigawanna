export interface ViewerLibraries {
  highlighted_library_stats: Record<string, string>;
  library_stats: Record<string, string>;
  framework_stats: Record<string, string>;
}
export async function getViewerLibraries() {
  const deno_url = process.env.DENO_URL;
  const pat = process.env.GH_PAT;
  
  if (!deno_url || !pat) return;

  try {
    return await fetch(deno_url + "/stats", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `bearer ${pat}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        return response.json();
      })
      .then((data) => data as ViewerLibraries);
  } catch (error) {
    return;
  }
}
