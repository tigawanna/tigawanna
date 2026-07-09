import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements, userAc } from "better-auth/plugins/admin/access";

const backstageStatements = {
  project: ["list", "view", "import", "update", "delete", "enrich"],
  enrichment: ["list", "view", "approve", "reject", "run"],
  embedding: ["list", "view", "index"],
  journal: ["list", "view", "create", "update", "delete"],
  contact: ["list", "view", "delete"],
} as const;

const statement = {
  ...defaultStatements,
  ...backstageStatements,
} as const;

const authAc = createAccessControl(statement);

const authRoles = {
  admin: authAc.newRole({
    ...adminAc.statements,
    ...backstageStatements,
  }),
  user: authAc.newRole({
    ...userAc.statements,
    project: [],
    enrichment: [],
    embedding: [],
    journal: [],
    contact: [],
  }),
};

type BetterAuthUserRoles = keyof typeof authRoles;

const userRoles = Object.keys(authRoles) as BetterAuthUserRoles[];

export { authAc, authRoles, userRoles, type BetterAuthUserRoles };
