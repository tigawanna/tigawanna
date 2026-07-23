import { sendContactMessage } from "@/routes/-components/landing/sections/contact/contact.functions";
import { contactFormSchema } from "@repo/ui/landing";
import { isWebMcpAvailable } from "@/lib/webmcp/is-webmcp-available";
import type { WebMcpToolDefinition } from "@/lib/webmcp/types";
import { getCompactSiteProfile } from "@/modules/portfolio/compact-site-profile";
import { findRelevantProjects } from "@/modules/portfolio/find-relevant-projects";
import type { GithubRepoNode } from "@/types/github";
import { unwrapUnknownError } from "@/utils/errors";

export type RegisterLandingWebMcpToolsOptions = {
  getProjects: () => GithubRepoNode[];
  signal?: AbortSignal;
};

function asString(value: unknown, field: string) {
  if (typeof value !== "string") {
    throw new Error(`${field} must be a string`);
  }

  return value;
}

function createLandingWebMcpTools(getProjects: () => GithubRepoNode[]): WebMcpToolDefinition[] {
  return [
    {
      name: "get_about_me",
      description:
        "Get compact information about Dennis Waweru: role, location, how he works, stack, primary technologies, contact links, and SEO keywords.",
      inputSchema: {
        type: "object",
        properties: {},
      },
      execute: async () => getCompactSiteProfile(),
    },
    {
      name: "get_in_touch",
      description:
        "Send a contact message to Dennis Waweru, the same as submitting the portfolio contact form.",
      inputSchema: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "Sender name.",
          },
          contact: {
            type: "string",
            description: "Optional email, phone, or other way to reach the sender.",
          },
          message: {
            type: "string",
            description: "Message body describing the inquiry or opportunity.",
          },
        },
        required: ["name", "message"],
      },
      execute: async (args) => {
        const parsed = contactFormSchema.parse({
          name: asString(args.name, "name"),
          contact: typeof args.contact === "string" ? args.contact : "",
          message: asString(args.message, "message"),
        });

        try {
          await sendContactMessage({ data: parsed });
          return {
            success: true,
            message: "Message sent. Dennis will get back to you soon.",
          };
        } catch (err: unknown) {
          return {
            success: false,
            message: unwrapUnknownError(err).message,
          };
        }
      },
    },
    {
      name: "find_relevant_projects",
      description:
        "Find portfolio projects most relevant to a project type or technology need. Matches GitHub repository tags first, then names and descriptions. Tag-based for now; semantic grouping will improve later.",
      inputSchema: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description:
              "Technologies, project type, or tags to match. Example: react native expo mobile or api typescript elysia.",
          },
          limit: {
            type: "number",
            description: "Maximum number of projects to return. Defaults to 6.",
          },
        },
        required: ["query"],
      },
      execute: async (args) => {
        const query = asString(args.query, "query");
        const limit = typeof args.limit === "number" && args.limit > 0 ? Math.floor(args.limit) : 6;
        const projects = findRelevantProjects(getProjects(), query, limit);

        return {
          query,
          count: projects.length,
          projects,
        };
      },
    },
  ];
}

export function registerLandingWebMcpTools({
  getProjects,
  signal,
}: RegisterLandingWebMcpToolsOptions) {
  if (!isWebMcpAvailable() || !document.modelContext) return false;

  for (const tool of createLandingWebMcpTools(getProjects)) {
    document.modelContext.registerTool(tool, { signal });
  }

  return true;
}
