import React, { useEffect, useState } from "react";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import {
  useAccount,
  useBalance,
} from "wagmi";
import useCustomContractRead from "../../Hooks/useCustomContractRead";
import {
  WETHX_PTN_POOL_ADDRESS,
  WETH_TOKEN_ADDRESS,
} from "../../Config";
import WETHX_PTN_POOL_ABI from "../../Config/WETHX_PTN_POOL_ABI.json";
import ApproveButton from "../../common/ApproveButton";
import useCustomContractWrite from "../../Hooks/useCustomContractWrite";
import convertEtherToWei from "../../Utils/convertEtherToWei";
import Loader from "../../Component/Common/Loader";
import convertWeiToEther from "../../Utils/convertWeiToEther";
import useCheckAllowance from "../../Hooks/useCheckAllowance";
import $ from "jquery";

import style from "./mint.module.css";

export const Mint = () => {

  // wagmi hooks
  const { address, isConnected } = useAccount();
  const [alienInputValue, setAlienInputValue] = useState("");
  const [alienXInputValue, setAlienXInputValue] = useState("");
  const [SlippageInPercent, setSlippageInPercent] = useState(0.5);
  const [isAproveERC20, setIsApprovedERC20] = useState(true);
  const { openConnectModal } = useConnectModal();

  useCustomContractRead({
    Adrress: WETHX_PTN_POOL_ADDRESS,
    Abi: WETHX_PTN_POOL_ABI,
    FuncName: "calcMint",
    Args: [convertEtherToWei?.(alienInputValue === "" ? "0" : alienInputValue)],
    isEnabled: alienInputValue,
    onSuccess: (data) => {
      setAlienXInputValue(
        parseFloat?.(convertWeiToEther?.(data?._xTokenOut?.toString()))
      );
    },
  });

  const { data: poolInfo } = useCustomContractRead({
    Adrress: WETHX_PTN_POOL_ADDRESS,
    Abi: WETHX_PTN_POOL_ABI,
    FuncName: "info",
    onSuccess: () => {},
  });

  const stackhandleAlienInputChange = (event, mintingFee) => {
    const { value } = event.target;
    const isStack = /^[0-9]*(\.[0-9]{0,18})?$/.test(value);
    if (isStack) {
      try {
        setAlienInputValue(value);
        const valueAfterFeeCut =
          value !== ""
            ? (
                parseFloat?.(value) -
                parseFloat?.(value) * (mintingFee / 100)
              ).toFixed(4)
            : "0.0";

        setAlienXInputValue(valueAfterFeeCut);
      } catch (e) {}
    }
  };

  const setMax = (value, mintingFee) => {
    const isStack = /^[0-9]*(\.[0-9]{0,18})?$/.test(value);
    if (isStack) {
      setAlienInputValue(value);
      const valueAfterFeeCut =
        value !== ""
          ? (
              parseFloat?.(value) -
              parseFloat?.(value) * (mintingFee / 100)
            ).toFixed(4)
          : "0.0";
      setAlienXInputValue(valueAfterFeeCut);
    }
  };

  const { data: xTokenAddress } = useCustomContractRead({
    Adrress: WETHX_PTN_POOL_ADDRESS,
    Abi: WETHX_PTN_POOL_ABI,
    FuncName: "xToken",
    onSuccess: () => {},
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

  const { data: checkAllowance } = useCheckAllowance({
    tokenAddress: WETH_TOKEN_ADDRESS,
    spenderAddress: WETHX_PTN_POOL_ADDRESS,
    isLpToken: false,
  });

  useEffect(() => {
    if (checkAllowance && address) {
      const price = parseFloat?.(alienInputValue === "" ? "1" : alienInputValue);
      const allowance = parseFloat?.(convertWeiToEther?.(checkAllowance));
      if (allowance >= price) {
        setIsApprovedERC20(true);
      } else {
        setIsApprovedERC20(false);
      }
    }
  }, [checkAllowance, address, alienInputValue]);

  const numericAlienInput = parseFloat?.(alienInputValue === "" ? "0" : alienInputValue);
  const numericAlienBalance = parseFloat?.(alienBalance?.formatted || "0");
  const numericAlienXInput = parseFloat?.(alienXInputValue === "" ? "0" : alienXInputValue);
  const minOutAfterSlippage =
    alienInputValue !== "" && Number.isFinite(numericAlienXInput)
      ? (
          numericAlienXInput -
          numericAlienXInput * (Number(SlippageInPercent) / 100)
        ).toString()
      : "0.0";

  const {
    _useContractWrite: mintContractWrite,
    _useWaitForTransaction: mintWaitForTransaction,
  } = useCustomContractWrite({
    Adrress: WETHX_PTN_POOL_ADDRESS,
    Abi: WETHX_PTN_POOL_ABI,
    FuncName: "mint",
    Args: [
      convertEtherToWei?.(minOutAfterSlippage),
      convertEtherToWei?.(alienInputValue === "" ? "0" : alienInputValue),
    ],
    isEnabled:
      numericAlienInput > 0 &&
      numericAlienInput <= numericAlienBalance &&
      address !== undefined &&
      !poolInfo?._mintingPaused &&
      isAproveERC20,
  });

  const { data: userInfo } = useCustomContractRead({
    Adrress: WETHX_PTN_POOL_ADDRESS,
    Abi: WETHX_PTN_POOL_ABI,
    FuncName: "userInfo",
    Args: [address],
    isEnabled: address !== undefined,
    onSuccess: () => {},
  });

  const {
    _useContractWrite: collectContractWrite,
    _useWaitForTransaction: collectWaitForTransaction,
  } = useCustomContractWrite({
    Adrress: WETHX_PTN_POOL_ADDRESS,
    Abi: WETHX_PTN_POOL_ABI,
    FuncName: "collect",
    isEnabled:
      parseFloat?.(userInfo?.xTokenBalance) > 0 && address !== undefined,
  });

  useEffect(() => {
    $("select").each(function () {
      const $this = $(this);
      const numberOfOptions = $(this).children("option").length;

      $this.addClass("select-hidden");
      $this.wrap('<div class="select"></div>');
      $this.after('<div class="select-styled"></div>');

      const $styledSelect = $this.next("div.select-styled");
      $styledSelect.text($this.children("option").eq(0).text());

      const $list = $("<ul />", {
        class: "select-options",
      }).insertAfter($styledSelect);

      for (let i = 0; i < numberOfOptions; i++) {
        $("<li />", {
          text: $this.children("option").eq(i).text(),
          rel: $this.children("option").eq(i).val(),
        }).appendTo($list);
        if ($this.children("option").eq(i).is(":selected")) {
          $(
            'li[rel="' + $this.children("option").eq(i).val() + '"]'
          ).addClass("is-selected");
        }
      }

      const $listItems = $list.children("li");

      $styledSelect.click(function (e) {
        e.stopPropagation();
        $("div.select-styled.active")
          .not(this)
          .each(function () {
            $(this).removeClass("active").next("ul.select-options").hide();
          });
        $(this).toggleClass("active").next("ul.select-options").toggle();
      });

      $listItems.click(function (e) {
        e.stopPropagation();
        $styledSelect.text($(this).text()).removeClass("active");
        $this.val($(this).attr("rel"));
        $list.find("li.is-selected").removeClass("is-selected");
        $list
          .find('li[rel="' + $(this).attr("rel") + '"]')
          .addClass("is-selected");
        $list.hide();
      });

      $(document).click(function () {
        $styledSelect.removeClass("active");
        $list.hide();
      });
    });
  }, []);


  return (
    <main className={style.mint_parent + " d-flex justify-content-center"}>
      <div className={style.mint}>
        <div className="d-flex justify-content-between align-items-center">
          <h1>Mint</h1>
          <div className="tooltip-parent position-relative d-flex align-items-center gap-2">
            <img src="/assets/info.svg" alt="" />
            <span>info</span>
            <p className="info-tooltip position-absolute">tooltip</p>
          </div>
        </div>
        <div className={style.inputdiv + " mt-4"}>
          <div className="d-flex">
            <p className="mb-0 flex-grow-1">
              <input
                className={` ${style.outline_none} w-100 border-0  bg-transparent fs-3 w-fit-content`}
                type="number"
                placeholder="0.00"
                value={alienInputValue}
                onChange={(e) => {
                  stackhandleAlienInputChange(
                    e,
                    parseInt?.(poolInfo?._mintingFee) / 10e3
                  );
                }}
              />
            </p>
            <div className="d-flex align-items-center gap-2">
              <img src="/assets/lynex.svg" alt="" />
              <p className="mb-0">LYNEA</p>
            </div>
          </div>
          <div className="mt-2 d-flex align-items-center justify-content-between">
            <button
              onClick={() => {
                setMax(
                  alienBalance?.formatted
                    ? parseFloat?.(alienBalance?.formatted).toFixed(6)
                    : "0.0",
                  parseInt?.(poolInfo?._mintingFee) / 10e3
                );
              }}
            >
              Max
            </button>
            <p className="mb-0" style={{ fontWeight: "500" }}>
              <span className="opacity-50">Balance</span>{" "}
              {alienBalance?.formatted
                ? parseFloat?.(alienBalance?.formatted).toFixed(5)
                : "0.00"}
            </p>
          </div>
        </div>
        <div className={style.arrow + " d-flex justify-content-center align-items-center"}>
          <img src="/assets/down-arrow.svg" alt="" />
        </div>
        <div className={style.inputdiv}>
          <div className="d-flex">
            <input
              className={` ${style.outline_none} w-100 border-0  bg-transparent fs-3 w-fit-content`}
              type="number"
              placeholder="0.00"
              value={alienXInputValue === 0 ? "0.0" : alienXInputValue}
            />
            <div className="d-flex align-items-center gap-2">
              <img src="/assets/lynex.svg" alt="" />
              <p className="mb-0">LYNEX</p>
            </div>
          </div>
          <div className="mt-2 d-flex align-items-center justify-content-between">
            <button></button>
            <p className="mb-0" style={{ fontWeight: "500" }}>
              <span className="opacity-50">Balance</span>{" "}
              {alienXBalance?.formatted
                ? parseFloat?.(alienXBalance?.formatted).toFixed(5)
                : "0.0"}
            </p>
          </div>
        </div>
        <div
          className={
            style.slippage +
            " d-flex my-3 px-sm-3 justify-content-between align-items-center"
          }
        >
          <p className="mb-0 opacity-50">Slippage</p>
          <div className="d-flex gap-sm-2 gap-1">
            <button
              onClick={() => {
                setSlippageInPercent(0.5);
              }}
            >
              0.5%
            </button>
            <button
              onClick={() => {
                setSlippageInPercent(1);
              }}
            >
              1%
            </button>
            <button
              onClick={() => {
                setSlippageInPercent(2);
              }}
            >
              2%
            </button>
            <button
              value={SlippageInPercent + "%"}
              onChange={(e) => {
                const numericValue = e.target.value.replace(/[^0-9.]/g, "");
                setSlippageInPercent(numericValue);
              }}
            >
              100%
            </button>
          </div>
        </div>
        <div className={style.bottom + " my-3"}>
          <div className="d-flex justify-content-between ">
            <p className="opacity-50">Mint Fee</p>
            <span>
              {parseInt?.(poolInfo?._mintingFee) > 0
                ? parseInt?.(poolInfo?._mintingFee) / 10e3
                : 0}
              %
            </span>
          </div>
          <hr />
          <div className="d-flex justify-content-between ">
            <p className="opacity-50">Minimum Received </p>
            <p>
              {alienInputValue === ""
                ? "0.0"
                : (
                    parseFloat?.(alienXInputValue) -
                    parseFloat?.(alienXInputValue) * (SlippageInPercent / 100)
                  ).toFixed(4)}{" "}
              <span className="opacity-50">LYNEX</span>
            </p>
          </div>
        </div>
        {address && isConnected ? (
          !isAproveERC20 ? (
            <div>
              <ApproveButton
                tokenAddress={WETH_TOKEN_ADDRESS}
                spenderAddress={WETHX_PTN_POOL_ADDRESS}
                setIsApprovedERC20={setIsApprovedERC20}
                isLpToken={false}
                color={"white"}
              />
            </div>
          ) : parseFloat?.(alienInputValue) > parseFloat?.(alienBalance?.formatted) ? (
            <div className="bag-1">
              <button className="btn-fill-dark py-3 w-100 mt-4">
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
                  !(parseFloat?.(alienInputValue) > 0) ||
                  !mintContractWrite?.writeAsync ||
                  mintContractWrite?.isLoading ||
                  mintWaitForTransaction?.isLoading
                }
                onClick={async () => {
                  try {
                    await mintContractWrite?.writeAsync();
                  } catch (error) {
                    console.log(error);
                  }
                }}
                className="btn-fill-dark py-3 w-100 mt-4"
              >
                {mintContractWrite?.isLoading || mintWaitForTransaction?.isLoading ? (
                  <Loader color="#423A2A" />
                ) : null}
                Mint Now
              </button>
              <br></br>
              <br></br>

              {parseFloat?.(userInfo?.xTokenBalance) > 0 && (
                <button
                  sx={{
                    gap: "6px",
                  }}
                  disabled={
                    !(parseFloat?.(userInfo?.xTokenBalance) > 0) ||
                    !collectContractWrite?.writeAsync ||
                    collectContractWrite?.isLoading ||
                    collectWaitForTransaction?.isLoading
                  }
                  onClick={async () => {
                    try {
                      await collectContractWrite?.writeAsync();
                    } catch (error) {
                      console.log(error);
                    }
                  }}
                  variant="contained"
                  className="btn-fill-dark py-3 w-100 mt-4"
                  fullWidth
                >
                  {collectContractWrite?.isLoading ||
                  collectWaitForTransaction?.isLoading ? (
                    <Loader color="#423A2A" />
                  ) : null}
                  Collect{" "}
                  {parseFloat?.(
                    convertWeiToEther?.(userInfo?.xTokenBalance?.toString())
                  ).toFixed(6)}{" "}
                  LYNEX
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
            className="btn-fill-dark py-3 w-100 mt-4"
          >
            Connect Wallet
          </button>
        )}
      </div>
    </main>
  );
};
