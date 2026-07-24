import { Suspense } from "react";
import Link from "next/link";

async function ProjectDetail({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const decoded = decodeURIComponent(name).replace("=>", "/");

  return (
    <main className="landing-void-surface mx-auto flex min-h-svh max-w-2xl flex-col justify-center px-6 py-24 text-landing-sage">
      <p className="text-xs tracking-[0.28em] text-landing-sage/50 uppercase">Project</p>
      <h1 className="mt-4 font-serif text-4xl font-medium tracking-[-0.03em]">{decoded}</h1>
      <p className="mt-4 text-sm leading-7 text-landing-sage/70">
        Project detail is stubbed for the Next.js landing experiment.
      </p>
      <Link href="/" className="mt-8 text-sm text-landing-cream underline-offset-4 hover:underline">
        Back to landing
      </Link>
    </main>
  );
}

/**
 * Placeholder project detail — keeps landing card links from 404ing during the experiment.
 */
export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  return (
    <Suspense
      fallback={
        <main className="landing-void-surface mx-auto flex min-h-svh max-w-2xl flex-col justify-center px-6 py-24 text-landing-sage">
          <p className="text-sm text-landing-sage/60">Loading project…</p>
        </main>
      }
    >
      <ProjectDetail params={params} />
    </Suspense>
  );
}
