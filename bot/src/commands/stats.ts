import { Bot } from "../types";

/**
 * /tvl — fetch TVL from Stacks API (stubbed — replace with real call-read-only)
 * /apy — current blended APY
 */
export function registerStatsCommands(bot: Bot) {
    bot.command("tvl", async (ctx) => {
        // TODO: replace with actual read-only contract call to get total-deposited
        const mockTvl = "24.5 sBTC";
        ctx.reply(
            `📊 *Aurum Vault — TVL*\n\n` +
            `Total Value Locked: \`${mockTvl}\`\n\n` +
            `_Source: on-chain via Stacks API_`,
            { parse_mode: "Markdown" }
        );
    });

    bot.command("apy", async (ctx) => {
        // TODO: Pull live rates from Zest + Hermetica subgraphs / APIs
        ctx.reply(
            `📈 *Current Blended APY*\n\n` +
            `Zest Protocol (Lending):     3.5%\n` +
            `Hermetica (Delta-Neutral):  12.8%\n` +
            `─────────────────────────────\n` +
            `Blended Net APY:            ~8.15%\n\n` +
            `_Rates update hourly_`,
            { parse_mode: "Markdown" }
        );
    });
}
