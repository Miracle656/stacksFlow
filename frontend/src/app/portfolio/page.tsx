"use client";

import { useState } from "react";
import { useWallet } from "@/components/WalletProvider";
import WalletConnect from "@/components/WalletConnect";
import {
    Star, TrendingUp, ArrowDownCircle, ArrowUpCircle,
    Award, Users, ChevronRight,
} from "lucide-react";
import { VaultDoorIcon } from "@/components/ThemeIcons";

// ─── Helper ──────────────────────────────────────────────────────
function getStxAddress(userData: any): string | null {
    if (userData?.addresses?.stx?.length > 0) return userData.addresses.stx[0].address;
    if (userData?.profile?.stxAddress?.mainnet) return userData.profile.stxAddress.mainnet;
    return null;
}

// ─── Mock data (replace with on-chain reads when deployed) ───────
const POSITIONS = [
    {
        id: 1,
        pool: "Zest Lending",
        asset: "sBTC → zsBTC",
        deposited: "0.7101",
        current: "0.7364",
        apy: "3.5%",
        yield: "+0.0263",
        color: "#8B5CF6",
    },
    {
        id: 2,
        pool: "Hermetica Delta-Neutral",
        asset: "sBTC → hBTC",
        deposited: "0.7101",
        current: "0.7866",
        apy: "12.8%",
        yield: "+0.0765",
        color: "var(--orange)",
    },
];

const ACTIVITY = [
    { type: "deposit", amount: "1.0000 sBTC", date: "Mar 01, 2026", status: "complete" },
    { type: "deposit", amount: "0.4202 sBTC", date: "Mar 04, 2026", status: "complete" },
    { type: "withdraw", amount: "0.2500 agBTC", date: "Mar 06, 2026", status: "pending" },
];

