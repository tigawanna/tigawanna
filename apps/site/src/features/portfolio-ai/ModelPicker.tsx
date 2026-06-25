import { useState } from "react";
import { ArrowDownUp, Check, Gift, Loader2, Search, TriangleAlert } from "lucide-react";
import { useOpenRouterModels } from "@/hooks/use-openrouter-models";
import { formatModelPrice } from "@/services/openrouter/openrouter.api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { OpenRouterModelData } from "@/types/openrouter";

interface ModelPickerProps {
  value: string;
  onChange: (modelId: string) => void;
}

function promptPrice(model: OpenRouterModelData) {
  return Number(model.pricing.prompt);
}

export function ModelPicker({ value, onChange }: ModelPickerProps) {
  const [search, setSearch] = useState("");
  const [sortCheapest, setSortCheapest] = useState(false);
  const [freeOnly, setFreeOnly] = useState(false);
  const { data: models, isLoading, isError } = useOpenRouterModels();

  const term = search.toLowerCase();
  let filtered = term
    ? (models ?? []).filter(
        (model) => model.id.toLowerCase().includes(term) || model.name.toLowerCase().includes(term),
      )
    : (models ?? []);

  if (freeOnly) {
    filtered = filtered.filter(
      (model) => Number(model.pricing.prompt) === 0 && Number(model.pricing.completion) === 0,
    );
  }

  if (sortCheapest) {
    filtered = [...filtered].sort((left, right) => promptPrice(left) - promptPrice(right));
  }

  if (isLoading) {
    return (
      <div className="flex h-28 items-center justify-center gap-2 rounded-2xl bg-base-200/60 text-sm text-base-content/60 ring-1 ring-base-content/10">
        <Loader2 className="size-4 animate-spin" />
        Loading models…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-28 items-center justify-center gap-2 rounded-2xl bg-error/10 text-sm text-error ring-1 ring-error/20">
        <TriangleAlert className="size-4" />
        Failed to load models
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-base-content/45" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search models..."
            className="h-11 rounded-2xl border-0 bg-base-100 pl-9 shadow-none ring-1 ring-base-content/10 focus-visible:ring-primary/35"
          />
        </div>
        <Button
          type="button"
          variant={freeOnly ? "default" : "outline"}
          onClick={() => setFreeOnly((value) => !value)}
          className="h-11 shrink-0 gap-1.5 rounded-2xl"
        >
          <Gift className="size-3.5" />
          Free
        </Button>
        <Button
          type="button"
          variant={sortCheapest ? "default" : "outline"}
          onClick={() => setSortCheapest((value) => !value)}
          className="h-11 shrink-0 gap-1.5 rounded-2xl"
        >
          <ArrowDownUp className="size-3.5" />
          Cheapest
        </Button>
      </div>

      <div className="max-h-72 overflow-y-auto rounded-2xl bg-base-100/70 p-1 ring-1 ring-base-content/10">
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-base-content/60">No models match.</p>
        ) : (
          filtered.map((model) => {
            const isSelected = model.id === value;
            const inputPrice = formatModelPrice(model.pricing.prompt);
            const outputPrice = formatModelPrice(model.pricing.completion);
            return (
              <button
                key={model.id}
                type="button"
                onClick={() => onChange(model.id)}
                className={cn(
                  "grid w-full grid-cols-[1fr_auto] items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition-colors hover:bg-primary/8",
                  isSelected && "bg-primary/12",
                )}
              >
                <span className="min-w-0">
                  <span className="flex items-center gap-2">
                    <span
                      className={cn(
                        "truncate font-medium",
                        isSelected ? "text-primary" : "text-base-content",
                      )}
                    >
                      {model.name}
                    </span>
                    {isSelected ? <Check className="size-4 shrink-0 text-primary" /> : null}
                  </span>
                  <span className="mt-0.5 block truncate font-mono text-xs text-base-content/55">
                    {model.id}
                  </span>
                </span>
                <span className="shrink-0 rounded-full bg-base-content/7 px-2.5 py-1 text-xs text-base-content/60">
                  {inputPrice} in · {outputPrice} out
                </span>
              </button>
            );
          })
        )}
      </div>

      {value ? (
        <p className="rounded-xl bg-primary/8 px-3 py-2 text-xs text-base-content/60">
          Selected: <span className="font-mono">{value}</span>
        </p>
      ) : null}
    </div>
  );
}
