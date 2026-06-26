import { botIdProtectedRoutes } from "@/lib/botid/protected-routes";
import { initBotId } from "botid/client/core";
import { useEffect } from "react";

let initialized = false;

export function BackstageBotIdInit() {
  useEffect(() => {
    if (initialized) {
      return;
    }

    initBotId({
      protect: [...botIdProtectedRoutes],
    });
    initialized = true;
  }, []);

  return null;
}
