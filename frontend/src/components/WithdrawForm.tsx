"use client";

import { useState } from "react";
import { useWallet } from "./WalletProvider";
import { Cl } from "@stacks/transactions";

export default function WithdrawForm() {
    const [amount, setAmount] = useState("");
    const { userData } = useWallet();

    const handleWithdraw = async () => {
        if (!amount || parseFloat(amount) <= 0) return;
        const amountInSats = Math.floor(parseFloat(amount) * 100_000_000);
        const connectModule = await import('@stacks/connect');
        const openContractCall = connectModule.openContractCall || (connectModule as any).default?.openContractCall;
        openContractCall({
            network: "testnet",
            contractAddress: "ST1JAHE8GEHB0MCBGR8J6W0AA7TJEE1XKFSD2Q80H",
            contractName: "aggregator-vault",
            functionName: "request-withdraw",
            functionArgs: [Cl.uint(amountInSats)],
            onFinish: (data: any) => console.log("Withdrawal requested:", data),
        });
    };

    return (
        <div className="card-inner" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Withdraw agBTC</span>
                <span className="badge badge-gray">3-day cooldown</span>
            </div>

            <div style={{ position: 'relative' }}>
                <input
                    type="number"
                    step="any"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="input-field"
                    style={{ paddingRight: '4.5rem' }}
                />
                <span style={{
                    position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)',
                    fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-muted)',
                }}>agBTC</span>
            </div>

            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '-0.5rem', lineHeight: 1.5 }}>
                Large withdrawals may take up to 3 days to unlock from the Hermetica strategy.
            </p>

            <button
                className={`btn-danger ${(!amount || parseFloat(amount) <= 0) ? 'btn-disabled' : ''}`}
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={handleWithdraw}
                disabled={!amount || parseFloat(amount) <= 0}
            >
                Request Withdrawal
            </button>
        </div>
    );
}
