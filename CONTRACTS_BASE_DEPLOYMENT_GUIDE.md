# Bravea Contracts: Beginner Guide + "Deploy on Base" Playbook

## 1) What this repo currently contains (important)

This repository contains:
- Contract **ABIs** (interfaces)
- Frontend contract **addresses/config**
- UI code that reads/writes these contracts

This repository does **not** contain Solidity source contracts to compile/deploy.

So for your assigned task **"Deploy them all on Base"**:
- You can understand all contracts from this repo ✅
- You must get Solidity contracts from the smart-contract repo/branch to actually deploy ❗

---

## 2) Current active addresses (from `src/Config/index.js`)

These are BSC testnet-style addresses currently wired in frontend config:

- `PTN_TOKEN_ADDRESS`: `0xFCa3a16Bbc883b61Ccc21AaE5d3B6897f8694490`
- `WETH_TOKEN_ADDRESS`: `0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd`
- `UNISWAP_ROUTER_ADDRESS`: `0xD99D1c33F9fC3444f8101754aBC46c52416550D1`
- `WETHX_TOKEN_ADDRESS`: `0x72ef862a70C0191B11B6AaEEe673f3D4961A15fA`
- `POTION_DAO_CHEF_ADDRESS`: `0x070a13b56414707Fafe0dbB35e2AAb563175efcA`
- `PTN_RESERVE`: `0x378D6971EF166677B5593fa2836B805B2672846F`
- `POTION_DAO_STAKING_ADDRESS`: `0xDC548C4B18975eEdD69200aB2a31E0e292415260`
- `POTION_DAO_TREASURY_ADDRESS`: `0x949D2CC2efB2135F32Cd2f740A01a7765BB7e496`
- `PTNTREASURY_FUND_ADDRESS`: `0xe2A414f879425cca7E31D384202Bd8eEf907d669`
- `POTION_DAO_ZAP_ADDRESS`: `0xcaD66e6b3476aD46897AfeE5183ED3812f489381`
- `WETHX_PTN_POOL_ADDRESS`: `0xEed1869F5d2e60A1f3F03a4E7112CBED192985D2`
- `WETH_PTN_ORACLE_ADDRESS`: `0x691Cbd6475dbBc75980C706a5506ac1Cf737212d`
- `WETHX_WETH_ORACLE_ADDRESS`: `0x1ecB17B046e7B5845c4E7A754c666cf121004c9B`
- `WETHX_PTN_MASTER_ORACLE_ADDRESS`: `0x8De288D8bFd2928DF3e480f7A3Cf03746f06AC2b`

> Note: `src/Config/addresses.json` has overlapping addresses and some mismatches. Treat `src/Config/index.js` as source-of-truth unless team confirms otherwise.

---

## 3) Contract-by-contract explanation (plain English)

### A) PTN Token (`TOKEN_ABI.json`)
**What it is:** Main ERC20 project token.

**Why it exists:**
- Used for staking/farming rewards and accounting.
- Part of pool pricing and mint/redeem economics.

**Typical methods:**
- `balanceOf`, `transfer`, `approve`, `allowance`, etc.

**Used by frontend in:** Mint/Redeem/Stake/Lock flows.

---

### B) WETH Token (external wrapped native token)
**What it is:** Wrapped ETH-compatible collateral token.

**Why it exists:**
- Acts as collateral side for pool/oracle pricing.
- Required in swaps/liquidity paths.

**Deployment note on Base:** Usually use canonical Base WETH contract, not your own custom WETH.

---

### C) WETHX Token
**What it is:** Secondary token in the protocol pair (synthetic/governed token side).

**Why it exists:**
- Works with PTN/WETH in pool mechanics.
- Used for mint/redeem equations and collateral ratio behavior.

---

### D) WETHX-PTN Pool (`WETHX_PTN_POOL_ABI.json`)
**What it is:** Core mint/redeem contract.

**Why it exists:**
- Users mint/redeem based on collateral + protocol ratios.
- Applies minting/redemption fees.

**Key ABI signals:**
- Events/methods like `Mint`, ratio updates, fee updates.
- Collateral-ratio controls and refresh logic.

**Dependencies:**
- Token addresses (`xToken`, `yToken`, reserves)
- Master oracle or underlying oracle references

**Used by frontend in:**
- `src/Pages/Mint/Mint.jsx`
- `src/Pages/Redeem/Redeem.jsx`

---

### E) MasterChef/Farm (`POTION_DAO_CHEF_ABI.json`)
**What it is:** Farming rewards distributor (pool-based).

**Why it exists:**
- Users stake LP/assets to earn reward emissions.

**Key ABI signals:**
- Events/methods like `Deposit`, `Harvest`, `EmergencyWithdraw`, pool/user info.

**Used by frontend in:**
- `src/Pages/Tools/Tool.jsx`
- `src/Pages/Tools/Accordion.jsx`

---

