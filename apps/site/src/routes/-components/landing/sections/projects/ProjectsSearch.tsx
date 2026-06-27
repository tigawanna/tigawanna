import { Input } from "@/components/ui/input";
import { Loader, Search, X } from "lucide-react";
import { twMerge } from "tailwind-merge";

type ProjectsSearchProps = {
  value: string;
  onChange: (value: string) => void;
  isDebouncing: boolean;
};

export function ProjectsSearch({ value, onChange, isDebouncing }: ProjectsSearchProps) {
  return (
    <div className="relative mx-auto w-full max-w-md" data-test="projects-search">
      <Search
        className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-landing-sage/40"
        aria-hidden="true"
      />
      <Input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search by name, tag, or description…"
        className={twMerge(
          "h-10 rounded-full border-landing-cream/10 bg-landing-cream/5 pr-10 pl-10 text-sm text-landing-cream shadow-none placeholder:text-landing-sage/40",
          "focus-visible:border-landing-cream/25 focus-visible:ring-landing-cream/15",
        )}
      />
      <div className="absolute inset-y-0 right-3 flex items-center gap-1.5">
        {isDebouncing ? (
          <Loader className="size-4 animate-spin text-landing-sage/40" aria-hidden="true" />
        ) : null}
        {value.length > 0 ? (
          <button
            type="button"
            onClick={() => onChange("")}
            className="grid size-6 place-items-center rounded-full text-landing-sage/50 transition-colors hover:bg-landing-cream/10 hover:text-landing-sage"
            aria-label="Clear search"
          >
            <X className="size-3.5" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
