import BigNumber from "bignumber.js";
import { ethers } from "ethers"

const convertEtherToWei=(value,decimal =18)=>{
    // console.log(value);
    try {
        return ethers.utils.parseUnits?.((typeof value==="string")?value!==undefined?value:"0":value!==undefined?value:"0",decimal)

    } catch (e) {
        console.log("convertEtherToWei", e);
    }
}

export default convertEtherToWei;