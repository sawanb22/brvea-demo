import BigNumber from "bignumber.js";
import { useBalance } from "wagmi";
import { WETHX_TOKEN_ADDRESS, WETH_TOKEN_ADDRESS, POTION_DAO_CHEF_ADDRESS, POTION_DAO_STAKING_ADDRESS, PTN_TOKEN_ADDRESS, UNISWAP_ROUTER_ADDRESS } from "../Config";
import IUniswapv2Pair from "../Config/IUniswapv2Pair.json";
import useCustomContractRead from "./useCustomContractRead";
import UniswapRouter from "../Config/UniswapRouter.json";
import POTION_DAO_CHEF_ABI from "../Config/POTION_DAO_CHEF_ABI.json";
import POTION_DAO_STAKING_ABI from "../Config/POTION_DAO_STAKING_ABI.json";
import { useState } from "react";

export const  useAPR = ({
    isLPStakeToken,
    stakeTokenInfo,
    rewardTokenInfo,
    token0Info,
    token1Info
}) => {

    const [totalStaked,setTotalStaked]=useState("0")
    const [apr,setAPR]=useState("0")
    const [stakeTokenPrice,setStakeTokenPrice]=useState("0")
    const [rewardTokenPrice,setRewardTokenPrice]=useState("0")
    const BNB="0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd"
    const BUSD="0xeD24FC36d5Ee211Ea25A80239Fb8C4Cfd80f12Ee"
    let _amountUSD = 1 * (10 ** 18 );

    const { data: _resultUSDS } = useCustomContractRead({
        Adrress: UNISWAP_ROUTER_ADDRESS,
        Abi: UniswapRouter,
        FuncName: "getAmountOut",
        Args: [_amountUSD?.toString(),[BNB, BUSD]]

      })
    let BNBUsdS = parseFloat?.(_resultUSDS[1] / (10 ** 18)).toFixed(4)

    let BNBUsdR = parseFloat( _resultUSDS[1] / (10 ** 18)).toFixed(4)

    const {data:totalTokenStake}=useCustomContractRead({
        Adrress:POTION_DAO_STAKING_ADDRESS,
        Abi:POTION_DAO_STAKING_ABI,
        isEnabled:!isLPStakeToken,
        FuncName:"totalSupply",
        onSuccess:(data)=>{
            setTotalStaked(data?.formatted)
        }
    })

    const {data:totalLpStake}=useBalance({
        addressOrName:POTION_DAO_CHEF_ADDRESS,
        token:stakeTokenInfo?.address,
        enabled:isLPStakeToken,
        onSuccess:(data)=>{
            setTotalStaked(data?.formatted)
        }
    })


 
    const {data:reserves}=useCustomContractRead({
            Adrress:stakeTokenInfo?.address,
            Abi:IUniswapv2Pair,
            FuncName:"getReserves",
            isEnabled:isLPStakeToken
    })
    
    let rewardPerSecond="0"
    let _amountA=0
    let _amountB=0
    let _amountS=0
    let _amountR = 1 * (10 ** rewardTokenInfo?.decimals ); 
    let rewardPairAddress=rewardTokenInfo?.address===WETH_TOKEN_ADDRESS?PTN_TOKEN_ADDRESS:WETH_TOKEN_ADDRESS

    const {data:rewardRateFromStake}=useCustomContractRead({
      Adrress:POTION_DAO_STAKING_ADDRESS,
      Abi:POTION_DAO_STAKING_ABI,
      FuncName:"rewardData",
      Args:[rewardTokenInfo?.address],
      onSuccess:(data)=>{
      }
    })
    const {data:rewardRateFromChefFarm}=useCustomContractRead({
      Adrress:POTION_DAO_CHEF_ADDRESS,
      Abi:POTION_DAO_CHEF_ABI,
      FuncName:"rewardPerSecond",
      onSuccess:(data)=>{
      }
    })
    if(isLPStakeToken){
            _amountA = 1 * (10 ** token0Info?.decimals)
            _amountB = 1 * (10 ** token1Info?.decimals )
            rewardPerSecond=rewardRateFromChefFarm;

    }else{
      _amountS = 1 * (10 ** stakeTokenInfo?.decimals );
      rewardPerSecond=rewardRateFromStake?.rewardRate
    }
    

    const { data: _resultB } = useCustomContractRead({
        Adrress: UNISWAP_ROUTER_ADDRESS,
        Abi: UniswapRouter,
        FuncName: "getAmountOut",
        isEnabled:token1Info?.address != BNB && _amountB>0,
        Args: [_amountB?.toString(),[token1Info?.address, BNB]]

      })

    const { data: _resultA } = useCustomContractRead({
        Adrress: UNISWAP_ROUTER_ADDRESS,
        Abi: UniswapRouter,
        FuncName: "getAmountOut",
        isEnabled:token0Info?.address != BNB && _amountA>0,
        Args: [_amountA?.toString(),[token0Info?.address, BNB]]

      })

    const { data: _resultS } = useCustomContractRead({
        Adrress: UNISWAP_ROUTER_ADDRESS,
        Abi: UniswapRouter,
        FuncName: "getAmountOut",
        isEnabled:stakeTokenInfo?.address != BNB && _amountS>0,
        Args: [_amountS?.toString(),[stakeTokenInfo?.address, WETH_TOKEN_ADDRESS]]

      })

    const { data: _resultR } = useCustomContractRead({
        Adrress: UNISWAP_ROUTER_ADDRESS,
        Abi: UniswapRouter,
        FuncName: "getAmountOut",
        isEnabled:rewardTokenInfo?.address != BNB,
        Args: [_amountR?.toString(),[rewardTokenInfo?.address,rewardPairAddress]]

      })


 

    if(parseFloat?.(totalStaked)>0){
        let _stokenPrice = 0 
        let _tokenPrice = 0 

        if(isLPStakeToken){
            console.log("It's LP");

            let _tokenBpriceUSD = BNBUsdS ;
            if(token1Info?.address != BNB){
                _tokenBpriceUSD = _resultB[1] / (10 ** 18); // price of 1 CAKE in BUSD
                _tokenBpriceUSD = _tokenBpriceUSD * BNBUsdS ;

            }

            let _tokenApriceUSD = BNBUsdS ;
            if(token0Info?.address != BNB){
            _tokenApriceUSD = _resultA[1] / (10 ** 18); // price of 1 CAKE in BUSD
            _tokenApriceUSD = _tokenApriceUSD * BNBUsdS ;

            }
            // console.log("Token A  Price: ", _tokenApriceUSD);
            // console.log("Token B  Price: ", _tokenBpriceUSD);
            
            let _tokenAsupply = reserves._reserve0/1e1**token0Info?.decimals ;
            let _tokenBsupply = reserves._reserve1/1e1**token1Info?.decimals ;

            let _totalValue = parseFloat(_tokenApriceUSD*_tokenAsupply).toFixed(8) + parseFloat(_tokenBpriceUSD*_tokenBsupply).toFixed(8) ;
            // console.log("Total "+v.name+" Value: ", _totalValue);

            let _totalSupply = stakeTokenInfo?.totalSupply ; 
            let _lpDecimals = stakeTokenInfo?.decimals ; 
            console.log("Total Supply: ", _totalSupply);
            _totalSupply = _totalSupply/1e1**_lpDecimals ;
            _stokenPrice = parseFloat(_totalValue/_totalSupply)
            console.log("Total "+v.name+" Price: ", _stokenPrice);
        }else{

          console.log("Getting S Price");
        
          _stokenPrice = _resultS[1] / (10 ** 18); // price of 1 CAKE in BUSD
         
          console.log("StakeP: "+_stokenPrice)
         

          if(rewardPairAddress != BUSD){
              _stokenPrice = _stokenPrice * BNBUsdS ;
          }

          
          // const _stokenDetails = await fetch('https://api.dex.guru/v1/tokens/'+temp['stakeTokenAddress']+'-bsc').then((data) => data.json());
          console.log("StakeP: "+_stokenPrice)
          // _stokenPrice  = _stokenDetails.priceUSD ;
          // _stokenPrice  = _stokenDetails.priceUSD ;
          // alert(props.index   )
        
      // ] if(v.rape == 4){
      //         alert(_stokenPrice)        
      //     }


      }

      setStakeTokenPrice(_stokenPrice) ;

      console.log("Getting R Price");

  _tokenPrice = _resultR[1] / (10 ** 18); // price of 1 CAKE in BUSD
  // _tokenPrice = _tokenPrice * BNBUsdR ;
  if(rewardPairAddress != BUSD){
      _tokenPrice = _tokenPrice * BNBUsdR ;

  }
  console.log("Token Price "+rewardPairAddress , _tokenPrice );

  setRewardTokenPrice(_tokenPrice) ;


     // const _tokenDetails = await fetch('https://api.dex.guru/v1/tokens/'+temp['rewardTokenAddress']+'-bsc').then((data) => data.json());
     // let _tokenDetails = tokenDetails.json() ;
  // _tokenPrice  = _tokenDetails.priceUSD ;
  console.log("Total Price: ", _tokenPrice);

  let _rewardPerBlock=3*rewardPerSecond; // i.e, 1 block minted in 3 second in bsc
  console.log(_rewardPerBlock);
  console.log(_tokenPrice);
  let earnPerYear = 10512000 * _rewardPerBlock * _tokenPrice  ; 
  console.log("APY " ,   earnPerYear/1e1**rewardTokenInfo?.decimals);
 
  let sttokenpool = _stokenPrice*totalStaked ;
  console.log("Stakig  Amount", totalStaked);
  console.log("Stakig  Token Price", _stokenPrice);
  console.log("Stakig  Token Amount", sttokenpool);
  console.log(" APR" , parseFloat(((earnPerYear/1e1**rewardTokenInfo?.decimals)/(sttokenpool/1e1**stakeTokenInfo?.decimals))*100).toFixed(4))

  apr = parseFloat(((earnPerYear/1e1**rewardTokenInfo?.decimals)/(sttokenpool/1e1**stakeTokenInfo?.decimals))*100).toFixed(4) ;
  setAPR(apr);    

  }

  return {
    APR:apr,
    stakeTokenPrice:stakeTokenPrice,
    rewardTokenPrice:rewardTokenPrice
  }

}

