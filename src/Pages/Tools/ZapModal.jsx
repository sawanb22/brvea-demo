// import React, { useState, useEffect } from "react";
// import { useAccount, useBalance } from "wagmi";
// import { useConnectModal } from "@rainbow-me/rainbowkit";
// import {
//     POTION_DAO_ZAP_ADDRESS,
//     UNISWAP_ROUTER_ADDRESS,
// } from "../../Config/index";
// import POTION_DAO_ZAP_ABI from "../../Config/POTION_DAO_ZAP_ABI.json";
// import IUniswapv2Pair from "../../Config/IUniswapv2Pair.json";
// import UniswapRouter from "../../Config/UniswapRouter.json";

// import AddRoundedIcon from "@mui/icons-material/AddRounded";
// import ApproveButton from "../common/ApproveButton";
// import convertEtherToWei from "../../Utils/convertEtherToWei";
// import useCustomContractWrite from "../../Hooks/useCustomContractWrite";
// import Loader from "../../Component/Common/Loader";
// import calculateSwapInAmount from "../../Utils/calculateSwapInAmount";
// import useCustomContractRead from "../../Hooks/useCustomContractRead";
// import convertWeiToEther from "../../Utils/convertWeiToEther";
// import useCalculateLiquidity from "../../Hooks/useCalculateLiquidity";
// import BigNumber from "bignumber.js";
// import { ethers } from "ethers";
// import useCheckAllowance from "../../Hooks/useCheckAllowance";

// import style from "./tool.module.css"

// export const ZapModal = ({ 
//     poolIndex,
//     token0Info,
//     token1Info,
//     lpToken,
//     handleClose,
//     index,
//     getApr,
//     perDay
//  }) => {
    
//     const { address, isConnected } = useAccount();
//     const [SlippageInPercent, setSlippageInPercent] = useState(0.5);
//     const { openConnectModal } = useConnectModal();
//     const [isAproveERC20, setIsApprovedERC20] = useState(true);
//     const [inputZapValue, setInputZapValue] = useState("");

//     const handleInputZapChange = (event) => {
//         const { value } = event.target;
//         const isStack = /^[0-9]*(\.[0-9]{0,9})?$/.test(value);
//         if (isStack) {
//             setInputZapValue(value);
//         }
//     };



//     const { data: checkAllowance } = useCheckAllowance({
//         tokenAddress: token0Info?.address,
//         spenderAddress: POTION_DAO_ZAP_ADDRESS,
//         isLpToken: false,
//     });

//     useEffect(() => {
//         if (checkAllowance && address) {
//             const price = parseFloat?.(inputZapValue === "" ? "1" : inputZapValue);
//             const allowance = parseFloat?.(convertWeiToEther?.(checkAllowance));
//             // console.log(allowance >= price);
//             if (allowance >= price) {
//                 setIsApprovedERC20(true);
//             } else {
//                 setIsApprovedERC20(false);
//             }
//         }
//     }, [checkAllowance, address, inputZapValue]);

//     const { data: alienBalance } = useBalance({
//         addressOrName: address,
//         token: token0Info?.address,
//         enabled: address !== undefined && token0Info?.address !== undefined,
//     });

//     const setMax = (value) => {
//         // alert(value)
//         const isStack = /^[0-9]*(\.[0-9]{0,18})?$/.test(value);
//         if (isStack) {
//             setInputZapValue(value);
//         }          
//       };

//     const {
//         _useContractWrite: zapContractWrite,
//         _useWaitForTransaction: zapWaitForTransaction,
//     } = useCustomContractWrite({
//         Adrress: POTION_DAO_ZAP_ADDRESS,
//         Abi: POTION_DAO_ZAP_ABI,
//         FuncName: "zap",
//         Args: [
//             poolIndex,
//             "1000",
//             convertEtherToWei?.(inputZapValue === "" ? "0" : inputZapValue),
//             true,
//         ],
//         isEnabled:
//             parseFloat?.(inputZapValue === "" ? "0" : inputZapValue) > 0 &&
//             parseFloat?.(inputZapValue === "" ? "0" : inputZapValue) <=
//             parseFloat?.(alienBalance?.formatted) &&
//             address !== undefined &&
//             isAproveERC20,
//     });

//     useEffect(() => {
//         if (zapWaitForTransaction?.isSuccess || zapContractWrite?.isSuccess) {
//             handleClose();
//         }
//     }, [zapWaitForTransaction?.isSuccess]);

//     const [estimateAlien, setEstimateAlien] = useState("");

