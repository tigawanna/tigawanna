
	import { createMiddleware } from "rakkasjs/node-adapter";
	import handler from "./hattip.js";

	export default createMiddleware(handler, { origin: "", trustProxy: true });
