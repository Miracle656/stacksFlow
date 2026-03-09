"use client";

import { useWallet } from './WalletProvider';
import { LogOut, Wallet } from 'lucide-react';

function getStxAddress(userData: any): string | null {
    if (userData?.addresses?.stx?.length > 0) return userData.addresses.stx[0].address;
    if (userData?.profile?.stxAddress?.mainnet) return userData.profile.stxAddress.mainnet;
    if (typeof userData?.address === 'string') return userData.address;
    return null;
}

export default function WalletConnect() {
    const { userData, connectWallet, disconnectWallet } = useWallet();

    if (userData) {
        const address = getStxAddress(userData);
        const short = address
            ? `${address.substring(0, 6)}…${address.substring(address.length - 4)}`
            : 'Connected';

        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-pill)',
                background: 'var(--surface)',
                boxShadow: 'var(--shadow-sm)',
                overflow: 'hidden',
                height: '38px',
            }}>
                {/* Left: green dot + address */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0 0.9rem',
                    borderRight: '1px solid var(--border)',
                    height: '100%',
                }}>
                    <span style={{
                        width: 7, height: 7, borderRadius: '50%',
                        background: '#12B76A',
                        boxShadow: '0 0 0 2px rgba(18,183,106,0.2)',
                        flexShrink: 0,
                        display: 'inline-block',
                    }} />
                    <span style={{
                        fontSize: '0.82rem', fontWeight: 700,
                        fontFamily: 'monospace',
                        color: 'var(--text-primary)',
                        letterSpacing: '0.02em',
                    }}>{short}</span>
                </div>

                {/* Right: disconnect button */}
                <button
                    onClick={disconnectWallet}
                    title="Disconnect wallet"
                    style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: 38, height: '100%',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-muted)',
                        transition: 'background 0.15s, color 0.15s',
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.background = 'var(--red-light)';
                        e.currentTarget.style.color = 'var(--red)';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--text-muted)';
                    }}
                >
                    <LogOut size={14} />
                </button>
            </div>
        );
    }

    return (
        <button className="btn-primary" onClick={connectWallet}>
            <Wallet size={16} />
            Connect Wallet
        </button>
    );
}
