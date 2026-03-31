# Dashboard Page Documentation

Document owner: Frontend and protocol integration team
Last updated: 2026-03-31
Status: Active

## 1) Purpose
The Dashboard page gives users a consolidated view of staking and reward state from the staking contract, and exposes reward-claim actions.

Primary goals:
- Show unlocked staked BRVA and locked BRVA balances.
- Show vesting and lock schedules with live countdowns.
- Show claimable rewards and claim actions.
- Keep displayed values numerically safe when reads are missing or delayed.

## 2) Location and route
Main component file:
- src/Pages/Dashboard/Dashboard.jsx

Route registration:
- src/App.js
- Path: /dashboard

## 3) External dependencies
Config and addresses:
- src/Config/index.js

Hooks:
- src/Hooks/useCustomContractRead.js
- src/Hooks/useCustomContractWrite.js

ABIs:
- src/Config/POTION_DAO_STAKING_ABI.json
- src/Config/WETHX_PTN_MASTER_ORACLE_ABI.json

Utilities:
- src/Utils/convertWeiToEther.js
- src/common/FormateNum.js

## 4) Network and contract dependencies
Current network configuration is Base Sepolia.

Dashboard read dependencies:
- WETHX_PTN_MASTER_ORACLE_ADDRESS
  - getYTokenPrice
- POTION_DAO_STAKING_ADDRESS
  - claimableRewards(address)
  - withdrawableBalance(address)
  - earnedBalances(address)
  - lockedBalances(address)
  - totalSupply()
  - lockedSupply()

Dashboard write dependencies:
- POTION_DAO_STAKING_ADDRESS
  - getReward()
  - emergencyWithdraw()

## 5) Page structure
The page is split into two columns.

Left column:
- Card: STaked (unlocked BRVA staked)
- Card: LOCKED (total BRVA locked)
- List panel: Vested (earningsData)
- List panel: Locked (lockData)

Right column:
- Rewards card: Claimable BRVA
- Rewards card: BRVA in Vesting
- Rewards card: Claim All

## 6) Data flow and state model
Input state:
- Connected wallet address from useAccount.
- Contract reads from custom read hook wrappers.

Derived numeric safety helpers:
- toNumber(value): converts to finite number, otherwise 0.
- toEtherNumber(value): converts wei-like values to ether-like numeric value safely.
- toFixedSafe(value, decimals): fixed precision string with finite fallback.

Core local state:
- totalClaimableRewards
- totalClaimableRewardsBNB
- totalEarlyClaimableRewards
- earlyPenalty
- potionPrice
- remainingTimes
- remainingTimesLocks

## 7) Read-to-UI mapping
A) Price source
- Read getYTokenPrice from master oracle.
- Convert to ether-like units.
- Multiply by WETH_USD_FALLBACK constant.
- Result used as BRVA USD reference price.

B) Supply and balance cards
- totalStakedSupply read from totalSupply().
- totalLockedSupply read from lockedSupply().
- totalStakedAmount = totalSupply value.
- lockedAmount = lockedSupply value.
- stakedAmount = max(totalStakedAmount - lockedAmount, 0).
- STaked card shows stakedAmount (unlocked) and USD.
- LOCKED card shows lockedAmount and USD.

C) Vesting and lock lists
- earnedBalances().earningsData renders vesting rows.
- lockedBalances().lockData renders lock rows.
- Each row shows amount and countdown.
- Empty states:
  - No Vestings Found
  - No Locks Found

D) Reward cards
- claimableRewards() index 0 maps to BRVA claimable amount.
- claimableRewards() index 1 maps to secondary token claimable amount.
- withdrawableBalance().amount contributes to early claimable BRVA.
- BRVA in Vesting card shows earnedBalances().total.
- Claim All BRVA display = claimable BRVA + early claimable BRVA.

## 8) Action behavior and button gating
Claim action:
- Contract method: getReward()
- Enabled when:
  - wallet is connected
  - claimable BRVA or secondary token is greater than 0
  - write configuration exists
  - transaction is not already pending

