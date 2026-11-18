import "dotenv/config";
import { Api } from "node-telegram-bot-api";

async function setTelegramWebhook() {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const secretToken = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();
  const webhookUrl = process.env.TELEGRAM_WEBHOOK_URL?.trim();

  if (!token || !secretToken || !webhookUrl) {
    throw new Error(
      "Set TELEGRAM_BOT_TOKEN, TELEGRAM_WEBHOOK_SECRET, and TELEGRAM_WEBHOOK_URL before registering the webhook.",
    );
  }

  if (!/^[A-Za-z0-9_-]{1,256}$/.test(secretToken)) {
    throw new Error("TELEGRAM_WEBHOOK_SECRET must be 1-256 characters using only letters, numbers, underscores, or hyphens.");
  }

  const url = new URL(webhookUrl);
  if (url.protocol !== "https:") {
    throw new Error("TELEGRAM_WEBHOOK_URL must use HTTPS.");
  }

  await new Api(token).setWebhook({
    url: url.toString(),
    secret_token: secretToken,
    allowed_updates: ["message"],
  });

  console.log("Telegram webhook registered.");
}

setTelegramWebhook().catch((error: unknown) => {
  console.error("Failed to register Telegram webhook:", error);
  process.exitCode = 1;
});
