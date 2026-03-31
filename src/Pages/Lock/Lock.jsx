import React, { useEffect, useState } from "react";

import ApproveButton from "../../common/ApproveButton";
import {
    WETHX_TOKEN_ADDRESS,
    WETH_TOKEN_ADDRESS,
    POTION_DAO_STAKING_ADDRESS,
    PTN_TOKEN_ADDRESS,
    UNISWAP_ROUTER_ADDRESS,
  } from "../../Config/index";
  import POTION_DAO_STAKING_ABI from "../../Config/POTION_DAO_STAKING_ABI.json";
  import Pancake from "../../Config/UniswapRouter.json";
  import IUniswapv2Pair from "../../Config/IUniswapv2Pair.json";
  
  // import MMFX_TOKEN from "../../../Config/MMFX_TOKEN.json";
  // import { MMFX_TOKEN_ADDRESS } from "../../../Config";
  
  import { useAccount, useBalance, useContractRead } from "wagmi";
  import { useConnectModal } from "@rainbow-me/rainbowkit";
//   import Button from "@mui/material/Button";
//   import { Box, TextField } from "@mui/material";
  import useCustomContractRead from "../../Hooks/useCustomContractRead";
  import Symbol from "../../Component/Common/Symbol";
  import convertWeiToEther from "../../Utils/convertWeiToEther";
  import useCustomContractWrite from "../../Hooks/useCustomContractWrite";
  import convertEtherToWei from "../../Utils/convertEtherToWei";
  import Loader from "../../Component/Common/Loader";
  
//   import { makeStyles } from "@mui/styles";
  import useCheckAllowance from "../../Hooks/useCheckAllowance";
  





import style from "./lock.module.css"
import { Link } from 'react-router-dom'

