import { initSimnet } from "@hirosystems/clarinet-sdk";
import { Cl } from "@stacks/transactions";

export async function setupTestEnv() {
    const simnet = await initSimnet();
    const accounts = simnet.getAccounts();
    const deployer = accounts.get("deployer")!;
    const wallet1 = accounts.get("wallet_1")!;
    const wallet2 = accounts.get("wallet_2")!;

    // Set the minter on token-agbtc to be the aggregator-vault contract
    // This must be done by the deployer (who is the initial minter)
    simnet.callPublicFn(
        "token-agbtc",
        "set-minter",
        [Cl.contractPrincipal(deployer, "aggregator-vault")],
        deployer
    );

    // Set the vault address on both strategies to fix circular dependencies
    simnet.callPublicFn(
        "strategy-zest",
        "set-vault-address",
        [Cl.contractPrincipal(deployer, "aggregator-vault")],
        deployer
    );

    simnet.callPublicFn(
        "strategy-hermetica",
        "set-vault-address",
        [Cl.contractPrincipal(deployer, "aggregator-vault")],
        deployer
    );

    return { simnet, deployer, wallet1, wallet2 };
}

// Helpers for SIP-010 token arguments
export function createSip010(address: string, contract: string) {
    return Cl.contractPrincipal(address, contract);
}
