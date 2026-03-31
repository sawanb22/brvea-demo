import React, { useState } from "react";
import Data from "../../common/Data"

import { useAccount, useContractReads } from "wagmi";
import { POTION_DAO_CHEF_ADDRESS } from "../../Config";
import useCustomContractRead from "../../Hooks/useCustomContractRead";
import POTION_DAO_CHEF_ABI from "../../Config/POTION_DAO_CHEF_ABI.json";
import useCustomContractWrite from "../../Hooks/useCustomContractWrite";
import convertWeiToEther from "../../Utils/convertWeiToEther";
import Loader from "../../Component/Common/Loader";
// import { Box, Button } from "@mui/material";


import style from "./tool.module.css"
import { Accordion } from './Accordion'


export const Tool = () => {

    const { address } = useAccount();
    const [totalClaimAmount, setTotalCaimAmount] = useState("0");
    const [poolArray, setPoolArray] = useState([]);
  
    useCustomContractRead({
      Adrress: POTION_DAO_CHEF_ADDRESS,
      Abi: POTION_DAO_CHEF_ABI,
      FuncName: "poolLength",
      onSuccess: (data) => {
        let arr = [];
        for (let i = 0; i < parseInt?.(data); i++) {
          arr.push(i);
        }
        setPoolArray(arr);
      },
    });
  
    const {
      _useContractWrite: harvestAllContractWrite,
      _useWaitForTransaction: harvestAllWaitForTransaction,
    } = useCustomContractWrite({
      Adrress: POTION_DAO_CHEF_ADDRESS,
      Abi: POTION_DAO_CHEF_ABI,
      FuncName: "harvestAllRewards",
      Args: [address],
      isEnabled: address !== undefined,
    });
  
    useContractReads({
      contracts: poolArray?.map((poolIndex) => {
        return {
          address: POTION_DAO_CHEF_ADDRESS,
          abi: POTION_DAO_CHEF_ABI,
          functionName: "pendingReward",
          args: [poolIndex, address],
        };
      }),
      enabled: address !== undefined,
      watch: true,
      onSuccess: (data) => {
        let total = 0;
        for (let i = 0; i < data?.length; i++) {
          total += parseFloat?.(convertWeiToEther?.(data?.[i]?.toString()));
        }
        setTotalCaimAmount(total);
      },
    });

    return (
        <main className='self_container mt-5'>
            <div className={style.reward + " d-flex m-auto justify-content-between align-items-center "}>
                <div className="d-flex gap-sm-4 gap-2 align-items-center">
                    <h3 className="mb-0 ">Total Rewards</h3>
                    <div className="d-flex gap-2 align-items-center">
                        <img src="/assets/demo.svg" alt="" />
                        <p className="mb-0"> {totalClaimAmount > 0
                              ? parseFloat?.(totalClaimAmount).toFixed(2)
                              : 0}{" "} BRVA</p>
                    </div>
                </div>
                <button
                            disabled={
                                address !== undefined &&
                                parseFloat?.(totalClaimAmount) > 0 &&
                                !harvestAllContractWrite?.isLoading &&
                                !harvestAllWaitForTransaction?.isLoading
                                  ? false
                                  : true
                              }
                              onClick={async () => {
                                try {
                                  await harvestAllContractWrite?.writeAsync();
                                } catch (error) {
                                  console.log("error",error);
                                  
                                }
                              }}
                className='btn-fill-dark py-3 px-4  px-lg-5' >Claim All</button>
            </div>

            {poolArray.length > 0 ? (
            <>
              {poolArray?.map((element, index) => {
                return (
                  <>
                    <Accordion
                      key={index}
                      data={Data[index]}
                      poolIndex={element}
                      setTotalCaimAmount={setTotalCaimAmount}
                      index={index}
                    />
                  </>
                );
              })}
            </>
          ) : (<Loader size={"60px"} />)}
        </main>
    )
}