export const Lock = () => {

    const [open, setOpen] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [inputValueWithdraw, setInputValueWithdraw] = useState("");
  
  
    const [isAproveERC20, setIsApprovedERC20] = useState(true);
    const [inputValuelock, setInputValuelock] = useState("");
    const [isLock, setIsLock] = useState(true);
    const stackhandleInputChange = (event) => {
      const { value } = event.target;
      const isStack = /^[0-9]*(\.[0-9]{0,18})?$/.test(value);
      if (isStack) {
        setInputValue(value);
      }
    };
    const stackhandleInputChangeWithdraw = (event) => {
      const { value } = event.target;
      const isStack = /^[0-9]*(\.[0-9]{0,18})?$/.test(value);
      if (isStack) {
        setInputValueWithdraw(value);
      }
    };
  
    const setMax = (value) => {
      const isStack = /^[0-9]*(\.[0-9]{0,2})?$/.test(value);
      if (isStack) {
        setInputValue(value);
      }
    };
  
    const setMaxLock = (value) => {
      const isStack = /^[0-9]*(\.[0-9]{0,2})?$/.test(value);
      if (isStack) {
        setInputValuelock(value);
      }
    };
  
    const handleClickOpen = () => {
      setOpen(true);
    };
    const handleClose = () => {
      setOpen(false);
    };
    const { address, isConnected } = useAccount();
    const [lockDuration, setlockDuration] = useState(0);
    const [totalClaimableRewards, setTotalClaimableRewards] = useState("0");
    const [totalClaimableRewardsBNB, setTotalClaimableRewardsBNB] = useState("0");
    const [totalEarlyClaimableRewards, setTotalEarlyClaimableRewards] =
      useState("0");
    const [earlyPenalty, setearlyPenalty] = useState("0");
  
    console.log(
      "totalClaimableRewards",
      totalClaimableRewards,
      totalEarlyClaimableRewards
    );
  
    const [potionPrice, setPotionPrice] = useState(0);
    const { data: getAmountOutFoMinati } = useCustomContractRead({
      Adrress: "0xb81394e16CcaAE916Ef96c04aC4322929826e28D",
      Abi: IUniswapv2Pair,
      FuncName: "getReserves",
      onSuccess: (data) => {
        console.log("rate", data);
        let _ptn = data.reserve1;
        let _weth = data.reserve0 * 700;
        let _price = parseFloat(_weth / _ptn).toFixed(9);
        setPotionPrice(_price);
      },
    });
  
    const { openConnectModal } = useConnectModal();
    const { data: mntBalance } = useBalance({
      addressOrName: address,
      token: PTN_TOKEN_ADDRESS,
    });
    const { data: stakeLockDuration } = useCustomContractRead({
      Adrress: POTION_DAO_STAKING_ADDRESS,
      Abi: POTION_DAO_STAKING_ABI,
      FuncName: "lockDuration",
    });
  
    const lockhandleInputChange = (event) => {
      const { value } = event.target;
      const isLock = /^[0-9]*(\.[0-9]{0,2})?$/.test(value);
  
      if (isLock) {
        setInputValuelock(value);
      }
    };
  
    const {
      _useContractWrite: lockContractWrite,
      _useWaitForTransaction: lockWaitForTransaction,
    } = useCustomContractWrite({
      Adrress: POTION_DAO_STAKING_ADDRESS,
      Abi: POTION_DAO_STAKING_ABI,
      FuncName: "stake",
      Args: [
        convertEtherToWei?.(inputValuelock === "" ? "0" : inputValuelock),
        true,
      ],
      isEnabled:
        parseFloat?.(inputValuelock === "" ? "0" : inputValuelock) > 0 &&
        parseFloat?.(inputValuelock) <= parseFloat?.(mntBalance?.formatted) &&
        isAproveERC20,
    });
  
    useCustomContractRead({
      Adrress: POTION_DAO_STAKING_ADDRESS,
      Abi: POTION_DAO_STAKING_ABI,
      FuncName: "claimableRewards",
      Args: [address],
      isEnabled: address !== undefined,
      onSuccess: (data) => {
        let total1 = convertWeiToEther?.(data?.[0]?.amount);
        let total2 = convertWeiToEther?.(data?.[1]?.amount);
  
        setTotalClaimableRewards?.(total1);
        setTotalClaimableRewardsBNB?.(total2);
      },
    });
    // console.log("hihih",totalClaimableRewards?.toString(), totalClaimableRewardsBNB?.toString());
    const {
      _useContractWrite: stakeContractWrite,
      _useWaitForTransaction: stakeWaitForTransaction,
    } = useCustomContractWrite({
      Adrress: POTION_DAO_STAKING_ADDRESS,
      Abi: POTION_DAO_STAKING_ABI,
      FuncName: "stake",
      Args: [convertEtherToWei?.(inputValue === "" ? "0" : inputValue), true],
      isEnabled:
        parseFloat?.(inputValue === "" ? "0" : inputValue) > 0 &&
        parseFloat?.(inputValue ?? 0) <= parseFloat?.(mntBalance?.formatted) &&
        isAproveERC20,
    });
  
    const { data: _rewardData } = useCustomContractRead({
      Adrress: POTION_DAO_STAKING_ADDRESS,
      Abi: POTION_DAO_STAKING_ABI,
      Args: [PTN_TOKEN_ADDRESS],
      FuncName: "rewardData",
      // onSuccess:(data)=>{
      //   console.log(data?.toString());
      // }
    });
  
    const { data: _rewardDataStake } = useCustomContractRead({
      Adrress: POTION_DAO_STAKING_ADDRESS,
      Abi: POTION_DAO_STAKING_ABI,
      Args: [WETH_TOKEN_ADDRESS],
      FuncName: "rewardData",
      // onSuccess:(data)=>{
      //   console.log(data?.toString());
      // }
    });
  
    const { data: _rewardDataLocked } = useCustomContractRead({
      Adrress: POTION_DAO_STAKING_ADDRESS,
      Abi: POTION_DAO_STAKING_ABI,
      Args: [WETHX_TOKEN_ADDRESS],
      FuncName: "rewardData",
      // onSuccess:(data)=>{
      //   console.log(data?.toString());
      // }
    });
  
    const { data: _rewardsDuration } = useCustomContractRead({
      Adrress: POTION_DAO_STAKING_ADDRESS,
      Abi: POTION_DAO_STAKING_ABI,
      FuncName: "rewardsDuration",
      // onSuccess:(data)=>{
      //   console.log(data?.toString());
      // }
    });
  
    const { data: totalLockedSupply } = useCustomContractRead({
      Adrress: POTION_DAO_STAKING_ADDRESS,
      Abi: POTION_DAO_STAKING_ABI,
      FuncName: "lockedSupply",
      // onSuccess:(data)=>{
      //   console.log(data?.toString());
      // }
    });
  
    const { data: totalStakedSupply } = useCustomContractRead({
      Adrress: POTION_DAO_STAKING_ADDRESS,
      Abi: POTION_DAO_STAKING_ABI,
      FuncName: "totalSupply",
      // onSuccess:(data)=>{
      //   console.log(data?.toString());
      // }
    });
  
    const { data: lockedBalances } = useCustomContractRead({
      Adrress: POTION_DAO_STAKING_ADDRESS,
      Abi: POTION_DAO_STAKING_ABI,
      FuncName: "lockedBalances",
      Args: [address],
      isEnabled: address !== undefined,
      // onSuccess:(data)=>{
      //   console.log(data?.total?.toString());
      // }
    });
  
    const { data: lockedSupply } = useCustomContractRead({
      Adrress: POTION_DAO_STAKING_ADDRESS,
      Abi: POTION_DAO_STAKING_ABI,
      FuncName: "lockedSupply",
      isEnabled: address !== undefined,
      // onSuccess:(data)=>{
      //   console.log(data?.total?.toString());
      // }
    });
  
    const { data: unlockedBalance } = useCustomContractRead({
      Adrress: POTION_DAO_STAKING_ADDRESS,
      Abi: POTION_DAO_STAKING_ABI,
      FuncName: "unlockedBalance",
      Args: [address],
      isEnabled: address !== undefined,
      // onSuccess:(data)=>{
      //   console.log(data?.total?.toString());
      // }
    });
  
    const { data: earnedBalances } = useCustomContractRead({
      Adrress: POTION_DAO_STAKING_ADDRESS,
      Abi: POTION_DAO_STAKING_ABI,
      FuncName: "earnedBalances",
      Args: [address],
      isEnabled: address !== undefined,
      onSuccess: (data) => {
        // setTotalEarlyClaimableRewards(
        //   parseFloat?.(totalClaimableRewards) +
        //     parseFloat?.(convertWeiToEther?.(data?.total?.toString()))
        // );
      },
    });
  
    const { data: _withdrawablebalance } = useCustomContractRead({
      Adrress: POTION_DAO_STAKING_ADDRESS,
      Abi: POTION_DAO_STAKING_ABI,
      FuncName: "withdrawableBalance",
      Args: [address],
      isEnabled: address !== undefined,
      onSuccess: (data) => {
        setTotalEarlyClaimableRewards(
          convertWeiToEther?.(data?.amount?.toString())
        );
        setearlyPenalty(convertWeiToEther?.(data?.penaltyAmount?.toString()));
      },
    });
    console.log("_withdrawablebalance", _withdrawablebalance);
  
    const {
      _useContractWrite: getRewardContract,
      _useWaitForTransaction: getRewardWaitForTransaction,
    } = useCustomContractWrite({
      Adrress: POTION_DAO_STAKING_ADDRESS,
      Abi: POTION_DAO_STAKING_ABI,
      FuncName: "getReward",
      isEnabled: address !== undefined && parseFloat?.(totalClaimableRewards) > 0,
    });
  
    const {
      _useContractWrite: withdrawExpiredLocksContract,
      _useWaitForTransaction: withdrawExpiredLocksWaitForTransaction,
    } = useCustomContractWrite({
      Adrress: POTION_DAO_STAKING_ADDRESS,
      Abi: POTION_DAO_STAKING_ABI,
      FuncName: "withdrawExpiredLocks",
      isEnabled:
        address !== undefined && parseFloat?.(lockedBalances?.unlockable) > 0,
    });
  
    const {
      _useContractWrite: emergencyWithdrawContract,
      _useWaitForTransaction: emergencyWithdrawWaitForTransaction,
    } = useCustomContractWrite({
      Adrress: POTION_DAO_STAKING_ADDRESS,
      Abi: POTION_DAO_STAKING_ABI,
      FuncName: "emergencyWithdraw",
      isEnabled:
        address !== undefined && parseFloat?.(totalEarlyClaimableRewards) > 0,
    });
  
    const getApr = () => {
      const rewardRate = convertWeiToEther(_rewardDataStake?.rewardRate);
      const rewardDuration = _rewardsDuration || 0;
      const days = rewardDuration / 86400;
      const amount = 100;
  
      const rewardInUsd = rewardRate * alienPrice;
      return ((rewardInUsd * rewardDuration) / amount) * (365 / days) * 100;
    };
  
    // const BNB="0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd"
    // const BUSD="0xeD24FC36d5Ee211Ea25A80239Fb8C4Cfd80f12Ee"
  
    // const _rateA = 1;
    // const _rateB = 1;
    const minatiPrice = 0.0006358; // $ hard coded value
    const alienPrice = 700;
    useEffect(() => {
      getLockerApr();
    }, []);
    // const { data: _rateB } = useCustomContractRead({
    //   Adrress: UNISWAP_ROUTER_ADDRESS,
    //   Abi: Pancake,
    //   FuncName: "getAmountOut",
    //   isEnabled: true,
    //   Args: [("1000000000000000000")?.toString(),[WETH_TOKEN_ADDRESS, BNB]]
  
    // })
  
    // const { data: _rateA } = useCustomContractRead({
    //   Adrress: UNISWAP_ROUTER_ADDRESS,
    //   Abi: Pancake,
    //   FuncName: "getAmountOut",
    //   isEnabled: true,
    //   Args: [("1000000000000000000")?.toString(),[PTN_TOKEN_ADDRESS, BNB]]
  
    // })
  
    // console.log(_rateA);
  
    // const { data: _rateUsd } = useCustomContractRead({
    //   Adrress: UNISWAP_ROUTER_ADDRESS,
    //   Abi: Pancake,
    //   FuncName: "getAmountOut",
    //   Args: [("1000000000000000000")?.toString(),[BNB, BUSD]]
  
    // })
  
    const { data: checkAllowance } = useCheckAllowance({
      tokenAddress: PTN_TOKEN_ADDRESS,
      spenderAddress: POTION_DAO_STAKING_ADDRESS,
      isLpToken: false,
    });
  
    useEffect(() => {
      if (checkAllowance && address) {
        const price = parseFloat?.(inputValue === "" ? "1" : inputValue);
        const allowance = parseFloat?.(convertWeiToEther?.(checkAllowance));
        // console.log(allowance >= price);
        if (allowance >= price) {
          setIsApprovedERC20(true);
        } else {
          setIsApprovedERC20(false);
        }
      }
    }, [checkAllowance, address, inputValue]);
  
    // const getLockerApr = () => {
    //   const rewardRate = _rewardDataStake?.rewardRate;
    //   const rewardLockedRate = _rewardDataLocked?.rewardRate;
    //   const rewardDuration = _rewardsDuration || 0;
    //   const amountA = rewardRate * 365 * 86400;
    //   const amountB = rewardLockedRate * 365 * 86400;
    //   // const valueA = amountA*minatiPrice ;
    //   // const valueB = amountB*alienPrice ;
    //   // const amoundD = lockedBalances ;
    //   // const valueD = 100*minatiPrice ;
    //   // console.log(_rateA);
    //   // console.log(_rateB);
  
    //   const total = amountA + amountB;
  
    //   return (total / lockedSupply) * 100;
    // };
  
    const getLockerApr = () => {
      const rewardRate = convertWeiToEther(_rewardData?.rewardRate);
      const rewardLockedRate = convertWeiToEther(_rewardDataLocked?.rewardRate);
      const rewardDuration = _rewardsDuration || 0;
      const amountA = rewardRate * rewardDuration;
      const amountB = rewardLockedRate * rewardDuration;
      const valueA = amountA * potionPrice;
      const valueB = amountB * alienPrice;
      const valueD = 100 * potionPrice;
  
      const days = rewardDuration / 86400;
      return (valueA + valueB / valueD) * (365 / (days * 4)) * 100;
    };
  
    const handlePercentageClick = (percentage) => {
      if (mntBalance) {
        const balance = parseFloat(mntBalance?.formatted); // Assuming `mntBalance.formatted` is in a readable format
        setInputValue((balance * (percentage / 100)).toFixed(2));
      }
    };
  
    const handlePercentageClickWithdraw = (percentage) => {
      if (lockedBalances?.unlockable) {
        const balance = parseFloat(
          convertWeiToEther(lockedBalances?.unlockable.toString())
        );
        setInputValueWithdraw((balance * (percentage / 100)).toFixed(2));
      }
    };
  




    return (
        <main className={style.stake_parent + " d-flex justify-content-center"}>
            <div className={style.stake}>
                <div className='d-flex justify-content-between align-items-center'>
                    <h1>Lock</h1>
                    <div className='tooltip-parent position-relative d-flex align-items-center gap-2'>
                        <img src="/assets/info.svg" alt="" />
                        <span>info</span>
                        <p className='info-tooltip position-absolute'>tooltip</p>
                    </div>
                </div>
                <div className={style.top + " mt-4 d-flex justify-content-between align-items-center"}>
                    <div>
                        <p className='opacity-50'>Total Locked</p>
                        <div className='d-flex justify-content-between align-items-center gap-2'>
                            <img src="/assets/demo.svg" alt="" />
                            <p className='mb-0'>{parseFloat?.(
                            convertWeiToEther?.(
                              lockedBalances?.total?.toString()
                            )
                          ).toFixed(2)}</p>
                        </div>
                    </div>
                    <Link to="/lock-withdraw" className='btn-fill-dark py-3 px-4'>Withdraw</Link>
                </div>
                {/* <div className={style.arrow + " d-flex justify-content-center align-items-center"}>
            <img src="/assets/down-arrow.svg" alt="" />
        </div> */}
                <div className={style.inputdiv + " mt-3"}>
                    <div className='d-flex'>
                    <input
                          type="number"
                          placeholder="0.00"
                          className="flex-grow-1"
                          value={inputValue}
                          onChange={stackhandleInputChange}
                        />
                        <div className='d-flex align-items-center gap-2'>
                            <img src="/assets/demo.svg" alt="" />
                            <p className='mb-0'>BRVEA</p>
                        </div>
                    </div>
                    <div className='mt-2 d-flex align-items-center justify-content-between'>
                        <button onClick={() => handlePercentageClick(100)} >Max</button>
                        {/* <p className='mb-0' style={{fontWeight:"500"}}><span className='opacity-50'>Balance</span> 37,363</p> */}
                    </div>
                </div>
                {/* <div className={style.slippage + ' d-flex my-3 px-3 justify-content-between align-items-center'}>
            <p className='mb-0 opacity-50'>Slippage</p>
            <div className='d-flex gap-2'>
                <button>10%</button>
                <button>25%</button>
                <button>50%</button>
                <button>100%</button>
            </div>
        </div> */}
                <div className={style.bottom + " my-3"}>
                    <div className='d-flex justify-content-between '>
                        <p className='opacity-50'>Balance</p>
                        <p>{parseFloat?.(mntBalance?.formatted)
                            ? parseFloat?.(mntBalance?.formatted).toFixed(2)
                            : "0.0"} <span className='opacity-50'></span></p>
                        
                    </div>
                    <hr />
                    <div className='d-flex justify-content-between '>
                        <p className='opacity-50'>APR</p>
                        <p >
                        {parseFloat(_rewardDataLocked ? getLockerApr() : 0).toFixed(2)}%
                          %{/* <span className="text-uppercase">BNB</span> */}
                        </p>
                    </div>
                </div>
           
                {isConnected && address ? (
                        <>
                          {!isAproveERC20 ? (
                            <ApproveButton
                              tokenAddress={PTN_TOKEN_ADDRESS}
                              spenderAddress={POTION_DAO_STAKING_ADDRESS}
                              setIsApprovedERC20={setIsApprovedERC20}
                              color="white"
                            />
                          ) : parseFloat?.(inputValue) >=
                          parseFloat?.(mntBalance?.formatted) ? (
                            <button className='btn-fill-dark py-3 w-100 mt-4'>
                              Insufficient Fund
                            </button>
                          ) : (
                            <button
                              disabled={
                                parseFloat?.(inputValue) > 0 &&
                                !stakeWaitForTransaction?.isLoading &&
                                !stakeContractWrite?.isLoading
                                  ? false
                                  : true
                              }
                              onClick={async () => {
                                try {
                                  await stakeContractWrite?.writeAsync();
                                } catch (error) {
                                  console.log(error);
                                }
                              }}
                              sx={{
                                gap: "10px !important",
                                "&.Mui-disabled": {
                                  cursor: "not-allowed !important",
                                  pointerEvents: "auto !important",
                                },
                                backgroundColor: "var(--main-color)",
                                fontSize: "14px",
                                fontFamily: "var(--font-pop)",
                                fontWeight: "700",
                                color: "var(--light)",
                                borderRadius: "12px",
                              }}
                              className='btn-fill-dark py-3 w-100 mt-4'
                            >
                              {(stakeWaitForTransaction?.isLoading ||
                                stakeContractWrite?.isLoading) && (
                                <Loader color="#423A2A" />
                              )}
                              Lock Now
                            </button>
                          )}
                        </>
                      ) : (
                        <button
                          onClick={openConnectModal}
                          className='btn-fill-dark py-3 w-100 mt-4'>
                          Connect wallet
                        </button>
                      )}



            </div>
        </main>
    )
}
