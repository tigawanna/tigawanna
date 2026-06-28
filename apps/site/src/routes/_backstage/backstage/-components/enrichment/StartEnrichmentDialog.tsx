import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { triggerProjectEnrichmentRun } from "@/modules/backstage/projects-enrichment.functions";
import { unwrapUnknownError } from "@/utils/errors";
import { useMutation } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const SCAN_PRESETS = [
  { label: "Latest 5", limit: 5 },
  { label: "Latest 25", limit: 25 },
  { label: "All (100)", limit: 100 },
] as const;

type StartEnrichmentDialogProps = {
  trackedRepos: Array<{ repoFullName: string }>;
  onRunStarted: () => void;
};

export function StartEnrichmentDialog({ trackedRepos, onRunStarted }: StartEnrichmentDialogProps) {
  const [open, setOpen] = useState(false);
  const [manualRepo, setManualRepo] = useState("");

  const triggerRun = useMutation({
    mutationFn: (input: { limit?: number; repos?: string[]; force?: boolean }) =>
      triggerProjectEnrichmentRun({ data: input }),
    onSuccess(result) {
      toast.success("Enrichment run started", { description: `Run ${result.runId}` });
      onRunStarted();
      setOpen(false);
      setManualRepo("");
    },
    onError(err: unknown) {
      toast.error("Failed to start run", { description: unwrapUnknownError(err).message });
    },
  });

  const runManualRepo = () => {
    const repo = manualRepo.trim();
    if (!repo.includes("/")) {
      toast.error("Use owner/repo format");
      return;
    }
    triggerRun.mutate({ repos: [repo], force: true });
  };

  const runTrackedRepos = (count: number | "all") => {
    const names =
      count === "all"
        ? trackedRepos.map((repo) => repo.repoFullName)
        : trackedRepos.slice(0, count).map((repo) => repo.repoFullName);

    if (names.length === 0) {
      toast.error("No tracked repos yet");
      return;
    }

    triggerRun.mutate({ repos: names, force: true });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2" data-test="start-enrichment-run">
          <Plus className="h-4 w-4" />
          Start run
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg" data-test="start-enrichment-dialog">
        <DialogHeader>
          <DialogTitle>Start enrichment run</DialogTitle>
          <DialogDescription>
            Discover repos from GitHub, re-enrich tracked projects, or target a single repository.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-6">
          <div className="space-y-3">
            <p className="text-base-content/60 text-xs font-medium uppercase tracking-wide">
              Discover from GitHub
            </p>
            <div className="flex flex-wrap gap-2">
              {SCAN_PRESETS.map((preset) => (
                <Button
                  key={preset.limit}
                  data-test={`trigger-scan-${preset.limit}`}
                  variant="outline"
                  disabled={triggerRun.isPending}
                  onClick={() => triggerRun.mutate({ limit: preset.limit })}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-base-content/60 text-xs font-medium uppercase tracking-wide">
              Re-enrich tracked
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                data-test="trigger-tracked-first-5"
                variant="outline"
                disabled={triggerRun.isPending || trackedRepos.length === 0}
                onClick={() => runTrackedRepos(5)}
              >
                First 5 tracked
              </Button>
              <Button
                data-test="trigger-tracked-all"
                variant="outline"
                disabled={triggerRun.isPending || trackedRepos.length === 0}
                onClick={() => runTrackedRepos("all")}
              >
                All tracked ({trackedRepos.length})
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-base-content/60 text-xs font-medium uppercase tracking-wide">
              Single repo
            </p>
            <div className="flex flex-wrap gap-2">
              <Input
                className="min-w-[240px] flex-1"
                data-test="manual-repo-input"
                placeholder="owner/repo"
                value={manualRepo}
                onChange={(event) => setManualRepo(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    runManualRepo();
                  }
                }}
              />
              <Button
                data-test="trigger-manual-repo"
                disabled={triggerRun.isPending || manualRepo.trim().length === 0}
                onClick={runManualRepo}
              >
                Run enrichment
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
