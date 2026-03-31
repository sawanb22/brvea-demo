import React, { useEffect, useState } from "react";

import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount, useBalance, useToken } from "wagmi";
import {
  POTION_DAO_CHEF_ADDRESS,
  POTION_DAO_ZAP_ADDRESS,
  PTN_TOKEN_ADDRESS,
  WETH_TOKEN_ADDRESS,
} from "../../Config";
import useCustomContractRead from "../../Hooks/useCustomContractRead";
import POTION_DAO_CHEF_ABI from "../../Config/POTION_DAO_CHEF_ABI.json";
import TOKEN_ABI from "../../Config/TOKEN_ABI.json";

import IUniswapv2Pair from "../../Config/IUniswapv2Pair.json";
import POTION_DAO_ZAP_ABI from "../../Config/POTION_DAO_ZAP_ABI.json";
// import IUniswapv2Pair from "../Config/IUniswapv2Pair.json";
import ApproveButton from "../../common/ApproveButton";
import useCustomContractWrite from "../../Hooks/useCustomContractWrite";
import convertEtherToWei from "../../Utils/convertEtherToWei";
import Loader from "../../Component/Common/Loader"
import convertWeiToEther from "../../Utils/convertWeiToEther";
import PropTypes from "prop-types";
// import zapBtn from "../../src/Components/Image/zapBtn.svg";
// import { styled } from "@mui/material/styles";
// import Dialog from "@mui/material/Dialog";
// import DialogTitle from "@mui/material/DialogTitle";
// import DialogContent from "@mui/material/DialogContent";
// import DialogActions from "@mui/material/DialogActions";
// import IconButton from "@mui/material/IconButton";
// import CloseIcon from "@mui/icons-material/Close";
// import { ZapModal } from "./Pages/Farms/ZapModal";
import useCheckAllowance from "../../Hooks/useCheckAllowance";

import { formatNumber } from "../../common/FormateNum";


import style from "./tool.module.css"
import { ZapModal } from './ZapModal'


