import { createMiddleware } from "@hattip/adapter-node";
const entryNode_default = createMiddleware(
  (req, res, next) => import("../hattip.js").then((n) => n.e).then((m) => m.default(req, res, next))
);
export {
  entryNode_default as default
};
