
import { deployments, lensAddresses } from '../config'
import { useNetwork } from 'wagmi'

export const useDeployments = () => {
    const [{ data, error, loading }, switchNetwork] = useNetwork()
    // TODO: this isn't the best solution.
    const network = data.chain?.name || 'Localhost'

    const lookup: Record<string,string> = {
        'Mumbai': 'mumbai',
        'Hardhat': 'localhost',
        'Localhost': 'localhost'
    }
    const deploymentKey = lookup[network]
    
    const ctx = {
        deployments: deployments[deploymentKey],
        lensAddresses: lensAddresses[deploymentKey]
    }
    return [ctx]
}

const CHAINS = {
    'mumbai': {
        chainId: 80001,
        chainName: "Polygon Testnet",
        rpcUrls: ["https://rpc-mumbai.maticvigil.com/"],
        nativeCurrency: {
            "name": "Testnet MATIC",
            "symbol": "MATIC",
            "decimals": 18
        },
        blockExplorerUrls: ["https://polygonscan.com/"],
    },
}

export const chainHooks = () => {
    // wallet_addEthereumChain
    // (window.ethereum as any).request({
    //     method: 'wallet_switchEthereumChain',
    //     params: [{ chainId: formattedChainId }],
    // });

    async function switchChain() {
        const ethereum = window.ethereum
        if(!ethereum) throw new Error("window.ethereum is undefined")

        await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
                CHAINS.mumbai as any
            ],
        });
    }

    return [{ switchChain }]

}