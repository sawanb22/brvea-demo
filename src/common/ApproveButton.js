// import { Button } from "@mui/material";
import useCustomContractWrite from "../Hooks/useCustomContractWrite";
import Loader from "../Component/Common/Loader";
import { erc20ABI, useAccount, useToken } from "wagmi";
import { useEffect } from "react";
import convertEtherToWei from "../Utils/convertEtherToWei";
import IUniswapv2Pair from "../Config/IUniswapv2Pair.json";
import BigNumber from "bignumber.js";
// import AlertMsg from "../AlertMsg/AlertMsg";
const ApproveButton = ({
  tokenAddress,
  spenderAddress,
  setIsApprovedERC20,
  ButtonName,
  spendAmount,
  isLpToken,
  color,
}) => {
  const { address } = useAccount();
  const { data: TokenInfo } = useToken({
    address: tokenAddress,
  });

  const {
    _useContractWrite: approveContractWrite,
    _useWaitForTransaction: approveWaitForTransaction,
  } = useCustomContractWrite({
    Adrress: tokenAddress,
    Abi: !isLpToken ? erc20ABI : IUniswapv2Pair,
    FuncName: "approve",
    Args: [
      spenderAddress,
      Number?.(spendAmount) > 0
        ? convertEtherToWei?.(spendAmount, TokenInfo?.decimals)
        : convertEtherToWei?.(
            new BigNumber(
              (Number.MAX_SAFE_INTEGER ** 1.3)?.toString()
            )?.toString(),
            TokenInfo?.decimals
          ),
    ],
    isEnabled: address !== undefined,
  });

  useEffect(() => {
    if (
      approveWaitForTransaction?.isSuccess ||
      approveContractWrite?.isSuccess
    ) {
      setIsApprovedERC20?.(true);
    }
  }, [
    approveWaitForTransaction?.isSuccess,
    approveContractWrite?.isSuccess,
    setIsApprovedERC20,
  ]);

  return (
    <>
      {/* {approveContractWrite?.isError && <AlertMsg/>} */}
      <button
        className='btn-fill-dark py-3 w-100 mt-4'
        disabled={
          !approveWaitForTransaction?.isLoading &&
          !approveContractWrite?.isLoading
            ? false
            : true
        }
        sx={{
          gap: "6px !important",
          width: "100% !important",
          color: `${color === "white" ? color : "black"}`,
          // border: "1px solid white",
          padding:"10px 10px",
          borderRadius: "10px",
          fontFamily:"var(--font-pop)",
          fontWeight:"600",
          fontSize:"16px",
          backgroundColor:"var(--main-color)"
        }}
        // startIcon={approveWaitForTransaction.isSuccess? <CheckIcon sx={{ color: "#eee", fontSize: "10px" }} />:null}
        type="button"
        onClick={async () => {
          try {
            await approveContractWrite?.writeAsync();
          } catch (error) {
            // console.log(error, "error");
          }
        }}
         
      >
        {approveWaitForTransaction?.isLoading ||
        approveContractWrite?.isLoading ? (
          <Loader color="#423A2A" />
        ) : null}
        {ButtonName ? <>{ButtonName}</> : "Approve"}
      </button>
    </>
  );
};

export default ApproveButton;
