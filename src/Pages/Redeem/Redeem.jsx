import React, { useEffect, useState } from "react";
import { useAccount, useToken, useBalance, useContractRead } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";

import WETHX_PTN_POOL_ABI from "../../Config/WETHX_PTN_POOL_ABI.json";
import WETHX_PTN_MASTER_ORACLE_ABI from "../../Config/WETHX_PTN_MASTER_ORACLE_ABI.json";
import {
  WETHX_PTN_POOL_ADDRESS,
  WETH_TOKEN_ADDRESS,
  WETHX_PTN_MASTER_ORACLE_ADDRESS,
} from "../../Config";
import useCustomContractWrite from "../../Hooks/useCustomContractWrite";
import useCustomContractRead from "../../Hooks/useCustomContractRead";
import convertWeiToEther from "../../Utils/convertWeiToEther";
import ApproveButton from "../../common/ApproveButton";
import Loader from "../../Component/Common/Loader";
import convertEtherToWei from "../../Utils/convertEtherToWei";
import useCheckAllowance from "../../Hooks/useCheckAllowance";
import $ from "jquery"

import style from "./redeem.module.css"

export const Redeem = () => {
 
  const { address, isConnected } = useAccount();
  const [isAproveERC20, setIsApprovedERC20] = useState(true);
  const { openConnectModal } = useConnectModal();
  const [alienInputValue, setAlienInputValue] = useState("");
  const [alienXInputValue, setAlienXInputValue] = useState("");
  const [minatiInputValue, setMinatiInputValue] = useState("");
  const [SlippageInPercent, setSlippageInPercent] = useState(0.5);

  const { data: calcRedeem } = useCustomContractRead({
    Adrress: WETHX_PTN_POOL_ADDRESS,
    Abi: WETHX_PTN_POOL_ABI,
    FuncName: "calcRedeem",
    Args: [
      convertEtherToWei?.(alienXInputValue === "" ? "0" : alienXInputValue),
    ],
    isEnabled: alienXInputValue,
    onSuccess: (data) => {
      console.log(data);
      console.log(convertWeiToEther?.(data?._yTokenOutSpot?.toString()));
      setAlienInputValue(
        parseFloat?.(convertWeiToEther?.(data?._ethOut?.toString())).toFixed(4)
      );
      setMinatiInputValue(
        parseFloat?.(
          convertWeiToEther?.(data?._yTokenOutSpot?.toString())
        ).toFixed(4)
      );
    },
  });
  const stackhandleAlienXInputChange = (event, redeemingFee) => {
    const { value } = event.target;
    const isStack = /^[0-9]*(\.[0-9]{0,9})?$/.test(value);
    if (isStack) {
      setAlienXInputValue(value);
      const valueAfterFeeCut =
        value !== ""
          ? (
            parseFloat?.(value) -
            parseFloat?.(value) * (redeemingFee / 100)
          ).toFixed(0)
          : "0.0";
      setAlienInputValue(valueAfterFeeCut);
    }
  };

  const setMax = (value, redeemingFee) => {
    const isStack = /^[0-9]*(\.[0-9]{0,18})?$/.test(value);
    if (isStack) {
      setAlienXInputValue(value);
      const valueAfterFeeCut =
        value !== ""
          ? (
            parseFloat?.(value) -
            parseFloat?.(value) * (redeemingFee / 100)
          ).toFixed(7)
          : "0.0";
      setAlienInputValue(valueAfterFeeCut);
    }
  };
  const { data: poolInfo } = useCustomContractRead({
    Adrress: WETHX_PTN_POOL_ADDRESS,
    Abi: WETHX_PTN_POOL_ABI,
    FuncName: "info",
    onSuccess: (data) => { },
  });
  const { data: xTokenAddress } = useCustomContractRead({
    Adrress: WETHX_PTN_POOL_ADDRESS,
    Abi: WETHX_PTN_POOL_ABI,
    FuncName: "xToken",
    onSuccess: (data) => { },
  });

  const { data: yTokenAddress } = useCustomContractRead({
    Adrress: WETHX_PTN_POOL_ADDRESS,
    Abi: WETHX_PTN_POOL_ABI,
    FuncName: "yToken",
    onSuccess: (data) => { },
  });

  const { data: alienXInfo } = useToken({
    address: xTokenAddress,
    enabled: xTokenAddress !== undefined,
  });

  const { data: alienYInfo } = useToken({
    address: yTokenAddress,
    enabled: yTokenAddress !== undefined,
  });

  const { data: alienBalance } = useBalance({
    addressOrName: address,
    token: WETH_TOKEN_ADDRESS,
    watch: true,
    enabled: address !== undefined,
  });

  const { data: alienXBalance } = useBalance({
    addressOrName: address,
    token: xTokenAddress,
    watch: true,
    enabled: address !== undefined,
  });
  const { data: minatiBalance } = useBalance({
    addressOrName: address,
    token: yTokenAddress,
    watch: true,
    enabled: address !== undefined,
  });

  const { data: checkAllowance } = useCheckAllowance({
    tokenAddress: alienXInfo?.address,
    spenderAddress: WETHX_PTN_POOL_ADDRESS,
    isLpToken: false,
  });

  useEffect(() => {
    if (checkAllowance && address) {
      const price = parseFloat?.(
        alienXInputValue === "" ? "1" : alienXInputValue
      );
      const allowance = parseFloat?.(convertWeiToEther?.(checkAllowance));
      // console.log(allowance >= price);
      if (allowance >= price) {
        setIsApprovedERC20(true);
      } else {
        setIsApprovedERC20(false);
      }
    }
  }, [checkAllowance, address, alienXInputValue]);

  const {
    _useContractWrite: redeemContractWrite,
    _useWaitForTransaction: redeemWaitForTransaction,
  } = useCustomContractWrite({
    Adrress: WETHX_PTN_POOL_ADDRESS,
    Abi: WETHX_PTN_POOL_ABI,
    FuncName: "redeem",
    Args: [
      convertEtherToWei?.(alienXInputValue === "" ? "0" : alienXInputValue),
      convertEtherToWei?.(
        minatiInputValue !== ""
          ? (
            parseFloat?.(minatiInputValue) -
            parseFloat?.(minatiInputValue) * (SlippageInPercent / 100)
          ).toString()
          : "0.0"
      ),
      convertEtherToWei?.(
        alienInputValue !== ""
          ? (
            parseFloat?.(alienInputValue) -
            parseFloat?.(alienInputValue) * (SlippageInPercent / 100)
          ).toString()
          : "0.0"
      ),
    ],
    isEnabled:
      parseFloat?.(alienXInputValue === "" ? "0" : alienXInputValue) > 0 &&
      parseFloat?.(alienXInputValue === "" ? "0" : alienXInputValue) <=
      parseFloat?.(alienXBalance?.formatted) &&
      address !== undefined &&
      !poolInfo?._redemptionPaused &&
      isAproveERC20,
  });

  const { data: userInfo } = useCustomContractRead({
    Adrress: WETHX_PTN_POOL_ADDRESS,
    Abi: WETHX_PTN_POOL_ABI,
    FuncName: "userInfo",
    Args: [address],
    isEnabled: address !== undefined,
    onSuccess: (data) => { },
  });

  const {
    _useContractWrite: collectContractWrite,
    _useWaitForTransaction: collectWaitForTransaction,
  } = useCustomContractWrite({
    Adrress: WETHX_PTN_POOL_ADDRESS,
    Abi: WETHX_PTN_POOL_ABI,
    FuncName: "collect",
    isEnabled:
      parseFloat?.(userInfo?.yTokenBalance) > 0 && address !== undefined,
  });

  const { data: minatiPriceRate } = useCustomContractRead({
    Adrress: WETHX_PTN_MASTER_ORACLE_ADDRESS,
    Abi: WETHX_PTN_MASTER_ORACLE_ABI,
    FuncName: "getYTokenPrice",
    onSuccess: (data) => { },
  });

  const [balance, setBalance] = useState(null);

  //============= code for costomize selectbox of modal start ===================
  let flage = true;
  useEffect(() => {
    if (flage) {
      $('select').each(function () {
        var $this = $(this), numberOfOptions = $(this).children('option').length;

        $this.addClass('select-hidden');
        $this.wrap('<div class="select"></div>');
        $this.after('<div class="select-styled"></div>');

        var $styledSelect = $this.next('div.select-styled');
        $styledSelect.text($this.children('option').eq(0).text());

        var $list = $('<ul />', {
          'class': 'select-options'
        }).insertAfter($styledSelect);

        for (var i = 0; i < numberOfOptions; i++) {
          $('<li />', {
            text: $this.children('option').eq(i).text(),
            rel: $this.children('option').eq(i).val()
          }).appendTo($list);
          if ($this.children('option').eq(i).is(':selected')) {
            $('li[rel="' + $this.children('option').eq(i).val() + '"]').addClass('is-selected')
          }
        }

        var $listItems = $list.children('li');

        $styledSelect.click(function (e) {
          e.stopPropagation();
          $('div.select-styled.active').not(this).each(function () {
            $(this).removeClass('active').next('ul.select-options').hide();
          });
          $(this).toggleClass('active').next('ul.select-options').toggle();
        });

        $listItems.click(function (e) {
          e.stopPropagation();
          $styledSelect.text($(this).text()).removeClass('active');
          $this.val($(this).attr('rel'));
          $list.find('li.is-selected').removeClass('is-selected');
          $list.find('li[rel="' + $(this).attr('rel') + '"]').addClass('is-selected');
          $list.hide();
          //console.log($this.val());
        });

        $(document).click(function () {
          $styledSelect.removeClass('active');
          $list.hide();
        });

      });
      flage = false
    }
  }, [])

    return (
        <main className={style.reedem_parent + " d-flex justify-content-center"}>
            <div className={style.redeem}>
                <div className='d-flex justify-content-between align-items-center'>
                    <h1>Redeem</h1>
                    <div className='tooltip-parent position-relative d-flex align-items-center gap-2'>
                        <img src="/assets/info.svg" alt="" />
                        <span>info</span>
                        <p className='info-tooltip position-absolute'>tooltip</p>
                    </div>
                </div>
                <div className={style.inputdiv + " mt-4"}>
                    <div className='d-flex'>
                    <input className={` ${style.outline_none} w-100 border-0  bg-transparent fs-3 w-fit-content`} type="number" placeholder="0.00" value={alienXInputValue}
                  onChange={(e) =>
                    stackhandleAlienXInputChange(
                      e,
                      parseFloat?.(poolInfo?._redemptionFee) / 10e3
                    )
                  }
                />
                        <div className='d-flex align-items-center gap-2'>
                            <img src="/assets/lynex.svg" alt="" />
                            <p className='mb-0'>LYNEX</p>
                        </div>
                    </div>
                    <div className='mt-2 d-flex align-items-center justify-content-between'>
                        <button onClick={() =>
                  setMax(
                    alienXBalance?.formatted
                      ? parseFloat?.(alienXBalance?.formatted).toFixed(5)
                      : "0.0",
                    parseFloat?.(poolInfo?._redemptionFee) / 10e3
                  )
                }>Max</button>
                        <p className='mb-0' style={{fontWeight:"500"}}><span className='opacity-50'>Balance</span> {alienXBalance?.formatted
                  ? parseFloat?.(alienXBalance?.formatted).toFixed(4)
                  : "0.0"}</p>
                    </div>
                </div>
                <div className={style.arrow + " d-flex justify-content-center align-items-center"}>
                    <img src="/assets/down-arrow.svg" alt="" />
                </div>
                <div className={style.inputdiv}>
                    <div className='d-flex'>
                    <input className={` ${style.outline_none} w-100 border-0  bg-transparent fs-3 w-fit-content`} type="number"
                  placeholder="0.00"
                  value={alienInputValue === 0 ? "0.0" : alienInputValue}
                />
                        <div className='d-flex align-items-center gap-2'>
                            <img src="/assets/lynex.svg" alt="" />
                            <p className='mb-0'>LYNEA</p>
                        </div>
                    </div>
                    {/* <div className='mt-3 d-flex align-items-center justify-content-between'>
                    <button>Max</button>
                    <p className='mb-0'><span className='opacity-50'>Balance</span> 37,363</p>
                </div> */}
                </div>
                <div className={style.add+" d-flex justify-content-center align-items-center"}>
                    {/* <i class="bi bi-plus"></i> */}
                    <img src="/assets/add.svg" alt="" />
                </div>
                <div className={style.inputdiv}>
                    <div className='d-flex'>
                    <input className={` ${style.outline_none} w-100 border-0  bg-transparent fs-3 w-fit-content`} type="number"
                  placeholder="0.00"
                  value={minatiInputValue === 0 ? "0.0" : minatiInputValue}
                />
                        <div className='d-flex align-items-center gap-2'>
                            <img src="/assets/demo.svg" alt="" />
                            <p className='mb-0'>BRVEA</p>
                        </div>
                    </div>
                    {/* <div className='mt-3 d-flex align-items-center justify-content-between'>
                    <button>Max</button>
                    <p className='mb-0'><span className='opacity-50'>Balance</span> 37,363</p>
                </div> */}
                </div>
                <div className={style.slippage + ' d-flex my-3 px-sm-3 justify-content-between align-items-center'}>
                    <p className='mb-0 opacity-50'>Slippage</p>
                    <div className='d-flex gap-sm-2 gap-1'>
                    <button 
                  onClick={() => {
                    setSlippageInPercent(0.5);
                  }}
                >0.5%</button>
                <button 
                  onClick={() => {
                    setSlippageInPercent(1);
                  }}
                >1%</button>
                <button 
                  onClick={() => {
                    setSlippageInPercent(2);
                  }}
                >2%</button>
                        <button>100%</button>
                    </div>
                </div>
                <div className={style.bottom + " my-3"}>
                    <div className='d-flex justify-content-between '>
                        <p className='opacity-50'>Redeem Fee</p>
                        <span> {parseInt?.(poolInfo?._redemptionFee) > 0
                  ? parseInt?.(poolInfo?._redemptionFee) / 10e3
                  : 0}
                % </span>
                    </div>
                    <hr />
                    <div className='d-flex justify-content-between '>
                        <p className='opacity-50'>Pool Balance </p>
                        <p>{parseFloat?.(
                convertWeiToEther?.(
                  poolInfo?._collateralBalance?.toString()
                )
              )}{" "} <span className='opacity-50'>WETH</span></p>
                    </div>
                    <hr />
                    <div className='d-flex justify-content-between '>
                        <p className='opacity-50'>Minimum Received </p>
                        <p>{alienXInputValue === ""
                ? "0.0"
                : parseFloat?.(
                  parseFloat?.(alienInputValue) -
                  parseFloat?.(alienInputValue) *
                  (SlippageInPercent / 100)
                ).toFixed(4)} <span className='opacity-50'>WETH</span></p>
                    </div>
                </div>
                {/* <button className='btn-fill-dark py-3 w-100 mt-4'>Redeem Now</button> */}
                {address && isConnected ? (
            !isAproveERC20 ? (
              <div>
                <ApproveButton
                  tokenAddress={alienXInfo?.address}
                  spenderAddress={WETHX_PTN_POOL_ADDRESS}
                  setIsApprovedERC20={setIsApprovedERC20}
                  color={"white"}
                  isLpToken={false}
                  userInput={alienXInputValue === "" ? "0" : alienXInputValue}
                />
              </div>
            ) : parseFloat?.(alienXInputValue) >
              parseFloat?.(alienXBalance?.formatted) ? (
              <div className="bag-1">
                <button className='btn-fill-dark py-3 w-100 mt-4'>
                  Insufficient Fund
                </button>
              </div>
            ) : (
              <>
                <button
                  sx={{
                    gap: "6px",
                  }}
                  disabled={
                    parseFloat?.(alienInputValue) > 0 &&
                      !redeemContractWrite?.isLoading &&
                      !redeemWaitForTransaction?.isLoading
                      ? false
                      : true
                  }
                  onClick={async () => {
                    try {
                      await redeemContractWrite?.writeAsync();
                    } catch (error) {
                      console.log(error);
                    }
                  }}
                  variant="contained"
                  className='btn-fill-dark py-3 w-100 mt-4'
                  fullWidth

                >
                  {redeemContractWrite?.isLoading ||
                    redeemWaitForTransaction?.isLoading ? (
                    <Loader color="#FF8C00" />
                  ) : null}
                  Redeem Now
                </button>
                <br></br>
                <br></br>

                {(parseFloat?.(userInfo?.yTokenBalance) > 0 ||
                  parseFloat?.(userInfo?.ethBalance) > 0) && (
                    <button
                      sx={{
                        gap: "6px",
                      }}
                      disabled={
                        (parseFloat?.(userInfo?.yTokenBalance) > 0 ||
                          parseFloat?.(userInfo?.ethBalance) > 0) &&
                          !collectContractWrite?.isLoading &&
                          !collectWaitForTransaction?.isLoading
                          ? false
                          : true
                      }
                      onClick={async () => {
                        try {
                          await collectContractWrite?.writeAsync();
                        } catch (error) {
                          console.log(error);
                        }
                      }}
                      variant="contained"
                   className='btn-fill-dark py-3 w-100 mt-4'
                      fullWidth
                    >
                      {collectContractWrite?.isLoading ||
                        collectWaitForTransaction?.isLoading ? (
                        <Loader color="#423A2A" />
                      ) : null}
                      Collect{" "}
                      {parseFloat?.(userInfo?.yTokenBalance) > 0
                        ? parseFloat?.(
                          convertWeiToEther?.(userInfo?.ethBalance?.toString())
                        ).toFixed(4) +
                        " LYNEA & " +
                        parseFloat?.(
                          convertWeiToEther?.(userInfo?.yTokenBalance?.toString())
                        ).toFixed(4) +
                        " BRVEA"
                        : parseFloat?.(
                          convertWeiToEther?.(userInfo?.ethBalance?.toString())
                        ).toFixed(4) + " LYNEA"}
                    </button>
                  )}
              </>
            )
          ) : (
            <button
              onClick={openConnectModal}
              variant="contained"
              fullWidth
              sx={{ color: "pink" }}
              className='btn-fill-dark py-3 w-100 mt-4'
            >
              Connect Wallet
            </button>
          )}


            </div>
        </main>
    )
}
