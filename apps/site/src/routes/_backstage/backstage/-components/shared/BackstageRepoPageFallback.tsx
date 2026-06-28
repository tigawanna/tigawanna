function BackstageRepoPageFallback() {
  return (
    <div
      className="mx-auto flex w-full max-w-6xl flex-col gap-6"
      data-test="backstage-page-loading"
    >
      <div className="skeleton h-8 w-48 rounded-lg" />
      <div className="skeleton h-4 w-full max-w-2xl rounded-lg" />
      <div className="skeleton min-h-96 w-full rounded-xl" />
    </div>
  );
}

export { BackstageRepoPageFallback };
