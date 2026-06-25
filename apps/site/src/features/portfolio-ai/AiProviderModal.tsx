import { useState } from "react";
import { Database, Eye, EyeOff, KeyRound, ShieldCheck, Sparkles } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { ModelPicker } from "./ModelPicker";
import { DEFAULT_CHAT_MODEL, type AiSettings, type AiStorageType } from "@/types/ai-settings";

interface AiProviderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: AiSettings | null;
  onSave: (settings: AiSettings) => void;
  onClear: () => void;
}

export function AiProviderModal({
  open,
  onOpenChange,
  settings,
  onSave,
  onClear,
}: AiProviderModalProps) {
  const [apiKey, setApiKey] = useState(settings?.apiKey ?? "");
  const [model, setModel] = useState(settings?.model ?? DEFAULT_CHAT_MODEL);
  const [storageType, setStorageType] = useState<AiStorageType>(settings?.storageType ?? "local");
  const [showKey, setShowKey] = useState(false);

  function handleOpen(next: boolean) {
    if (next) {
      setApiKey(settings?.apiKey ?? "");
      setModel(settings?.model ?? DEFAULT_CHAT_MODEL);
      setStorageType(settings?.storageType ?? "local");
    }
    onOpenChange(next);
  }

  function handleSave() {
    if (!apiKey.trim() || !model) return;
    onSave({ apiKey: apiKey.trim(), model, storageType });
    onOpenChange(false);
  }

  function handleClear() {
    setApiKey("");
    setModel(DEFAULT_CHAT_MODEL);
    setStorageType("local");
    onClear();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="flex max-h-[92vh] flex-col gap-0 overflow-hidden border border-base-content/10 bg-base-100 p-0 shadow-2xl sm:max-w-2xl">
        <DialogHeader className="border-b border-base-content/10 px-6 py-5">
          <div className="flex items-start gap-3 pr-8">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-content shadow-sm">
              <Sparkles className="size-5" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="font-serif text-xl">OpenRouter settings</DialogTitle>
              <DialogDescription className="mt-1 leading-6">
                Bring your own key to power portfolio search and chat. Keys stay in this browser.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-4 overflow-y-auto px-6 py-5">
          <section className="rounded-2xl bg-base-200/50 p-4 ring-1 ring-base-content/10">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <Label htmlFor="portfolio-modal-api-key" className="text-sm font-semibold">
                  OpenRouter API key
                </Label>
                <p className="mt-1 text-xs leading-5 text-base-content/60">
                  Sent only when you search or chat. Never stored on the server.
                </p>
              </div>
              <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs text-base-content/60">
                <ShieldCheck className="size-3.5 text-primary" />
                Browser only
              </span>
            </div>
            <div className="relative">
              <Input
                id="portfolio-modal-api-key"
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(event) => setApiKey(event.target.value)}
                placeholder="sk-or-v1-..."
                className="h-12 rounded-2xl border-0 bg-base-100 pr-11 shadow-none ring-1 ring-base-content/10 focus-visible:ring-primary/35"
                autoComplete="off"
                data-test="portfolio-ai-api-key"
              />
              <button
                type="button"
                onClick={() => setShowKey((value) => !value)}
                className="absolute top-1/2 right-3 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-base-content/55 transition-colors hover:bg-base-content/8 hover:text-base-content"
                aria-label={showKey ? "Hide key" : "Show key"}
              >
                {showKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            <p className="mt-2 text-xs text-base-content/60">
              <a
                href="https://openrouter.ai/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary underline-offset-2 hover:underline"
              >
                Get a key on OpenRouter
              </a>
            </p>
          </section>

          <section className="rounded-2xl bg-base-200/50 p-4 ring-1 ring-base-content/10">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/12 text-primary">
                <Database className="size-4" />
              </div>
              <div>
                <Label className="text-sm font-semibold">Key storage</Label>
                <p className="text-xs text-base-content/60">Choose how long the key persists.</p>
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {(
                [
                  { value: "local", label: "Local storage", hint: "Persists across tabs" },
                  { value: "session", label: "Session storage", hint: "Cleared on tab close" },
                ] as const
              ).map(({ value, label, hint }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setStorageType(value)}
                  className={cn(
                    "rounded-xl px-3 py-3 text-left text-sm transition-colors ring-1",
                    storageType === value
                      ? "bg-primary/12 font-medium text-primary ring-primary/25"
                      : "bg-base-100 text-base-content/60 ring-base-content/10 hover:bg-primary/8 hover:text-base-content",
                  )}
                >
                  {label}
                  <span className="block text-xs font-normal opacity-70">{hint}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-2xl bg-base-200/50 p-4 ring-1 ring-base-content/10">
            <div className="mb-3">
              <Label className="text-sm font-semibold">Chat model</Label>
              <p className="mt-1 text-xs text-base-content/60">
                Used for conversational answers after repository search.
              </p>
            </div>
            <ModelPicker value={model} onChange={setModel} />
          </section>
        </div>

        <DialogFooter className="border-t border-base-content/10 bg-base-200/40 px-6 py-4">
          {settings ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="rounded-xl"
            >
              Clear
            </Button>
          ) : null}
          <Button
            type="button"
            onClick={handleSave}
            disabled={!apiKey.trim() || !model}
            size="sm"
            className="gap-2 rounded-xl"
            data-test="portfolio-ai-save"
          >
            <KeyRound className="size-3.5" />
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
