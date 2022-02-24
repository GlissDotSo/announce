import { ethers } from 'ethers'
import { useContext, useEffect } from 'react'
import { isError, useQuery } from 'react-query'
import { useAccount, useConnect, useContractWrite } from 'wagmi'
import { ANNONCE_SUBGRAPH_URL } from '../../config'
import { StateContext, StoreContext } from '../../providers/wagmi'
import { ProfileHandleInlineLink } from '../utils'

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

const deployments = require('../../../deployments/localhost.json')
import { AppStore } from '../../state'

const LensProfileContextSwitcher = ({ address }: any) => {
    const { isLoading, isError, isSuccess, error, data } = useQuery('get-profiles-for-wallet', () => getProfilesForWallet(address))
    
    const store = useContext(StoreContext)

    const [{ data: txData, error: txErr, loading }, write] = useContractWrite(
        {
            addressOrName: deployments.contracts['LensHubProxy'].address,
            contractInterface: deployments.contracts['LensHubProxy'].abi,
        },
        'createProfile',
    )

    async function createProfile() {
        const createProfileData = {
            to: address,
            handle: `${+(new Date) / 1000}`,
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
            const hasProfile = data.profiles.length > 0
            if (hasProfile) selectProfile(data.profiles[0])
        }
    }, [isSuccess])

    if(isLoading || isError) return ''
    if(!isSuccess) return ''

    const hasProfile = data.profiles.length > 0

    return <>
        {/* {isSuccess && hasProfile && data.profiles.map((profile: any) => <a href={`#`}>@{profile.handle}</a>) } */}
        {isSuccess && hasProfile && <>
            {`Logged in as `}{ data.profiles.slice(1).map((profile: any) => <ProfileHandleInlineLink profile={profile}/>) }{'.'}
        </>}
        {isSuccess && !hasProfile && <>{`No profiles detected`}<a onClick={createProfile}> [create one]</a>{'.\n'}</>}
    </>
}

export const WalletProfile = () => {
    const [{ data: connectData, error: connectError }, connect] = useConnect()
    const [{ data: accountData }, disconnect] = useAccount({
        fetchEns: true,
    })

    

    if (accountData) {
        return (
            <div>
                <img src={accountData.ens?.avatar || ''} />
                <pre>
                    {`Annonce Terminal [Version 1.0]\n`}
                    {/* {`(c) 2022 Annonce DAO. All rights on-chain.\n\n`} */}
                    {`Connected wallet: `}{accountData.ens?.name
                        ? `${accountData.ens?.name} (${accountData.address})`
                        : accountData.address}{'.\n'}
                    <LensProfileContextSwitcher address={accountData.address} />
                </pre>
                {/* <div>Connected to {accountData?.connector?.name}</div> */}
                {/* <button onClick={disconnect}>Disconnect</button> */}
            </div>
        )
    }

    return <>Not connected</>
}

export default WalletProfile 