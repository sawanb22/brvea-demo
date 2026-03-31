import React, { useState, useEffect } from "react";
import { Hero } from "./Hero";
import style from "./Home.module.css";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import { useNavigate } from "react-router-dom";
// import { Carousel } from './Carousel';

import {
  // MNG_TOKEN,
  // MMFX_TOKEN_ADDRESS,
  // ORACLE_MNG,
  // MMUSD_TOKEN_ADDRESS,
  // MMOX_ADDRESS,
  POTION_DAO_STAKING_ADDRESS,
  WETHX_PTN_POOL_ADDRESS,
  PTN_TOKEN_ADDRESS,
  WETHX_PTN_MASTER_ORACLE_ADDRESS,
  WETHX_WETH_ORACLE_ADDRESS,
  POTION_DAO_CHEF_ADDRESS,
  POTION_DAO_ZAP_ADDRESS,
  WETHX_TOKEN_ADDRESS,
  EX_LINK,
  DEX_LINK,
  UNISWAP_ROUTER_ADDRESS,
  WETH_TOKEN_ADDRESS,
} from "../../Config/index";

import POTION_DAO_STAKING_ABI from "../../Config/POTION_DAO_STAKING_ABI.json";
import TOKEN_ABI from "../../Config/TOKEN_ABI.json";

import IUniswapv2Pair from "../../Config/IUniswapv2Pair.json";
import UniswapRouter from "../../Config/UniswapRouter.json";
import WETHX_PTN_POOL_ABI from "../../Config/WETHX_PTN_POOL_ABI.json";
import WETHX_PTN_MASTER_ORACLE_ABI from "../../Config/WETHX_PTN_MASTER_ORACLE_ABI.json";
import WETHX_WETH_ORACLE_ABI from "../../Config/WETHX_WETH_ORACLE_ABI.json";
import POTION_DAO_CHEF_ABI from "../../Config/POTION_DAO_CHEF_ABI.json";
import POTION_DAO_ZAP_ABI from "../../Config/POTION_DAO_ZAP_ABI.json";
import { useAccount, useBalance, useContractRead, useToken } from "wagmi";
import useCustomContractRead from "../../Hooks/useCustomContractRead";
import convertWeiToEther from "../../Utils/convertWeiToEther";
import convertEtherToWei from "../../Utils/convertEtherToWei";
import { formatNumber } from "../../common/FormateNum";

