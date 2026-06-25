import { KeyRound, Settings, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AiSettings } from "@/types/ai-settings";

interface AiSettingsPanelProps {
  settings: AiSettings | null;
  onOpenSettings: () => void;
}

export function AiSettingsPanel({ settings, onOpenSettings }: AiSettingsPanelProps) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-base-content/10 bg-base-200/50 px-4 py-3">
      <div className="flex items-center gap-2 text-sm">
        <Settings className="size-4 text-base-content/55" />
        {settings ? (
          <>
            <span className="text-base-content/60">OpenRouter</span>
            <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              Ready
            </span>
            <span className="hidden text-xs text-base-content/55 sm:inline">
              · {settings.model}
            </span>
          </>
        ) : (
          <>
            <TriangleAlert className="size-3.5 text-error" />
            <span className="text-sm text-error">Add your OpenRouter key to search with AI</span>
          </>
        )}
      </div>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onOpenSettings}
        className="gap-1.5 rounded-xl text-xs"
        data-test="portfolio-ai-settings"
      >
        <KeyRound className="size-3.5" />
        {settings ? "Change" : "Configure"}
      </Button>
    </div>
  );
}
