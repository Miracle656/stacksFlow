import type { Metadata } from "next";
import "./globals.css";
import WalletConnect from "@/components/WalletConnect";
import { WalletProvider } from "@/components/WalletProvider";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Aurum — sBTC Yield Aggregator",
  description: "The first non-custodial Bitcoin yield aggregator on Stacks. Earn up to 8.4% APY on your sBTC.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.cdnfonts.com/css/borna" rel="stylesheet" />
      </head>
      <body>
        <WalletProvider>
          {/* Top Navigation */}
          <header style={{
            position: 'sticky',
            top: 0,
            zIndex: 50,
            background: 'rgba(244, 245, 248, 0.85)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderBottom: '1px solid var(--border)',
          }}>
            <div className="nav-container">
              <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/aurum-logo.png" alt="Aurum" style={{ width: 36, height: 36, borderRadius: 10, objectFit: 'contain' }} />
                <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Aurum</span>
              </Link>

              {/* Centre Nav Pills */}
              <nav className="nav-pills">
                {[
                  { label: 'Dashboard', href: '/dashboard' },
                  { label: 'Portfolio', href: '/portfolio' },
                  { label: 'Docs', href: '#' },
                ].map(({ label, href }) => (
                  <Link key={label} href={href} style={{
                    padding: '0.4rem 1.1rem',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    textDecoration: 'none',
                    transition: 'all 0.15s ease',
                  }}>{label}</Link>
                ))}
              </nav>

              <WalletConnect />
            </div>
          </header>

          {/* Page Content */}
          <main className="main-content">
            {children}
          </main>
        </WalletProvider>
      </body>
    </html>
  );
}
