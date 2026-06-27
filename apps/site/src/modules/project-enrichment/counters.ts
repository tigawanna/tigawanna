export type RunCounters = {
  reposSynced: number;
  reposSkipped: number;
  reposEnriched: number;
};

export type RepoProcessDelta = {
  reposSynced: number;
  reposSkipped: number;
  reposEnriched: number;
};

export function sumDeltas(deltas: RepoProcessDelta[]): RunCounters {
  return deltas.reduce(
    (totals, delta) => ({
      reposSynced: totals.reposSynced + delta.reposSynced,
      reposSkipped: totals.reposSkipped + delta.reposSkipped,
      reposEnriched: totals.reposEnriched + delta.reposEnriched,
    }),
    { reposSynced: 0, reposSkipped: 0, reposEnriched: 0 },
  );
}
