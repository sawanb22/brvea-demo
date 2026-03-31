# Bravea Base Sepolia Test Plan

Project: bravea-integration

Network: Base Sepolia (84532)

Date: 28-03-2026

Wallet: metamask

Commit/Build: __________

---

## 1) Goal Of This Plan

This plan maps all remaining tests you can run now and all tests you should run before handoff.

Use this in order. Do not skip earlier gates.

---

## 2) Current Status Snapshot

Mark this before running tests:

- [✅] Wallet connect on Base Sepolia is working
- [✅] Farm pool cards load (not stuck on loader)
- [✅] At least one approve transaction has succeeded
- [✅] A full deposit/stake transaction has been confirmed
- [✅] UI balances update after transaction and refresh

If the fourth checkbox is not true, you have not completed staking/deposit yet.

---

## 3) Can Do Now vs Should Do

### Can Do Now 

- [✅] Wallet and network checks
- [ ] Read data checks on all pages
- [ ] One full flow per write action with small amount
- [ ] Basic negative checks (insufficient amount, disconnected wallet)
- [✅] Refresh persistence checks

### Should Do Before Release (must run before production)

- [ ] Repeat core write tests on fresh wallet
- [ ] Repeat core write tests on second browser/profile
- [ ] Failure and revert-path checks with recorded errors
- [ ] Explorer verification for each tx method and contract address
- [ ] Full evidence bundle: screenshots and tx hashes for all critical flows

---

## 4) Test Gates

### Gate A: Environment And Startup

| ID | Test | Steps | Pass Criteria | Status | Notes |
|---|---|---|---|---|---|
| A1 | Correct project | Start app only from this repo | App runs from bravea-integration only | ✅ PASS | Using bravea-integration only |
| A2 | Chain | Connect wallet | Wallet stays on Base Sepolia | ✅ PASS | Confirmed in MetaMask |
| A3 | Address config | Verify active config values | Active staking and chef addresses match latest deploy | ✅ PASS | Updated active Base Sepolia addresses |
| A4 | Route smoke | Open all routes once | No blank page, no crash | ✅ PASS | Automated route smoke coverage added in `App.test.js` for `/`, `/dashboard`, `/farm`, `/stake`, `/stake-withdraw`, `/lock`, `/lock-withdraw`, `/mint`, and `/redeem` |

Routes to smoke test:

- /
- /dashboard
- /farm
- /stake
- /stake-withdraw
- /lock
- /lock-withdraw
- /mint
- /redeem

### Gate B: Read Data Validity

| ID | Page | What To Check | Pass Criteria | Status | Notes |
|---|---|---|---|---|---|
| B1 | Home | Prices, totals, links | Data loads, no NaN, links open expected target | ✅ PASS | Automated Home component test passes (`Home.test.jsx`): safe fallback rendering, no `NaN`/`Infinity`, `Last Update: NA` behavior validated |
| B2 | Dashboard | Rewards and summary values | Values render and refresh | ✅ PASS | Automated Dashboard component test passes (`Dashboard.test.jsx`): unlocked staked math, 0/0/0/10.00K scenario, and claim button gating validated |
| B3 | Farm | Pool cards and metrics | Cards visible, no infinite loader | ✅ PASS | Loader issue resolved after pool/config fixes |
| B4 | Stake | Balance and total staked card | Numbers render and update | ✅ PASS | Automated smoke coverage in `OtherPages.test.jsx` plus prior manual verification |
| B5 | Stake Withdraw | Unlock/withdraw values | Values render without breaking | ✅ PASS | Automated smoke coverage in `OtherPages.test.jsx` plus prior manual verification |
| B6 | Lock and Lock Withdraw | Lock-related values | Values render and update | ✅ PASS | Automated smoke coverage in `OtherPages.test.jsx` plus prior manual verification |
| B7 | Mint | Input and output estimates | Inputs accepted, output updates | ✅ PASS | Automated smoke coverage in `OtherPages.test.jsx` plus prior manual verification |
| B8 | Redeem | Redeem read values | Values render and update | ✅ PASS | Automated smoke coverage in `OtherPages.test.jsx`; collateral-ratio-dependent outputs remain expected |

### Gate C: Critical Write Flows (Small Amounts)

Important: Approve is not completion. Completion requires the second transaction.

