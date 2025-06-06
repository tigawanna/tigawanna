import SimplifiedIntro from "@/components/landing-page/SimplifiedIntro";
import { DevToArticles } from "@/components/landing-page/articles/DevToArticles";
import { ContactMeForm } from "@/components/landing-page/contact/ContactMeForm";
import { CurrentlyWorkingOnGithubProjects } from "@/components/landing-page/projects/repos/CurrentlyWorkingOnGithubProjects";
import { ProjectsSuspenseFallback } from "@/components/landing-page/projects/repos/PinnedGithubProjects";
import { MainFooter } from "@/components/shared/Footer";
import { Suspense } from "react";
import { LessonsSection } from "./lessons/__components/LessonsSection";
import { getViewerPinnedRepos, getViewerRecentlyPushedRepos } from "@/state/api/repos";
import { ViewerGithubProjects } from "@/components/landing-page/projects/repos/ViewerGithubProjects";
import { CondensedAbout } from "@/components/landing-page/about/CondensedAbout";
import { TalksSection } from "@/components/landing-page/talks/TalksSection";
import { CertificateSection } from "@/components/landing-page/certificates/CertificateSection";

export interface PageProps {
  params: Promise<{ topic: string }>;
}

export const revalidate = 60;
export default async function Home({}: PageProps) {
  const { data, errors } = await getViewerRecentlyPushedRepos();
  const pinned = await getViewerPinnedRepos();

  return (
    <main className="flex flex-col w-full h-full gap-6">
      <SimplifiedIntro />
      <CondensedAbout />
      <TalksSection />
      <CertificateSection />
      {/* GitHub Projects Section */}
      <section id="projects" className="w-full py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold mb-12 text-center bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            My Projects
          </h2>

          <Suspense fallback={<ProjectsSuspenseFallback />}>
            <ViewerGithubProjects data={data} errors={errors} pinned={pinned} />
          </Suspense>

          <div className="mt-16">
            <Suspense fallback={<ProjectsSuspenseFallback />}>
              <CurrentlyWorkingOnGithubProjects data={data} errors={errors} />
            </Suspense>
          </div>
        </div>
      </section>

      {/* Articles Section */}
      <section id="articles" className="w-full py-16 bg-base-200/30">
        <div className="container mx-auto px-6">
          <Suspense fallback={<ProjectsSuspenseFallback />}>
            <DevToArticles />
          </Suspense>
        </div>
      </section>

      {/* Lessons Section */}
      <section id="journal" className="w-full py-16">
        <div className="container mx-auto px-6">
          <LessonsSection />
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="w-full py-16 bg-base-200/30">
        <div className="container mx-auto px-6">
          <ContactMeForm />
        </div>
      </section>

      <MainFooter />
    </main>
  );
}
