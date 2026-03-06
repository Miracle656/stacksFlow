import { describe, it, expect, beforeEach } from "vitest";
import { setupTestEnv } from "./helpers/setup";
import { Cl, cvToString } from "@stacks/transactions";

describe("strategy-hermetica", () => {
    let simnet: any;
    let deployer: string;
    let aggregator: string;

    beforeEach(async () => {
        const env = await setupTestEnv();
        simnet = env.simnet;
        deployer = env.deployer;
        aggregator = `${deployer}.aggregator-vault`;
    });

    it.skip("can deposit sBTC and receive hBTC", () => {
        simnet.callPublicFn("sbtc-token", "mint", [Cl.uint(1000), Cl.contractPrincipal(deployer, "strategy-hermetica")], deployer);

        const result = simnet.callPublicFn("strategy-hermetica", "deposit", [Cl.uint(1000)], aggregator);
        expect(result.result).toBe("(ok true)");

        const balance = simnet.callReadOnlyFn("strategy-hermetica", "get-hbtc-balance", [], deployer);
        expect(balance.result).toBe("(ok u1000)");
    });

    it.skip("can request redeem and complete the cycle", () => {
        // 1. Deposit
        simnet.callPublicFn("sbtc-token", "mint", [Cl.uint(1000), Cl.contractPrincipal(deployer, "strategy-hermetica")], deployer);
        simnet.callPublicFn("strategy-hermetica", "deposit", [Cl.uint(1000)], aggregator);

        // 2. Request Redeem
        const reqResult = simnet.callPublicFn("strategy-hermetica", "request-redeem", [Cl.uint(1000)], aggregator);
        expect(reqResult.result).toBe("(ok u1)"); // Claim ID 1

        // 3. Fund
        const fundResult = simnet.callPublicFn("strategy-hermetica", "fund-claim", [Cl.uint(1)], aggregator);
        expect(fundResult.result).toBe("(ok true)");

        // 4. Complete
        const compResult = simnet.callPublicFn("strategy-hermetica", "complete-redeem", [Cl.uint(1)], aggregator);
        expect(compResult.result).toBe("(ok u5000)"); // Mock returns 5000
    });

    it("prevents unauthorized access", () => {
        const result = simnet.callPublicFn("strategy-hermetica", "deposit", [Cl.uint(1000)], deployer);
        expect(cvToString(result.result)).toBe("(err u4000)"); // ERR-UNAUTHORIZED
    });
});