### F) Staking (`POTION_DAO_STAKING_ABI.json`)
**What it is:** Staking contract (single/multi reward style behavior).

**Why it exists:**
- Users lock/stake token(s) and earn reward distributions.

**Key ABI signals:**
- `RewardAdded`, `RewardPaid`, `Recovered`, distributor approvals, stake/withdraw/reward reads.

**Used by frontend in:**
- Stake/Lock pages and dashboard calculations.

---

### G) Zap (`POTION_DAO_ZAP_ABI.json`)
**What it is:** Convenience contract for one-click liquidity/farm actions.

**Why it exists:**
- Reduces multiple manual txs into simpler user action.

**Key ABI signals:**
- `addZap`, `removeZap`, `zap`, events like `ZapAdded`, `Zapped`.

**Dependencies:**
- Router address
- Chef/farm pools

---

### H) Treasury (`POTION_TREASURY.json`) and Treasury Fund (`TREASURY_FUND.json`)
**What it is:** Protocol fund management wallets/contracts.

**Why it exists:**
- Fee handling and treasury reserve accounting.
- Separation of operational fund logic from user pool logic.

---

### I) Oracles (`WETHX_WETH_ORACLE_ABI.json`, `WETHX_PTN_MASTER_ORACLE_ABI.json`)
**What they are:** Price feed components.

**Why they exist:**
- Pool/mint/redeem requires trusted prices and often TWAP-based values.

**Key ABI signals in master oracle:**
- `getXTokenPrice`, `getYTokenPrice`, `getXTokenTWAP`, `getYTokenTWAP`.

**Critical for Base deployment:**
- Wrong oracle setup = wrong pricing = broken mint/redeem economics.

---

### J) Router + Pair ABIs (`UniswapRouter.json`, `IUniswapv2Pair.json`)
**What they are:** DEX integration interfaces.

**Why they exist:**
- Swap/liquidity operations and pool data reads.

**Deployment note on Base:**
- Use Base-compatible DEX router/pair ecosystem (not BSC testnet router address).

---

## 4) Fast dependency graph (what must exist before what)

1. External infra on Base:
   - WETH (canonical)
   - DEX Router + Pair ecosystem
2. Core tokens:
   - PTN
   - WETHX (if custom)
3. Oracle layer:
   - WETH/PTN oracle
   - WETHX/WETH oracle
   - Master oracle (aggregates/serves pool)
4. Treasury layer:
   - Treasury
   - Treasury fund
5. Core pool:
   - WETHX-PTN pool (needs token + oracle + reserve deps)
6. Rewards layer:
   - Staking contract
   - Chef contract
7. UX helper layer:
   - Zap contract (depends on chef + router)

---

## 5) "Deploy all on Base" execution checklist (practical)

## Step 0 — Required before anything
- Get smart-contract source repo/branch (Solidity + deployment scripts).
- Confirm exact constructor args for each contract.

## Step 1 — Pick Base network + infra
- Choose Base mainnet or Base Sepolia first.
- Confirm canonical WETH and chosen DEX router addresses for that network.

## Step 2 — Deploy in dependency order
- Deploy tokens/oracles/treasury first.
- Deploy pool after oracle/token addresses are final.
- Deploy staking/chef after token + treasury are final.
- Deploy zap last (needs router + chef).

## Step 3 — Wire frontend config
Update `src/Config/index.js` with Base values:
- `CHAIN_ID` (Base network)
- `RPC_URL`
- `EX_LINK` (BaseScan-style explorer address link)
- `DEX_LINK`
- Every contract address listed above

## Step 4 — Sanity test in UI (must pass)
- Wallet connects to Base.
- Token balances display correctly.
- Mint quote works and mint tx succeeds.
- Redeem quote works and redeem tx succeeds.
- Stake/lock actions succeed and reward reads update.
- Farm pending rewards + harvest works.

## Step 5 — Resolve config drift
- Remove or clearly mark `addresses.json` if not used.
- Keep one single source-of-truth address file.

---

## 6) What can break your migration (high-risk items)

1. **Wrong router/WETH addresses** copied from BSC.
2. **Oracle decimals mismatch** causing incorrect price math.
3. **Constructor arg ordering mistakes** during deployment.
4. **Permission roles not transferred** (owner/minter/distributor).
5. **Frontend reading old addresses** due to multiple config files.

---

## 7) 2-hour fast-start plan for you

- **0–20 min:** Collect Solidity repo + deployment scripts + constructor docs.
- **20–40 min:** Build a deployment sheet (contract, constructor args, depends-on, owner).
- **40–90 min:** Deploy sequentially on Base testnet and record addresses.
- **90–120 min:** Update `src/Config/index.js`, run UI smoke test, fix first failing integration.

---

## 8) One-line summary for your manager

"I mapped all protocol contracts, identified deployment dependency order, and prepared a Base migration checklist; next step is executing deployments from the Solidity repo and wiring new Base addresses into frontend config."
