
import { usePrepareContractWrite,useContractWrite,useWaitForTransaction } from 'wagmi';

const useCustomContractWrite = ({Adrress,Abi,FuncName,Args,isEnabled}) => {  
    const _usePrepareContractWrite = usePrepareContractWrite(
        {
        address: Adrress,
        abi:Abi ,
        functionName:FuncName,
        args:Args,
        enabled:isEnabled
        }
    );
    const _useContractWrite = useContractWrite(_usePrepareContractWrite?.config);
    // console.log(_usePrepareContractWrite?.config);
    // console.log(_useContractWrite);
    const _useWaitForTransaction=useWaitForTransaction({
        hash:_useContractWrite?.data?.hash
    })
    return {
        _useContractWrite,
        _useWaitForTransaction,
        _usePrepareContractWrite,
        _isPrepareConfigReady: Boolean(_usePrepareContractWrite?.config),
        _prepareErrorMessage: _usePrepareContractWrite?.error?.message || ""
    }
};

export default useCustomContractWrite;