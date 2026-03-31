import BigNumber from "bignumber.js";
import { useAccount,erc20ABI, useToken } from "wagmi";
import convertWeiToEther from "../Utils/convertWeiToEther";
import useCustomContractRead from "./useCustomContractRead";
import IUniswapv2Pair from "../Config/IUniswapv2Pair.json";
import { useEffect, useState } from "react";

const useCheckAllowance=({
    tokenAddress, 
    spenderAddress,  
    isLpToken
})=>{
    const { address } = useAccount();
    const {data:checkAllowanceContract,isSuccess} = useCustomContractRead({
      Adrress: tokenAddress,
      Abi: !isLpToken ? erc20ABI : IUniswapv2Pair,
      FuncName: "allowance",
      Args: [address, spenderAddress],
      isEnabled: (
        address !== undefined && 
        spenderAddress !== undefined 
        )
    });
  
    return {
      data:checkAllowanceContract,
      isSuccess:isSuccess
  }

}

export default useCheckAllowance;