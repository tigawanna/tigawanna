import { json } from "@hattip/response";
import { getViewerLangs } from "../../util/gql";


export function get() {
  return json({ hello:getViewerLangs() });


}
