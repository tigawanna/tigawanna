//  how to use in the calling application

import { envVariables } from "@/env";

export interface SuccessResponse {
  type: "success";
  message?: string;
}

export type ErrorResponse = {
  type: "error";
  message: string;
};

type RequestResult = SuccessResponse | ErrorResponse;

type EmailMessagePayload = {
  clientName: string;
  from: string;
  to: string;
  subject: string;
  text: string;
  persist?: boolean | undefined;
  tg?: boolean | undefined;
};

export async function sendEmailMessage(message: EmailMessagePayload) {
  const { MESSAGE_API_URL, MESSAGE_API_KEY } = envVariables
//   const { MESSAGE_API_URL, MESSAGE_API_KEY } = process.env;
//   if (!MESSAGE_API_URL) throw new Error("Message API URL is not defined");
//   if (!MESSAGE_API_KEY) throw new Error("Message API key is not defined");
  try {
    const res = await fetch(`${MESSAGE_API_URL}/messages/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `bearer ${MESSAGE_API_KEY}`,
      },
      body: JSON.stringify(message),
    });

    if (!res.ok) {
    //   throw new Error(`Failed to send email: ${res.statusText}`);
    return
    }
    const resjson = res.json() as unknown as RequestResult
    if (resjson.type === "error") {
      return
    }
    return resjson;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error sending email:", error.message);
      return
    }
    console.error("Error sending email:", error);
    return
  }
}

type TelegramPayload = {
  clientName: string;
  type: string;
  data: string;
  persist?: boolean | undefined;
};

export async function sendTelegramMessage(message: TelegramPayload) {
      const { MESSAGE_API_URL, MESSAGE_API_KEY } = envVariables
//   const { MESSAGE_API_URL, MESSAGE_API_KEY } = process.env;
//   if (!MESSAGE_API_URL) throw new Error("Message API URL is not defined");
//   if (!MESSAGE_API_KEY) throw new Error("Message API key is not defined");
  try {
   const res = await fetch(`${MESSAGE_API_URL}/messages/tg`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `bearer ${MESSAGE_API_KEY}`,
      },
      body: JSON.stringify(message),
    });

    if (!res.ok) {
      throw new Error(`Failed to send Telegram message: ${res.statusText}`);
    }
    const resjson = res.json() as unknown as RequestResult
    if (resjson.type === "error") {
      throw new Error(resjson.message);
    }
    return resjson;
  } catch (error) {
    console.error("Error sending Telegram message:", error);
    throw error;
  }
}