export const Accordion = (props) => {
    const [open, setOpen] = useState(true)

    const handleClickOpen = () => {
        setOpen(true);
    };
    const handleClose = () => {
        console.log("close run")
        setOpen(false);
    };


    const { address, isConnected } = useAccount();
    const [isAproveERC20, setIsApprovedERC20] = useState(true);
    const [inputDepositValue, setInputDepositValue] = useState("");
    const [inputWithdrawValue, setInputWithdrawValue] = useState("");
    const [inputWithdrawFeeValue, setInputWithdrawFeeValue] = useState("");
  
    const { openConnectModal } = useConnectModal();
  
    const handleInputDepositChange = (event) => {
      const { value } = event.target;
      const isStack = /^[0-9]*(\.[0-9]{0,18})?$/.test(value);
      if (isStack) {
        setInputDepositValue(value);
      }
    };
  
    const setMax = (value) => {
      const isStack = /^[0-9]*(\.[0-9]{0,9})?$/.test(value);
      if (isStack) {
        setInputDepositValue(value);
      }
    };
  
    const handleInputWithdrawChange = (event) => {
      const { value } = event.target;
      const isStack = /^[0-9]*(\.[0-9]{0,18})?$/.test(value);
      if (isStack) {
        setInputWithdrawValue(value);
        handleFee(value)
      }
    };
    const { data: lpToken } = useCustomContractRead({
      Adrress: POTION_DAO_CHEF_ADDRESS,
      Abi: POTION_DAO_CHEF_ABI,
      FuncName: "lpToken",
      Args: [props?.poolIndex],
      onSuccess: (data) => {},
    });
    const { data: zapsDetail } = useCustomContractRead({
      Adrress: POTION_DAO_ZAP_ADDRESS,
      Abi: POTION_DAO_ZAP_ABI,
      FuncName: "zaps",
      Args: [props?.poolIndex],
      onSuccess: (data) => {},
    });
  
    const { data: token0Info } = useToken({
      address: zapsDetail?.token0,
      enabled: zapsDetail?.token0 !== undefined,
    });
    const { data: token1Info } = useToken({
      address: zapsDetail?.token,
      enabled: zapsDetail?.token !== undefined,
    });
  
    const { data: lpBalance } = useBalance({
      addressOrName: address,
      token: lpToken,
      watch: true,
      enabled: lpToken !== undefined && address !== undefined,
    });
    const handlePercentageClick = (percentage) => {
      
      if (lpBalance) {
        const balance = parseFloat(lpBalance?.formatted); // Assuming `mntBalance.formatted` is in a readable format
        setInputDepositValue((balance * (percentage / 100)).toFixed(18));
      }
    };
    console.log("InputDeposit", inputDepositValue);
    
  
    const { data: lpFarmBalance } = useBalance({
      addressOrName: POTION_DAO_CHEF_ADDRESS,
      token: lpToken,
      watch: true,
      enabled: lpToken !== undefined && POTION_DAO_CHEF_ADDRESS !== undefined,
    });
    // console.log(lpFarmBalance)
    const { data: checkAllowance } = useCheckAllowance({
      tokenAddress: lpToken,
      spenderAddress: POTION_DAO_CHEF_ADDRESS,
      isLpToken: true,
    });
  
    useEffect(() => {
      if (checkAllowance && address) {
        const price = parseFloat?.(
          inputDepositValue === "" ? "1" : inputDepositValue
        );
        const allowance = parseFloat?.(convertWeiToEther?.(checkAllowance));
        if (allowance >= price) {
          setIsApprovedERC20(true);
        } else {
          setIsApprovedERC20(false);
        }
      }
    }, [checkAllowance, address, inputDepositValue]);
  
    const {
      _useContractWrite: depositContractWrite,
      _useWaitForTransaction: depositWaitForTransaction,
    } = useCustomContractWrite({
      Adrress: POTION_DAO_CHEF_ADDRESS,
      Abi: POTION_DAO_CHEF_ABI,
      FuncName: "deposit",
      Args: [
        props?.poolIndex,
        convertEtherToWei(
          inputDepositValue == "" ? "0" : parseFloat(inputDepositValue).toFixed(9)
        ),
        address,
      ],
      isEnabled:
        convertEtherToWei(
          inputDepositValue == "" ? "0" : parseFloat(inputDepositValue).toFixed(9)
        ) > 0,
    });
  
    const { data: userInfo } = useCustomContractRead({
      Adrress: POTION_DAO_CHEF_ADDRESS,
      Abi: POTION_DAO_CHEF_ABI,
      FuncName: "userInfo",
      Args: [props?.poolIndex, address],
      isEnabled: address !== undefined,
      onSuccess: (data) => {
        console.log("user", props?.poolIndex);
        console.log("user", address);
        console.log("user", data);
      },
    });
  
    const handlePercentageClickWithdraw = (percentage) => {
      if (userInfo?.[0]) {
        const balance = parseFloat(convertWeiToEther(userInfo?.[0]?.toString()));
        const value = (balance * (percentage / 100)).toFixed(18)
        setInputWithdrawValue(value);
        handleFee(value);
      }
    };
  
    const { data: pendingReward } = useCustomContractRead({
      Adrress: POTION_DAO_CHEF_ADDRESS,
      Abi: POTION_DAO_CHEF_ABI,
      FuncName: "pendingReward",
      Args: [props?.poolIndex, address],
      onSuccess: (data) => {},
      isEnabled: address !== undefined,
    });
  
    const { data: rewardPerSecond } = useCustomContractRead({
      Adrress: POTION_DAO_CHEF_ADDRESS,
      Abi: POTION_DAO_CHEF_ABI,
      FuncName: "rewardPerSecond",
      onSuccess: (data) => {},
    });
  
    const { data: _totalAllocPOint } = useCustomContractRead({
      Adrress: POTION_DAO_CHEF_ADDRESS,
      Abi: POTION_DAO_CHEF_ABI,
      FuncName: "totalAllocPoint",
      onSuccess: (data) => {
        console.log("_totalAllocPOint", data._totalAllocPOint);
      },
    });
  
    const { data: _poolInfo } = useCustomContractRead({
      Adrress: POTION_DAO_CHEF_ADDRESS,
      Abi: POTION_DAO_CHEF_ABI,
      Args: [props?.poolIndex],
      FuncName: "poolInfo",
      onSuccess: (data) => {},
    });
  
    const handleFee = (value) => {
      const fee = parseFloat(_poolInfo?.[4]);
      console.log("FEEE", fee);
      
      if (fee && value) {
        const balance = parseFloat(value); // Assuming `mntBalance.formatted` is in a readable format
        console.log("balancefee", balance, fee);
        setInputWithdrawFeeValue((balance * fee) / 10000)?.toFixed(18);
      }
      else {
        console.log("balancefee", "bgtg", value);
        setInputWithdrawFeeValue(0)
      }
    };
  
    // useEffect(() => {
    //   return () => {
    //     handleFee();
    //   };
    // }, [_poolInfo, inputWithdrawValue]);
  
    const {
      _useContractWrite: harvestContractWrite,
      _useWaitForTransaction: harvestWaitForTransaction,
    } = useCustomContractWrite({
      Adrress: POTION_DAO_CHEF_ADDRESS,
      Abi: POTION_DAO_CHEF_ABI,
      FuncName: "harvest",
      Args: [props?.poolIndex, address],
      isEnabled:
        parseFloat?.(pendingReward).toFixed(2) > 0 && address !== undefined,
    });
  
    const {
      _useContractWrite: withdrawContractWrite,
      _useWaitForTransaction: withdrawWaitForTransaction,
    } = useCustomContractWrite({
      Adrress: POTION_DAO_CHEF_ADDRESS,
      Abi: POTION_DAO_CHEF_ABI,
      FuncName: "withdraw",
      Args: [
        props?.poolIndex,
        convertEtherToWei?.(inputWithdrawValue === "" ? "0" : inputWithdrawValue),
        address,
      ],
      isEnabled:
        parseFloat?.(userInfo?.[0]) >=
          parseFloat?.(inputWithdrawValue === "" ? "0" : inputWithdrawValue) &&
        address !== undefined,
    });
  
    const {
      _useContractWrite: emergencyWithdrawContractWrite,
      _useWaitForTransaction: emergencyWithdrawWaitForTransaction,
    } = useCustomContractWrite({
      Adrress: POTION_DAO_CHEF_ADDRESS,
      Abi: POTION_DAO_CHEF_ABI,
      FuncName: "emergencyWithdraw",
      Args: [props?.poolIndex, address],
      isEnabled:
        parseFloat?.(userInfo?.[0]).toFixed(2) > 0 && address !== undefined,
    });
  
    const [expanded, setExpanded] = React.useState(false);
  
    const handleChange = (panel) => (event, isExpanded) => {
      setExpanded(isExpanded ? panel : false);
    };
  
    const alienPrice = 700;
    const lpRat1 = 2300;
    const lpRate2 = 2300;
  
    const [potionPrice, setPotionPrice] = useState(0);
    const { data: getAmountOutFoMinati } = useCustomContractRead({
      Adrress: "0xb81394e16CcaAE916Ef96c04aC4322929826e28D",
      Abi: IUniswapv2Pair,
      FuncName: "getReserves",
      onSuccess: (data) => {
        console.log("rate", data);
        let _ptn = data?.reserve1 == 0 ? 1  : data.reserve1 ;
        let _weth = data.reserve0 == 0 ? 1 : data.reserve0 * alienPrice;
        let _price = parseFloat(_weth / _ptn).toFixed(10);
        setPotionPrice(_price);
      },
    });
    // const potionPrice = 0.0006358  ; // $ hard coded value
  
    const { data: lpBalanceChef } = useBalance({
      addressOrName: lpToken,
      token: PTN_TOKEN_ADDRESS,
      watch: true,
      enabled: lpToken !== undefined && address !== undefined,
    });
  
    const { data: lpBalanceChef2 } = useBalance({
      addressOrName: lpToken,
      token: WETH_TOKEN_ADDRESS,
      watch: true,
      enabled: lpToken !== undefined && address !== undefined,
    });
  
    // console.log("lpBalanceChef2", potionPrice, props?.poolIndex , lpBalanceChef2, lpBalanceChef, lpBalanceChef?.value.toString() == '0' ? true : false );
  
    const [lpPrice, setLpPrice] = useState(0);
  
    const { data: _lpRate2 } = useCustomContractRead({
      Adrress: lpToken,
      Abi: TOKEN_ABI,
      FuncName: "totalSupply",
      isEnabled: lpToken && potionPrice,
      onSuccess: (data) => {
        // console.log("lp price tokensupply", convertWeiToEther(data));
  
        if (lpBalanceChef?.value.toString() !== "0") {
          // console.log("lp price value", props?.poolIndex  , potionPrice * lpBalanceChef?.formatted * 2);
          // console.log("lp price",lpBalanceChef?.formatted);
          // console.log("hello---------------",lpToken, potionPrice,lpBalanceChef?.formatted * 2, data.toString());
          const lpRate2 =
            (potionPrice * lpBalanceChef?.formatted * 2) /
            convertWeiToEther(data);
          // console.log("lp price rate", lpRate2);
          setLpPrice(lpRate2);
          // setPotionPrice(_price);
        } else if (lpBalanceChef2?.value.toString() !== "0") {
          const lpRate2 =
            (alienPrice * lpBalanceChef2?.formatted * 2) /
            convertWeiToEther(data);
          // console.log("lp price rate", lpRate2);
          setLpPrice(lpRate2);
        }
      },
    });
    // console.log("lp price final",convertWeiToEther?.(_lpRate2));
  
    console.log("LpPrice", props?.poolIndex, lpPrice);
  
    const getApr = () => {
      // Convert and check rewardRate
      const rewardRate = rewardPerSecond ? convertWeiToEther(rewardPerSecond) : 0;
    
      // Calculate farmsRewardPerSecond, ensuring alloc points are valid
      const farmsRewardPerSecond = 
        (_poolInfo?.allocPoint && _totalAllocPOint) 
          ? (_poolInfo.allocPoint / _totalAllocPOint) * rewardRate 
          : 0;
    
      // console.log("farmsRewardPerSecond", props?.poolIndex, farmsRewardPerSecond);
    
      // Calculate annualFarmReward, ensuring farmsRewardPerSecond is valid
      const annualFarmReward = farmsRewardPerSecond * 86400 * 365;
      // console.log("annualFarmReward", annualFarmReward);
    
      // Calculate annualFarmRewardUSD, ensuring potionPrice is valid
      const annualFarmRewardUSD = potionPrice ? annualFarmReward * potionPrice : 0;
      // console.log("annualFarmRewardUSD", annualFarmRewardUSD);
    
      // Ensure lpFarmBalance and lpPrice are valid for TVL calculation
      const amount = lpFarmBalance?.formatted || 0;
      const totalValueLockedFarmUSD = amount * (lpPrice || 0);
      // console.log("totalValueLockedFarmUSD", props?.poolIndex, totalValueLockedFarmUSD);
    
      // Calculate APR, ensuring totalValueLockedFarmUSD is not zero
      const APR = totalValueLockedFarmUSD 
        ? parseFloat((annualFarmRewardUSD / totalValueLockedFarmUSD) * 100) 
        : 0;
    
      // console.log("APR", props?.poolIndex, APR);
    
      return APR;
    };
    
  
    console.log(props, "pro");
    const accordArr = ["One", "Two", "Three", "Four", "Five"];
  
    function convertSeconds(seconds) {
      const days = Math.floor(seconds / (24 * 3600)); // 24 hours * 3600 seconds in an hour
      seconds %= 24 * 3600;
      const hours = Math.floor(seconds / 3600); // 3600 seconds in an hour
      seconds %= 3600;
      const minutes = Math.floor(seconds / 60); // 60 seconds in a minute
      seconds %= 60; // remaining seconds
  
      // return `${days} days, ${hours} hours, ${minutes} minutes, and ${seconds} seconds`;
      return `${hours}:H${minutes}M:${seconds}S `;
    }
  
    const formatTimeLeft = (seconds) => {
      const days = Math.floor(seconds / (24 * 3600));
      seconds %= 24 * 3600;
      const hours = Math.floor(seconds / 3600);
      seconds %= 3600;
      const minutes = Math.floor(seconds / 60);
      const secs = seconds % 60;
  
      return `${days}d ${hours}h ${minutes}m ${secs}s`;
    };
  
    const currentTime = Math.floor(Date.now() / 1000); // current time in seconds
    const unlockTime = parseFloat(userInfo?.[2]?.toString()); // userInfo[2] is unlockTime
    const targetEpochTime = parseInt(unlockTime);
  
    const [timeLeft, setTimeLeft] = useState(0);
  
    useEffect(() => {
      // Set the initial time left
      setTimeLeft(targetEpochTime - currentTime);
  
      // Update the time left every second
      const timerInterval = setInterval(() => {
        setTimeLeft((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
      }, 1000);
  
      // Clean up the interval on component unmount
      return () => clearInterval(timerInterval);
    }, [targetEpochTime, currentTime]);
  
    console.log("Potionprice", potionPrice);
    

    return (
        <>
             <div className={style.accordian + " my-sm-4 my-3"} key={props.index}>
                        <div
                            className={
                                style.row1 + " accordion-button d-flex justify-content-between gap-3"
                            }
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target={`#collapse${accordArr[props.index]}`}
                            aria-expanded={`${props.index == 0 ? "true" : ""}`}
                            aria-controls={`collapse${accordArr[props.index]}`}
                        >
                            <div className="d-flex gap-sm-2 gap-1 align-items-center flex-grow-1">
                                <img src={`/assets/${accordArr[props.index]==0?"demo":"demo1"}.svg`} alt="img" />
                                <img src="/assets/demo1.svg" alt="img" />
                                {/* <div className={style.imgdiv + " d-flex gap-sm-2"}>
                            <div className="d-flex justify-content-center align-items-center">
                                <img src="/assets/demo.svg" alt="img" />
                            </div>
                            <div className="d-flex justify-content-center align-items-center">
                                <img src="/assets/demo.svg" width={"100%"} alt="img" />
                            </div>
                        </div> */}
                                <div className="bag-60 text-stretch">
                                    <div className="d-flex gap-2 align-items-center">
                                        <h1>{props.data.title}</h1>
                                        {/* <button className={style.zapbtn + " d-flex align-items-center"}
                                            onClick={handleClickOpen}
                                        >
                                            <img src="/assets/zap.svg" alt="" />
                                            <span className="ms-1">Zap</span>
                                        </button> */}
                                    </div>
                                    <p className='mb-0 opacity-50'>{parseFloat?.(rewardPerSecond) > 0 &&
                _totalAllocPOint &&
                _poolInfo
                  ? (
                      parseFloat?.(
                        convertWeiToEther?.(rewardPerSecond?.toString())
                      ) * 86400
                    ).toFixed(2) *
                    (_poolInfo?.allocPoint /
                      (_totalAllocPOint ? _totalAllocPOint : 1))
                  : 0}{" "}
                BRVEA per day</p>
                                </div>
                            </div>
                            <div className="d-flex gap-xxl-5 gap-xl-4 gap-2 align-items-center flex-grow-1 justify-content-between">
                                <div className='d-flex gap-xxl-5 gap-xl-4 gap-3 align-items-center'>
                                <div className="d-none d-lg-block text-center">
                                    <span>TVL</span>
                                    <p>                ${formatNumber(parseFloat?.(lpFarmBalance?.formatted * lpPrice).toFixed(2))}
                                    </p>
                                </div>
                                <div className="d-none d-lg-block text-center">
                                    <span>Deposited</span>
                                    <p>{userInfo?.[0]
                  ? formatNumber(parseFloat?.(
                      convertWeiToEther?.(userInfo?.[0]?.toString())
                    ).toFixed(3))
                  : "0.0"}</p>
                                </div>
                                <div className="d-none d-lg-block text-center">
                                    <span>Earn</span>
                                    <p>{parseFloat?.(rewardPerSecond) > 0 &&
                _totalAllocPOint &&
                _poolInfo
                  ? formatNumber((
                      parseFloat?.(
                        convertWeiToEther?.(rewardPerSecond?.toString())
                      ) *
                      86400 *
                      (_poolInfo?.allocPoint /
                        (_totalAllocPOint ? _totalAllocPOint : 1)) *
                      potionPrice
                    ).toFixed(2))
                  : 0}{" "} per day</p>
                                </div>
                                <div className="d-none d-lg-block text-center">
                                    <span>APR</span>
                                    <p>{formatNumber(parseFloat(getApr()).toFixed(2))}%</p>
                                </div>
                                <div className="d-none d-lg-block text-center">
                                    <span>Duration</span>
                                    <p>{convertSeconds(parseInt(_poolInfo?.lockingPeriod))}</p>

                                </div>
                                </div>
                                <button className="d-flex justify-content-center align-items-center">
                                    <img src="/assets/down-right-arrow.svg" alt="" />
                                </button>
                            </div>
                        </div>
                        <div
                            id={`collapse${accordArr[props.index]}`}
                            className={`accordion-collapse collapse ${props.index == 0 ? "show" : ""}`}
                            data-bs-parent="#accordionExample"
                        >
                            {/* state code for tab and mini devices */}
                            <div
                                className={
                                    style.minidisplay +
                                    " d-flex flex-wrap  flex-md-nowrap gap-3  d-lg-none  my-4 justify-content-md-between justify-content-center"
                                }
                            >
                                <div className="text-center">
                                    <span>TVL</span>
                                    <p>  $
                {formatNumber(parseFloat?.(
                  lpFarmBalance?.formatted *
                    (props?.poolIndex === 0 ? lpRat1 * 2 : lpPrice)
                ).toFixed(2))}</p>
                                </div>
                                <div className="text-center">
                                    <span>Deposited</span>
                                    <p>
                {userInfo?.[0]
                  ? formatNumber(parseFloat?.(
                      convertWeiToEther?.(userInfo?.[0]?.toString())
                    ).toFixed(3))
                  : "0.0"}
              </p>
                                </div>
                                <div className="text-center">
                                    <span>Earn</span>
                                    <p className="text-nowrap">  $
                {parseFloat?.(rewardPerSecond) > 0 &&
                _totalAllocPOint &&
                _poolInfo
                  ? formatNumber((
                      parseFloat?.(
                        convertWeiToEther?.(rewardPerSecond?.toString())
                      ) *
                      86400 *
                      (_poolInfo?.allocPoint /
                        (_totalAllocPOint ? _totalAllocPOint : 1)) *
                      potionPrice
                    ).toFixed(9))
                  : 0}{" "}
                per day</p>
                                </div>
                                <div className="text-center">
                                    <span>APR</span>
                                    <p>{formatNumber(parseFloat(getApr()).toFixed(2))}%</p>
                                </div>
                                <div className="text-center">
                                    <span>Duration</span>
                                    <p className="text-nowrap">  {convertSeconds(parseInt(_poolInfo?.lockingPeriod))}</p>
                                </div>
                            </div>
                            {/* end code for tab and mini devices */}

                            <div
                                className={
                                    style.box_container +
                                    " mt-4 accordion-body flex-wrap flex-xl-nowrap d-flex gap-2 justify-content-between"
                                }
                            >
                                <div>
                                    <div className="d-flex justify-content-between w-100">
                                        <p >Deposit</p>
                                        <p>
                                            <span className="me-2">Balance</span>
                                            {lpBalance?.formatted
                    ? parseFloat?.(lpBalance?.formatted).toFixed(2)
                    : "0.00"}{" "}
                                            <span> BRVA</span>
                                        </p>
                                    </div>
                                    <div className="d-flex flex-column justify-content-between">
                                    <input
                  type="number"
                  className="text-field"
                  placeholder="0.00"
                  value={parseFloat?.(inputDepositValue)}
                  onChange={handleInputDepositChange}
                />
                                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                                            <div className="d-flex align-items-center gap-1">
                                                <button
                                                    className="bg-white"
                                                onClick={() => handlePercentageClick(10)}
                                                >
                                                    10%
                                                </button>
                                                <button
                                                    className="bg-white"
                                                onClick={() => handlePercentageClick(25)}
                                                >
                                                    25%
                                                </button>
                                                <button
                                                    className="bg-white"
                                                onClick={() => handlePercentageClick(50)}
                                                >
                                                    50%
                                                </button>
                                                <button
                                                    className="bg-white"
                                                onClick={() => handlePercentageClick(75)}
                                                >
                                                    75%
                                                </button>
                                            </div>
                                            <div>
                                                {" "}
                                                <button
                                                    className={`btn1 ${style.max_btn}`}
                                                onClick={() => handlePercentageClick(100)}
                                                >
                                                    Max
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="d-flex justify-content-between gap-3">
                                        <div className={`${style.info_div} position-relative d-flex justify-content-center align-items-center tooltip-parent`}>
                                            <img src="/assets/info.svg" alt="" />
                                            <p className="info-tooltip position-absolute fw-normal">
                                                tooltip
                                            </p>
                                        </div>
                                    

                                        {isConnected && address ? (
                  !isAproveERC20 ? (
                    <div className="flex-grow-1">
                      <ApproveButton
                        tokenAddress={lpToken}
                        spenderAddress={POTION_DAO_CHEF_ADDRESS}
                        setIsApprovedERC20={setIsApprovedERC20}
                        isLpToken={true}
                        color={"white"}
                      />
                    </div>
                  ) : parseFloat?.(
                      inputDepositValue == "" ? "0" : inputDepositValue
                    ).toFixed(18) > parseFloat?.(lpBalance?.formatted) ? (
                    <button className='btn-fill-dark py-3 w-100'>
                      Insufficient Fund
                    </button>
                  ) : (
                    <button
                      disabled={
                        parseFloat?.(inputDepositValue) > 0 &&
                        !depositContractWrite?.isLoading &&
                        !depositWaitForTransaction?.isLoading
                          ? false
                          : true
                      }
                      onClick={async () => {
                        try {
                          // console.log(parseFloat(inputDepositValue).toFixed(2) > 0)
                          // console.log("amount",convertEtherToWei?.(inputDepositValue === "" ? "0" : parseFloat(inputDepositValue).toFixed(2)));
                          // console.log("amount",parseInt(convertEtherToWei?.(inputDepositValue === "" ? "0" : parseFloat(inputDepositValue).toFixed(2))));
                          await depositContractWrite?.writeAsync();
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
                      }}
                      className='btn-fill-dark py-3 w-100'
                    >
                      {(depositWaitForTransaction?.isLoading ||
                        depositContractWrite?.isLoading) && (
                        <Loader color="#423A2A" />
                      )}
                      Deposit
                    </button>
                  )
                ) : (
                  <button
                   className='btn-fill-dark py-3 w-100'
                    onClick={openConnectModal}
                  >
                    Connect Wallet
                  </button>
                )}




                                    </div>
                                </div>
                                <div>
                                    <div
                                        className={`${style.accord_withdraw_box} d-flex justify-content-between flex-wrap`}
                                    >
                                        <p className="mb-0">Withdraw</p>
                                        <div className="d-flex gap-2 align-items-start p-0 ">
                                            <div className="d-flex align-items-end gap-1">
                                                {/* <div className={`${style.coin_circle}`}> */}
                                                    <img src="/assets/demo.svg" alt="Coin Icon" 
                                                    style={{
                                                        width:"15px",
                                                        height:"15px",
                                                        borderRadius:"50px"
                                                        }} />
                                                {/* </div> */}
                                                <p className="mb-0">
                                                {userInfo?.[0]
                        ? parseFloat?.(
                            convertWeiToEther?.(userInfo?.[0]?.toString())
                          ).toFixed(5)
                        : "0.0"}
                                                    <span className="ps-1" style={{ fontSize: "11.2px" }}>
                                                    {props.data?.title} Lp
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="d-flex flex-column justify-content-between">
                                    <input
                  type="number"
                  className="text-field"
                  placeholder="0.00"
                  value={parseFloat?.(inputWithdrawValue)}
                  onChange={handleInputWithdrawChange}
                />
                                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                                            <div className="d-flex align-items-center gap-1">
                                                <button
                                                    className="bg-white"
                                                onClick={() => handlePercentageClickWithdraw(10)}
                                                >
                                                    10%
                                                </button>
                                                <button
                                                    className="bg-white"
                                                onClick={() => handlePercentageClickWithdraw(25)}
                                                >
                                                    25%
                                                </button>
                                                <button
                                                    className="bg-white"
                                                onClick={() => handlePercentageClickWithdraw(50)}
                                                >
                                                    50%
                                                </button>
                                                <button
                                                    className="bg-white"
                                                onClick={() => handlePercentageClickWithdraw(75)}
                                                >
                                                    75%
                                                </button>
                                            </div>
                                            <div>
                                                {" "}
                                                <button
                                                    className={`btn1 ${style.max_btn}`}
                                                onClick={() => handlePercentageClickWithdraw(100)}
                                                >
                                                    Max
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    {/* <button className='btn1 py-3 w-100'> Connect Wallet</button> */}
                                    <div className="d-flex justify-content-between gap-3">
                                        <div
                                            className={`${style.info_div} position-relative d-flex justify-content-center align-items-center tooltip-parent`}
                                        >
                                            <img src="/assets/info.svg" alt="" />
                                            <p className="info-tooltip position-absolute fw-normal">
                                                tooltip
                                            </p>
                                        </div>
                                        {/* <button className='btn-fill-dark py-3 w-100'>Withdraw</button> */}

                                        {isConnected && address ? (
                  parseFloat(inputWithdrawValue) >
                  parseFloat(convertWeiToEther(userInfo?.[0]?.toString())) ? (
                    <button className='btn-fill-dark py-3 w-100'>
                      Insufficient Fund
                    </button>
                  ) : currentTime >= unlockTime ? (
                    // If current time is greater than unlockTime, show the regular withdraw button
                    <>
                      <button
                        disabled={
                          parseFloat(inputWithdrawValue) > 0 &&
                          !withdrawContractWrite?.isLoading &&
                          !withdrawWaitForTransaction?.isLoading
                            ? false
                            : true
                        }
                        onClick={async () => {
                          try {
                            await withdrawContractWrite?.writeAsync();
                          } catch (error) {
                            console.error(error);
                          }
                        }}
                        className='btn-fill-dark py-3 w-100'
                      >
                        {(withdrawContractWrite?.isLoading ||
                          withdrawWaitForTransaction?.isLoading) && (
                          <>
                            <Loader color={"#423A2A"} />
                          </>
                        )}
                        Withdraw
                      </button>
                    </>
                  ) : (
                    // If current time is less than unlockTime, show the "Withdraw With Penalty" button
                    <>
                      <h8 className='btn-fill-dark py-3 w-100'>
                        {" "}
                        UnlockTime: {formatTimeLeft(timeLeft)}{" "}
                      </h8>
                      <button
                        disabled={
                          parseFloat(userInfo?.[0]) > 0 &&
                          !withdrawContractWrite?.isLoading &&
                          !withdrawWaitForTransaction?.isLoading
                            ? false
                            : true
                        }
                        onClick={async () => {
                          try {
                            await withdrawContractWrite?.writeAsync();
                          } catch (error) {
                            console.error(error);
                          }
                        }}
                        className='btn-fill-dark py-3 w-100'
                      >
                        {(withdrawContractWrite?.isLoading ||
                          withdrawWaitForTransaction?.isLoading) && (
                          <>
                            <Loader color={"#CCB483"} />
                          </>
                        )}
                        Withdraw With Penalty Fee
                        {/* : ( */}
                        {parseFloat?.(inputWithdrawFeeValue)?.toFixed(6)} Lp
                      </button>
                    </>
                  )
                ) : (
                  <button
                    onClick={openConnectModal}
                    className='btn-fill-dark py-3 w-100'
                    style={{ width: "78%" }}
                  >
                    Connect Wallet
                  </button>
                )}
                                    





                                    </div>
                                    {/* <Box width={20} /> */}
                                </div>
                                <div>
                                    <div className="d-flex justify-content-between">
                                        <p>Reward</p>
                                    </div>
                                    <div className="d-flex justify-content-between" style={{padding:".75rem 0.9rem"}}>
                                        <div className="d-flex justify-content-center gap-3 align-items-center">
                                            <div>
                                                <div className={`${style.bg_circle_lgold} d-flex align-items-center`}>
                                                    <img src="/assets/demo.svg" alt="" />
                                                </div>
                                            </div>
                                            <p className="mb-0"
                                            style={{
                                                fontSize:"20px",
                                                fontWeight:"500",
                                                lineHeight:"normal"
                                            }}
                                            >
                                                {pendingReward
                      ? parseFloat?.(
                          convertWeiToEther?.(pendingReward?.toString())
                        ).toFixed(2)
                      : 0}{" "}
                                                <span> BRVA</span>
                                            </p>
                                        </div>

                                    </div>
                                    <div className="d-flex justify-content-between mt-3">
                                        <a
                                        href={`https://pancakeswap.finance/v2/add/${token1Info?.address}/${token0Info?.address}`}
                                            target="_blank"
                                            style={{
                                                color: "var(--dark)",
                                                fontWeight: "500",
                                            }}
                                        >
                                            {" "}
                                            Add LP
                                        </a>
                                        <a
                                           href={`https://pancakeswap.finance/v2/remove/${token1Info?.address}/${token0Info?.address}`}
                                            target="_blank"
                                            style={{
                                                color: "var(--dark)",
                                                fontWeight: "500",
                                            }}
                                        >
                                            Remove LP
                                        </a>
                                    </div>
                                    <div className="mt-2 d-flex justify-content-between gap-3">
                                        <div
                                            className={`${style.info_div} position-relative d-flex justify-content-center align-items-center tooltip-parent`}
                                        >
                                            <img src="/assets/info.svg" alt="" />
                                            <p className="info-tooltip position-absolute fw-normal">
                                                tooltip
                                            </p>
                                        </div>
                                    
                                    {/* <button className='btn-fill-dark py-3 w-100'>Connect Wallet</button> */}
                                  

                                    {isConnected && address ? (
                  <button
                    disabled={
                      parseFloat?.(pendingReward) > 0 &&
                      !harvestContractWrite?.isLoading &&
                      !harvestWaitForTransaction?.isLoading
                        ? false
                        : true
                    }
                    onClick={async () => {
                      try {
                        await harvestContractWrite?.writeAsync();
                      } catch (error) {}
                    }}
                    sx={{
                      gap: "10px !important",
                      "&.Mui-disabled": {
                        cursor: "not-allowed !important",
                        pointerEvents: "auto !important",
                      },
                    }}
                    className='btn-fill-dark py-3 w-100'
                  >
                    {(harvestContractWrite?.isLoading ||
                      harvestWaitForTransaction?.isLoading) && (
                      <Loader color={"black"} />
                    )}
                    Claim
                  </button>
                ) : (
                  <button
                    className='btn-fill-dark py-3 w-100'
                    onClick={openConnectModal}
                  >
                    Connect Wallet
                  </button>
                )}


                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>


            {/* {open ? (
                <ZapModal
                poolIndex={props?.poolIndex}
                token0Info={token0Info}
                token1Info={token1Info}
                lpToken={lpToken}
                handleClose={handleClose}
                index={props.index}
                getApr={getApr()}
                perDay={(
                  parseFloat?.(convertWeiToEther?.(rewardPerSecond?.toString())) *
                  86400 *
                  (props?.poolIndex === 0 ? potionPrice : alienPrice)
                ).toFixed(5)}
                />
            ) : null} */}
        </>
    )
}
