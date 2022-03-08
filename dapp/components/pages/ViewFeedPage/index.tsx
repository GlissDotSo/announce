import { BaseLayout } from "../../layouts"
import { useRouter } from 'next/router'
import { useQuery } from "react-query"
import { ANNONCE_SUBGRAPH_URL, IPFS_NODE_URI } from "../../../config"
import { Action, ProfileHandleInlineLink, ShortenedAddy } from "../../utils"
import styles from '../../../styles/Home.module.css'

import { observer } from "mobx-react-lite"
import { AppStore } from "../../../state"
import { StoreContext } from "../../../providers/wagmi"
import { useContext, useEffect, useState } from "react"

import spotifyStyleTime from 'spotify-style-times'
import { useAccount, useContract, useContractWrite, useProvider, useSigner } from "wagmi"
import { uploadToIpfs } from '../../../lib/ipfs'

import { ethers } from "ethers"
import { useDeployments } from "../../../hooks"

async function getProfiles(ids: string[]) {
    console.log()

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
                    profiles(where: { profileId_in: ${JSON.stringify(ids)} } ) {
                        handle,
                        profileId
                    }
                }
            `
        })
    })
        .then(x => x.json())


    return res2.data.profiles
}

async function getIsFollowing(profileId: string, fromProfileId: string): Promise<boolean> {
    const query = `{
                    followingEdge(id:"${fromProfileId}_${profileId}") {
                        id
                    }
                }`
    
    const res2 = await fetch(`${ANNONCE_SUBGRAPH_URL}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        mode: 'cors',
        body: JSON.stringify({
            query
        })
    })
        .then(x => x.json())
    
    console.log(res2.data)
    return !!res2.data.followingEdge

}

