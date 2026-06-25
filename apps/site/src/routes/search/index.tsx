import { Footer } from "@/components/navigation/Footer";
import { ResponsiveGenericToolbar } from "@/components/navigation/ResponsiveGenericToolbar";
import { AppConfig } from "@/utils/system";
import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { SearchIcon, Sparkles } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { PortfolioSearchExperience } from "./-components/PortfolioSearchExperience";

const searchParams = z.object({
  q: z.string().optional(),
});

export const Route = createFileRoute("/search/")({
  validateSearch: (search) => searchParams.parse(search),
  component: SearchPage,
  head: () => ({
    meta: [
      {
        title: `${AppConfig.name} | Search`,
        description: "Ask about projects, stacks, and topics across the portfolio.",
      },
    ],
  }),
});

function SearchPage() {
  const { q = "" } = useSearch({ from: "/search/" });
  const navigate = useNavigate({ from: "/search/" });
  const [draft, setDraft] = useState(q);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextQuery = draft.trim();
    if (nextQuery.length < 2) return;
    void navigate({ search: { q: nextQuery } });
  }

  return (
    <div className="bg-base-100 flex min-h-screen w-full flex-col">
      <ResponsiveGenericToolbar>
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-16 md:py-24">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
              <Sparkles className="size-4" />
              AI portfolio search
            </div>
            <h1 className="font-serif text-4xl text-base-content md:text-5xl">
              Ask what you want to know about my work
            </h1>
            <p className="max-w-2xl text-base text-base-content/65">
              Bring your OpenRouter key, ask in plain language, and get relevant repositories with a
              short explanation of why they match.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mx-auto flex w-full max-w-3xl flex-col gap-3 sm:flex-row"
            data-test="portfolio-search-form"
          >
            <label className="sr-only" htmlFor="portfolio-search-input">
              Search portfolio
            </label>
            <div className="flex flex-1 items-center gap-3 rounded-2xl border border-base-content/10 bg-base-200/60 px-4 py-3 shadow-sm">
              <SearchIcon className="size-5 shrink-0 text-primary" />
              <input
                id="portfolio-search-input"
                type="text"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="e.g. React dashboards, auth systems, or mobile apps"
                className="w-full bg-transparent text-base text-base-content outline-none placeholder:text-base-content/45"
                data-test="portfolio-search-input"
              />
            </div>
            <button type="submit" className="btn btn-primary rounded-2xl px-8">
              Search
            </button>
          </form>

          <PortfolioSearchExperience query={q.trim()} />
        </div>
        <Footer />
      </ResponsiveGenericToolbar>
    </div>
  );
}
