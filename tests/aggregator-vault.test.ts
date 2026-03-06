import { describe, it, expect, beforeEach } from "vitest";
import { setupTestEnv } from "./helpers/setup";
import { Cl, cvToString } from "@stacks/transactions";

describe("aggregator-vault", () => {
    let simnet: any;
    let deployer: string;
    let wallet1: string;
    let wallet2: string;

    beforeEach(async () => {
        const env = await setupTestEnv();
        simnet = env.simnet;
        deployer = env.deployer;
        wallet1 = env.wallet1;
        wallet2 = env.wallet2;

        // Mint 10,000 sBTC to wallet1 and wallet2
        simnet.callPublicFn("sbtc-token", "mint", [Cl.uint(1000000000), Cl.standardPrincipal(wallet1)], deployer);
        simnet.callPublicFn("sbtc-token", "mint", [Cl.uint(1000000000), Cl.standardPrincipal(wallet2)], deployer);
    });

    describe("deposit", () => {
        it("fails if amount is below minimum (1000 sats)", () => {
            const result = simnet.callPublicFn(
                "aggregator-vault",
                "deposit",
                [Cl.uint(999)],
                wallet1
            );
            expect(cvToString(result.result)).toBe("(err u5004)");
        });

        it("accepts deposit and routes 50/50 to strategies", () => {
            // 100,000 sats deposit
            const result = simnet.callPublicFn(
                "aggregator-vault",
                "deposit",
                [Cl.uint(100000)],
                wallet1
            );

            // Should mint exactly 100,000 agBTC shares (1:1 on first deposit)
            expect(cvToString(result.result)).toBe("(ok u100000)");

            // Verify vault total assets
            const total = simnet.callReadOnlyFn("aggregator-vault", "get-total-assets", [], deployer);
            expect(cvToString(total.result)).toBe("u100000");

            // Verify routing balances: Zest should have 50%, Hermetica 50%
            const zestBal = simnet.callPublicFn("strategy-zest", "get-zsbtc-balance", [], deployer);
            expect(cvToString(zestBal.result)).toBe("(ok u50000)");

            const hermBal = simnet.callPublicFn("strategy-hermetica", "get-hbtc-balance", [], deployer);
            expect(cvToString(hermBal.result)).toBe("(ok u50000)");

            // Verify user has the agBTC
            const agbtc = simnet.callReadOnlyFn("token-agbtc", "get-balance", [Cl.standardPrincipal(wallet1)], deployer);
            expect(cvToString(agbtc.result)).toBe("(ok u100000)");
        });
    });

    describe("withdraw", () => {
        beforeEach(() => {
            // Give wallet1 100,000 agBTC (representing 100,000 sBTC total TVL)
            simnet.callPublicFn(
                "aggregator-vault",
                "deposit",
                [Cl.uint(100000)],
                wallet1
            );
        });

        it("processes instant withdrawal if amount fits in Zest buffer", () => {
            // 40,000 agBTC withdraw (40k sBTC). Zest holds 50k, so this is instant
            const req = simnet.callPublicFn(
                "aggregator-vault",
                "request-withdraw",
                [Cl.uint(40000)],
                wallet1
            );
            // Returns claim id 1
            expect(cvToString(req.result)).toBe("(ok u1)");

            // Check claim status
            const claim = simnet.callReadOnlyFn("aggregator-vault", "get-claim", [Cl.uint(1)], deployer);
            expect(cvToString(claim.result)).toContain('(status "ready")');

            // Complete it immediately
            const comp = simnet.callPublicFn(
                "aggregator-vault",
                "complete-withdraw",
                [Cl.uint(1)],
                wallet1
            );
            expect(cvToString(comp.result)).toBe("(ok u40000)"); // 40,000 sBTC returned

            // Zest balance should now be 10k (50k - 40k)
            const zestBal = simnet.callPublicFn("strategy-zest", "get-zsbtc-balance", [], deployer);
            expect(cvToString(zestBal.result)).toBe("(ok u10000)");
        });

        it("processes cooldown withdrawal if amount exceeds Zest buffer", () => {
            // Setup: deposit 200k first
            simnet.callPublicFn("sbtc-token", "mint", [Cl.uint(200000), Cl.standardPrincipal(deployer)], deployer);
            simnet.callPublicFn("aggregator-vault", "deposit", [Cl.uint(200000)], wallet1);

            // Request withdrawal of 200k
            const req = simnet.callPublicFn(
                "aggregator-vault",
                "request-withdraw",
                [Cl.uint(200000)],
                wallet1
            );
            expect(cvToString(req.result)).toBe("(ok u1)");

            // Claim should be pending with a timestamp
            const claim = simnet.callReadOnlyFn("aggregator-vault", "get-claim", [Cl.uint(1)], deployer);
            expect(cvToString(claim.result)).toContain('(status "pending")');

            // Trying to complete immediately should fail with ERR-CLAIM-NOT-READY (5006)
            const earlyComp = simnet.callPublicFn(
                "aggregator-vault",
                "complete-withdraw",
                [Cl.uint(1)],
                wallet1
            );
            expect(cvToString(earlyComp.result)).toBe("(err u5006)");

            // Mine blocks to simulate 3 days passing
            // 3 days = 259200 seconds / 600 seconds per standard block = ~432 blocks
            simnet.mineEmptyBlocks(432);

            // Complete it
            const comp = simnet.callPublicFn(
                "aggregator-vault",
                "complete-withdraw",
                [Cl.uint(1)],
                wallet1
            );
            // Verify full amount is returned
            expect(cvToString(comp.result)).toBe("(ok u200000)");
        });
    });
});
