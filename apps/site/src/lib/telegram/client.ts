import { z } from "zod";
import { getServerEnv } from "@/lib/envs/server-env";

const telegramEnvSchema = z.object({
  TELEGRAM_BOT_TOKEN: z.string().min(1),
  TELEGRAM_CHANNEL_ID: z.string().min(1),
});

export interface TelegramSendResult {
  success: boolean;
  message: string;
  statusCode: number;
}

export class TelegramNotifier {
  private readonly apiUrl: string;
  private readonly channelId: string;

  constructor() {
    const env = getServerEnv();
    const parsed = telegramEnvSchema.safeParse({
      TELEGRAM_BOT_TOKEN: env.TELEGRAM_BOT_TOKEN,
      TELEGRAM_CHANNEL_ID: env.TELEGRAM_CHANNEL_ID,
    });

    if (!parsed.success) {
      throw new Error("Telegram bot token and channel ID must be provided");
    }

    this.channelId = parsed.data.TELEGRAM_CHANNEL_ID;
    this.apiUrl = `https://api.telegram.org/bot${parsed.data.TELEGRAM_BOT_TOKEN}/sendMessage`;
  }

  async send(message: string): Promise<TelegramSendResult> {
    const response = await fetch(this.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: this.channelId,
        text: message,
        disable_web_page_preview: true,
      }),
    });

    if (!response.ok) {
      return {
        success: false,
        message: `Telegram API responded with status ${response.status}`,
        statusCode: response.status,
      };
    }

    return {
      success: true,
      message: "Message sent successfully",
      statusCode: 200,
    };
  }
}
