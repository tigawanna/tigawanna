import { checkBotId } from "botid/server";

export async function requireHumanVerification() {
  const verification = await checkBotId();

  if (verification.isBot) {
    throw new Error("Request blocked. Please refresh the page and try again.");
  }
}
