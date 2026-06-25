import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { Search, Sparkles } from "lucide-react";
import { useState } from "react";

export function LandingSearchBar() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  function handleSearch() {
    const trimmed = query.trim();
    if (trimmed.length < 2) return;
    void navigate({
      to: "/search",
      search: { q: trimmed },
    });
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      handleSearch();
    }
  }

  return (
    <div className="flex w-full max-w-2xl flex-col gap-3 sm:flex-row">
      <div className="flex flex-1 items-center gap-3 rounded-2xl border border-[#c5ccb4]/15 bg-[#c5ccb4]/8 px-4 py-3 backdrop-blur-md">
        <Sparkles className="size-5 shrink-0 text-[#d8deca]" />
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about my projects, stacks, or domains…"
          className="w-full bg-transparent text-sm text-[#f6efd7] outline-none placeholder:text-[#c5ccb4]/45"
          data-test="landing-search-input"
        />
      </div>
      <Button
        size="lg"
        onClick={handleSearch}
        className="gap-2 rounded-2xl px-8 text-base shadow-lg shadow-primary/30"
        data-test="landing-search-button"
      >
        <Search className="size-4" />
        Ask
      </Button>
    </div>
  );
}
