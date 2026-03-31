# Today Contract Study Worksheet (Pre-Deployment)

Use this sheet to complete your task before deployment.

Time target: 6 hours  
Outcome target: you can explain each contract + every UI call path.

---

## 0) Today Goal (write this first)

- Goal: Deploy Bravea protocol on Base Sepolia after complete understanding.
- Today focus: **understanding + mapping only** (no deployment execution without source repo).

---

## 1) One Worked Example (Pool Contract) — Follow this style for all others

Contract: `WETHX_PTN_POOL`  
Address key: `WETHX_PTN_POOL_ADDRESS` (from `src/Config/index.js`)  
ABI: `src/Config/WETHX_PTN_POOL_ABI.json`

### 1.1 Purpose
- Core protocol pool for mint/redeem.
- Controls quotes, fees, pause flags, and collection state.

### 1.2 Where used in UI
- Mint page: `src/Pages/Mint/Mint.jsx`
- Redeem page: `src/Pages/Redeem/Redeem.jsx`
- Home page metric: `lastRefreshCrTimestamp` in `src/Pages/Home/Home.jsx`

### 1.3 Read functions used
- `calcMint(inputAmount)` → returns expected output for mint preview.
- `info()` → returns pool configuration and pause flags.
- `xToken()` / `yToken()` → returns token addresses.
- `userInfo(user)` → pending/collectable state.
- `calcRedeem(inputAmount)` → preview redeem outputs.
- `lastRefreshCrTimestamp()` → status metric used in Home.

### 1.4 Write functions used
- `mint(minOut, amountIn)` from Mint page.
- `redeem(xTokenIn, minYOut, minEthOut)` from Redeem page.
- `collect()` from Mint/Redeem pages.

### 1.5 Approval dependency
- Mint flow requires allowance of collateral token to pool.
- Redeem flow requires allowance of xToken to pool.

### 1.6 UI flow mapping
- User types amount -> `calcMint` / `calcRedeem` called -> UI quote updates.
- User clicks action -> `mint` / `redeem` tx.
- After pending state exists -> `collect` tx.

### 1.7 What breaks if wrong pool address
- Mint and Redeem both fail immediately.
- Fee/pause values display wrong.
- User collect state breaks.

### 1.8 Base deployment dependency notes
- Pool deploy needs token addresses + oracle references + reserve/fund links (exact constructor from source repo required).

---

## 1B) Worked Example (Staking Contract)

Contract: `POTION_DAO_STAKING`  
Address key: `POTION_DAO_STAKING_ADDRESS` (from `src/Config/index.js`)  
ABI: `src/Config/POTION_DAO_STAKING_ABI.json`

### 1B.1 Purpose
- Handles staking and locked staking lifecycle.
- Tracks rewards, lock durations, withdrawable balances, and claims.

### 1B.2 Where used in UI
- Stake page: `src/Pages/Stake/Stake.jsx`
- Lock page: `src/Pages/Lock/Lock.jsx`
- Stake-Withdraw page: `src/Pages/Stake-Withdraw/Stake_withdraw.jsx`
- Lock-Withdraw page: `src/Pages/Lock-Withdraw/Lock_withdraw.jsx`
- Dashboard/Home metrics: `src/Pages/Dashboard/Dashboard.jsx`, `src/Pages/Home/Home.jsx`
- APR support reads: `src/Hooks/useAPR.js`

### 1B.3 Read functions used
- `lockDuration()`
- `claimableRewards(user)`
- `rewardData(rewardToken)`
- `rewardsDuration()`
- `lockedSupply()` / `totalSupply()`
- `lockedBalances(user)`
- `unlockedBalance(user)`
- `earnedBalances(user)`
- `withdrawableBalance(user)`

### 1B.4 Write functions used
- `stake(amount, lock)` (called with different args in Stake/Lock flows)
- `withdraw(amount)`
- `getReward()`
- `withdrawExpiredLocks()`
- `emergencyWithdraw()`

### 1B.5 Approval dependency
- User must approve staking token to staking contract before `stake`.

### 1B.6 UI flow mapping
- User inputs amount -> app validates balances/allowance.
- Stake/Lock click -> `stake` tx.
- After reward accrues -> `getReward` tx.
- For exits -> `withdraw` or `withdrawExpiredLocks`.
- Worst-case path -> `emergencyWithdraw`.

