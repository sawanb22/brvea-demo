# Operator Runbook: Base Sepolia (Execution-Only)

Purpose: Fast, practical sequence to deploy, wire, validate, and cut over Bravea stack on Base Sepolia.
Audience: Operator/DevOps/Protocol admin.

---

## 0) Required Inputs (fill before starting)

- DEPLOYER_PRIVATE_KEY=<...>
- OWNER_ADDRESS=<...> (prefer multisig)
- TEAM_WALLET=<...>
- FEE_WALLET=<...>
- POINT_SYSTEM=<...>
- REWARD_DISTRIBUTOR=<...>
- STAKING_MINTERS=[<...>,<...>]
- RPC_URL=https://sepolia.base.org
- EXPLORER=https://sepolia.basescan.org

External constants to verify before deploy:
- WETH=0x4200000000000000000000000000000000000006
- ROUTER=0x1689E7B1F10000AE47eBfE339a4f69dECd19F602

---

## 1) Deploy Order (strict)

1. Deploy Bravea
- Save BRAVEA

2. Deploy WETHX (if fresh deploy track)
- Save WETHX

3. Deploy BRVEAReserve(initialOwner=OWNER_ADDRESS)
- Save PTN_RESERVE

4. Initialize reserve
- BRVEAReserve.initialize(BRAVEA, POINT_SYSTEM)

5. Deploy BraveaDaoStaking(
   stakingToken,
   stakingTokenReserve=PTN_RESERVE,
   minters=STAKING_MINTERS,
   teamWallet=TEAM_WALLET,
   initialOwner=OWNER_ADDRESS
)
- Save STAKING

6. Deploy BraveaDaoChefFee(
   initialOwner=OWNER_ADDRESS,
   feeWallet=FEE_WALLET,
   bravea=BRAVEA,
   pointSystem=POINT_SYSTEM
)
- Save CHEF

7. Deploy BraveaDaoTreasury(staking=STAKING, initialOwner=OWNER_ADDRESS)
- Save TREASURY

8. Deploy oracle stack + swap strategy (project-specific contracts)
- Save WETH_PTN_ORACLE
- Save WETHX_WETH_ORACLE
- Save MASTER_ORACLE
- Save SWAP_STRATEGY

9. Deploy Pool(
   xToken=WETHX,
   yToken=WETH,
   yTokenReserve=PTN_RESERVE,
   initialOwner=OWNER_ADDRESS
)
- Save POOL

10. Deploy BraveaDaoZapWethSwap(
    PotionDaoChef=CHEF,
    uniRouter=ROUTER,
    initialOwner=OWNER_ADDRESS
)
- Save ZAP

11. Deploy BRAVEATreasuryFund(initialOwner=OWNER_ADDRESS)
- Save TREASURY_FUND
- Initialize with reward token if required by your process

---

## 2) Post-Deploy Wiring (must complete)

1. Reserve wiring
- BRVEAReserve.setPool(POOL)
- Add any additional allowed pools if used

2. Staking reward setup
- STAKING.addReward(<rewardToken>, REWARD_DISTRIBUTOR)
- STAKING.approveRewardDistributor(<rewardToken>, REWARD_DISTRIBUTOR, true)
- Repeat for each reward token

3. Minter/permission setup
- WETHX.setMinter(POOL) if pool mints xToken
- Any additional minter grants required by your token/reward design

4. Chef setup
- Add LP pools on CHEF with allocPoint, lockPeriod, fee, rewarder
- Verify CHEF.poolLength() > 0

5. Treasury setup
- Add strategies on TREASURY if strategy-based fund requests are needed

---

## 3) Frontend Cutover

Update active config in src/Config/index.js:
- CHAIN_ID=84532
- RPC_URL=https://sepolia.base.org
- All deployed addresses:
  - PTN_TOKEN_ADDRESS
  - WETH_TOKEN_ADDRESS
  - UNISWAP_ROUTER_ADDRESS
  - WETHX_TOKEN_ADDRESS
  - POTION_DAO_CHEF_ADDRESS
  - PTN_RESERVE
  - POTION_DAO_STAKING_ADDRESS
  - POTION_DAO_TREASURY_ADDRESS
  - PTNTREASURY_FUND_ADDRESS
  - POTION_DAO_ZAP_ADDRESS
  - WETHX_PTN_POOL_ADDRESS
  - WETH_PTN_ORACLE_ADDRESS
  - WETHX_WETH_ORACLE_ADDRESS
  - WETHX_PTN_MASTER_ORACLE_ADDRESS

