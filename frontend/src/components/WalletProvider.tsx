"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

interface WalletContextType {
    userData: any | null;
    connectWallet: () => void;
    disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Session key used by @stacks/connect to persist wallet data
const STACKS_CONNECT_KEY = '@stacks/connect';

function readLocalStorage(): any | null {
    try {
        if (typeof window === 'undefined') return null;
        const raw = localStorage.getItem(STACKS_CONNECT_KEY);
        if (!raw) return null;
        // @stacks/connect stores data as hex-encoded JSON
        const hexToBytes = (hex: string) => {
            const bytes = new Uint8Array(hex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
            return new TextDecoder().decode(bytes);
        };
        return JSON.parse(hexToBytes(raw));
    } catch {
        return null;
    }
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
    const [userData, setUserData] = useState<any | null>(null);

    useEffect(() => {
        // Try to load existing session on mount
        const stored = readLocalStorage();
        if (stored?.addresses?.stx?.length > 0) {
            setUserData(stored);
        }
    }, []);

    const connectWallet = async () => {
        try {
            const mod = await import('@stacks/connect');
            // `connect` is the v8 canonical wallet-picker API
            const connectFn = (mod as any).connect ?? (mod as any).default?.connect;
            if (typeof connectFn !== 'function') {
                alert('Could not initialize Stacks wallet connection. Make sure Leather or Xverse is installed.');
                return;
            }
            const result = await connectFn({
                appDetails: {
                    name: 'Aurum Yield Aggregator',
                    icon: window.location.origin + '/favicon.ico',
                },
            });
            if (result?.addresses) {
                setUserData(result);
            } else {
                // After successful wallet interaction, read back from localStorage
                const stored = readLocalStorage();
                if (stored) setUserData(stored);
            }
        } catch (err: any) {
            // User cancelled or no wallet installed
            console.warn('[agBTC] Wallet connection cancelled or failed:', err?.message);
        }
    };

    const disconnectWallet = async () => {
        try {
            const mod = await import('@stacks/connect');
            const disconnectFn = (mod as any).disconnect ?? (mod as any).clearLocalStorage;
            if (typeof disconnectFn === 'function') disconnectFn();
        } catch { /* ignore */ }
        setUserData(null);
    };

    return (
        <WalletContext.Provider value={{ userData, connectWallet, disconnectWallet }}>
            {children}
        </WalletContext.Provider>
    );
}

export const useWallet = () => {
    const context = useContext(WalletContext);
    if (context === undefined) {
        throw new Error('useWallet must be used within a WalletProvider');
    }
    return context;
};