// ─── Component ───────────────────────────────────────────────────
export default function PortfolioPage() {
    const { userData } = useWallet();
    const [activeTab, setActiveTab] = useState<"positions" | "activity">("positions");

    if (!userData) {
        return (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "55vh", gap: "1.5rem", textAlign: "center" }}>
                <VaultDoorIcon size={80} />
                <div>
                    <h2 style={{ fontWeight: 800, fontSize: "1.75rem", letterSpacing: "-0.03em", marginBottom: "0.5rem" }}>Connect your wallet</h2>
                    <p style={{ color: "var(--text-secondary)", fontSize: "1rem", maxWidth: "360px", lineHeight: 1.6 }}>View your positions, yield history, and points.</p>
                </div>
                <WalletConnect />
            </div>
        );
    }

    const address = getStxAddress(userData);
    const shortAddr = address ? `${address.slice(0, 8)}...${address.slice(-6)}` : "Connected";

    const totalDeposited = POSITIONS.reduce((s, p) => s + parseFloat(p.deposited), 0).toFixed(4);
    const totalCurrent = POSITIONS.reduce((s, p) => s + parseFloat(p.current), 0).toFixed(4);
    const totalYield = POSITIONS.reduce((s, p) => s + parseFloat(p.yield), 0).toFixed(4);

    return (
        <div className="animate-up">
            {/* Page header */}
            <div style={{ marginBottom: "2rem" }}>
                <h1 style={{ fontWeight: 800, fontSize: "2rem", letterSpacing: "-0.03em", marginBottom: "0.25rem" }}>Portfolio</h1>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", fontFamily: "monospace" }}>{shortAddr}</p>
            </div>

            {/* Top stat row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
                <TopStat label="Total Deposited" value={`${totalDeposited} sBTC`} />
                <TopStat label="Current Value" value={`${totalCurrent} sBTC`} highlight />
                <TopStat label="Total Yield Earned" value={`+${totalYield} sBTC`} green />
                <TopStat label="Pending Yield" value="0.0051 sBTC" dot />
            </div>

            {/* 2-col layout */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "1.5rem", alignItems: "start" }}>

                {/* Left — Positions / Activity */}
                <div className="card" style={{ padding: "1.75rem" }}>
                    {/* Tabs */}
                    <div style={{ display: "flex", gap: "0.25rem", background: "var(--surface-2)", borderRadius: "var(--radius-sm)", padding: "0.25rem", marginBottom: "1.5rem", width: "fit-content" }}>
                        {(["positions", "activity"] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                style={{
                                    padding: "0.4rem 1.1rem",
                                    borderRadius: "var(--radius-sm)",
                                    fontSize: "0.875rem",
                                    fontWeight: 600,
                                    border: "none",
                                    cursor: "pointer",
                                    fontFamily: "'Borna', sans-serif",
                                    background: activeTab === tab ? "var(--surface)" : "transparent",
                                    color: activeTab === tab ? "var(--text-primary)" : "var(--text-secondary)",
                                    boxShadow: activeTab === tab ? "var(--shadow-sm)" : "none",
                                    transition: "all 0.15s ease",
                                }}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>

                    {activeTab === "positions" ? (
                        <div>
                            {/* Table header */}
                            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: "1rem", padding: "0 0 0.75rem", borderBottom: "1px solid var(--border)", marginBottom: "0.75rem" }}>
                                {["Pool", "Deposited", "Current Value", "APY", "Yield Earned"].map((h) => (
                                    <span key={h} className="label">{h}</span>
                                ))}
                            </div>
                            {POSITIONS.map((pos) => (
                                <div key={pos.id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: "1rem", padding: "1rem 0", borderBottom: "1px solid var(--border)", alignItems: "center" }}>
                                    {/* Pool */}
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                        <div style={{ width: 32, height: 32, borderRadius: "8px", flexShrink: 0, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            <VaultDoorIcon size={32} />
                                        </div>
                                        <div>
                                            <p style={{ fontWeight: 700, fontSize: "0.875rem" }}>{pos.pool}</p>
                                            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{pos.asset}</p>
                                        </div>
                                    </div>
                                    <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>{pos.deposited} sBTC</span>
                                    <span style={{ fontWeight: 700, fontSize: "0.875rem" }}>{pos.current} sBTC</span>
                                    <span style={{ fontWeight: 700, fontSize: "0.875rem", color: pos.color }}>{pos.apy}</span>
                                    <span style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--green)" }}>{pos.yield} sBTC</span>
                                </div>
                            ))}
                            {/* Summary row */}
                            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: "1rem", padding: "1rem 0 0" }}>
                                <span style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--text-muted)" }}>Total</span>
                                <span style={{ fontWeight: 700, fontSize: "0.875rem" }}>{totalDeposited} sBTC</span>
                                <span style={{ fontWeight: 700, fontSize: "0.875rem" }}>{totalCurrent} sBTC</span>
                                <span style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--orange)" }}>~8.15%</span>
                                <span style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--green)" }}>+{totalYield} sBTC</span>
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                            {ACTIVITY.map((tx, i) => (
                                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.875rem 1rem", background: "var(--surface-2)", borderRadius: "var(--radius-sm)" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                        <div style={{ width: 34, height: 34, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: tx.type === "deposit" ? "rgba(18,183,106,0.1)" : "rgba(252,100,50,0.1)", color: tx.type === "deposit" ? "var(--green)" : "var(--orange)", flexShrink: 0 }}>
                                            {tx.type === "deposit" ? <ArrowDownCircle size={16} /> : <ArrowUpCircle size={16} />}
                                        </div>
                                        <div>
                                            <p style={{ fontWeight: 700, fontSize: "0.875rem", textTransform: "capitalize" }}>{tx.type}</p>
                                            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{tx.date}</p>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                        <p style={{ fontWeight: 700, fontSize: "0.875rem" }}>{tx.amount}</p>
                                        <span className={`badge ${tx.status === "complete" ? "badge-green" : "badge-orange"}`} style={{ fontSize: "0.7rem" }}>{tx.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right column */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

                    {/* agBTC Wallet Card — folder/tab shape (image 3), white + orange */}
                    <div style={{ position: "relative", width: "100%", minHeight: 168 }}>
                        {/* SVG shape: rounded rect with card-pocket notch at top-left */}
                        <svg
                            style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
                            viewBox="0 0 290 168" preserveAspectRatio="none"
                        >
                            {/* White body */}
                            <path
                                d="M 16 0 H 82 Q 92 0 92 10 V 36 Q 92 44 100 44 H 274 Q 290 44 290 60 V 152 Q 290 168 274 168 H 16 Q 0 168 0 152 V 16 Q 0 0 16 0 Z"
                                fill="white"
                                stroke="#E8E9EE"
                                strokeWidth="1.5"
                            />
                            {/* Orange accent on the tab edge */}
                            <path
                                d="M 16 0 H 82 Q 92 0 92 10 V 36 Q 92 44 100 44 H 160"
                                fill="none"
                                stroke="#FC6432"
                                strokeWidth="2"
                                strokeLinecap="round"
                            />
                            {/* Subtle inner shadow line under the card-pocket ledge */}
                            <line x1="92" y1="44" x2="290" y2="44" stroke="#F0F1F5" strokeWidth="1" />
                        </svg>

                        {/* Content on top of the shape */}
                        <div style={{ position: "relative", padding: "52px 18px 16px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                                <div>
                                    <p style={{ fontWeight: 900, fontSize: "1rem", letterSpacing: "-0.01em" }}>agBTC</p>
                                    <p style={{ fontSize: "0.65rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Yield Share Token</p>
                                </div>
                                <span style={{ padding: "0.18rem 0.55rem", borderRadius: "9999px", background: "var(--orange-light)", color: "var(--orange)", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.04em" }}>agBTC</span>
                            </div>
                            <p style={{ fontWeight: 900, fontSize: "2rem", letterSpacing: "-0.05em", lineHeight: 1, color: "var(--text-primary)" }}>2.1402</p>
                            <p style={{ fontSize: "0.75rem", color: "var(--orange)", fontWeight: 600, marginTop: "0.2rem" }}>≈ 2.2472 sBTC</p>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid var(--border)" }}>
                                <p style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontFamily: "monospace" }}>ST3X…HXGN0</p>
                                <p style={{ fontSize: "0.65rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Stacks</p>
                            </div>
                        </div>
                    </div>

                    {/* Points Card */}
                    <div className="card" style={{ padding: "1.5rem", position: "relative", overflow: "hidden" }}>
                        <div style={{ position: "absolute", top: 0, right: 0, width: 80, height: 80, background: "var(--orange-light)", borderRadius: "0 0 0 80px", opacity: 0.6 }} />
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                            <Award size={17} color="var(--orange)" />
                            <p style={{ fontWeight: 700, fontSize: "0.95rem" }}>Points</p>
                            <span className="badge badge-orange" style={{ marginLeft: "auto", fontSize: "0.65rem" }}>Coming Soon</span>
                        </div>
                        <p style={{ fontWeight: 900, fontSize: "2.5rem", letterSpacing: "-0.05em", color: "var(--text-primary)", lineHeight: 1 }}>—</p>
                        <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.5rem", lineHeight: 1.5 }}>
                            Earn points for depositing, holding agBTC, and referring friends. Points will be redeemable for protocol rewards.
                        </p>
                        <div style={{ height: 1, background: "var(--border)", margin: "1rem 0" }} />
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            {[
                                { icon: <TrendingUp size={13} />, label: "Deposit points", desc: "1 pt / sBTC / day" },
                                { icon: <Star size={13} />, label: "Hold bonus", desc: "2× after 30 days" },
                                { icon: <Users size={13} />, label: "Referral bonus", desc: "10% of referree pts" },
                            ].map(({ icon, label, desc }) => (
                                <div key={label} style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                                    <span style={{ color: "var(--text-muted)", flexShrink: 0 }}>{icon}</span>
                                    <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)" }}>{label}</span>
                                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginLeft: "auto" }}>{desc}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Referrals stub */}
                    <div className="card" style={{ padding: "1.5rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                            <Users size={16} color="var(--text-secondary)" />
                            <p style={{ fontWeight: 700, fontSize: "0.95rem" }}>Referrals</p>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                            <div style={{ background: "var(--surface-2)", padding: "0.75rem", borderRadius: "var(--radius-sm)" }}>
                                <p className="label" style={{ marginBottom: "0.25rem" }}>Referred TVL</p>
                                <p style={{ fontWeight: 800, fontSize: "1rem" }}>—</p>
                            </div>
                            <div style={{ background: "var(--surface-2)", padding: "0.75rem", borderRadius: "var(--radius-sm)" }}>
                                <p className="label" style={{ marginBottom: "0.25rem" }}>Referrals</p>
                                <p style={{ fontWeight: 800, fontSize: "1rem" }}>0</p>
                            </div>
                        </div>
                        <button className="btn-secondary" style={{ width: "100%", justifyContent: "center", marginTop: "0.75rem", fontSize: "0.8rem" }}>
                            Copy Referral Link <ChevronRight size={14} />
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}

// ─── Sub-components ───────────────────────────────────────────────
function TopStat({ label, value, highlight, green, dot }: { label: string; value: string; highlight?: boolean; green?: boolean; dot?: boolean }) {
    return (
        <div className="card" style={{ padding: "1.25rem", ...(highlight ? { border: "1.5px solid var(--orange)", boxShadow: "0 0 0 3px var(--orange-light)" } : {}) }}>
            <p className="label" style={{ marginBottom: "0.6rem" }}>{label}</p>
            <p style={{ fontWeight: 800, fontSize: "1.4rem", letterSpacing: "-0.03em", lineHeight: 1, display: "flex", alignItems: "center", gap: "0.4rem", color: green ? "var(--green)" : "var(--text-primary)" }}>
                {value}
                {dot && <span className="pulse-dot" style={{ background: "var(--green)", marginLeft: "0.25rem" }} />}
            </p>
        </div>
    );
}