Claim All action:
- Contract method: emergencyWithdraw()
- Enabled when:
  - wallet is connected
  - claimAll BRVA display value is greater than 0
  - write configuration exists
  - transaction is not already pending

Pending state UI:
- Button text appends dot sequence while transaction state is loading.

## 9) Countdown logic
Two one-second intervals are used:
- Vesting countdown updates remainingTimes array.
- Lock countdown updates remainingTimesLocks array.

Time conversion:
- target epoch minus current epoch.
- If negative or zero, all units display 0.

## 10) Known semantics and domain notes
Important staking semantic:
- totalSupply includes both unlocked and locked stake in the staking contract.
- lockedSupply is the locked subset.
- Unlocked staked amount for UI display is computed as totalSupply minus lockedSupply.

This is why a user can see:
- Unlocked staked lower than total staked
- Locked shown separately

## 11) Known limitations and follow-ups
1. Price conversion currently uses a fixed WETH_USD_FALLBACK value of 700.
2. Claim All enablement currently follows BRVA-side total logic; secondary token-only claimability may need product confirmation.
3. Some imports and hook dependencies in the file are not fully cleaned and may show linter warnings.
4. Info tooltips are static placeholder text.

## 12) Error handling and resiliency
Current resiliency behaviors:
- Non-finite numeric inputs collapse to 0 via toNumber.
- Invalid countdown inputs collapse to zero duration.
- Buttons are disabled when write prerequisites are not met.

Operational caveat:
- Unit test execution may fail in current setup if browser API polyfills are missing for slider dependencies in other pages.

## 13) Manual QA checklist
Use this quick list after Dashboard changes:
1. Open /dashboard with connected wallet.
2. Confirm STaked card equals unlocked portion only.
3. Confirm LOCKED card equals locked total.
4. Confirm USD values update when oracle price read updates.
5. Confirm vesting list and lock list show correct empty state when no data.
6. Confirm Claim button enables only when claimable rewards exist.
7. Confirm Claim All button enables only when eligible amount exists.
8. Trigger claim action and verify pending state text appears.
9. Refresh page and ensure values remain consistent.

## 14) Change management guidance
For safe edits on this page:
1. Create a timestamped backup of Dashboard.jsx before changes.
2. Apply one scoped change at a time.
3. Run build validation.
4. Record what changed and rollback command in a debug log.
5. Stop after the scoped objective is done; do not expand scope into unrelated warnings.

## 15) Quick reference summary
- Route: /dashboard
- Main file: src/Pages/Dashboard/Dashboard.jsx
- Primary read contract: POTION_DAO_STAKING_ADDRESS
- Primary write actions: getReward and emergencyWithdraw
- Unlocked staked formula: max(totalSupply - lockedSupply, 0)

## 16) Why you can see 0, 0, 0, and 10.00K at the same time
This is the most important behavior to understand.

Example state from user view:
- Claimable BRVA card: 0.00 BRVA and 0.00 secondary token
- BRVA in Vesting card: 0.00
- Claim All card: 10.00K BRVA and 0.00 secondary token

This is possible and expected when:
1. You have unlocked stake balance (principal) available to withdraw.
2. You currently have no pending reward emissions for BRVA or secondary token.
3. You currently have no active earning locks in earningsData.

Concrete example:
- unlocked principal in staking: 9,999 BRVA
- claimable reward BRVA: 0
- claimable secondary reward: 0
- vesting total: 0
- then Claim All BRVA base is ~9,999 and compact UI can show 10.00K

How the page produces that state:
1. Claimable BRVA values come from claimableRewards(address):
  - If rewards[msg.sender][token] is zero (or accrual is zero), UI shows 0.00.
2. BRVA in Vesting comes from earnedBalances(address).total:
  - If no active earnings entries exist, UI shows 0.00.
3. Claim All BRVA value uses withdrawableBalance(address).amount plus claimable BRVA:
  - withdrawable amount includes unlocked principal and eligible earned balance minus penalty.
  - So this can be large even when reward cards are zero.

In short:
- Claimable cards represent reward accrual.
- Claim All BRVA includes withdrawable principal path as well.
- They are related but not the same pool of tokens.

