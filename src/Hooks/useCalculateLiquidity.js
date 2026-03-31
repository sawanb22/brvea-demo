// import BigNumber from "bignumber.js";
// import { useBalance } from "wagmi";
// import IUniswapv2Pair from "../Config/IUniswapv2Pair.json";
// import useCustomContractRead from "./useCustomContractRead";

// const useCalculateLiquidity=({
//     lpToken,
//     reserves,
//     token0Info,
//     token1Info
// })=>{
//     // console.log(    lpToken,
//     //     reserves,
//     //     token0Info,
//     //     token1Info);
//     let liquidity;
//      const _reserve0 = reserves?.[0]
//      const _reserve1= reserves?.[1]
//     const {data:balance0} = useBalance({
//         addressOrName:lpToken,
//         token:token0Info?.address
//     })
//     const {data:balance1} = useBalance({
//         addressOrName:lpToken,
//         token:token1Info?.address
//     })
//     console.log(parseFloat?.(balance0?.value)-parseFloat?.(_reserve0));
//     const amount0 = new BigNumber(balance0?.value).minus(_reserve0);
//     console.log(amount0);
//     const amount1 = new BigNumber(balance1?.value).minus(_reserve1);
//     const MINIMUM_LIQUIDITY = new BigNumber(10).pow(3);
//     const {data:_totalSupply}=useCustomContractRead({
//         Adrress:lpToken,
//         Abi:IUniswapv2Pair,
//         FuncName:"totalSupply"
//     })
//     // console.log(_totalSupply?.toString());


//     if (_totalSupply === 0) {
//         liquidity = new BigNumber(Math.sqrt(amount0.times(amount1))).minus(MINIMUM_LIQUIDITY);
//         console.log(liquidity);
//     } else {
//         liquidity = Math.min(amount0.times(_totalSupply) / _reserve0, amount1.times(_totalSupply) / _reserve1);
//         console.log(liquidity);
//     }

//     return {
//         data:liquidity
//     }

// }

// export default useCalculateLiquidity;