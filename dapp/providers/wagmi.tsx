import { Provider as WagmiProvider, chain, allChains } from 'wagmi'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import { WalletLinkConnector } from 'wagmi/connectors/walletLink'

// API key for Ethereum node
// Two popular services are Infura (infura.io) and Alchemy (alchemy.com)
const infuraId = process.env.INFURA_ID

// Chains for connectors to support
const supportedChains = [
    chain.polygonTestnetMumbai,
    chain.hardhat,
    chain.localhost
]

// Set up connectors
const connectors = ({ chainId }: { chainId?: number | undefined }) => {
    // WalletLink support code:
    // const rpcUrl =
    //     supportedChains.find((x) => x.id === chainId)?.rpcUrls?.[0]
    // if(!rpcUrl) throw new Error(`RPC URL not found for chain ${chainId}`)

    return [
        new InjectedConnector({
            chains: supportedChains,
            options: { shimDisconnect: true },
        }),
        new WalletConnectConnector({
            chains: supportedChains,
            options: {
                infuraId,
                qrcode: true,
            },
        }),
        // new WalletLinkConnector({
        //     chains: supportedChains,
        //     options: {
        //         appName: 'My wagmi app',
        //         jsonRpcUrl: `${rpcUrl}/${infuraId}`,
        //     },
        // }),
    ]
}


import { QueryClient, QueryClientProvider, useQuery } from 'react-query'
import { useProvider, useCreateStore } from "mobx-store-provider";
import { AppStore } from "../state";
import React from 'react'
import { createContext } from 'react'


const store = new AppStore()
export const StoreContext = createContext<AppStore>(store)

const GlobalAppState = ({ children }: {
    children: React.ReactNode;
}) => {
    const { Provider } = StoreContext

    return <Provider value={store}>
        {children}
    </Provider>
    // return children
}


const queryClient = new QueryClient()

export const Providers = ({ children }: {
    children: React.ReactNode;
}): JSX.Element => <>
    <GlobalAppState>
        <QueryClientProvider client={queryClient}>
            <WagmiProvider autoConnect connectors={connectors}>
                {children}
            </WagmiProvider>
        </QueryClientProvider>
    </GlobalAppState>
</>

