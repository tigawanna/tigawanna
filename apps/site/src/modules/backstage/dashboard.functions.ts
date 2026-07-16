import { requireBackstageSession } from "@/lib/better-auth/session.server";
import {
  loadBackstageDashboardCounts,
  type BackstageDashboardCounts,
} from "@/modules/backstage/dashboard.server";
import { createServerFn } from "@tanstack/react-start";

export type { BackstageDashboardCounts };

export const getBackstageDashboardCounts = createServerFn({ method: "GET" }).handler(
  async (): Promise<BackstageDashboardCounts> => {
    await requireBackstageSession();
    return loadBackstageDashboardCounts();
  },
);
