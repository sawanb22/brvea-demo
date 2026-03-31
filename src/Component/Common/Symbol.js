import { useToken } from "wagmi";
import { ZERO_ADDRESS } from "../../Config";

const Symbol=({tokenAddress})=>{
    const { data } = useToken({
      address: tokenAddress,
      enabled:tokenAddress!=="" || tokenAddress!==ZERO_ADDRESS
    });
    return(
      data?.symbol
    )
}

export default Symbol;