### 1B.7 What breaks if wrong staking address
- Stake/lock pages stop working.
- Dashboard totals/rewards show wrong or empty data.
- Claim and withdraw actions fail.

### 1B.8 Base deployment dependency notes
- Staking depends on staking token + reserve/fund + reward distributor roles.
- ABI constructor hints include `_stakingToken`, `_stakingTokenReserve`, `_minters`, `_teamWalletAddress`.

---

## 1C) Worked Example (Chef/Farm Contract)

Contract: `POTION_DAO_CHEF`  
Address key: `POTION_DAO_CHEF_ADDRESS` (from `src/Config/index.js`)  
ABI: `src/Config/POTION_DAO_CHEF_ABI.json`

### 1C.1 Purpose
- MasterChef-style farm contract for pool-based rewards.
- Handles pool configuration, user positions, pending reward and harvest.

### 1C.2 Where used in UI
- Tools page: `src/Pages/Tools/Tool.jsx`
- Farm accordion: `src/Pages/Tools/Accordion.jsx`
- Home metrics/APR inputs: `src/Pages/Home/Home.jsx`, `src/Hooks/useAPR.js`

### 1C.3 Read functions used
- `poolLength()`
- `poolInfo(pid)`
- `pendingReward(pid, user)`
- `rewardPerSecond()`
- `totalAllocPoint()`

### 1C.4 Write functions used
- `harvestAllRewards()`
- Pool-level actions from accordion flow (deposit/withdraw/harvest paths use chef ABI).

### 1C.5 Approval dependency
- For deposit flows, user must approve pool/stake token to chef contract.

### 1C.6 UI flow mapping
- UI loads farm pools -> `poolLength`, `poolInfo`.
- UI computes pending rewards -> `pendingReward`.
- User harvests -> `harvestAllRewards` (or per-pool action in accordion flow).

### 1C.7 What breaks if wrong chef address
- Farm pool list/rewards break.
- Harvest fails.
- APR calculations tied to farm emissions become wrong.

### 1C.8 Base deployment dependency notes
- Chef needs reward token source + pool tokens + emission params + alloc-point config.
- Role and ownership setup must be confirmed from contract source scripts.

---

## 1D) Worked Example (PTN Token Contract)

Contract: `PTN Token (ERC20)`  
Address key: `PTN_TOKEN_ADDRESS` (from `src/Config/index.js`)  
ABI: `src/Config/TOKEN_ABI.json`

### 1D.1 Purpose
- Primary protocol token used across staking/farming and dashboard accounting.
- Acts as reward/base token reference in multiple pricing and balance flows.

### 1D.2 Where used in UI
- Home metrics: `src/Pages/Home/Home.jsx`
- Stake/Lock pages for balances and rewardData args:
  - `src/Pages/Stake/Stake.jsx`
  - `src/Pages/Lock/Lock.jsx`
  - `src/Pages/Stake-Withdraw/Stake_withdraw.jsx`
  - `src/Pages/Lock-Withdraw/Lock_withdraw.jsx`
- Tools/Farm displays: `src/Pages/Tools/Accordion.jsx`
- Shared approval utility: `src/common/ApproveButton.js`

### 1D.3 Read functions used
- `totalSupply()` via `TOKEN_ABI` in Home/Tools metrics.
- `allowance(owner, spender)` via allowance hook (`useCheckAllowance`) against token contracts.
- Wallet token balances via `useBalance(token: PTN_TOKEN_ADDRESS)`.

### 1D.4 Write functions used
- `approve(spender, amount)` through `ApproveButton` abstraction.

### 1D.5 Approval dependency
- PTN approvals are required before stake/farm actions where PTN is the input token.

### 1D.6 UI flow mapping
- UI reads PTN supply/balances for stats.
- Before action requiring transferFrom, UI checks allowance.
- If insufficient, user clicks approve -> token `approve` tx.

### 1D.7 What breaks if wrong PTN token address
- Stake/Lock PTN balances become wrong.
- Approval checks fail or approve wrong token.
- Dashboard/home token-linked stats become invalid.

