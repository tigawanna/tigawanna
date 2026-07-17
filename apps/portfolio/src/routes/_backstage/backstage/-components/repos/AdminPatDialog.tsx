import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  clearStoredGithubAdminPat,
  getStoredGithubAdminPat,
  setStoredGithubAdminPat,
} from "@/routes/_backstage/backstage/-utils/github-admin-pat-storage";
import { KeyRound, Loader } from "lucide-react";
import { useEffect, useState } from "react";

type AdminPatDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  repoFullName: string;
  onRetry: (pat: string) => void;
  isRetrying?: boolean;
};

export function AdminPatDialog({
  open,
  onOpenChange,
  repoFullName,
  onRetry,
  isRetrying,
}: AdminPatDialogProps) {
  const [pat, setPat] = useState("");

  useEffect(() => {
    if (open) {
      setPat(getStoredGithubAdminPat() ?? "");
    }
  }, [open]);

  const handleSaveAndRetry = () => {
    const trimmed = pat.trim();
    if (!trimmed) {
      return;
    }
    setStoredGithubAdminPat(trimmed);
    onRetry(trimmed);
  };

  const handleClearStored = () => {
    clearStoredGithubAdminPat();
    setPat("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-test="admin-pat-dialog">
        <DialogHeader>
          <DialogTitle>Admin token required</DialogTitle>
          <DialogDescription>
            Deleting <span className="font-medium">{repoFullName}</span> needs a GitHub personal
            access token with admin rights on the repository. Paste one below — it is saved only in
            this browser&apos;s local storage, not on the server.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2 py-2">
          <Label htmlFor="github-admin-pat">Personal access token</Label>
          <Input
            id="github-admin-pat"
            data-test="github-admin-pat-input"
            type="password"
            autoComplete="off"
            placeholder="ghp_…"
            value={pat}
            onChange={(event) => setPat(event.target.value)}
          />
          {getStoredGithubAdminPat() ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-base-content/60 h-auto justify-start px-0 text-xs"
              onClick={handleClearStored}
            >
              Clear saved token from this browser
            </Button>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            data-test="admin-pat-retry"
            disabled={!pat.trim() || isRetrying}
            onClick={handleSaveAndRetry}
            className="gap-1.5"
          >
            {isRetrying ? (
              <>
                <Loader className="size-3.5 animate-spin" />
                Retrying…
              </>
            ) : (
              <>
                <KeyRound className="size-3.5" />
                Save &amp; retry delete
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
