import { Bot } from "../types";

/**
 * /start — welcome message + command list
 */
export function registerStartCommand(bot: Bot) {
    bot.command("start", (ctx) => {
        ctx.reply(
            `👋 Welcome to *Aurum Bot*!\n\n` +
            `I track your sBTC yield positions on Aurum.\n\n` +
            `*Commands*\n` +
            `/tvl — Total Value Locked in the Aurum vault\n` +
            `/apy — Current blended APY (Zest + Hermetica)\n` +
            `/balance <stx_address> — Your agBTC balance\n` +
            `/help — Show this message`,
            { parse_mode: "Markdown" }
        );
    });
}