### 1D.8 Base deployment dependency notes
- If PTN is redeployed on Base, all dependent contracts must use the new PTN address.
- If PTN is reused, verify decimals/symbol and ownership assumptions.

---

## 1E) Worked Example (Master Oracle Contract)

Contract: `WETHX_PTN_MASTER_ORACLE`  
Address key: `WETHX_PTN_MASTER_ORACLE_ADDRESS` (from `src/Config/index.js`)  
ABI: `src/Config/WETHX_PTN_MASTER_ORACLE_ABI.json`

### 1E.1 Purpose
- Aggregates oracle pricing for xToken/yToken and TWAP outputs.
- Critical source of truth for redeem quotes and dashboard pricing.

### 1E.2 Where used in UI
- Redeem page: `src/Pages/Redeem/Redeem.jsx`
- Home page analytics/pricing: `src/Pages/Home/Home.jsx`

### 1E.3 Read functions used
- `getYTokenPrice()` (Redeem + Home)
- `getXTokenPrice()` (Home)
- `getXTokenTWAP()` (Home)
- (ABI also includes `getYTokenTWAP()` though current UI usage is mainly Y price + X price/TWAP)

### 1E.4 Write functions used
- No write calls from current frontend flows.

### 1E.5 Approval dependency
- None (read-only from UI side).

### 1E.6 UI flow mapping
- User opens Redeem/Home -> app reads master oracle prices.
- Redeem output expectations and visible price indicators depend on this read.

### 1E.7 What breaks if wrong master oracle address
- Redeem pricing guidance becomes wrong.
- Home pricing/TWAP metrics become wrong or fail.
- Risk of user-facing quote mismatch and unsafe UX decisions.

### 1E.8 Base deployment dependency notes
- Master oracle depends on underlying pair oracle addresses for xToken/yToken.
- Deploy pair oracles first, then master oracle, then wire pool/frontend.

---

## 1F) Worked Example (Zap Contract)

Contract: `POTION_DAO_ZAP`  
Address key: `POTION_DAO_ZAP_ADDRESS` (from `src/Config/index.js`)  
ABI: `src/Config/POTION_DAO_ZAP_ABI.json`

### 1F.1 Purpose
- Convenience helper for zap routes and one-click LP/farm interaction paths.
- Maintains zap mapping metadata and provides zap execution endpoints.

### 1F.2 Where used in UI
- Active usage: `src/Pages/Tools/Accordion.jsx` (`zaps` read)
- Imported in Home context: `src/Pages/Home/Home.jsx`
- Largely commented/partial flow: `src/Pages/Tools/ZapModal.jsx`

### 1F.3 Read functions used
- `zaps(id)` read from Tools accordion.

### 1F.4 Write functions used
- No active write path currently in live UI.
- Commented code indicates possible use of `zap(...)` flow in ZapModal.

### 1F.5 Approval dependency
- If zap execution is enabled, input token approvals to zap contract are required.

### 1F.6 UI flow mapping
- Current frontend mainly reads zap route info (`zaps`).
- Full zap execution path appears prepared but partially disabled/commented.

### 1F.7 What breaks if wrong zap address
- Tools zap metadata display fails.
- Any future enabled zap tx path will fail immediately.

### 1F.8 Base deployment dependency notes
- ABI constructor hints indicate dependency on chef and router addresses.
- Deploy chef + confirm Base router first, then deploy/configure zap.

---

## 1G) Worked Example (WETH Token / Collateral Token)

Contract: `WETH (external token)`  
Address key: `WETH_TOKEN_ADDRESS`  
ABI usage: ERC20 pattern via `useBalance`/allowance + shared token ABIs

### 1G.1 Purpose
- Collateral/route token used in mint/redeem and price routing.

### 1G.2 Where used in UI
- Mint/Redeem balances and approvals.
- Stake/Lock/Home/APR pricing routes and reward pair logic.

### 1G.3 Read/Write usage
- Reads: wallet balances, allowance checks.
- Writes: approve (when required for pool/staking flows).

### 1G.4 Deploy/Reuse on Base
- Usually **Reuse** canonical Base WETH address (do not redeploy custom WETH unless explicitly required).

### 1G.5 If wrong address
- Mint/redeem collateral and multiple price routes break.

---

## 1H) Worked Example (WETHX Token)

