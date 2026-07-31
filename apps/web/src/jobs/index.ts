import type { JobsConfig } from "payload";

import { fetchArtifactsTask } from "./tasks/fetch-artifacts";
import { listAndUpsertReposTask } from "./tasks/list-and-upsert-repos";
import { writeEnrichmentTask } from "./tasks/write-enrichment";
import { enrichRepoWorkflow } from "./workflows/enrich-repo";

/**
 * Payload Jobs config for GitHub sync.
 * No `autoRun` — serverless uses Vercel Cron → `/api/payload-jobs/run`.
 */
export const jobsConfig = {
  // Default is true — successful jobs are deleted after run, which breaks
  // status polling and admin inspection of history.
  deleteJobOnComplete: false,
  access: {
    run: ({ req }) => {
      if (req.user) return true;

      const secret = process.env.CRON_SECRET?.trim();
      if (!secret) return false;

      const authHeader = req.headers.get("authorization");
      return authHeader === `Bearer ${secret}`;
    },
  },
  jobsCollectionOverrides: ({ defaultJobsCollection }) => {
    if (!defaultJobsCollection.admin) {
      defaultJobsCollection.admin = {};
    }
    defaultJobsCollection.admin.hidden = false;
    return defaultJobsCollection;
  },
  tasks: [listAndUpsertReposTask, fetchArtifactsTask, writeEnrichmentTask],
  workflows: [enrichRepoWorkflow],
} satisfies JobsConfig;
