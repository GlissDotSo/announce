import { verifyMessage } from 'ethers/lib/utils'
import { useAccount, useSignMessage, useSignTypedData } from 'wagmi'
import React from 'react'

import { useConnect } from 'wagmi'
import dynamic from 'next/dynamic'


// WORKAROUND: https://github.com/tmm/wagmi/issues/28
const WalletConnection = dynamic(() => import('@/components/wallet'), { ssr: false })


import { useRef, useState, useEffect } from 'react'
import { ethers } from 'ethers'



// The named list of all type definitions
const types = {
    DispatcherAuth: [
        { name: 'wallet', type: 'address' },
        { name: 'sessionPubkey', type: 'bytes' }
    ],
}


export const SignMessage = () => {
    const [{ data, error, loading }, signTypedData] = useSignTypedData()
    const [{ data: accountData }, disconnect] = useAccount({
        fetchEns: true,
    })

    const [keypair, setKeypair] = useState<ethers.Wallet>(null)
    
    async function performAuth() {
        const wallet = ethers.Wallet.createRandom()

        const domain = {
            name: 'Ether Mail',
            version: '1',
            chainId: await accountData.connector.getChainId(),
            verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
        }

        const msg = {
            wallet: accountData.address,
            sessionPubkey: wallet.publicKey
        }

        console.debug(msg)

        const { data, error } = await signTypedData({
            domain,
            types,
            value: msg
        })
        
        if(error) throw error

        setKeypair(wallet)
        console.log(data)
    }

    console.log(loading, error)

    useEffect(() => {
        if (accountData && keypair == null) {
            if (!loading && !error) performAuth()
        }
    }, [accountData, keypair, loading, error])

    return <>h</>
}



export default function IndexPage() {
    return <div>
        <h1>Welcome to web3</h1>
        <WalletConnection/>
        <SignMessage/>
    </div>
}