//     const { data: reserves } = useCustomContractRead({
//         Adrress: lpToken,
//         Abi: IUniswapv2Pair,
//         FuncName: "getReserves",
//         isEnabled: inputZapValue !== "",
//         onSuccess: (data) => {
//             // console.log(data?.[0].toString());
//             const minati = convertWeiToEther?.(
//                 parseInt?.(
//                     calculateSwapInAmount?.(
//                         data?.[0]?.toString(),
//                         convertEtherToWei?.(
//                             inputZapValue === "" ? "0" : inputZapValue
//                         ).toString()
//                     )
//                 ).toString()
//             );
//             setEstimateAlien?.(
//                 parseFloat?.(inputZapValue === "" ? "0" : inputZapValue) -
//                 parseFloat?.(minati)
//             );
//         },
//     });

//     // const { data: routerAddress } = useCustomContractRead({
//     //   Adrress: POTION_DAO_ZAP_ADDRESS,
//     //   Abi: POTION_DAO_ZAP_ABI,
//     //   FuncName: "uniRouter",
//     //   onSuccess: (data) => {
//     //     // console.log(data?.[0].toString());
//     //   }
//     // })

//     const { data: getAmountOutFoMinati } = useCustomContractRead({
//         Adrress: UNISWAP_ROUTER_ADDRESS,
//         Abi: UniswapRouter,
//         FuncName: "getAmountOut",
//         isEnabled: inputZapValue !== "" && estimateAlien !== "",
//         Args: [
//             convertEtherToWei?.(
//                 parseFloat?.(
//                     parseFloat?.(inputZapValue === "" ? "0" : inputZapValue) -
//                     parseFloat?.(estimateAlien === "" ? "0" : estimateAlien)
//                 ).toString()
//             ),
//             reserves?.[0],
//             reserves?.[1],
//         ],
//         onSuccess: (data) => { },
//     });

//     const { data: totalSupply } = useCustomContractRead({
//         Adrress: lpToken,
//         Abi: IUniswapv2Pair,
//         FuncName: "totalSupply",
//     });

//     function calculateMinimumLiquidity(
//         inputAmount,
//         totalSupply,
//         reserve1,
//         SlippageInPercent
//     ) {
//         const input = new BigNumber(convertEtherToWei?.(inputAmount)?.toString());
//         const reserve1BigNumber = new BigNumber(
//             reserve1 !== NaN ? reserve1?.toString() : "0" || 0
//         );
//         const totalSupplyBigNumber = new BigNumber(totalSupply?.toString() || 0);
//         const slippageBigNumber = new BigNumber(
//             SlippageInPercent?.toString() || 0
//         ).div(100);

//         const minLiquidity = input
//             .times(totalSupplyBigNumber)
//             .times(new BigNumber(1).minus(slippageBigNumber))
//             .div(reserve1BigNumber.times(2));
//         // console.log(parseInt?.(!minLiquidity.isNaN()?minLiquidity:"0")?.toString());
//         return parseInt?.(!minLiquidity.isNaN() ? minLiquidity : "0")?.toString();
//     }

//     const calculatePriceImpact = (amount0, amount1, reserves) => {
//         const reserve0 = reserves?.[0];
//         const reserve1 = reserves?.[1];
//         const midPrice = reserve0 / reserve1;
//         const midPriceAfter =
//             (parseFloat?.(reserve0) + parseFloat?.(amount0)) /
//             (parseFloat?.(reserve1) + parseFloat?.(amount1));
//         const priceImpact = Math.abs(midPrice - midPriceAfter) / midPrice;
//         return (priceImpact * 100)?.toFixed(3);
//     };
//     const closeModal = (e)=>{
//         if(e.target.classList.contains("outterdiv")){
//             handleClose()
//         }
//     }


