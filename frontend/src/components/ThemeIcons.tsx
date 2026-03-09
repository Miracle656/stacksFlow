"use client";
import { useState } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATED VAULT DOOR
// The vault body stays fixed. The circular door swings open (rotateY) on hover,
// revealing gold bars inside the safe.
// ─────────────────────────────────────────────────────────────────────────────
export function AnimatedVaultDoor({ size = 80 }: { size?: number }) {
    const [open, setOpen] = useState(false);
    const r = size;

    return (
        <div
            style={{ position: "relative", width: r, height: r, cursor: "pointer", flexShrink: 0 }}
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
            title={open ? "Vault open" : "Hover to open"}
        >
            {/* ── Vault body (the steel safe) ── */}
            <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(145deg, #374151, #1F2937)",
                borderRadius: r * 0.12,
                boxShadow: "0 6px 20px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.08)",
            }}>
                {/* Hinge strips on left */}
                {[0.25, 0.75].map((v, i) => (
                    <div key={i} style={{
                        position: "absolute", left: 0,
                        top: `${v * 100}%`, transform: "translateY(-50%)",
                        width: r * 0.1, height: r * 0.14,
                        background: "linear-gradient(90deg, #9CA3AF, #6B7280)",
                        borderRadius: "0 4px 4px 0",
                        boxShadow: "1px 0 4px rgba(0,0,0,0.3)",
                    }} />
                ))}

                {/* Locking bolts on right (retract when open) */}
                {[0.28, 0.72].map((v, i) => (
                    <div key={i} style={{
                        position: "absolute", right: 0,
                        top: `${v * 100}%`, transform: "translateY(-50%)",
                        width: open ? r * 0.04 : r * 0.12,
                        height: r * 0.08,
                        background: "linear-gradient(90deg, #6B7280, #9CA3AF)",
                        borderRadius: "4px 0 0 4px",
                        transition: "width 0.35s ease 0.1s",
                        boxShadow: "-1px 0 4px rgba(0,0,0,0.3)",
                    }} />
                ))}

                {/* Interior (visible when door swings open) */}
                <div style={{
                    position: "absolute", inset: "14%",
                    background: "linear-gradient(160deg, #0f172a, #1e1b4b)",
                    borderRadius: r * 0.07,
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center", gap: r * 0.04,
                    opacity: open ? 1 : 0,
                    transition: "opacity 0.25s ease 0.3s",
                    boxShadow: "inset 0 4px 12px rgba(0,0,0,0.6)",
                }}>
                    {/* Gold bars */}
                    {[1, 2, 3].map((i) => (
                        <div key={i} style={{
                            width: "52%", height: r * 0.075,
                            background: "linear-gradient(90deg, #92400e, #f59e0b, #fbbf24, #f59e0b, #92400e)",
                            borderRadius: 3,
                            boxShadow: "0 2px 6px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.3)",
                        }} />
                    ))}
                    <span style={{ fontSize: r * 0.12, color: "#fbbf24", fontFamily: "'Borna',sans-serif", fontWeight: 700, marginTop: r * 0.02 }}>VAULT</span>
                </div>
            </div>

            {/* ── Door (swings on rotateY from the left hinge) ── */}
            <div style={{
                position: "absolute", inset: 0,
                perspective: `${r * 6}px`,
                perspectiveOrigin: "10% center",
                pointerEvents: "none",
            }}>
                <div style={{
                    width: "100%", height: "100%",
                    transformOrigin: "8% center",
                    transform: open ? "rotateY(-72deg)" : "rotateY(0deg)",
                    transition: "transform 0.65s cubic-bezier(0.4, 0, 0.2, 1)",
                    position: "relative",
                    borderRadius: r * 0.12,
                    background: "linear-gradient(145deg, #9CA3AF, #6B7280, #4B5563)",
                    boxShadow: open
                        ? "4px 6px 20px rgba(0,0,0,0.5)"
                        : "2px 0 6px rgba(0,0,0,0.4)",
                }}>
                    {/* Door surface texture lines */}
                    <div style={{ position: "absolute", inset: "8%", border: "1.5px solid rgba(255,255,255,0.1)", borderRadius: r * 0.08 }} />

                    {/* Central circular dial */}
                    <div style={{
                        position: "absolute",
                        top: "50%", left: "50%",
                        transform: `translate(-50%, -50%) rotate(${open ? "90deg" : "0deg"})`,
                        transition: "transform 0.65s ease",
                        width: "62%", height: "62%",
                    }}>
                        {/* Outer ring */}
                        <div style={{
                            position: "absolute", inset: 0,
                            borderRadius: "50%",
                            background: "linear-gradient(145deg, #D1D5DB, #9CA3AF)",
                            border: `${r * 0.03}px solid #6B7280`,
                            boxShadow: "0 2px 8px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.2)",
                        }} />

                        {/* Spokes */}
                        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
                            const rad = (angle * Math.PI) / 180;
                            const cx = 50, cy = 50, r1 = 18, r2 = 44;
                            const x1 = cx + r1 * Math.cos(rad), y1 = cy + r1 * Math.sin(rad);
                            const x2 = cx + r2 * Math.cos(rad), y2 = cy + r2 * Math.sin(rad);
                            return (
                                <svg key={angle} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }}>
                                    <line x1={`${x1}%`} y1={`${y1}%`} x2={`${x2}%`} y2={`${y2}%`}
                                        stroke="#555E6D" strokeWidth={`${r * 0.025}`} strokeLinecap="round" />
                                </svg>
                            );
                        })}

                        {/* Center hub */}
                        <div style={{
                            position: "absolute",
                            top: "50%", left: "50%",
                            transform: "translate(-50%, -50%)",
                            width: "30%", height: "30%",
                            borderRadius: "50%",
                            background: "radial-gradient(circle at 35% 35%, #FF8A50, #FC6432, #C0440F)",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
                        }} />
                    </div>

                    {/* Keyhole */}
                    <svg style={{ position: "absolute", bottom: "18%", left: "50%", transform: "translateX(-50%)", width: r * 0.12, height: r * 0.16 }} viewBox="0 0 12 16">
                        <circle cx="6" cy="5" r="3" fill="#374151" />
                        <path d="M4 8 L6 15 L8 8 Z" fill="#374151" />
                    </svg>
                </div>
            </div>
        </div>
    );
}


