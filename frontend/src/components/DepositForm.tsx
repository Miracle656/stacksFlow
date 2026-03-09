"use client";

import { useState } from "react";
import { useWallet } from "./WalletProvider";
import { Cl } from "@stacks/transactions";

export default function DepositForm() {
    const [amount, setAmount] = useState("");
    const { userData } = useWallet();

    const handleDeposit = async () => {
        if (!amount || parseFloat(amount) <= 0) return;
        const amountInSats = Math.floor(parseFloat(amount) * 100_000_000);
        const connectModule = await import('@stacks/connect');
        const openContractCall = connectModule.openContractCall || (connectModule as any).default?.openContractCall;
        openContractCall({
            network: "testnet",
            contractAddress: "ST1JAHE8GEHB0MCBGR8J6W0AA7TJEE1XKFSD2Q80H",
            contractName: "aggregator-vault",
            functionName: "deposit",
            functionArgs: [Cl.uint(amountInSats)],
            onFinish: (data: any) => console.log("Deposit broadcasted:", data),
        });
    };

    const estOut = amount && parseFloat(amount) > 0
        ? (parseFloat(amount) / 1.050).toFixed(4)
        : null;

    return (
        <div className="card-inner" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Rate badge */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Deposit sBTC</span>
                <span className="badge badge-blue">1 agBTC ≈ 1.050 sBTC</span>
            </div>

            {/* Input */}
            <div style={{ position: 'relative' }}>
                <input
                    type="number"
                    step="any"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="input-field"
                    style={{ paddingRight: '4rem' }}
                />
                <span style={{
                    position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)',
                    fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-muted)',
                }}>sBTC</span>
            </div>

            {estOut && (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'right', marginTop: '-0.5rem' }}>
                    You receive ≈ <strong style={{ color: 'var(--blue)' }}>{estOut} agBTC</strong>
                </p>
            )}

            <button
                className={`btn-primary ${(!amount || parseFloat(amount) <= 0) ? 'btn-disabled' : ''}`}
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={handleDeposit}
                disabled={!amount || parseFloat(amount) <= 0}
            >
                Deposit
            </button>
        </div>
    );
}