Contract: `WETHX token`  
Address key: `WETHX_TOKEN_ADDRESS`  
ABI usage: ERC20 reads/allowance + referenced by pool/oracle logic

### 1H.1 Purpose
- Protocol xToken side used by pool mint/redeem and oracle pricing.

### 1H.2 Where used in UI
- Home/Stake/Lock context reads and reward references.
- Pool and master oracle calculations depend on xToken address wiring.

### 1H.3 Read/Write usage
- Reads: balances/supply in analytics contexts.
- Writes: approve where needed in flows interacting with dependent contracts.

### 1H.4 Deploy/Reuse on Base
- Typically **Deploy** with protocol set unless team says reuse existing address.

### 1H.5 If wrong address
- Pool/oracle read consistency breaks; metrics and redeem assumptions drift.

---

## 1I) Worked Example (PTN Reserve)

Contract: `PTN reserve`  
Address key: `PTN_RESERVE`  
ABI visibility: address-level config dependency (no direct heavy UI method usage in current branch)

### 1I.1 Purpose
- Reserve/accounting support contract in protocol architecture.

### 1I.2 Where used in UI
- Indirect dependency via protocol contracts (pool/staking/treasury wiring), not a major direct UI call target.

### 1I.3 Deploy/Reuse on Base
- Usually **Deploy** as part of protocol stack.

### 1I.4 If wrong address
- Downstream contracts may initialize/mint/reward incorrectly depending on reserve linkage.

---

## 1J) Worked Example (WETHX/WETH Pair Oracle)

Contract: `WETHX_WETH_ORACLE`  
Address key: `WETHX_WETH_ORACLE_ADDRESS`  
ABI: `src/Config/WETHX_WETH_ORACLE_ABI.json`

### 1J.1 Purpose
- Pair oracle for xToken/collateral side, feeding freshness/price components.

### 1J.2 Where used in UI
- Home page reads `blockTimestampLast` for oracle status/freshness display context.

### 1J.3 Read/Write usage
- Read: `blockTimestampLast`.
- No active frontend writes.

### 1J.4 Deploy/Reuse on Base
- Usually **Deploy** (or deploy equivalent oracle infra) before master oracle.

### 1J.5 If wrong address
- Freshness and upstream pricing reliability degrade; master oracle trust assumptions weaken.

---

## 1K) Worked Example (WETH/PTN Pair Oracle)

Contract: `WETH_PTN_ORACLE`  
Address key: `WETH_PTN_ORACLE_ADDRESS`  
ABI visibility: configured dependency used by oracle stack

### 1K.1 Purpose
- Pair oracle for PTN against collateral/reference token.

### 1K.2 Where used in UI
- Mostly indirect through master/pool price stack, not frequently called directly from pages.

### 1K.3 Deploy/Reuse on Base
- Usually **Deploy** before master oracle and pool wiring.

### 1K.4 If wrong address
- PTN pricing path becomes wrong; impacts redeem/mint economics via downstream contracts.

---

## 1L) Worked Example (Treasury Contract)

Contract: `POTION_DAO_TREASURY`  
Address key: `POTION_DAO_TREASURY_ADDRESS`  
ABI: `src/Config/POTION_TREASURY.json`

### 1L.1 Purpose
- Treasury-level protocol fund and policy management.

### 1L.2 Where used in UI
- Not a heavily direct end-user call target in this frontend branch; mostly governance/ops dependency.

### 1L.3 Deploy/Reuse on Base
- Usually **Deploy** with protocol stack.

### 1L.4 If wrong address
- Fee routing/treasury operations and dependent permissions can fail.

---

## 1M) Worked Example (Treasury Fund Contract)

Contract: `PTN Treasury Fund`  
Address key: `PTNTREASURY_FUND_ADDRESS`  
ABI: `src/Config/TREASURY_FUND.json`

### 1M.1 Purpose
- Dedicated treasury fund handling for protocol allocations.

### 1M.2 Where used in UI
- Mostly indirect dependency through protocol fund architecture.

### 1M.3 Deploy/Reuse on Base
- Usually **Deploy** alongside treasury with linked permissions.

### 1M.4 If wrong address
- Fund distribution/accounting linkage issues and admin operation failures.

---

## 1N) Worked Example (Router + Pair Infrastructure)

