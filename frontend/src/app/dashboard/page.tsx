"use client";
import { useState } from "react";
import { useWallet } from "@/components/WalletProvider";
import WithdrawForm from "@/components/WithdrawForm";
import DepositForm from "@/components/DepositForm";
import ClaimsList from "@/components/ClaimsList";
import WalletConnect from "@/components/WalletConnect";
import { TrendingUp } from "lucide-react";

export default function DashboardPage() {
    const { userData } = useWallet();

    if (!userData) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '55vh', gap: '1.5rem', textAlign: 'center' }}>
                {/* Inline vault circle gate visual */}
                <div style={{ position: 'relative', width: 90, height: 90 }}>
                    <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid var(--border)', background: 'var(--surface-2)' }} />
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 54, height: 54, borderRadius: '50%', border: '2px solid var(--orange)', background: 'var(--orange-light)' }} />
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 14, height: 14, borderRadius: '50%', background: 'var(--orange)' }} />
                </div>
                <div>
                    <h2 style={{ fontWeight: 800, fontSize: '1.75rem', letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>Connect your wallet</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '360px', lineHeight: 1.6 }}>
                        Connect your Stacks wallet to manage your Aurum yield position and view live stats.
                    </p>
                </div>
                <WalletConnect />
            </div>
        );
    }

    return (
        <div className="animate-up">
            {/* Page Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontWeight: 800, fontSize: '2rem', letterSpacing: '-0.03em', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                    Vault Dashboard
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                    Manage your sBTC, track yield, and claim rewards.
                </p>
            </div>

            {/* Top Stats Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                <StatCard label="Total Value Locked" value="24.5" unit="sBTC" color="var(--blue)" />
                <StatCard label="Your agBTC Balance" value="2.1402" unit="agBTC" color="var(--text-primary)" highlight />
                <StatCard label="Pending Yield" value="0.0051" unit="sBTC" color="var(--green)" dot />
            </div>

            {/* Main 2-column Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '1.5rem', alignItems: 'start' }}>

                {/* Left: Vault — white card with vault-door circle motif (image 4 concept) */}
                <VaultCard>
                    <DepositForm />
                    <WithdrawForm />
                </VaultCard>

                {/* Right: Strategy Rates */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="card" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
                            <TrendingUp size={18} color="var(--orange)" />
                            <h2 style={{ fontWeight: 700, fontSize: '1rem' }}>Live Strategy Rates</h2>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <RateRow label="Zest Protocol" sublabel="Lending Market" rate="3.5%" color="#8B5CF6" pct={35} />
                            <RateRow label="Hermetica" sublabel="Delta-Neutral Vault" rate="12.8%" color="var(--orange)" pct={85} />
                        </div>
                        <div style={{ height: 1, background: 'var(--border)', margin: '1.25rem 0' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Blended Net APY</span>
                            <span style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--orange)', letterSpacing: '-0.02em' }}>~8.15%</span>
                        </div>
                    </div>

                    {/* Mini TVL breakdown */}
                    <div className="card" style={{ padding: '1.5rem' }}>
                        <p className="label" style={{ marginBottom: '1rem' }}>Allocation Split</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <AllocRow label="Zest" pct={50} color="#8B5CF6" />
                            <AllocRow label="Hermetica" pct={50} color="var(--orange)" />
                        </div>
                    </div>
                </div>
            </div>

            <ClaimsList />
        </div>
    );
}

function StatCard({ label, value, unit, color, highlight, dot }: { label: string; value: string; unit: string; color: string; highlight?: boolean; dot?: boolean }) {
    return (
        <div className={`card`} style={{ padding: '1.5rem', ...(highlight ? { border: '1.5px solid var(--orange)', boxShadow: '0 0 0 3px var(--orange-light)' } : {}) }}>
            <p className="label" style={{ marginBottom: '0.75rem' }}>{label}</p>
            <p style={{ fontWeight: 800, fontSize: '1.75rem', letterSpacing: '-0.04em', color: color, lineHeight: 1, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                {value} <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-muted)' }}>{unit}</span>
                {dot && <span className="pulse-dot" style={{ background: 'var(--green)', marginLeft: '0.25rem' }} />}
            </p>
        </div>
    );
}

function RateRow({ label, sublabel, rate, color, pct }: { label: string; sublabel: string; rate: string; color: string; pct: number }) {
    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <div>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{label}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginLeft: '0.4rem' }}>{sublabel}</span>
                </div>
                <span style={{ fontWeight: 700, fontSize: '0.875rem', color }}>{rate}</span>
            </div>
            <div style={{ height: 6, background: 'var(--surface-2)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 99 }} />
            </div>
        </div>
    );
}

function AllocRow({ label, pct, color }: { label: string; pct: number; color: string }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{label}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{pct}%</span>
                </div>
                <div style={{ height: 5, background: 'var(--surface-2)', borderRadius: 99 }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 99 }} />
                </div>
            </div>
        </div>
    );
}

// ─── VaultCard: image-4 concept ───────────────────────────────────────────────
// White card. Two concentric circles on the left = vault door (closed).
// On hover: big circle slides to the left edge (door swings open).
function VaultCard({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    return (
        <div
            className="card"
            style={{ padding: '2rem', position: 'relative', overflow: 'hidden', cursor: 'default' }}
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
        >
            {/* ── Vault door circles (decorative, background layer) ── */}
            {/* Outer ring */}
            <div style={{
                position: 'absolute',
                top: '50%',
                left: open ? '-18%' : '15%',
                transform: 'translate(-50%, -50%)',
                width: 220, height: 220,
                borderRadius: '50%',
                border: '2px solid var(--border)',
                background: 'var(--surface-2)',
                transition: 'left 0.65s cubic-bezier(0.4,0,0.2,1)',
                pointerEvents: 'none',
                zIndex: 0,
            }} />
            {/* Inner ring — smaller circle, stays slightly more to the right */}
            <div style={{
                position: 'absolute',
                top: '50%',
                left: open ? '-10%' : '15%',
                transform: 'translate(-50%, -50%)',
                width: 120, height: 120,
                borderRadius: '50%',
                border: `2px solid var(--orange)`,
                background: open ? 'var(--orange-light)' : 'var(--surface)',
                transition: 'left 0.55s cubic-bezier(0.4,0,0.2,1), background 0.4s ease',
                pointerEvents: 'none',
                zIndex: 0,
                boxShadow: open ? '0 0 0 4px var(--orange-light)' : 'none',
            }} />
            {/* Hub dot */}
            <div style={{
                position: 'absolute',
                top: '50%',
                left: open ? '-10%' : '15%',
                transform: 'translate(-50%, -50%)',
                width: 16, height: 16,
                borderRadius: '50%',
                background: 'var(--orange)',
                transition: 'left 0.55s cubic-bezier(0.4,0,0.2,1)',
                pointerEvents: 'none',
                zIndex: 0,
            }} />

            {/* ── Content layer ── */}
            <div style={{ position: 'relative', zIndex: 1 }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <h2 style={{ fontWeight: 700, fontSize: '1.1rem', letterSpacing: '-0.01em' }}>Vault</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Deposit sBTC — earn agBTC yield</p>
                    </div>
                    <span style={{ marginLeft: 'auto', padding: '0.2rem 0.7rem', borderRadius: '9999px', background: 'var(--orange-light)', border: '1px solid rgba(252,100,50,0.3)', color: 'var(--orange)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.04em' }}>LIVE</span>
                </div>
                <div style={{ height: 1, background: 'var(--border)', marginBottom: '1.5rem' }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                    {children}
                </div>
            </div>
        </div>
    );
}
