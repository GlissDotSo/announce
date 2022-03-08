import { BaseLayout } from "../../layouts"
import { useRouter } from 'next/router'
import { useQuery } from "react-query"
import { ANNONCE_SUBGRAPH_URL } from "../../../config"
import { Action, LensUsernameInput, ProfileHandleInlineLink } from "../../utils"
import { Container, Row } from "react-bootstrap"
import Link from "next/link"
import styles from '../../../styles/Home.module.css'
import { useState } from "react"
import { useAccount, useContract, useSigner } from "wagmi"
import { ethers } from "ethers"
import { useDeployments } from "../../../hooks"


export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

const CreateFeed = () => {
    const [usernameInput, setUsernameInput] = useState("")
    const [feedName, setFeedName] = useState("")
    const router = useRouter()
    
    const [{ data: accountData }] = useAccount()
    const [{ data: signerData, error: signerError, loading }, getSigner] = useSigner()
    const [{ deployments }] = useDeployments()
    const lensHubContract = useContract(
        {
            addressOrName: deployments.contracts['LensHubProxy'].address,
            contractInterface: deployments.contracts['LensHubProxy'].abi,
            signerOrProvider: signerData
        }
    )
    const feedContract = useContract(
        {
            addressOrName: deployments.contracts['FeedProxy'].address,
            contractInterface: deployments.contracts['FeedProxy'].abi,
            signerOrProvider: signerData
        }
    )

    async function createFeed() {
        const { name, owner, profileHandle }: any = {
            name: feedName,
            profileHandle: usernameInput,
            owner: accountData?.address
        }

        const createFeedVars = {
            name,
            profileHandle,
            owner,
            imageURI: "",
            followModule: ZERO_ADDRESS,
            followModuleData: [],
            followNFTURI: ""
        }
        
        const tx = await feedContract.createFeed(createFeedVars)
        

        // TODO: This is terrible.
        // Refactor so it's not MVP-quality code.

        const receipt = await tx.wait(1)

        let abi = deployments.contracts['FeedProxy'].abi;
        let iface = new ethers.utils.Interface(abi);
        let log = iface.parseLog(receipt.logs[2]);
        const { feedId } = log.args;

        router.push(`/publications/${feedId.toString()}`)
    }
    
    return <>
        {
            <pre>

                {'\n'}
                {'\n'}
                <b>create a publication</b>{'\n'}{'\n'}
                title:{'\n'}
                <input type='text' value={feedName} onChange={(ev) => setFeedName(ev.target.value)} placeholder="Announcements" style={{ width: 250 }} className={styles.textInput} />{'\n'}{'\n'}

                username:{'\n'}
                <LensUsernameInput value={usernameInput} onChange={setUsernameInput} />{'\n'}{'\n'}

                <Action onClick={createFeed}>create</Action>

                {'\n'}
            </pre>
        }
    </>
}




function CreateFeedPage(args: any) {
    return <BaseLayout>
        <CreateFeed/>
    </BaseLayout>
}

export default CreateFeedPage