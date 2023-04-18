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
const { searchParams } = new URL(ctx.request.url);
const owner = searchParams.get("owner");
const repo = searchParams.get("repo");
const path = searchParams.get("path");
const message = searchParams.get("message");


if(!owner || !repo || !path || !message){
	if(!owner){
		console.log("missing owner params");
		return json(new Error("missing owner params"));
	}
	if(!repo){
		console.log("missing repo params");
		return json(new Error("missing repo params"));
	}
	if(!path){
		console.log("missing path params");
		return json(new Error("missing path params"));
	}
	if(!message){
		console.log("missing message params");
		return json(new Error("missing message params"));
}
}

const res = await savePackageJsonsToRepo({owner,repo,message,path})
return json({res});


}
