import BigNumber from "bignumber.js";
import { ethers } from "ethers"

const convertWeiToEther=(value,decimal=18)=>{
    // console.log(value);
    try {
        return BigNumber(ethers.utils.formatUnits((typeof value==="string")?value!==undefined?value:"0":value!==undefined?value:"0",decimal))?.toString()
    }
    catch (e) {
        console.log("convertWeiToEtherError", e);
        
    }
}

export default convertWeiToEther;