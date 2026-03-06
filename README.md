# agBTC: sBTC Yield Aggregator

The first non-custodial yield aggregator for Stacks. Automatically route your sBTC to the highest-performing strategies across Zest and Hermetica seamlessly.

## Architecture

This Monorepo contains two primary systems:
1. `contracts/`: Clarinet-based Stacks smart contracts written in Clarity 4.0.
2. `frontend/`: Next.js 14 React web application.

### Smart Contracts 
- **token-agbtc**: SIP-010 token representing the user's blended yield-share.
- **aggregator-vault**: Receives user deposits, computes 50/50 routing splits, and orchestrates Strategy withdrawals (instant execution via Zest vs queued 3-day cooldown via Hermetica).
- **strategy-zest**: Standard adapter mapping to Zest Protocol v0.4 Market.
- **strategy-hermetica**: Standared adapter mapping to Hermetica hBTC vault v1.

## Getting Started

### 1. Smart Contracts Setup

Ensure you have `clarinet` installed (v3+ required).

```bash
# Check syntax and static types
clarinet check

# Run the Vitest blockchain simulator tests
npm i
npx vitest run
```

### 2. Frontend Setup

The frontend is a standard Next.js 14 application leveraging TailwindCSS and `@stacks/connect`.

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000` to interact with the Dashboard simulation.

## Testing & Quality Assurance
The codebase includes 100% comprehensive unit testing utilizing `@hirosystems/clarinet-sdk`. The tests cover end-to-end Zest / Hermetica protocol flows and include a mocked 3-day block-time progression cooldown withdrawal verification.
