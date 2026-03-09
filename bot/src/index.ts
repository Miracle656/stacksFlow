import { Telegraf } from "telegraf";
import * as dotenv from "dotenv";
import { registerStartCommand } from "./commands/start";
import { registerStatsCommands } from "./commands/stats";
import { registerBalanceCommand } from "./commands/balance";

dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) throw new Error("BOT_TOKEN is not set in .env");

const bot = new Telegraf(BOT_TOKEN);

// ─── Register all command handlers ────────────────────────────────
registerStartCommand(bot);
registerStatsCommands(bot);
registerBalanceCommand(bot);

// ─── Help command (mirrors /start) ────────────────────────────────
bot.command("help", (ctx) =>
    ctx.reply(
        `*Aurum Bot Commands*\n\n` +
        `/tvl — Total Value Locked\n` +
        `/apy — Current blended APY\n` +
        `/balance <address> — agBTC balance`,
        { parse_mode: "Markdown" }
    )
);

// ─── Boot ─────────────────────────────────────────────────────────
bot.launch().then(() => console.log("🤖 Aurum bot running…"));

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
