
import { useContractRead } from 'wagmi';


const useCustomContractRead = ({Adrress,Abi,FuncName,Args,select,onSuccess,onError,onSettled,isEnabled,isWatch}) => {  
    const _useContractRead = useContractRead(
        {
        address: Adrress,
        abi:Abi ,
        functionName:FuncName,
        args:Args,
        select:select,
        onSuccess:onSuccess,
        onSettled:onSettled,
        onError:onError,
        watch: isWatch??true,
        enabled: isEnabled,
        }
    );

    
    return _useContractRead;
};

export default useCustomContractRead;