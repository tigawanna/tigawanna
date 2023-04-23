import { json } from "@hattip/response";
function post(ctx) {
  return new Response("NIce", {
    headers: { "content-type": "application/json" }
  });
}
async function get(ctx) {
  const { searchParams } = new URL(ctx.request.url);
  return json({ searchParams });
}
export {
  get,
  post
};