Contracts: `UniswapRouter` and `IUniswapv2Pair` interfaces  
Address keys: `UNISWAP_ROUTER_ADDRESS` (+ LP pair addresses discovered via chef/poolInfo contexts)  
ABIs: `src/Config/UniswapRouter.json`, `src/Config/IUniswapv2Pair.json`

### 1N.1 Purpose
- Router gives swap quote/route functions (`getAmountOut` usage in APR and related metrics).
- Pair ABI used for LP reserve reads (`getReserves`) and LP-token style allowance where needed.

### 1N.2 Where used in UI
- APR hook and Home/Stake/Lock/Tools reserve and quote calculations.

### 1N.3 Read/Write usage
- Reads: `getAmountOut`, `getReserves`.
- Writes: mostly not active in current user-facing flows; infra for price/liquidity context.

### 1N.4 Deploy/Reuse on Base
- Router is typically **Reuse** (official Base DEX router).
- Pair contracts are DEX infra outputs; not generally deployed by protocol app team as part of core stack unless explicitly required.

### 1N.5 If wrong address
- APR/price and liquidity metrics become unreliable.
- Any route-dependent UI assumptions are wrong.

---

## 2) Fill this for each remaining contract

Copy this block for each contract.

### Contract Template
- Contract name:
- Address key in config:
- ABI file:
- Purpose (1 line):
- Used in UI files:
- Read functions used by UI:
- Write functions used by UI:
- Required approvals:
- Depends on which addresses/contracts:
- Roles/permissions expected:
- If this address is wrong, what breaks:
- Deploy / Reuse / Verify on Base Sepolia:

---

## 3) Contract List You Must Complete Today

1. `PTN_TOKEN_ADDRESS`
2. `WETH_TOKEN_ADDRESS` (external infra, usually reuse)
3. `WETHX_TOKEN_ADDRESS`
4. `PTN_RESERVE`
5. `WETH_PTN_ORACLE_ADDRESS`
6. `WETHX_WETH_ORACLE_ADDRESS`
7. `WETHX_PTN_MASTER_ORACLE_ADDRESS`
8. `POTION_DAO_TREASURY_ADDRESS`
9. `PTNTREASURY_FUND_ADDRESS`
10. `WETHX_PTN_POOL_ADDRESS`
11. `POTION_DAO_STAKING_ADDRESS`
12. `POTION_DAO_CHEF_ADDRESS`
13. `POTION_DAO_ZAP_ADDRESS`
14. `UNISWAP_ROUTER_ADDRESS` (external infra, usually reuse)

---

## 4) 6-Hour Sprint Checklist

### Hour 1
- Confirm deploy scope: Deploy vs Reuse vs Verify for all 14 keys.
- Finish pool worksheet (already provided above).

### Hour 2
- Complete staking contract worksheet.
- Complete chef contract worksheet.

### Hour 3
- Complete token + reserve + treasury worksheets.

### Hour 4
- Complete oracle worksheets.
- Complete zap + router worksheet.

### Hour 5
- Create dependency order table (what must be deployed before what).
- Create role setup table (owner/minter/distributor/admin).

### Hour 6
- Create final go/no-go summary:
  - unknown constructor args
  - unknown roles
  - missing source/deploy scripts
  - deployment-ready yes/no

---

## 5) Deployment Readiness Gate (must all be YES)

- [ ] I can explain each contract in 2 lines.
- [ ] I can map each major button click to contract method call.
- [ ] I have full dependency order.
- [ ] I know which contracts are deploy vs reuse.
- [ ] I know required roles after deployment.
- [ ] No unknown critical item remains.

If any box is NO, do not start deployment.

---

## 6) Blocker note (important)

This repo set does not include deployable source scripts for smart-contract deployment.
You can complete understanding/mapping fully, but real deployment execution needs contract source/artifacts + deploy scripts.

---

## 7) Dependency Order Table (Base Sepolia)

Use this exact sequence for planning. Do not deploy later layers first.

