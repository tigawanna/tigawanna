import { json } from "@hattip/response";



export function get() {
  return json({ hello:"world" });

}
