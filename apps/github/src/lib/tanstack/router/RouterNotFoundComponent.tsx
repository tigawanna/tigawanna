import { AppConfig } from "@/utils/system";
import { Link } from "@tanstack/react-router";

export function RouterNotFoundComponent() {
  return (
    <div
      data-test="router-not-found"
      className="bg-base-100 text-base-content flex min-h-screen flex-col items-center justify-center px-6 py-20"
    >
      <RouterNotFoundContent />
    </div>
  );
}

function RouterNotFoundContent() {
  const Icon = AppConfig.icon;

  return (
    <div className="flex max-w-md flex-col items-center text-center">
      <Icon className="text-primary size-16" aria-hidden />

      <p className="text-base-content/50 mt-8 text-sm tracking-[0.32em] uppercase">404</p>

      <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">Page not found</h1>

      <p className="text-base-content/70 mt-5 text-base leading-7">
        The page you&apos;re looking for doesn&apos;t exist. Head back to the dashboard.
      </p>

      <div className="mt-8">
        <Link to="/" data-test="router-not-found-home" className="btn btn-primary">
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