| ID | Flow | Step 1 | Step 2 | Pass Criteria | Tx Hash 1 | Tx Hash 2 | Status |
|---|---|---|---|---|---|---|---|
| C1 | Farm Deposit | Approve LP | Deposit | Deposited value increases and persists after refresh | Confirmed | Confirmed | ✅ PASS |
| C2 | Farm Withdraw | Input small amount | Withdraw | Deposited decreases, wallet LP increases | Confirmed | N/A | ✅ PASS |
| C3 | Stake | Approve BRVEA | Stake | Total staked increases, wallet BRVEA decreases | Confirmed | Confirmed | ✅ PASS |
| C4 | Stake Withdraw | Input allowed amount | Withdraw | Staked amount decreases, wallet BRVEA increases | Confirmed | N/A | ✅ PASS |
| C5 | Lock Stake | Approve BRVEA | Stake with lock | Locked values update and persist after refresh | Confirmed | Confirmed | ✅ PASS |
| C6 | Claim Rewards | Trigger claim/getReward | Confirm tx | Reward values update as expected | Per-pool `Harvest` confirmed | `Claim All` confirmed | ✅ PASS (manual retest on 31-03-2026 confirms `Claim All` is now working) |
| C7 | Mint | Approve if required | Mint (+ collect) | Mint/collect output reflected in balances | N/A (allowance already set) | Confirmed | ✅ PASS |
| C8 | Redeem | Approve if required | Redeem | Redeem output reflected in balances | N/A (allowance set) | Confirmed | ✅ PASS (works for amounts within available pool collateral; Collect confirmed) |

### Gate D: Negative And Guardrail Tests

| ID | Test | Steps | Expected Behavior | Status | Notes |
|---|---|---|---|---|---|
| D1 | Empty amount | Keep amount 0 and click action | Button disabled or no tx sent | ✅ PASS | User confirmed the 0-amount path is handled for the current test round |
| D2 | Over balance | Enter amount greater than balance | Insufficient Fund shown, no tx | ✅ PASS | User confirmed the over-balance guardrail behaves correctly |
| D3 | Wrong network | Switch away from Base Sepolia | App asks to correct network or actions blocked | ⚠ PARTIAL | User switched networks and the app still appeared on Base Sepolia; needs a cleaner explicit mismatch check against MetaMask network state |
| D4 | Disconnect wallet | Disconnect and revisit page | Connect Wallet state shown, no crash | ✅ PASS | User confirmed disconnect/revisit behaves correctly |
| D5 | Rapid repeat click | Click action repeatedly | No duplicate tx spam | ✅ PASS | User confirmed repeated clicks are handled correctly |

### Gate E: Persistence And Refresh

| ID | Test | Steps | Pass Criteria | Status | Notes |
|---|---|---|---|---|---|
| E1 | After each write tx | Hard refresh page | Updated values remain correct | ✅ PASS | Confirmed on completed farm/stake flows |
| E2 | Full app refresh | Reload and revisit all major pages | No state corruption | ✅ PASS | User confirmed reload/hard refresh keeps values correct |
| E3 | New session | Close and reopen browser | Last on-chain state shown correctly | ✅ PASS | User confirmed close/reopen persistence works as described |

---

## 5) Known High-Risk Areas To Watch

- Approve confirmed but second tx not sent.
- Input amount left at 0.00 when trying to deposit/stake.
- Pool data reads return empty and UI stays in loader.
- Read values appear stale until refresh.
- Chain mismatch or cached old network session.

---

## 6) Fast Debug Guide

### If farm shows loader only

1. Verify chef address is correct in active config.
2. Check poolLength on chef.
3. If poolLength is 0, pools are not initialized.
4. If poolLength is greater than 0, check poolInfo and userInfo reads.

### If approve succeeds but deposit/stake stays zero

1. Confirm second tx exists and is confirmed.
2. If second tx missing, action was not sent.
3. Ensure input amount is greater than 0.
4. Retry after refresh and wallet reconnect.

### If boss asks: Are pointers loading

Use this answer format:

- Yes: pool cards visible, pool reads resolving, values updating.
- No: loader persists or pool reads failing/empty.

---

## 7) Evidence Log (Fill During Testing)

| ID | Date/Time | Page | Action | Before | After | Tx Hash | Result | Screenshot |
|---|---|---|---|---|---|---|---|---|
| 1 |  |  |  |  |  |  | PASS/FAIL |  |
| 2 |  |  |  |  |  |  | PASS/FAIL |  |
| 3 |  |  |  |  |  |  | PASS/FAIL |  |
| 4 |  |  |  |  |  |  | PASS/FAIL |  |
| 5 |  |  |  |  |  |  | PASS/FAIL |  |
| 6 |  |  |  |  |  |  | PASS/FAIL |  |
| 7 |  |  |  |  |  |  | PASS/FAIL |  |
| 8 |  |  |  |  |  |  | PASS/FAIL |  |

---

## 8) Exit Criteria

Release-ready for this round only if all are true:

- [ ] All Gate A tests pass
- [ ] All Gate B tests pass
- [ ] All critical write flows C1 to C8 pass at least once
- [ ] Negative tests D1 to D5 pass
- [ ] Persistence tests E1 to E3 pass
- [ ] Evidence log includes tx hash for each write action
- [ ] Major issues documented with reproduction steps

---

## 9) Today Priority Run Order

Use this exact order now:

1. A1 to A4
2. B3 farm read check
3. C1 farm deposit complete flow
4. C2 farm withdraw
5. C3 stake complete flow
6. C4 stake withdraw
7. C6 claim rewards
8. B1, B2, B4 to B8
9. D1 to D5
10. E1 to E3