| Order | Contract / Infra | Key | Action | Why it comes here |
|---|---|---|---|---|
| 1 | WETH (canonical Base) | `WETH_TOKEN_ADDRESS` | Reuse/Verify | External base asset used by multiple routes |
| 2 | Router (Base DEX) | `UNISWAP_ROUTER_ADDRESS` | Reuse/Verify | Needed for APR/route calculations and zap deps |
| 3 | PTN Token | `PTN_TOKEN_ADDRESS` | Deploy/Verify | Core token used by staking/farming/oracles |
| 4 | WETHX Token | `WETHX_TOKEN_ADDRESS` | Deploy/Verify | xToken side for pool + oracle system |
| 5 | PTN Reserve | `PTN_RESERVE` | Deploy/Verify | Reserve/fund dependency for protocol wiring |
| 6 | WETH/PTN Pair Oracle | `WETH_PTN_ORACLE_ADDRESS` | Deploy/Verify | Input feed for master pricing |
| 7 | WETHX/WETH Pair Oracle | `WETHX_WETH_ORACLE_ADDRESS` | Deploy/Verify | Input feed for master pricing |
| 8 | Master Oracle | `WETHX_PTN_MASTER_ORACLE_ADDRESS` | Deploy/Verify | Aggregates pair oracle values used by app/pool |
| 9 | Treasury | `POTION_DAO_TREASURY_ADDRESS` | Deploy/Verify | Protocol treasury management layer |
| 10 | Treasury Fund | `PTNTREASURY_FUND_ADDRESS` | Deploy/Verify | Fund allocation/payment linkage |
| 11 | Pool | `WETHX_PTN_POOL_ADDRESS` | Deploy/Verify | Needs tokens + oracle + fund/reserve wiring |
| 12 | Staking | `POTION_DAO_STAKING_ADDRESS` | Deploy/Verify | Needs token + reserve/fund/reward config |
| 13 | Chef | `POTION_DAO_CHEF_ADDRESS` | Deploy/Verify | Needs reward token/emissions/pool setup |
| 14 | Zap | `POTION_DAO_ZAP_ADDRESS` | Deploy/Verify | Depends on chef + router + zap routes |

---

## 8) Role Setup Matrix (Post-Deploy Checklist)

Mark each row ✅ only after tx hash is recorded.

| Contract | Role / Permission | Who should hold it | Status | Tx Hash |
|---|---|---|---|---|
| PTN Token | owner | protocol multisig / deployer handoff | [ ] | |
| PTN Token | minter (if applicable) | pool/staking/chef per design | [ ] | |
| WETHX Token | owner | protocol multisig / deployer handoff | [ ] | |
| WETHX Token | minter (if applicable) | pool contract or designated minter | [ ] | |
| Staking | owner | protocol multisig / admin | [ ] | |
| Staking | reward distributor approval | designated distributor(s) | [ ] | |
| Chef | owner | protocol multisig / admin | [ ] | |
| Chef | pool config rights | admin operator | [ ] | |
| Treasury | owner/admin | protocol multisig | [ ] | |
| Treasury Fund | owner/admin | protocol multisig | [ ] | |
| Pool | owner/admin | protocol multisig | [ ] | |
| Pool | pause/control rights | admin operator | [ ] | |
| Master Oracle | owner/admin | protocol multisig | [ ] | |
| Pair Oracles | owner/admin | protocol multisig | [ ] | |
| Zap | owner/admin | protocol multisig | [ ] | |

Note: exact role names and function calls must be confirmed from source contracts/scripts.

---

## 9) Final Go / No-Go Summary (Today)

### 9.1 Current status
- ✅ Frontend integration and contract usage mapping completed.
- ✅ Per-contract worksheet completed for practical understanding.
- ✅ Dependency deployment order prepared.
- ✅ Role setup checklist prepared.
- ❌ Deployment execution blocked (missing contract source/artifacts + deploy scripts).

### 9.2 Go / No-Go decision
- **Decision: NO-GO for on-chain deployment execution right now.**

### 9.3 Why no-go
- This repository set does not contain deployable smart-contract source project.
- ABI and addresses are enough to integrate/read/write existing deployments, not redeploy exact contracts.

### 9.4 Minimum unblock requirements
- Smart-contract source repo (Solidity/Vyper + deploy scripts), or
- Verified source/artifacts for each required deployed contract.

### 9.5 Immediate next action when unblocked
- Configure Base Sepolia env -> deploy in Table order -> assign roles via Matrix -> update frontend config -> run smoke tests.
