"use client";

import Link from "next/link";
import { ArrowRight, Zap, BarChart3, ShieldCheck } from "lucide-react";
import { useWallet } from "@/components/WalletProvider";

export default function Home() {
  const { userData, connectWallet } = useWallet();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '4rem' }}>
      {/* Hero */}
      <div style={{ textAlign: 'center', maxWidth: '680px', marginBottom: '4rem' }}>
        <span className="badge badge-blue" style={{ marginBottom: '1.5rem' }}>Stacks · Bitcoin L2</span>

        <h1 style={{
          fontWeight: 900,
          fontSize: 'clamp(2.5rem, 6vw, 4rem)',
          letterSpacing: '-0.04em',
          lineHeight: 1.05,
          color: 'var(--text-primary)',
          marginBottom: '1.25rem',
        }}>
          Maximize Your<br />
          <span style={{ color: 'var(--orange)' }}>sBTC Yield</span>
        </h1>

        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.7, marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem' }}>
          The first non-custodial yield aggregator on Stacks. Automatically route your sBTC across Zest and Hermetica to earn up to 8.4% APY.
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {userData ? (
            <Link href="/dashboard" className="btn-primary" style={{ textDecoration: 'none' }}>
              Open Dashboard <ArrowRight size={16} />
            </Link>
          ) : (
            <button className="btn-primary" onClick={connectWallet}>
              Get Started <ArrowRight size={16} />
            </button>
          )}
          <a href="#" className="btn-secondary" style={{ textDecoration: 'none' }}>Read Docs</a>
        </div>
      </div>

      {/* Stats Banner */}
      <div className="card" style={{
        width: '100%',
        maxWidth: '800px',
        padding: '1.75rem 2.5rem',
        marginBottom: '4rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '2rem',
        textAlign: 'center',
      }}>
        {[
          { label: 'Total Value Locked', value: '24.5 sBTC' },
          { label: 'Blended APY', value: '~8.4%', orange: true },
          { label: 'Total Yield Paid', value: '1.2 sBTC' },
        ].map((s) => (
          <div key={s.label} style={{ borderRight: s.label !== 'Total Yield Paid' ? '1px solid var(--border)' : 'none', paddingRight: s.label !== 'Total Yield Paid' ? '2rem' : 0 }}>
            <p className="label" style={{ marginBottom: '0.5rem' }}>{s.label}</p>
            <p style={{ fontWeight: 800, fontSize: '1.5rem', letterSpacing: '-0.04em', color: (s as any).orange ? 'var(--orange)' : 'var(--text-primary)' }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Feature Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', width: '100%', maxWidth: '900px' }}>
        {[
          { icon: <Zap size={22} color="var(--orange)" />, title: 'Auto-Routing', desc: 'Smart contracts instantly allocate your sBTC 50/50 across Zest lending and Hermetica delta-neutral vaults.' },
          { icon: <BarChart3 size={22} color="#8B5CF6" />, title: 'Blended APY', desc: 'Enjoy a competitive 8–10% blended APY without manually tracking individual protocol rates.' },
          { icon: <ShieldCheck size={22} color="var(--green)" />, title: 'Non-Custodial', desc: 'You hold your own agBTC share tokens. 100% permissionless and auditable on-chain.' },
        ].map(({ icon, title, desc }) => (
          <div key={title} className="card" style={{ padding: '1.5rem' }}>
            <div style={{ width: 44, height: 44, background: 'var(--surface-2)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              {icon}
            </div>
            <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem' }}>{title}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
