import { Bot } from "../types";

/**
 * /balance <stx_address> — agBTC balance for a given address
 */
export function registerBalanceCommand(bot: Bot) {
    bot.command("balance", async (ctx) => {
        const parts = ctx.message.text.split(" ");
        const address = parts[1];

        if (!address) {
            return ctx.reply(
                "Please provide a Stacks address.\n\nExample: `/balance ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM`",
                { parse_mode: "Markdown" }
            );
        }

        // TODO: call the Stacks API to read agBTC token balance
        // const url = `${process.env.STACKS_API_URL}/v2/contracts/call-read/...`;
        const mockBalance = "2.1402 agBTC";

        ctx.reply(
            `💼 *agBTC Balance*\n\n` +
            `Address: \`${address}\`\n` +
            `Balance: \`${mockBalance}\`\n\n` +
            `_≈ 2.2472 sBTC at current exchange rate_`,
            { parse_mode: "Markdown" }
        );
    });
}
