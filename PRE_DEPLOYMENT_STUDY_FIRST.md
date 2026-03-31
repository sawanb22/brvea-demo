# Pre-Deployment Study First (Bravea Integration)

This document is your **study path before deployment**.  
Goal: understand how this app + contracts work so deployment to Base is safe.

---

## 1) What this repository is (and is not)

This repository contains:
- Frontend React app
- ABI files (contract interfaces)
- Network + contract address config
- Contract read/write wiring in hooks/pages

This repository does **not** contain:
- Solidity source contracts (`.sol`)
- Hardhat/Foundry contract deployment project

So this repo is for **interaction/integration**, not contract deployment.

---

## 2) Mental model (how the app talks to blockchain)

- `src/Config/index.js`
  - Active chain/network constants and contract addresses.
- `src/Config/*.json`
  - ABIs used for encoding function calls.
- `src/Hooks/useCustomContractRead.js`
  - Wrapper over `wagmi` read calls.
- `src/Hooks/useCustomContractWrite.js`
  - Wrapper over `wagmi` prepare/write/wait transaction flow.
- Pages (`src/Pages/*`)
  - Business flows (mint, redeem, stake, farm, dashboard).

Think of it as:

`UI action -> hook -> ABI + address -> contract function`

---

## 3) Contracts in this integration (plain role map)

- **PTN token** (`TOKEN_ABI.json`)  
  ERC20 project token used in staking/farming and economics.

- **WETH token** (external wrapped native token)  
  Collateral/route token for pool and pricing.

- **WETHX token**  
  Paired token side used by mint/redeem protocol.

- **WETHX_PTN_POOL** (`WETHX_PTN_POOL_ABI.json`)  
  Main pool for mint/redeem, collateral ratio, fees, user accounting.

- **POTION_DAO_STAKING** (`POTION_DAO_STAKING_ABI.json`)  
  Staking + lock logic, rewards, withdraw/claim functions.

- **POTION_DAO_CHEF** (`POTION_DAO_CHEF_ABI.json`)  
  Farm (MasterChef-style) pools, pending rewards, harvest.

- **POTION_DAO_ZAP** (`POTION_DAO_ZAP_ABI.json`)  
  Zap helper for one-click LP/farm operations (partially used/commented in places).

- **Master Oracle + Pair Oracles**  
  Price feeds/TWAP for pool math and dashboard stats.

- **Treasury + Treasury Fund**  
  Protocol fund/treasury handling.

---

## 4) Page-by-page on-chain study checklist

## A) Mint page (`src/Pages/Mint/Mint.jsx`)
Study these first:
- Reads: `calcMint`, `info`, `xToken`, `userInfo`
- Writes: `mint`, `collect`
Understand:
- input amount → quote path
- fee/collateral assumptions from pool `info`
- post-mint collection flow

## B) Redeem page (`src/Pages/Redeem/Redeem.jsx`)
Study:
- Reads: `calcRedeem`, `info`, `xToken`, `yToken`, `userInfo`, oracle `getYTokenPrice`
- Writes: `redeem`, `collect`
Understand:
- quote vs actual redeem output
- dependency on oracle price

## C) Stake / Lock / Withdraw pages
Files:
- `src/Pages/Stake/Stake.jsx`
- `src/Pages/Lock/Lock.jsx`
- `src/Pages/Stake-Withdraw/Stake_withdraw.jsx`
- `src/Pages/Lock-Withdraw/Lock_withdraw.jsx`

Study staking methods:
- Reads: `lockDuration`, `claimableRewards`, `rewardData`, `rewardsDuration`, `lockedSupply`, `totalSupply`, `lockedBalances`, `unlockedBalance`, `earnedBalances`, `withdrawableBalance`
- Writes: `stake`, `withdraw`, `getReward`, `withdrawExpiredLocks`, `emergencyWithdraw`

Understand:
- locked vs unlocked balance lifecycle
- reward accrual and claim path
- emergency path risks

## D) Tools/Farm pages
Files:
- `src/Pages/Tools/Tool.jsx`
- `src/Pages/Tools/Accordion.jsx`

Study:
- Chef reads: `poolLength`, `poolInfo`, `pendingReward`
- Chef writes: `harvestAllRewards`, pool interactions (deposit/withdraw flows in accordion)
- Zap reads from `zaps` map (zap path)

## E) Home/Dashboard pages (analytics layer)
Files:
- `src/Pages/Home/Home.jsx`
- `src/Pages/Dashboard/Dashboard.jsx`
- `src/Hooks/useAPR.js`

Study:
- What values are true on-chain reads vs calculated approximations
- Oracle and LP reserve dependencies
- APR assumptions (`3 sec/block` logic etc.)

---

## 5) Critical pre-deployment understanding you must lock in

Before deploying anything on Base, you must be able to answer:

1. Which contract depends on which previous contract address?
2. Which constructor args are required for each contract?
3. Which roles must be granted after deployment (owner/minter/reward distributor)?
4. Which frontend methods will break if one address is wrong?
5. Which values are chain-specific (router, WETH, explorer links, chain ID)?

If you cannot answer these 5, do not deploy yet.

---

## 6) What to collect from smart-contract repo (mandatory)

From the contract repo/branch, collect:
- Contract source files (`.sol` or other EVM source language)
- Deployment scripts
- Constructor argument docs
- Role setup steps
- Verify scripts (optional but recommended)

Without this, deployment cannot be executed.

---

## 7) Fast study order (recommended)

1. `src/Config/index.js` (network + addresses)
2. `useCustomContractRead.js` and `useCustomContractWrite.js` (call mechanics)
3. Mint and Redeem pages (core economics)
4. Staking pages (state machine + reward lifecycle)
5. Chef/Tools pages (farm mechanics)
6. Home/Dashboard + `useAPR.js` (derived metrics)

---

## 8) Deployment readiness definition

You are deployment-ready when:
- You can map each button click to a contract function.
- You know contract dependency order.
- You have source + scripts from contract repo.
- You have Base testnet values (RPC, chain ID, router, WETH, test ETH).
- You have a post-deploy validation checklist for mint/redeem/stake/harvest.

Only then proceed to actual deployment.
