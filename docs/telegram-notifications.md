# Telegram notifications for a website

A simple way to get alerts from your site into Telegram — contact form submissions, critical errors, auth emails, etc. — without SMTP.

This is how it works on this project: a Telegram bot posts into a private channel via the Bot API.

## What you need

1. A Telegram bot (token from BotFather)
2. A Telegram channel (or group) the bot can post to
3. Two env vars on your server / host:

```bash
TELEGRAM_BOT_TOKEN=123456:ABC-DEF...
TELEGRAM_CHANNEL_ID=-100xxxxxxxxxx
```

## 1. Create the bot

1. Open Telegram and message [@BotFather](https://t.me/BotFather).
2. Send `/newbot` and follow the prompts (name + username).
3. Copy the **HTTP API token**. That is `TELEGRAM_BOT_TOKEN`.
4. Keep it secret — treat it like a password.

## 2. Create a channel and add the bot

1. Create a **private channel** (recommended) or use an existing one.
2. Add your bot as an **admin** with permission to post messages.
3. Post any message in the channel once so Telegram knows the bot is there.

## 3. Get the channel ID

Channel IDs usually look like `-100…`.

**Easy method:**

1. Forward a message from the channel to [@userinfobot](https://t.me/userinfobot) or [@getidsbot](https://t.me/getidsbot).
2. Copy the chat / channel id they return → that is `TELEGRAM_CHANNEL_ID`.

**API method:**

1. Post something in the channel (with the bot as admin).
2. Open:

```text
https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates
```

3. Look for `"chat":{"id":-100...}` in the JSON.

## 4. Put the env vars on the host

Set both variables wherever the site runs (Vercel, Docker, `.env`, etc.):

```bash
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHANNEL_ID=-100...
```

Redeploy / restart so the process picks them up.

If either is missing, this project simply skips Telegram (e.g. contact messages still save in the CMS).

## 5. Send a message from your app

Under the hood it is one HTTP POST:

```text
POST https://api.telegram.org/bot<TOKEN>/sendMessage
Content-Type: application/json

{
  "chat_id": "<CHANNEL_ID>",
  "text": "Your alert text here",
  "disable_web_page_preview": true
}
```

In this repo that call is wrapped by `@repo/telegram` / `getTelegramClient()`:

```ts
const telegram = getTelegramClient();
if (telegram) {
  await telegram.send("Site is up — test notification");
}
```

### Quick curl smoke test

```bash
curl -sS "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
  -H "Content-Type: application/json" \
  -d "{\"chat_id\":\"${TELEGRAM_CHANNEL_ID}\",\"text\":\"Hello from the server\"}"
```

If that lands in the channel, your credentials are correct.

## What this project notifies about

| Event | When |
| --- | --- |
| Contact form | Every successful submission (also stored in the CMS) |
| Critical site errors | Production only (not local / preview) |
| Auth / system “email” | Relayed to Telegram instead of SMTP when configured |

You can use the same bot + channel for any other server-side event: failed jobs, deploy hooks, uptime webhooks, etc.

## Tips

- Prefer a **private channel** so only you (and invited people) see alerts.
- One bot can post to several channels if you keep multiple channel IDs; this project uses one.
- Telegram text messages max out at **4096 characters** — truncate long stacks before sending.
- Never commit the bot token. Rotate it in BotFather if it leaks (`/revoke`).

## Checklist

- [ ] Bot created via BotFather
- [ ] Bot added as channel admin
- [ ] `TELEGRAM_BOT_TOKEN` set
- [ ] `TELEGRAM_CHANNEL_ID` set (usually starts with `-100`)
- [ ] Curl / app send test succeeds
- [ ] Redeployed with env vars
