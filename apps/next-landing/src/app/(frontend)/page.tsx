import { LandingPage } from "@/components/landing/LandingPage";
import {
  getLandingLessonPreviews,
  getPinnedRepos,
  getRecentRepos,
} from "@/data-access/landing";

/**
 * Landing route — fetch data on the server, compose the page, stream shells where deferred.
 */
export default async function HomePage() {
  const [lessonPreviews, pinnedRepos, recentRepos] = await Promise.all([
    getLandingLessonPreviews(),
    getPinnedRepos(),
    getRecentRepos(),
  ]);

  return (
    <LandingPage
      lessonPreviews={lessonPreviews}
      pinnedRepos={pinnedRepos}
      recentRepos={recentRepos}
    />
  );
}
