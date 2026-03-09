"use client";

import { useState, useEffect } from "react";
import { Lock, CheckCircle2, Clock } from "lucide-react";
import { useWallet } from "./WalletProvider";
import { Cl } from "@stacks/transactions";

// ─── Mock claim data ─────────────────────────────────────────────
// unlockAt is a real epoch ms timestamp — claims count down live.
// In a real app these would come from on-chain events/indexer.
const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

// Simulate: claim #1 was requested ~34 hours ago (still ~38 hrs left)
// Simulate: claim #2 was requested 4+ days ago (already unlocked)
const CLAIMS = [
    { id: 1, amount: "1.5000", unlockAt: Date.now() + 38 * 60 * 60 * 1000 },
    { id: 2, amount: "0.2500", unlockAt: Date.now() - 60 * 1000 }, // already past
];

// ─── Helpers ─────────────────────────────────────────────────────
function getTimeRemaining(unlockAt: number): string {
    const diff = unlockAt - Date.now();
    if (diff <= 0) return "";

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    const parts: string[] = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0 || parts.length === 0) parts.push(`${minutes}m`);
    return parts.join(" ");
}

// ─── Component ───────────────────────────────────────────────────
export default function ClaimsList() {
    const { userData } = useWallet();
    const [tick, setTick] = useState(0);

    // Re-render every minute so the countdown stays live
    useEffect(() => {
        const id = setInterval(() => setTick((t) => t + 1), 60_000);
        return () => clearInterval(id);
    }, []);

    const handleClaim = async (claimId: number) => {
        const connectModule = await import("@stacks/connect");
        const openContractCall =
            connectModule.openContractCall ||
            (connectModule as any).default?.openContractCall;
        openContractCall({
            network: "testnet",
            contractAddress: "ST1JAHE8GEHB0MCBGR8J6W0AA7TJEE1XKFSD2Q80H",
            contractName: "aggregator-vault",
            functionName: "complete-withdrawal",
            functionArgs: [Cl.uint(claimId)],
            onFinish: (data: any) =>
                console.log(`Claim #${claimId} completed:`, data),
        });
    };

    if (!userData) return null;

    return (
        <div
            className="card"
            style={{ padding: "2rem", marginTop: "1.5rem" }}
        >
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    marginBottom: "1.5rem",
                }}
            >
                <Clock size={18} color="var(--text-secondary)" />
                <h2 style={{ fontWeight: 700, fontSize: "1.1rem" }}>
                    Withdrawal Claims
                </h2>
                <span
                    className="badge badge-gray"
                    style={{ marginLeft: "auto" }}
                >
                    {CLAIMS.length} claims
                </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {CLAIMS.map((claim) => {
                    const remaining = getTimeRemaining(claim.unlockAt);
                    const isPending = remaining !== "";

                    return (
                        <div
                            key={claim.id}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "1rem 1.25rem",
                                borderRadius: "var(--radius-md)",
                                background: isPending
                                    ? "var(--surface-2)"
                                    : "var(--green-light)",
                                border: `1px solid ${isPending
                                        ? "var(--border)"
                                        : "rgba(18,183,106,0.25)"
                                    }`,
                                opacity: isPending ? 0.75 : 1,
                                transition: "opacity 0.15s ease",
                            }}
                        >
                            {/* Left side */}
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.875rem",
                                }}
                            >
                                <div
                                    style={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: "50%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        background: isPending
                                            ? "var(--border)"
                                            : "rgba(18,183,106,0.15)",
                                        color: isPending
                                            ? "var(--text-muted)"
                                            : "var(--green)",
                                        flexShrink: 0,
                                    }}
                                >
                                    {isPending ? (
                                        <Lock size={15} />
                                    ) : (
                                        <CheckCircle2 size={16} />
                                    )}
                                </div>
                                <div>
                                    <p
                                        style={{
                                            fontWeight: 700,
                                            fontSize: "1rem",
                                            color: isPending
                                                ? "var(--text-secondary)"
                                                : "var(--text-primary)",
                                        }}
                                    >
                                        {claim.amount}{" "}
                                        <span
                                            style={{
                                                fontSize: "0.8rem",
                                                fontWeight: 500,
                                                color: "var(--text-muted)",
                                            }}
                                        >
                                            sBTC
                                        </span>
                                    </p>
                                    <p
                                        style={{
                                            fontSize: "0.75rem",
                                            color: "var(--text-muted)",
                                        }}
                                    >
                                        Claim #{claim.id}
                                    </p>
                                </div>
                            </div>

                            {/* Right side */}
                            {isPending ? (
                                <div style={{ textAlign: "right" }}>
                                    <p
                                        style={{
                                            fontSize: "0.7rem",
                                            color: "var(--text-muted)",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.08em",
                                            fontWeight: 600,
                                            marginBottom: "0.15rem",
                                        }}
                                    >
                                        Unlocks in
                                    </p>
                                    <p
                                        style={{
                                            fontWeight: 700,
                                            fontSize: "0.875rem",
                                            color: "var(--text-secondary)",
                                            fontVariantNumeric: "tabular-nums",
                                        }}
                                    >
                                        {remaining}
                                    </p>
                                </div>
                            ) : (
                                <button
                                    className="btn-success"
                                    onClick={() => handleClaim(claim.id)}
                                    style={{ padding: "0.5rem 1.25rem" }}
                                >
                                    Claim sBTC
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            <p
                style={{
                    fontSize: "0.75rem",
                    color: "var(--text-muted)",
                    marginTop: "1rem",
                }}
            >
                Locked claims are undergoing the Hermetica 3-day redemption
                cooldown. Ready claims can be withdrawn instantly.
            </p>
        </div>
    );
}
