import { RequestContext } from "rakkasjs";

// 


export function post(ctx:RequestContext) {
	// console.log("ctx  === ",ctx)


	return new Response("NIce", {
		headers: { "content-type": "application/json" },
	});
}


import { json } from "@hattip/response";
import { savePackageJsonsToRepo } from "../../../state/user-tools/user-packages";

export async function get(ctx:RequestContext) {
// const { searchParams } = new URL(ctx.request.url);

const res = await savePackageJsonsToRepo({})

// const body = ctx.request

return json({res});


}
