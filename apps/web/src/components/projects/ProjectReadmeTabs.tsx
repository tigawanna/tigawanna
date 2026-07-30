import type { DefaultTypedEditorState } from "@payloadcms/richtext-lexical";

import { RichText } from "@/components/richtext/RichText";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type ProjectPackageTab = {
  /** Stable tab value (usually package path). */
  value: string;
  /** Tab label shown in the scrollable list. */
  label: string;
  /** Lexical body when a README exists. */
  content: DefaultTypedEditorState | null;
};

type ProjectReadmeTabsProps = {
  packages: ProjectPackageTab[];
};

/**
 * Scrollable ShadCN tabs for monorepo package READMEs.
 * Packages without a README still appear — content shows the package name only.
 */
export function ProjectReadmeTabs({ packages }: ProjectReadmeTabsProps) {
  if (packages.length === 0) return null;

  const defaultValue = packages[0]!.value;

  return (
    <Tabs defaultValue={defaultValue} className="w-full gap-4" data-test="project-readme-tabs">
      <div className="overflow-x-auto pb-1">
        <TabsList className="min-w-full justify-start" variant="default">
          {packages.map((pkg) => (
            <TabsTrigger key={pkg.value} value={pkg.value} data-test="project-readme-tab">
              {pkg.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {packages.map((pkg) => (
        <TabsContent key={pkg.value} value={pkg.value} data-test="project-readme-panel">
          {pkg.content ? (
            <RichText data={pkg.content} enableGutter={false} />
          ) : (
            <p className="text-base-content/70" data-test="project-readme-empty">
              {pkg.label}
            </p>
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
}
