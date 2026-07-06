import type { MonorepoPackageDescription } from "@/modules/backstage/projects.functions";

type MonorepoPackagesListProps = {
  packages: MonorepoPackageDescription[];
  testId?: string;
};

/**
 * Read-only list of workspace packages inside a monorepo enrichment result.
 */
export function MonorepoPackagesList({ packages, testId }: MonorepoPackagesListProps) {
  if (packages.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-2" data-test={testId}>
      <h3 className="text-sm font-medium">Workspace packages</h3>
      <ul className="flex flex-col gap-3">
        {packages.map((pkg) => (
          <li
            key={pkg.path}
            className="rounded-lg border border-base-content/10 bg-base-200/30 px-3 py-2.5"
            data-test="monorepo-package-item"
          >
            <p className="text-sm font-medium">
              <span className="font-mono text-xs text-base-content/70">{pkg.path}</span>
              {pkg.name !== pkg.path ? (
                <span className="text-base-content/60"> · {pkg.name}</span>
              ) : null}
            </p>
            <p className="text-base-content/80 mt-1 text-sm leading-relaxed">{pkg.description}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
