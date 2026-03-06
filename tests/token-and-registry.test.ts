import { describe, it, expect, beforeEach } from "vitest";
import { setupTestEnv } from "./helpers/setup";
import { Cl, cvToString } from "@stacks/transactions";

describe("agBTC Token & Strategy Registry", () => {
    let simnet: any;
    let deployer: string;
    let wallet1: string;

    beforeEach(async () => {
        const env = await setupTestEnv();
        simnet = env.simnet;
        deployer = env.deployer;
        wallet1 = env.wallet1;
    });

    describe("token-agbtc", () => {
        it("has correct metadata", () => {
            const name = simnet.callReadOnlyFn("token-agbtc", "get-name", [], deployer);
            expect(cvToString(name.result)).toBe('(ok "Aggregator BTC")');

            const symbol = simnet.callReadOnlyFn("token-agbtc", "get-symbol", [], deployer);
            expect(cvToString(symbol.result)).toBe('(ok "agBTC")');

            const decimals = simnet.callReadOnlyFn("token-agbtc", "get-decimals", [], deployer);
            expect(cvToString(decimals.result)).toBe("(ok u8)");
        });

        it("prevents unauthorized minting", () => {
            const result = simnet.callPublicFn("token-agbtc", "mint", [
                Cl.uint(100),
                Cl.standardPrincipal(wallet1)
            ], deployer);
            expect(cvToString(result.result)).toBe("(err u1000)"); // ERR-UNAUTHORIZED
        });
    });

    describe("strategy-registry", () => {
        it("allows owner to add a strategy", () => {
            const result = simnet.callPublicFn("strategy-registry", "add-strategy", [
                Cl.stringAscii("Zest Protocol"),
                Cl.contractPrincipal(deployer, "strategy-zest"),
                Cl.uint(5000)
            ], deployer);
            expect(cvToString(result.result)).toBe("(ok u1)");

            const count = simnet.callReadOnlyFn("strategy-registry", "get-strategy-count", [], deployer);
            expect(cvToString(count.result)).toBe("u1");
        });

        it("prevents non-owner from adding a strategy", () => {
            const result = simnet.callPublicFn("strategy-registry", "add-strategy", [
                Cl.stringAscii("Zest Protocol"),
                Cl.contractPrincipal(deployer, "strategy-zest"),
                Cl.uint(5000)
            ], wallet1);

            expect(cvToString(result.result)).toBe("(err u2000)"); // ERR-UNAUTHORIZED
        });
    });
});