Operational note:
- Treat src/Config/index.js as runtime source of truth.
- Do not use src/Config/addresses.json for active deployment unless intentionally migrated.

---

## 4) Pre-Trading Validation (before enableTrading)

Run these checks on chain + UI:

1. Contract ownership/roles
- Owner addresses correct
- Staking distributors configured
- Reserve rewarder/pools configured

2. Read sanity
- Home/Dashboard metrics load
- Farm pool cards load
- Staking balances/rewards load
- Mint/Redeem estimate reads load

3. Small write flows (minimal amounts)
- Farm: approve -> deposit -> withdraw
- Stake: approve -> stake -> withdraw
- Lock: approve -> stake(lock) -> withdrawExpiredLocks (when unlockable)
- Mint: approve(WETH) -> mint -> collect
- Redeem: approve(WETHX) -> redeem -> collect

4. Negative checks
- zero amount blocked
- over-balance blocked
- wrong network blocked
- disconnected wallet safe state

Use TESTING_CHECKLIST_BASE_SEPOLIA.md as evidence log source.

---

## 5) Trading Cutover

Cutover command/action:
- BRAVEA.enableTrading()

Immediately after cutover verify:
- BRAVEA.tradingActive() == true
- Chef harvest now uses mint branch (not point allocation branch)
- Reserve transfer path now sends tokens (not points)

---

## 6) Post-Launch Monitoring (first 24h)

1. Core health every cycle
- CHEF.pendingReward values advancing
- STAKING.claimableRewards non-stale
- POOL.info and calcMint/calcRedeem responding
- Oracle timestamps/prices not stale

2. Economic safety checks
- No abnormal slippage/reverts on mint/redeem
- Penalty behavior in Chef/Staking as expected
- Treasury allocation succeeds and emits expected events

3. Incident rollback levers
- Pause mint/redeem where contract supports it
- Disable problematic strategy access in TREASURY
- Disable/add pool permissions in RESERVE

---

## 7) Command Templates (replace placeholders)

Foundry-style examples:

```bash
export RPC_URL=https://sepolia.base.org
export PRIVATE_KEY=<deployer_key>

cast send <RESERVE> "initialize(address,address)" <BRAVEA> <POINT_SYSTEM> --rpc-url $RPC_URL --private-key $PRIVATE_KEY
cast send <RESERVE> "setPool(address)" <POOL> --rpc-url $RPC_URL --private-key $PRIVATE_KEY
cast send <STAKING> "addReward(address,address)" <REWARD_TOKEN> <DISTRIBUTOR> --rpc-url $RPC_URL --private-key $PRIVATE_KEY
cast send <STAKING> "approveRewardDistributor(address,address,bool)" <REWARD_TOKEN> <DISTRIBUTOR> true --rpc-url $RPC_URL --private-key $PRIVATE_KEY
cast send <BRAVEA> "enableTrading()" --rpc-url $RPC_URL --private-key $PRIVATE_KEY
```

Frontend run:

```bash
npm install
npm start
```

---

## 8) Sign-Off Checklist

Mark release-ready only if all are true:
- [ ] All deployed addresses are verified on Base Sepolia explorer
- [ ] Frontend config updated and committed
- [ ] Gate A-E checks passed in TESTING_CHECKLIST_BASE_SEPOLIA.md
- [ ] Tx hash evidence captured for each critical write flow
- [ ] Trading cutover completed and verified
- [ ] Post-launch first-cycle monitoring clean

---

## 9) Known Critical Clarifications (must not ignore)

1. BRAVEATreasuryFund duration comment vs constant mismatch (comment says 3 months, constant is 1 day in code).
2. PointSystem behavior is external dependency; ensure production behavior is confirmed before cutover.
3. Oracle address validity on Base Sepolia must be verified, not assumed.
