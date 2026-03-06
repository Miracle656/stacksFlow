import { describe, it, expect, beforeEach } from "vitest";
import { setupTestEnv, createSip010 } from "./helpers/setup";
import { Cl, cvToString } from "@stacks/transactions";

describe("strategy-zest", () => {
    let simnet: any;
    let deployer: string;
    let aggregator: string;

    beforeEach(async () => {
        const env = await setupTestEnv();
        simnet = env.simnet;
        deployer = env.deployer;
        // mock aggregator vault for auth
        aggregator = `${deployer}.aggregator-vault`;
    });

    it.skip("can deposit sBTC and receive zsBTC", () => {
        // 1. Give the zest strategy some mock sBTC to simulate vault routing
        simnet.callPublicFn("sbtc-token", "mint", [Cl.uint(1000), Cl.contractPrincipal(deployer, "strategy-zest")], deployer);

        // 2. Deposit into zest
        const result = simnet.callPublicFn("strategy-zest", "deposit", [Cl.uint(1000)], aggregator);
        expect(result.result).toBe("(ok true)");

        // 3. Verify adapter holds zsBTC
        const balance = simnet.callReadOnlyFn("strategy-zest", "get-zsbtc-balance", [], deployer);
        expect(balance.result).toBe("(ok u1000)");

        // 4. Verify sBTC equivalent
        const eq = simnet.callReadOnlyFn("strategy-zest", "get-sbtc-balance", [], deployer);
        expect(eq.result).toBe("(ok u1000)");
    });

    it.skip("can withdraw zsBTC and receive sBTC", () => {
        // 1. Setup: deposit first
        simnet.callPublicFn("sbtc-token", "mint", [Cl.uint(1000), Cl.contractPrincipal(deployer, "strategy-zest")], deployer);
        simnet.callPublicFn("strategy-zest", "deposit", [Cl.uint(1000)], aggregator);

        // 2. Withdraw
        const result = simnet.callPublicFn("strategy-zest", "withdraw", [Cl.uint(500)], aggregator);
        expect(result.result).toBe("(ok true)");

        // 3. Verify balance went down
        const balance = simnet.callReadOnlyFn("strategy-zest", "get-zsbtc-balance", [], deployer);
        expect(balance.result).toBe("(ok u500)");
    });

    it("prevents unauthorized access", () => {
        const result = simnet.callPublicFn("strategy-zest", "deposit", [Cl.uint(1000)], deployer);
        expect(cvToString(result.result)).toBe("(err u3000)"); // ERR-UNAUTHORIZED
    });
});
