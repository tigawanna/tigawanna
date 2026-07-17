import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { SlidersHorizontal } from "lucide-react";
import type { ReactNode } from "react";

type BackstageFiltersDialogProps = {
  activeFilterCount: number;
  onClear?: () => void;
  children: ReactNode;
  "data-test"?: string;
};

export function BackstageFiltersDialog({
  activeFilterCount,
  onClear,
  children,
  "data-test": dataTest,
}: BackstageFiltersDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="shrink-0 gap-2" data-test={dataTest}>
          <SlidersHorizontal className="h-4 w-4" />
          <span>Filters</span>
          {activeFilterCount > 0 ? (
            <Badge
              variant="secondary"
              className="h-5 min-w-5 justify-center rounded-full px-1.5 text-xs"
            >
              {activeFilterCount}
            </Badge>
          ) : null}
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-md"
        data-test={dataTest ? `${dataTest}-content` : undefined}
      >
        <DialogHeader>
          <DialogTitle>Filters & sort</DialogTitle>
          <DialogDescription>Changes apply immediately.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">{children}</div>
        {onClear && activeFilterCount > 0 ? (
          <DialogFooter>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              data-test={dataTest ? `${dataTest}-clear` : undefined}
            >
              Clear filters
            </Button>
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

type BackstageFilterFieldProps = {
  label: string;
  children: ReactNode;
};

export function BackstageFilterField({ label, children }: BackstageFilterFieldProps) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      {children}
    </div>
  );
}