//     return (
//         <div className={style.zapModal + " d-flex justify-content-center align-items-xxl-center outterdiv"} onClick={handleClose}>
//                 <div className={style.center_card}>
//                     <h1 className='text-center'>Zap into Farms</h1>
//                     <div className={style.row1}>
//                         <div>
//                             <div className={style.input_div + " d-flex gap-4"}>
//                                 <div className='d-flex gap-3 align-items-center'>
//                                     <img src="/assets/demo.svg" className={style.imgbg} alt="" />
//                                     <p className='text-uppercase opacity-50 mb-0'>BRVA</p>
//                                 </div>
//                                 <input type="number" className='flex-grow-1' placeholder='0.00'
//                                 autoComplete="off"
//                                 value={inputZapValue}
//                                 onChange={handleInputZapChange}
//                                 variant="standard"
//                                 InputProps={{
//                                     disableUnderline: true,
//                                 }}
//                             />
//                             </div>
//                         </div>
//                         <div className='d-flex justify-content-between mt-3'>
//                             <button
//                                 onClick={() =>
//                                     setMax(
//                                       alienBalance?.formatted
//                                         ? parseFloat?.(alienBalance?.formatted)?.toFixed(18)
//                                         : "0.00"
//                                     )
//                                   }
//                                 className='border-0 bg-transparent ' style={{ color: "var(--dark)", fontWeight: "400" }}>Max</button>
//                             <p className='mb-0'><span className='opacity-50'>Balance </span>
//                                 {alienBalance?.formatted
//                                 ? parseFloat?.(alienBalance?.formatted).toFixed(9)
//                                 : "0.0"}
//                                 0.00
//                             </p>
//                         </div>
//                     </div>
//                     <div className={style.row2 + ' d-flex my-3 justify-content-center'}>
//                         <div className='d-flex justify-content-center align-items-center'>
//                             <img src="/assets/down-arrow.svg" width="100%" alt="" />
//                         </div>
//                     </div>
//                     <div className={style.row3}>
//                         <div className='d-inline-flex align-items-center gap-2'>
//                             <div>
//                                 <img src="/assets/demo.svg" alt="" className={style.imgbg} />
//                                 <img src="/assets/demo1.svg" alt="" className={style.imgbg} />
//                             </div>
//                             <p className='mb-0'>
//                                 {index === 1 ? 'BRVEA / LYNEA' : 'LYNEX / LYNEA'}
//                             </p>
//                         </div>
//                         <p className='my-3'>Est. Allocation</p>
//                         <div>
//                             <div className='d-flex justify-content-between align-items-center my-2'>
//                                 <div className='d-flex align-items-center gap-2'>
//                                     <img src="/assets/demo.svg" alt="" className={style.imgbg} />
//                                     <p className='mb-0'>{index === 1 ? ' BRVEA ' : ' LYNEX'}</p>

//                                 </div>
//                                 <p className='mb-0 fs-6'>0.000
//                                     {inputZapValue === "" &&
//                                     estimateAlien === "" &&
//                                     parseFloat?.(getAmountOutFoMinati) > 0
//                                     ? "0.000"
//                                     : parseFloat?.(
//                                         convertWeiToEther?.(getAmountOutFoMinati?.toString())
//                                     ).toFixed(5)}
//                                 </p>
//                             </div>
//                             <div className='d-flex justify-content-between align-items-center my-2'>
//                                 <div className='d-flex align-items-center gap-2'>
//                                     <img src="/assets/demo1.svg" className={style.imgbg} alt="" />
//                                     <p className='mb-0'>LYNEA</p>
//                                 </div>
//                                 <p className='mb-0 fs-6'>
//                                 {inputZapValue === "" || estimateAlien === ""
//                                     ? "0.000"
//                                     : parseFloat?.(estimateAlien).toFixed(5)}
//                                 </p>
//                             </div>
//                         </div>
//                         <div className='d-flex justify-content-between'>
//                             <div>
//                                 <span>APR</span>
//                                 <p>23.00%</p>
//                             </div>
//                             <div>
//                                 <span>Est.Daily Income</span>
//                                 <p>$140</p>
//                             </div>
//                             <div>
//                                 <span>Price Impact</span>
//                                 <p>0.00%</p>
//                             </div>
//                         </div>
//                     </div>
//                     <div className={style.row4 + " my-3"}>
//                         <div className='d-flex my-2 justify-content-between'>
//                             <span>Minimum Received</span>
//                             <p className='mb-0'>0.00 BRVA LP</p>
//                         </div>
//                         <div className='d-flex my-2 justify-content-between'>
//                             <span>Slippage</span>
//                             <div className='d-flex gap-2'>
//                                 <button className={style.slippage_btn}
//                                 // onClick={() => {
//                                 //     setSlippageInPercent(0.5);
//                                 // }}
//                                 >0.5%</button>
//                                 <button className={style.slippage_btn}
//                                 // onClick={() => {
//                                 //     setSlippageInPercent(1);
//                                 // }}
//                                 >1%</button>
//                                 <button className={style.slippage_btn}
//                                 // onClick={() => {
//                                 //     setSlippageInPercent(2);
//                                 // }}
//                                 >2%</button>
//                                 <input
//                                     className={style.slippage_btn}
//                                     placeholder='0%'
//                                 // value={}
//                                 // onChange={(e) => {
//                                 //     const numericValue = e.target.value.replace(
//                                 //         /[^0-9.]/g,
//                                 //         ""
//                                 //     );
//                                 //     setSlippageInPercent(numericValue);
//                                 // }}
//                                 />
//                             </div>
//                         </div>
//                     </div>
//                     <button className='btn-fill-dark py-3 w-100' >Connect Wallet</button>

//                 </div>
//         </div>
//     )
// }