async function getFeed(id: string, fromProfileId: string) {
    console.log('fromProfile', fromProfileId)
    // TODO: validate args

    // 1. Get user profile info.
    // 
    const res1 = await fetch(`${ANNONCE_SUBGRAPH_URL}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        mode: 'cors',
        body: JSON.stringify({
            query: `
                {
                    feeds(where: { feedId: "${id}" }) {
                        id,
                        name,
                        owner,
                        authors {
                            profile {
                                profileId,
                                handle
                            }
                        },
                        feedPubs(orderBy: createdAt, orderDirection: desc) {
                            createdAt,
                            author {
                                id,
                                handle,
                                imageURI
                            },
                            pub {
                                pubId,
                                contentURI,
                                content,
                                timestamp
                            }
                        },
                        profile {
                            handle,
                            profileId,
                            pubCount,
                            followersCount,
                            followingCount
                        }
                    }
                }
            `
        })
    })
        .then(x => x.json())


    const feed = res1.data.feeds[0]

    // 2. Get following.
    // 
    // const following = profile.following
    // const followers = feed.profile.followers
    // let followingProfiles = []
    // let followersProfiles = []

    // if (following.length > 0) {
    //     const followingProfileIds = following.map((edge: any) => edge.to.id).join(',')
    //     followingProfiles = await getProfiles(followingProfileIds)
    // }
    // if (followers.length) {
    //     const followersProfileIds = followers.map((edge: any) => edge.from.id)
    //     followersProfiles = await getProfiles(followersProfileIds)
    // }
    let isFollowing = false
    if(fromProfileId) {
        isFollowing = await getIsFollowing(feed.profile.profileId, fromProfileId)
    }


    const data = {
        feed,
        isFollowing,
        // following: followingProfiles,
        // followers: followersProfiles
    }

    return data;
}




const Item = ({ id, author, pub }: any) => {
    // TODO: Load from IPFS.
    const [content, setContent] = useState('')
    
    const cid = pub.contentURI.split('ipfs:')[1]
    const ipfsUrl = `${IPFS_NODE_URI}/ipfs/${cid}`

    async function loadFromIpfs() {
        const res = await fetch(ipfsUrl)
        setContent(await res.text())
    }

    useEffect(() => {    
        if (!pub.content && !content) {
            loadFromIpfs();
        }
    }, [])

    return <pre key={id}>
        <b>
            {`@`}<ProfileHandleInlineLink profile={author} />
            {`\n`}
        </b>

        <a href={ipfsUrl}>
        {spotifyStyleTime(new Date(pub.timestamp * 1000))}
        {` ago`}
        </a>
        {`\n`}

        {`${pub.content || content}`}
    </pre>
}


const ViewFeed = observer(({ id }: { id: string }) => {
    const store = useContext(StoreContext)

    // const { isLoading, isError, isSuccess, error, data } = useQuery('get-profiles-for-wallet', () => getProfilesForWallet(address))
    const { isLoading, isSuccess, error, data } = useQuery(
        [`getFeed`,id,store.profile], 
        () => getFeed(id, store?.profile?.profileId),
        { enabled: !!store?.profile?.profileId }
    )

    const [{ data: accountData }] = useAccount()
    const [{ deployments, lensAddresses }] = useDeployments()

    const [{ data: signerData, error: signerError, loading }, getSigner] = useSigner()
    const lensHubContract = useContract(
        {
            addressOrName: deployments.contracts['LensHubProxy'].address,
            contractInterface: deployments.contracts['LensHubProxy'].abi,
            signerOrProvider: signerData
        }
    )
    const followGraphContract = useContract(
        {
            addressOrName: deployments.contracts['FollowGraph'].address,
            contractInterface: deployments.contracts['FollowGraph'].abi,
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


    async function follow(profileId: string) {
        const fromProfileId: string | undefined = store?.profile?.profileId
        if (!fromProfileId) {
            console.warn("Not following from a profile")
            return
        }

        const tx = await followGraphContract.follow(
            [profileId],
            fromProfileId,
            [[]]
        )
        await tx.wait(1)
    }

    async function unfollow(profileId: string) {
        const fromProfileId: string | undefined = store?.profile?.profileId
        if (!fromProfileId) {
            console.warn("Not following from a profile")
            return
        }

        const tx = await followGraphContract.unfollow(
            [profileId],
            fromProfileId
        )
        await tx.wait(1)
    }

    const [textareaContent, setTextareaContent] = useState('')

    async function createPost(content: string) {
        let upload = {
            cid: "bafybeihdpt5mvcsl4djalzwx23fqld3brezkydljbbhkakmehoxjdl3lra"
        }
        upload = await uploadToIpfs(content)

        

        const post1 = {
            feedId: ethers.BigNumber.from(id),
            authorProfileId: ethers.BigNumber.from(store?.profile?.profileId),
            contentURI: `ipfs:${upload.cid}`,

            // TODO: Future design decisions about these variables.
            collectModule: lensAddresses['empty collect module'].address,
            collectModuleData: [],
            referenceModule: lensAddresses['follower only reference module'].address,
            referenceModuleData: [],
        }

        await feedContract.postToFeed(post1)
    }

    const isOwner = data?.feed?.owner == accountData?.address.toLowerCase()
    const authorIds: string[] = [].concat(
        data?.feed?.authors.map((author: any) => author.profile.profileId)
    )
    const isAuthor = authorIds.includes(store.profile?.profileId)

    const router = useRouter()
    return <>
        {
            (isSuccess && data) && <>
                <pre>
                    {'\n'}
                    {'\n'}
                    <b>{data.feed.name}</b> {'@'}<ProfileHandleInlineLink profile={data.feed.profile} />{'\n'}
                    <b>{data.feed.profile.followersCount} followers</b> &middot; owned by <ShortenedAddy addr={data.feed.owner}/>{'\n'}
                    {data.isFollowing
                        ? <Action onClick={() => unfollow(data.feed.profile.profileId)}>unfollow</Action>
                        : <Action onClick={() => follow(data.feed.profile.profileId)}>follow</Action>
                    }{` `}{isOwner && <Action onClick={() => router.push(`/publications/${data.feed.id}/configure`)}>configure</Action>}{'\n'}
                    {'\n'}

                    {/* {owner: {data.feed.owner}{'\n'} */}
                    {/* authors: {'\n'}
                    {' -> '}{data.feed.authors.map((author: any) => <ProfileHandleInlineLink profile={author.profile} />).map(x => <>{x}{`, `}</>)}{'\n'}{'\n'} */}


 
                    <b>posts{'\n'}</b>
                    {'=====\n\n'}
                    {isAuthor && <>
                    <textarea className={styles.textarea} style={{ width: '100%' }} onChange={(ev) => setTextareaContent(ev.target.value)} placeholder={`Write something to ${data.feed.name}...`}></textarea>
                    <button onClick={() => createPost(textareaContent)}>post</button>{'\n'}{'\n'}
                    </>}

                    {data.feed.feedPubs.map((x: any, i: number) => <Item key={i} {...x}/>)}


                    {/* <b>{data.following.length} following</b>{'\n'}
                    {data.following.map(profile => <ProfileHandleInlineLink profile={profile} />).map(x => <>{x}{`\n`}</>)} */}

                    {/* {data.followers.map((profile: any) => <ProfileHandleInlineLink profile={profile} />).map(x => <>{x}{`\n`}</>)}  */}
                    
                    
                </pre>
            </>
        }
    </>
})

function ViewFeedPage(args: any) {
    const router = useRouter()
    const { id } = router.query
    if (!id) {
        return <></>
    }

    return <BaseLayout>
        <ViewFeed id={id as string} />
    </BaseLayout>
}

export default ViewFeedPage