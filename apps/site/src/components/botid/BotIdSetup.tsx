import { botIdProtectedRoutes } from "@/lib/botid/protected-routes";
import { initBotId } from "botid/client/core";
import { useEffect } from "react";

export function BotIdSetup() {
  useEffect(() => {
    if (!import.meta.env.PROD) {
      return;
    }

    initBotId({
      protect: [...botIdProtectedRoutes],
    });
  }, []);

  return null;
}
