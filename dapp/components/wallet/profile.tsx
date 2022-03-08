import { ethers } from 'ethers'
import { useContext, useEffect, useState } from 'react'
import { isError, useQuery } from 'react-query'
import { useAccount, useConnect, useContractWrite, useNetwork } from 'wagmi'
import { ANNONCE_SUBGRAPH_URL, IPFS_NODE_URI } from '../../config'
import { StoreContext } from '../../providers/wagmi'
import { ProfileHandleInlineLink, ShortenedAddy } from '../utils'

async function getProfilesForWallet(wallet: string) {
    const res2 = await fetch(`${ANNONCE_SUBGRAPH_URL}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        mode: 'cors',
        body: JSON.stringify({
            query: `
                {
                    profiles(where: { owner: ${JSON.stringify(wallet)} } ) {
                        handle,
                        profileId
                    }
                }
            `
        })
    })
        .then(x => x.json())


    return {
        profiles: res2.data.profiles
    }
}

function makeRandomId(length: number): string {
    var result = '';
    var characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}

function useLensCreateProfileContract(network: string, deployments: any) {
    let addressOrName
    let contractInterface
    let functionName

    if(network == 'Mumbai') {
        const MockProfileCreationProxy_address = '0x08C4fdC3BfF03ce4E284FBFE61ba820c23722540'
        addressOrName = MockProfileCreationProxy_address
        contractInterface = MockProfileProxyABI
        functionName = 'proxyCreateProfile'
    } else {
        addressOrName = deployments.contracts['LensHubProxy'].address
        contractInterface = deployments.contracts['LensHubProxy'].abi
        functionName = 'createProfile'
    }

    return useContractWrite(
        {
            addressOrName,
            contractInterface,
        },
        functionName
    )
}

const MockProfileProxyABI = [
    {
        "inputs": [
            {
                "components": [
                    {
                        "internalType": "address",
                        "name": "to",
                        "type": "address"
                    },
                    {
                        "internalType": "string",
                        "name": "handle",
                        "type": "string"
                    },
                    {
                        "internalType": "string",
                        "name": "imageURI",
                        "type": "string"
                    },
                    {
                        "internalType": "address",
                        "name": "followModule",
                        "type": "address"
                    },
                    {
                        "internalType": "bytes",
                        "name": "followModuleData",
                        "type": "bytes"
                    },
                    {
                        "internalType": "string",
                        "name": "followNFTURI",
                        "type": "string"
                    }
                ],
                "internalType": "struct DataTypes.CreateProfileData",
                "name": "vars",
                "type": "tuple"
            }
        ],
        "name": "proxyCreateProfile",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
]

const LensProfileContextSwitcher = ({ address }: any) => {
    const query = useQuery('get-profiles-for-wallet', () => getProfilesForWallet(address))
    const { isLoading, isError, isSuccess, error, data } = query
    
    const store = useContext(StoreContext)
    const [{ deployments }] = useDeployments()
    const [{ data: networkData }, switchNetwork] = useNetwork()
    
    const [{ data: txData, error: txErr, loading }, write] = useLensCreateProfileContract(networkData.chain?.name as string, deployments)

    async function createProfile() {
        const createProfileData = {
            to: address,
            handle: makeRandomId(7),
            imageURI:
                'https://ipfs.fleek.co/ipfs/ghostplantghostplantghostplantghostplantghostplantghostplan',
            followModule: ethers.constants.AddressZero,
            followModuleData: [],
            followNFTURI:
                'https://ipfs.fleek.co/ipfs/ghostplantghostplantghostplantghostplantghostplantghostplan',
        }
        await write({ args: createProfileData })
    }

    function selectProfile(profile: any) {
        store.setProfile(profile)
    }

    useEffect(() => {
        if (isSuccess) {
            const hasProfile = query.data.profiles.length > 0
            if (hasProfile) {
                console.debug('selectProfile', query.data.profiles[0])
                selectProfile(query.data.profiles[0])
            }
        }
    }, [isSuccess, query.data, selectProfile])

    if(isLoading || isError) return <></>
    if (!isSuccess) return <></>

    const hasProfile = query.data.profiles.length > 0

    return <>
        {/* {isSuccess && hasProfile && data.profiles.map((profile: any) => <a href={`#`}>@{profile.handle}</a>) } */}
        {isSuccess && hasProfile && <>
            {`Logged in as `}{query.data.profiles.slice(0,1).map((profile: any) => <ProfileHandleInlineLink key={profile.profileId} profile={profile}/>) }{'.'}
            {/* {` `}{data.profiles.map(profile => profile.handle).join(', ')} */}
        </>}
        {isSuccess && !hasProfile && <>{`No profiles detected`}<a onClick={createProfile}> [create one]</a>{'.\n'}</>}
    </>
}

import styles from '../../styles/Home.module.css'
import WalletConnector from './connector'
import Image from 'next/image'
import { useDeployments } from '../../hooks'

export const WalletProfile = () => {
    const [{ data: connectData, error: connectError }, connect] = useConnect()
    const [{ data: accountData }, disconnect] = useAccount({
        fetchEns: true,
    })
    const [{ data, error, loading }, switchNetwork] = useNetwork()

    // {
    //     accountData.ens?.name
    //     ? `${accountData.ens?.name} (${accountData.address})`
    //     : accountData.address
    // }
    let walletInfo
    if (accountData && data.chain) {
        walletInfo = <>
            {`Connected to wallet `}<ShortenedAddy addr={accountData.address} />{`.\n` }
            <LensProfileContextSwitcher address={accountData.address} />
        </>
    } else {
        walletInfo = <>
            {`No wallet connected.`}
            <WalletConnector />
        </>
    }

    const [showDebugInfo, setShowDebugInfo] = useState(false)

    return (
        <div className={styles.walletProfile}>
            {/* <img src={accountData.ens?.avatar || ''} /> */}

            <img className={styles.logo} src="/logo.svg" />
            <pre>
                {`Anno Terminal [Version 1.0]\n`}
                {walletInfo}
            </pre>

            <pre onClick={() => setShowDebugInfo(!showDebugInfo)}>
                { showDebugInfo 
                    ? <>
                        <span className={styles.online}></span>{` Blockchain Node (${data.chain?.name})\n`}
                        <span className={styles.online}></span>{` Indexer - ${ANNONCE_SUBGRAPH_URL}\n`}
                        <i className={styles.online}></i>{` IPFS Node - ${IPFS_NODE_URI}\n`}
                    </>
                    : <>
                        <span className={styles.online}></span>{` Blockchain Node\n`}
                        <span className={styles.online}></span>{` Indexer Node\n`}
                        <i className={styles.online}></i>{` IPFS Node\n`}
                    </>
                }
            </pre>
            {/* <div>Connected to {accountData?.connector?.name}</div> */}
            {/* <button onClick={disconnect}>Disconnect</button> */}
        </div>
    )
}

export default WalletProfile 