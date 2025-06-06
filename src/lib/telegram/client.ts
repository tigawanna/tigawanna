interface TelegramConfig {
  botToken: string;
  channelId: string; // Can be @channelname or numeric ID
}

interface ResponseData {
  success: boolean;
  message: string;
  statusCode?: number;
}

// telgram api anatomy https://api.telegram.org/bot<token>/getChat?chat_id=<chat_id>
export class TelegramNotifier {
  private readonly apiUrl: string;
private readonly config: TelegramConfig;
  
  constructor() {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const channelId = process.env.TELEGRAM_CHANNEL_ID;
    if (!botToken || botToken.trim() === "") {
        throw new Error("Telegram bot token must be provided");
    }
    if (!channelId || channelId.trim() === "") {
        throw new Error("Telegram channel ID must be provided");
    }
    this.config = {
      botToken,
      channelId,
    };
    this.apiUrl = `https://api.telegram.org/bot${this.config.botToken}/sendMessage`;
  }

  async send(message: string): Promise<ResponseData> {
    try {
      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: this.config.channelId,
          text: message,
          disable_web_page_preview: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await response.json();
      return {
        success: true,
        message: "Message sent successfully",
        statusCode: 200,
      };
    } catch (error) {
      if (error instanceof Error) {
        console.error("Failed to send Telegram message:", error.message);
        return {
          success: false,
          message: "Error sending message:" + error.message,
          statusCode: 500,
        };
      }
      console.error("Failed to send Telegram message:", error);
      return {
        success: false,
        message: "Unknown error sending message",
        statusCode: 500,
      };
    }
  }
}

export const telegramEnv = {
  botToken: process.env.TELEGRAM_BOT_TOKEN || "",
  channelId: process.env.TELEGRAM_CHANNEL_ID || "",
};
