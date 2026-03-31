# Debug Findings - Home and Dashboard

Date: 2026-03-31
Scope: Analysis only (no code changes in this step)

## What was validated
- Reviewed Home and Dashboard frontend logic.
- Verified staking contract behavior from recovered contract.
- Ran automated test command once.

## Test run result
- Command: npm test -- --watchAll=false
- Result: FAIL (environment/test setup issue, not business logic assertion)
- Failure: matchMedia not present due react-slick usage in Home import path.
- Impact: Unit tests currently cannot be used as a reliable regression signal until test setup polyfills are added.

## Findings (ordered by severity)

### 1) Dashboard STAKED card is currently showing total supply, which includes locked amounts
Severity: High
Status: Confirmed

Evidence:
- Dashboard reads total supply and locked supply separately:
  - src/Pages/Dashboard/Dashboard.jsx:143 (totalSupply)
  - src/Pages/Dashboard/Dashboard.jsx:152 (lockedSupply)
  - src/Pages/Dashboard/Dashboard.jsx:158 (stakedAmount from totalSupply)
  - src/Pages/Dashboard/Dashboard.jsx:159 (lockedAmount from lockedSupply)
- Staking contract semantics confirm totalSupply includes lock stakes:
  - recovered-contracts/BraveaDaoStaking.sol:972 (public totalSupply)
  - recovered-contracts/BraveaDaoStaking.sol:973 (public lockedSupply)
  - recovered-contracts/BraveaDaoStaking.sol:1171 (stake adds to totalSupply)
  - recovered-contracts/BraveaDaoStaking.sol:1174-1175 (if lock, also adds to lockedSupply)

Observed symptom alignment:
- Your screenshot values: STAKED = 19999, LOCKED = 10000.
- This is consistent with frontend reading totalSupply for STAKED and lockedSupply for LOCKED.
- If intent is unlocked-only staked, expected STAKED would be totalSupply - lockedSupply = 9999.

Resolution needed:
- Decide product intent:
  1) If STAKED means unlocked-only: display totalSupply - lockedSupply.
  2) If STAKED means all staked (including locked): update label copy to avoid duplication confusion.

### 2) Dashboard Claim All enablement checks BRVA only, not full multi-token claimability
Severity: Medium
Status: Confirmed

Evidence:
- Claim-all computed BRVA side only:
  - src/Pages/Dashboard/Dashboard.jsx:164 (claimAllBrva)
- Enablement gate uses claimAllBrva > 0:
  - src/Pages/Dashboard/Dashboard.jsx:180
  - src/Pages/Dashboard/Dashboard.jsx:739 (button disabled={!canClaimAll})

Risk:
- If BRVA side is 0 but secondary reward token is claimable, Claim All can be disabled incorrectly.

Resolution needed:
- Align Claim All enabled-state with all tokens intended to be claimed in that action.

### 3) Home lock APR formula has likely operator-precedence/value-normalization issue
Severity: Medium
Status: Confirmed code pattern, needs product formula confirmation

Evidence:
- src/Pages/Home/Home.jsx:135 (getLockerApr)
- src/Pages/Home/Home.jsx:162 uses: (valueA + valueB / valueD) * (365 / (days * 4)) * 100

Risk:
- Current expression only divides valueB by valueD, not the total reward value.
- This can materially distort APR depending on intended financial model.

Resolution needed:
- Confirm intended formula with tokenomics source and apply explicit parentheses accordingly.

### 4) Home still relies on fixed WETH/USD fallback constant (700) for price-dependent calculations
Severity: Medium
Status: Confirmed

Evidence:
- src/Pages/Home/Home.jsx:60 (WETH_USD_FALLBACK = 700)
- Applied in key calculations:
  - src/Pages/Home/Home.jsx:146
  - src/Pages/Home/Home.jsx:180
  - src/Pages/Home/Home.jsx:262
  - src/Pages/Home/Home.jsx:441

Risk:
- BRVA/LYNEX price, MCap, and APR drift from market reality when ETH/USD is not 700.

Resolution needed:
- Replace static fallback with dynamic feed or configurable runtime source.

## Additional observations
- Timestamp hardening in Home is present and working as expected via NA fallback:
  - src/Pages/Home/Home.jsx:72 (formatTimestampOrNA)
  - src/Pages/Home/Home.jsx:552
  - src/Pages/Home/Home.jsx:649
- Initial analysis pass was no-change. Phase 1 execution is now recorded below.

## Execution log (Phase 1 - Dashboard staked semantic fix)
Status: Completed

Checkpoint:
- Backup file: recovery-checkpoints/20260331-104748-dashboard-staked-fix/Dashboard.jsx.bak
- Restore command: Copy-Item 'recovery-checkpoints/20260331-104748-dashboard-staked-fix/Dashboard.jsx.bak' 'src/Pages/Dashboard/Dashboard.jsx' -Force

Changes applied:
- src/Pages/Dashboard/Dashboard.jsx
  - Compute unlocked staked amount as totalSupply - lockedSupply (clamped to >= 0).
  - Update card label from "Total BRVA Staked" to "Unlocked BRVA Staked".

Validation:
- get_errors on Dashboard.jsx: no errors.
- npm run build: exit code 0.

Observed warnings and handling:
- Build output still contains pre-existing lint/source-map warnings across multiple files.
- No additional fixes were attempted outside the scoped phase to avoid rabbit-hole drift.

Open items (not changed in this phase):
1. Claim All enablement should include all claimable token paths.
2. Home lock APR formula requires product formula confirmation.
3. Home still uses fixed WETH/USD fallback constant.

Stop condition used:
- One scoped fix + successful compile + explicit rollback path.
- Deferred broader warnings and unrelated cleanup intentionally.

## Recommended next execution order
1. Fix Claim All enablement scope (Dashboard only).
2. Confirm and correct Home lock APR formula.
3. Remove static WETH/USD fallback dependency from Home pricing.
