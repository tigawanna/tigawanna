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
		throw new Error("missing params");
	}
	if(!repo){
		throw new Error("missing params");
	}
	if(!path){
		throw new Error("missing params");
	}
	if(!message){
	throw new Error("missing params");
}
}

const res = await savePackageJsonsToRepo({owner,repo,message,path})

// const body = ctx.request

return json({res});


}