Display formatting note (important):
- Claim All BRVA display passes through rounding and compact formatting.
- Page flow is effectively:
  1. claimAllBrva = claimableBrva + earlyClaimableBrva
  2. toFixedSafe(claimAllBrva, 0) rounds to whole number string
  3. formatNumber(...) may abbreviate as K/M/B
- Example: 9,999 can render as 10.00K because compact formatting uses two decimals at thousand scale.

## 17) User perspective map (what each number means)
This map explains what users see and what each value means in plain language.

| What user sees | Meaning in plain language | Source function | Why it can be 0 |
|---|---|---|---|
| Claimable BRVA (left value) | BRVA rewards ready to claim now | claimableRewards(address)[0].amount | No active reward accrual yet, or rewards already claimed |
| Claimable secondary token (right value) | Secondary reward token ready to claim now | claimableRewards(address)[1].amount | No accrual for secondary reward token |
| BRVA in Vesting | BRVA earned under vesting schedule | earnedBalances(address).total | No earning locks currently open |
| Claim All BRVA | Total BRVA withdrawable now by emergency path plus claimable BRVA display logic | withdrawableBalance(address).amount + claimable BRVA display component | Can still be high due unlocked principal even if rewards are zero |
| Claim All secondary token | Secondary token reward shown in claim-all card | Same claimable secondary token value used by page | Zero if secondary reward accrual is zero |
| STaked (Unlocked BRVA Staked) | Amount currently staked but not locked | totalSupply() - lockedSupply() | Can be zero if all stake is in locked bucket |
| LOCKED (Total BRVA Locked) | Amount in lock schedule | lockedSupply() | Can be zero if user did not lock |

## 18) Developer perspective map (exact code and contract paths)

UI state assignment in Dashboard component:
- totalClaimableRewards is set from claimableRewards response index 0.
- totalClaimableRewardsBNB is set from claimableRewards response index 1.
- totalEarlyClaimableRewards is set from withdrawableBalance.amount.
- vestedBrva is derived from earnedBalances.total.
- claimAllBrva is derived as claimableBrva + earlyClaimableBrva.

Contract logic behind the values (BraveaDaoStaking):
- claimableRewards(address): computes _earned() per reward token.
- earnedBalances(address): sums unexpired earnings entries.
- withdrawableBalance(address):
  - amount = bal.unlocked + bal.earned - penaltyAmount
  - penaltyAmount applies only to still-penalized earned portion.

Interpretation consequence:
- A user may have large bal.unlocked while rewards and earnings are zero.
- In that state, Claim All BRVA can be large while claimable/vesting cards show zero.
- The displayed text can be abbreviated (K/M/B), so exact underlying value may be slightly different from shown compact text.

## 19) Page execution flow (easy mental model)
The runtime flow is:
1. Wallet address loads from useAccount.
2. Dashboard triggers reads to oracle and staking contract.
3. Read results are normalized through toNumber/toEtherNumber.
4. Derived UI values are computed:
  - stakedAmount, lockedAmount, claimableBrva, claimAllBrva, vestedBrva.
5. Render updates cards and lists.
6. Button gating checks whether writes are prepared and values are actionable.
7. On click, writeAsync is called for getReward or emergencyWithdraw.

## 20) Practical troubleshooting guide for this exact confusion
If a user asks: "Why Claimable is 0 but Claim All is 10K?"

Check in this order:
1. Verify claimableRewards(address) values for reward tokens.
2. Verify earnedBalances(address).total and earningsData length.
3. Verify withdrawableBalance(address).amount.
4. If step 1 and 2 are zero but step 3 is large, explain that unlocked principal is driving Claim All.

Expected explanation template:
- "Your rewards are currently zero, so Claimable shows 0."
- "You still have withdrawable principal in staking, so Claim All shows a large BRVA amount."

## 21) Important product note
Current Claim All button gating is BRVA-side focused in this page implementation.
If product intent is to enable Claim All when any reward token is claimable, update gate logic accordingly in a dedicated scoped change.