export const Home = () => {
  var settings = {
    dots: true,
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    speed: 1000,
    autoplay: false,
    autoplaySpeed: 3000,
    pauseOnHover: true,
  };

  const navigate = useNavigate();

  const [poolArray, setPoolArray] = useState([]);
  const WETH_USD_FALLBACK = 700;

  const toNumber = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const toEtherNumber = (value) => toNumber(convertWeiToEther(value));

  const toFixedSafe = (value, decimals = 2) =>
    toNumber(value).toFixed(decimals);

  const formatTimestampOrNA = (timestamp) => {
    const seconds = toNumber(timestamp);
    if (seconds <= 0) {
      return "NA";
    }

    const date = new Date(seconds * 1e3);
    return Number.isNaN(date.getTime()) ? "NA" : date.toLocaleString();
  };

  // Farm LP tokens
  const FARM_LP_TOKEN_ONE_ADDRESS = WETHX_PTN_POOL_ADDRESS;
  // Legacy value kept for rollback/reference: 0xb81394e16CcaAE916Ef96c04aC4322929826e28D
  const FARM_LP_TOKEN_TWO_ADDRESS = "0x7BE3D49d078f3258922e47Ad00f7c3EADa1Fb650";
  // Legacy value kept for rollback/reference: 0x7BE3D49d078f3258922e47Ad00f7c3EADa1Fb650

  // Buy links
  const BRAVEA_BUY_LINK = DEX_LINK;
  // Legacy value kept for rollback/reference:
  // https://pancakeswap.finance/swap?chain=bscTestnet&inputCurrency=0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd&outputCurrency=0xFCa3a16Bbc883b61Ccc21AaE5d3B6897f8694490
  const WETHX_BUY_LINK = `https://app.uniswap.org/swap?chain=base_sepolia&outputCurrency=${WETHX_TOKEN_ADDRESS}`;
  // Legacy value kept for rollback/reference:
  // https://pancakeswap.finance/swap?outputCurrency=0x72ef862a70C0191B11B6AaEEe673f3D4961A15fA&chain=bscTestnet

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

  const getLockerApr = () => {
    const rewardRate = toEtherNumber(_rewardData?.rewardRate);
    const rewardLockedRate = toEtherNumber(_rewardDataLocked?.rewardRate);
    const rewardDuration = toNumber(_rewardsDuration);
    if (rewardDuration <= 0 || potionPrice <= 0) {
      return 0;
    }

    const amountA = rewardRate * rewardDuration;
    const amountB = rewardLockedRate * rewardDuration;
    const valueA = amountA * potionPrice;
    const valueB = amountB * WETH_USD_FALLBACK;
    // const amoundD = lockedBalances ;
    const valueD = 100 * potionPrice;
    if (valueD <= 0) {
      return 0;
    }
    // console.log(_rateA);
    // console.log(_rateB);

    const days = rewardDuration / 86400;
    if (days <= 0) {
      return 0;
    }

    // const amount = 100 ;
    // console.log((valueA+valueB/valueD)*(365/(days*4))*100);
    const apr = (valueA + valueB / valueD) * (365 / (days * 4)) * 100;
    return Number.isFinite(apr) ? apr : 0;
  };

  const getApr = () => {
    const rewardRate = toEtherNumber(_rewardDataStake?.rewardRate);
    const rewardDuration = toNumber(_rewardsDuration);
    if (rewardDuration <= 0) {
      return 0;
    }

    const days = rewardDuration / 86400;
    if (days <= 0) {
      return 0;
    }

    const amount = 100;
    const apr =
      ((rewardRate * rewardDuration * WETH_USD_FALLBACK) / amount) *
      (365 / days) *
      100;

    return Number.isFinite(apr) ? apr : 0;
  };

  const addTokenInMetaMask = (tokenSymbol, tokenAddress, tokenIcon) => {
    window.ethereum
      .request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20",
          options: {
            address: tokenAddress,
            symbol: tokenSymbol,
            decimals: 18,
            image: tokenIcon,
          },
        },
      })
      .then((success) => {
        if (success) {
          console.log("FOO successfully added to wallet!");
        } else {
          throw new Error("Something went wrong.");
        }
      })
      .catch(console.error);
  };

  const { data: totalLockedValue } = useCustomContractRead({
    Adrress: POTION_DAO_STAKING_ADDRESS,
    Abi: POTION_DAO_STAKING_ABI,
    FuncName: "lockedSupply",
  });

  const { data: minatiTokenInfo } = useToken({
    address: PTN_TOKEN_ADDRESS,
  });
  const { data: alienxTokenInfo } = useToken({
    address: WETHX_TOKEN_ADDRESS,
  });

  const { data: potionPriceRate } = useCustomContractRead({
    Adrress: WETHX_PTN_MASTER_ORACLE_ADDRESS,
    Abi: WETHX_PTN_MASTER_ORACLE_ABI,
    FuncName: "getYTokenPrice",
    onSuccess: (data) => {},
  });

  const { data: AlienXPriceRate } = useCustomContractRead({
    Adrress: WETHX_PTN_MASTER_ORACLE_ADDRESS,
    Abi: WETHX_PTN_MASTER_ORACLE_ABI,
    FuncName: "getXTokenPrice",
    onSuccess: (data) => {},
  });

  const { data: WethXTWAPRate } = useCustomContractRead({
    Adrress: WETHX_PTN_MASTER_ORACLE_ADDRESS,
    Abi: WETHX_PTN_MASTER_ORACLE_ABI,
    FuncName: "getXTokenTWAP",
    onSuccess: (data) => {},
  });

  const { data: WethXLastUpdate } = useCustomContractRead({
    Adrress: WETHX_WETH_ORACLE_ADDRESS,
    Abi: WETHX_WETH_ORACLE_ABI,
    FuncName: "blockTimestampLast",
    onSuccess: (data) => {},
  });

  const { data: _lastRefreshCrTimestamp } = useCustomContractRead({
    Adrress: WETHX_PTN_POOL_ADDRESS,
    Abi: WETHX_PTN_POOL_ABI,
    FuncName: "lastRefreshCrTimestamp",
    onSuccess: (data) => {},
  });

  const [potionPrice, setPotionPrice] = useState(0);
  useEffect(() => {
    const derivedPotionPrice =
      toEtherNumber(potionPriceRate) * WETH_USD_FALLBACK;
    setPotionPrice(toNumber(derivedPotionPrice));
  }, [potionPriceRate]);

  useCustomContractRead({
    Adrress: POTION_DAO_CHEF_ADDRESS,
    Abi: POTION_DAO_CHEF_ABI,
    FuncName: "poolLength",
    onSuccess: (data) => {
      let arr = [];
      for (let i = 0; i < parseInt?.(data); i++) {
        arr.push(i);
      }
      console.log(data);
      setPoolArray(arr);
    },
  });

  const { data: poolInfo } = useContractRead({
    address: WETHX_PTN_POOL_ADDRESS,
    abi: WETHX_PTN_POOL_ABI,
    functionName: "info",
  });

  const { data: rewardPerSecond } = useCustomContractRead({
    Adrress: POTION_DAO_CHEF_ADDRESS,
    Abi: POTION_DAO_CHEF_ABI,
    FuncName: "rewardPerSecond",
    onSuccess: (data) => {},
  });
  //redirect
  const Stackhandler = () => {
    navigate("/Staking");
  };
  const Crosshandler = () => {
    navigate("/farm");
  };

  const { data: lpFarmBalanceTwo } = useBalance({
    addressOrName: POTION_DAO_CHEF_ADDRESS,
    token: FARM_LP_TOKEN_TWO_ADDRESS,
    watch: true,
  });
  const { data: lpFarmBalanceOne } = useBalance({
    addressOrName: POTION_DAO_CHEF_ADDRESS,
    token: FARM_LP_TOKEN_ONE_ADDRESS,
    watch: true,
  });

  const { data: _poolInfoOne } = useCustomContractRead({
    Adrress: POTION_DAO_CHEF_ADDRESS,
    Abi: POTION_DAO_CHEF_ABI,
    Args: [1],
    FuncName: "poolInfo",
    onSuccess: (data) => {},
  });
  const { data: _poolInfoTwo } = useCustomContractRead({
    Adrress: POTION_DAO_CHEF_ADDRESS,
    Abi: POTION_DAO_CHEF_ABI,
    Args: [0],
    FuncName: "poolInfo",
    onSuccess: (data) => {},
  });
  const { data: _totalAllocPOint } = useCustomContractRead({
    Adrress: POTION_DAO_CHEF_ADDRESS,
    Abi: POTION_DAO_CHEF_ABI,
    FuncName: "totalAllocPoint",
  });

  // const  = potionPrice;

  const { data: lpBalanceChef } = useBalance({
    addressOrName: FARM_LP_TOKEN_ONE_ADDRESS,
    token: WETH_TOKEN_ADDRESS,
    watch: true,
  });

  const { data: lpBalanceChef2 } = useBalance({
    addressOrName: FARM_LP_TOKEN_TWO_ADDRESS,
    token: WETH_TOKEN_ADDRESS,
    watch: true,
  });

  const [lpRateOne, setlpRateOne] = useState(0);
  const [lpRateTwo, setlpRatetwo] = useState(0);

  const { data: _lpRate1 } = useCustomContractRead({
    Adrress: FARM_LP_TOKEN_ONE_ADDRESS,
    Abi: TOKEN_ABI,
    FuncName: "totalSupply",
    isEnabled: WETH_USD_FALLBACK && lpBalanceChef ? true : false,
    onSuccess: (data) => {
      const lpRate =
        (WETH_USD_FALLBACK * toNumber(lpBalanceChef?.formatted) * 2) /
        toEtherNumber(data);
      console.log("lp price rate", lpRate);
      setlpRateOne(toNumber(lpRate));
      // setPotionPrice(_price);
    },
  });
  const { data: _lpRate2 } = useCustomContractRead({
    Adrress: FARM_LP_TOKEN_TWO_ADDRESS,
    Abi: TOKEN_ABI,
    FuncName: "totalSupply",
    isEnabled: WETH_USD_FALLBACK && lpBalanceChef2 ? true : false,
    onSuccess: (data) => {
      const lpRate =
        (WETH_USD_FALLBACK * toNumber(lpBalanceChef2?.formatted) * 2) /
        toEtherNumber(data);
      console.log("lp price rate", lpRate);
      setlpRatetwo(toNumber(lpRate));
      // setPotionPrice(_price);
    },
  });

  console.log("setlpRateOne", lpRateOne, lpRateTwo);

  const PoolPair1 = ({
    rewardPerSecond,
    lpRate,
    lpFarmBalance,
    _poolInfo,
    _totalAllocPOint,
  }) => {
    const getApr = () => {
      const rewardRate = toEtherNumber(rewardPerSecond);
      const allocPoint = toNumber(_poolInfo?.allocPoint);
      const totalAllocPoint = toNumber(_totalAllocPOint);
      const farmsRewardPerSecond =
        totalAllocPoint > 0 ? (allocPoint / totalAllocPoint) * rewardRate : 0;

      const annualFarmReward = farmsRewardPerSecond * 86400 * 365;
      const annualFarmRewardUSD = annualFarmReward * toNumber(potionPrice);
      const amount = toNumber(lpFarmBalance?.formatted);
      const totalValueLockedFarmUSD = amount * toNumber(lpRate);

      if (totalValueLockedFarmUSD <= 0) {
        return 0;
      }

      const apr = (annualFarmRewardUSD / totalValueLockedFarmUSD) * 100;
      return Number.isFinite(apr) ? apr : 0;
    };

    return <>{formatNumber(toFixedSafe(getApr(), 2))}%</>;
  };
  const PoolPair2 = ({
    rewardPerSecond,
    lpRate,
    lpFarmBalance,
    _poolInfo,
    _totalAllocPOint,
  }) => {
    const getApr = () => {
      const rewardRate = toEtherNumber(rewardPerSecond);
      const allocPoint = toNumber(_poolInfo?.allocPoint);
      const totalAllocPoint = toNumber(_totalAllocPOint);
      const farmsRewardPerSecond =
        totalAllocPoint > 0 ? (allocPoint / totalAllocPoint) * rewardRate : 0;

      const annualFarmReward = farmsRewardPerSecond * 86400 * 365;
      const annualFarmRewardUSD = annualFarmReward * toNumber(potionPrice);
      const amount = toNumber(lpFarmBalance?.formatted);
      const totalValueLockedFarmUSD = amount * toNumber(lpRate);

      if (totalValueLockedFarmUSD <= 0) {
        return 0;
      }

      const apr = (annualFarmRewardUSD / totalValueLockedFarmUSD) * 100;
      return Number.isFinite(apr) ? apr : 0;
    };
    return <>{formatNumber(toFixedSafe(getApr(), 2))}%</>;
  };

  const locked = toEtherNumber(totalLockedValue) * toNumber(potionPrice);
  const brvaMcap = toNumber(minatiTokenInfo?.totalSupply?.formatted) *
    toNumber(potionPrice);
  const lynexPrice =
    toEtherNumber(AlienXPriceRate) * WETH_USD_FALLBACK;
  const lynexMcap =
    toNumber(alienxTokenInfo?.totalSupply?.formatted) * toNumber(lynexPrice);
  const collateralRatio = toNumber(poolInfo?._collateralRatio) / 1e4;
  console.log("locked value", locked, potionPrice);

  return (
    <main>
      <Hero />
      <section
        className={
          style.section1 +
          " self_container d-flex flex-wrap flex-xl-nowrap gap-xl-2 gap-lg-5 gap-3 justify-content-xl-between justify-content-center mb-5"
        }
      >
        <div
          className={
            style.card1 + " d-flex flex-column justify-content-between"
          }
        >
          <div>
            <h3>$ {Math.floor(toNumber(locked))}</h3>
            <p>Total Locked</p>
          </div>
          <div className="d-flex gap-4">
            <Link to="/lock" className="btn-fill-light w-50 py-3 text-center">
              Lock now
            </Link>
            <button className="btn-light w-50 py-3">How it Works</button>
          </div>
        </div>

        {/* <Carousel/> */}
        <div className={style.card2}>
          <div className="d-flex align-items-center gap-3">
            <img src="/assets/demo.svg" alt="" />
            <div>
              <h3>BRAVEA</h3>
              <p className="mb-0">BRVA</p>
            </div>
          </div>
          <div className="slider-container">
            <Slider {...settings}>
              <div
                className={
                  style.slide_div +
                  " d-flex justify-content-between mt-sm-5 mt-4"
                }
              >
                <div>
                  <span>Stake APR</span>
                  <p className="mb-0">
                    {formatNumber(toFixedSafe(getApr(), 2))}%
                  </p>
                </div>
                <div>
                  <span>Lock APR</span>
                  <p className="mb-0">
                    {formatNumber(toFixedSafe(getLockerApr(), 2))}%
                  </p>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <Link
                    to="/stake"
                    className="btn-fill-dark py-3 px-3 px-xxl-4"
                  >
                    Stake
                  </Link>
                  <Link to="/lock" className="btn-fill-dark py-3 px-3 px-xxl-4">
                    Lock
                  </Link>
                </div>
              </div>
              <div
                className={
                  style.slide_div +
                  " d-flex justify-content-between mt-sm-5 mt-4"
                }
              >
                <div>
                  <span>M Cap</span>
                  <p className="mb-0">
                    $ {formatNumber(toFixedSafe(brvaMcap, 2))}
                  </p>
                </div>
                <div>
                  <span>Price</span>
                  <p className="mb-0">$ {toFixedSafe(potionPrice, 6)}</p>
                </div>
                <div className="d-flex align-items-center">
                  <Link
                    to={BRAVEA_BUY_LINK}
                    className="btn-fill-dark w-100 py-3 px-3 px-xxl-5"
                  >
                    Buy Now
                  </Link>
                  {/* <Link to="/lock" className='btn-fill-dark py-3 px-3 px-xxl-4'>Lock</Link> */}
                </div>
              </div>
            </Slider>
          </div>
          <div className="d-flex justify-content-between mt-4 gap-1">
            <div className="d-flex gap-1 flex-wrap align-items-center">
              <div className="d-flex align-items-center gap-1">
                <p className="mb-0">Collateral Ratio</p>
                <span style={{ fontSize: "14px" }}>
                  {toFixedSafe(collateralRatio, 2)}%{" "}
                </span>
              </div>
              <p className="mb-0">
                Last Update:{" "}
                {formatTimestampOrNA(_lastRefreshCrTimestamp)}
              </p>
            </div>
            <button
              onClick={() =>
                addTokenInMetaMask(
                  minatiTokenInfo?.symbol,
                  PTN_TOKEN_ADDRESS,
                  ""
                )
              }
              className="d-flex align-items-center"
            >
              <i className="bi bi-plus-lg"></i>
              <img src="/assets/metamask.svg" alt="" />
              <span className="opacity-50">Add</span>
            </button>
          </div>
        </div>
        <div className={style.card3}>
          <div className="d-flex align-items-center gap-3">
            <img src="/assets/demo.svg" alt="" />
            <div>
              <h3>LYNEX</h3>
              <p className="mb-0">LYNX</p>
            </div>
          </div>
          <div className="slider-container">
            <Slider {...settings}>
              <div
                className={
                  style.slide_div +
                  " d-flex justify-content-between mt-sm-5 mt-4 "
                }
              >
                <div className={style.brva}>
                  <p className="mb-0 mt-0">LYNEA / BRVA</p>
                  <div className="d-flex mt-1">
                    <img src="/assets/demo1.svg" alt="" />
                    <img src="/assets/demo.svg" alt="" />
                  </div>
                </div>
                <div style={{ marginTop: "-5px" }}>
                  <span style={{ marginTop: "-2px" }}>Lock APR</span>
                  <p className="mb-0" style={{ marginTop: "10px" }}>
                    <PoolPair1
                      lpFarmBalance={lpFarmBalanceOne}
                      _poolInfo={_poolInfoOne}
                      _totalAllocPOint={_totalAllocPOint}
                      lpRate={lpRateOne}
                      rewardPerSecond={rewardPerSecond}
                    />
                  </p>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <Link to="/mint" className="btn-fill-dark py-3 px-4">
                    Mint
                  </Link>
                </div>
              </div>
              <div
                className={
                  style.slide_div +
                  " d-flex justify-content-between mt-sm-5 mt-4 "
                }
              >
                <div>
                  <span>M Cap</span>
                  <p className="mb-0">
                    $ {formatNumber(toFixedSafe(lynexMcap, 2))}
                  </p>
                </div>
                <div>
                  <span>Price</span>
                  <p className="mb-0">$ {toFixedSafe(lynexPrice, 2)} </p>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <Link to={WETHX_BUY_LINK} target="_blank" className="btn-fill-dark btn1 text-decoration-none py-3 px-4 px-xxl-5 d-flex justify-content-center align-items-center">
                    Buy Now
                  </Link>
                </div>
              </div>
            </Slider>
          </div>
          <div className="d-flex justify-content-between mt-4 gap-1">
            <div className="d-flex flex-wrap gap-1 align-items-center">
              <div className="d-flex align-items-center gap-1">
                <p className="mb-0">60-MIN TWAP</p>
                <span style={{ fontSize: "14px" }}>
                  {" "}
                  {toFixedSafe(toEtherNumber(WethXTWAPRate), 2)}{" "}
                  LYNEA
                </span>
              </div>
              <p className="mb-0">
                {" "}
                Last Update:{" "}
                {formatTimestampOrNA(WethXLastUpdate)}
              </p>
            </div>
            <button onClick={() =>
                    addTokenInMetaMask(
                      alienxTokenInfo?.symbol,
                      WETHX_TOKEN_ADDRESS,
                      ''
                    )
                  } className="d-flex align-items-center">
              <i className="bi bi-plus-lg"></i>
              <img src="/assets/metamask.svg" alt="" />
              <span className="opacity-50">Add</span>
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};