// ─────────────────────────────────────────────────────────────────────────────
// LEATHER WALLET SHAPE
// Looks like an actual bi-fold leather wallet seen from the front:
// a dark rounded rect with a card-pocket notch cut from the top.
// ─────────────────────────────────────────────────────────────────────────────
export function WalletShape({
    children,
    width = 260,
    height = 148,
}: {
    children?: React.ReactNode;
    width?: number;
    height?: number;
}) {
    // The wallet shape: rounded rect, but top-left has an inward card-slot curve.
    // We achieve this with an SVG clipPath approach.
    const id = "wallet-clip";
    const notchW = width * 0.28;
    const notchH = height * 0.22;
    const r = 16; // corner radius

    return (
        <div style={{ position: "relative", width, height, flexShrink: 0 }}>
            <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
                <defs>
                    <clipPath id={id}>
                        {/* Main wallet body with card-pocket notch at top-left */}
                        <path d={`
              M ${r} 0
              H ${notchW - r}
              Q ${notchW} 0 ${notchW} ${r}
              V ${notchH - r}
              Q ${notchW} ${notchH} ${notchW + r} ${notchH}
              H ${width - r}
              Q ${width} ${notchH} ${width} ${notchH + r}
              V ${height - r}
              Q ${width} ${height} ${width - r} ${height}
              H ${r}
              Q 0 ${height} 0 ${height - r}
              V ${r}
              Q 0 0 ${r} 0
              Z
            `} />
                    </clipPath>
                </defs>

                {/* Wallet body — main dark leather */}
                <path
                    d={`M ${r} 0 H ${notchW - r} Q ${notchW} 0 ${notchW} ${r} V ${notchH - r} Q ${notchW} ${notchH} ${notchW + r} ${notchH} H ${width - r} Q ${width} ${notchH} ${width} ${notchH + r} V ${height - r} Q ${width} ${height} ${width - r} ${height} H ${r} Q 0 ${height} 0 ${height - r} V ${r} Q 0 0 ${r} 0 Z`}
                    fill="url(#walletGrad)"
                    filter="url(#walletShadow)"
                />

                <defs>
                    <linearGradient id="walletGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#2A2A2A" />
                        <stop offset="50%" stopColor="#1A1A1A" />
                        <stop offset="100%" stopColor="#111111" />
                    </linearGradient>
                    <filter id="walletShadow" x="-10%" y="-10%" width="130%" height="140%">
                        <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.4" />
                    </filter>
                </defs>

                {/* Leather stitch line along card-pocket edge */}
                <path
                    d={`M ${notchW + 2} ${notchH} H ${width - r}`}
                    fill="none"
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="1"
                    strokeDasharray="4 3"
                />

                {/* Thin inner border for card pocket depth */}
                <path
                    d={`M ${notchW} ${r + 2} V ${notchH - r} Q ${notchW} ${notchH} ${notchW + r} ${notchH} H ${width - r - 2}`}
                    fill="none"
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth="1.5"
                />

                {/* Orange accent card peeking from bottom of pocket */}
                <rect x={notchW + 8} y={notchH - 10} width={width - notchW - 24} height={18} rx={4}
                    fill="#FC6432" opacity={0.7} />

                {/* Card stripe */}
                <rect x={notchW + 8} y={notchH - 5} width={width - notchW - 24} height={5} rx={0}
                    fill="#E0541F" opacity={0.5} />

                {/* Bottom stitch border */}
                <path
                    d={`M ${r} ${height - 2} H ${width - r}`}
                    fill="none"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="1"
                    strokeDasharray="4 3"
                />
            </svg>

            {/* Children (text content) rendered on top */}
            <div style={{
                position: "absolute",
                top: notchH + 8,
                left: 16,
                right: 16,
                bottom: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
            }}>
                {children}
            </div>
        </div>
    );
}


// ─────────────────────────────────────────────────────────────────────────────
// SMALL VAULT ICON (non-animated, for small inline use)
// ─────────────────────────────────────────────────────────────────────────────
export function VaultDoorIcon({ size = 48 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Vault">
            <rect x="4" y="4" width="92" height="92" rx="10" fill="#374151" />
            {[0.28, 0.72].map((v, i) => (
                <rect key={i} x="82" y={v * 100 - 4} width="14" height="8" rx="3" fill="#6B7280" />
            ))}
            <circle cx="46" cy="50" r="30" fill="#9CA3AF" stroke="#6B7280" strokeWidth="3" />
            <circle cx="46" cy="50" r="22" fill="#D1D5DB" stroke="#9CA3AF" strokeWidth="1.5" />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
                const rad = (angle * Math.PI) / 180;
                return <line key={angle} x1={46 + 9 * Math.cos(rad)} y1={50 + 9 * Math.sin(rad)} x2={46 + 20 * Math.cos(rad)} y2={50 + 20 * Math.sin(rad)} stroke="#6B7280" strokeWidth="2" strokeLinecap="round" />;
            })}
            <circle cx="46" cy="50" r="9" fill="#FC6432" />
            <circle cx="46" cy="50" r="3" fill="#fff" />
        </svg>
    );
}
