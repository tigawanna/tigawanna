import { z } from "zod";

export const monorepoPackageSchema = z.object({
  path: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1).max(200),
});

export const enrichmentSchema = z.object({
  description: z.string().min(1).max(350),
  topics: z.array(z.string().min(1).max(50)).min(1).max(10),
  homepage: z.url().optional().or(z.literal("")),
  confidence: z.object({
    description: z.number().min(0).max(1),
    topics: z.number().min(0).max(1),
    homepage: z.number().min(0).max(1),
  }),
  reasoning: z.string().max(500),
  monorepoPackages: z.array(monorepoPackageSchema).optional(),
});

export type MonorepoPackageDescription = z.infer<typeof monorepoPackageSchema>;
export type EnrichmentPayload = z.infer<typeof enrichmentSchema>;
