import { BaseLayout } from "../../layouts"
import { useRouter } from 'next/router'
import { useQuery } from "react-query"
import { ANNONCE_SUBGRAPH_URL } from "../../../config"
import { ProfileHandleInlineLink } from "../../utils"

const deployments = require('../../../../deployments/localhost.json')
import { observer } from "mobx-react-lite"
import { AppStore } from "../../../state"
import { StoreContext } from "../../../providers/wagmi"
import { useContext } from "react"

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
                        name,
                        owner,
                        authors {
                            profile {
                                profileId,
                                handle
                            }
                        },
                        feedPubs {
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

const Action = ({ onClick, children }) => {
    return <a href='#' style={{ color: '#00d034', textDecoration: 'none' }} onClick={onClick}>[{children}]</a>
}



import spotifyStyleTime from 'spotify-style-times'
import Link from "next/link"
import { useContract, useContractWrite, useProvider, useSigner } from "wagmi"

const Item = ({ id, author, pub }: any) => {
    return <pre key={id}>
        <b>
            {`@`}<ProfileHandleInlineLink profile={author} />
            {`\n`}
        </b>

        {spotifyStyleTime(new Date(pub.timestamp * 1000))}
        {` ago`}
        {`\n`}

        {`${pub.content || "Available at " + pub.contentURI}`}
    </pre>
}



const ViewFeed = observer(({ id }: any) => {
    const store = useContext(StoreContext)

    // const { isLoading, isError, isSuccess, error, data } = useQuery('get-profiles-for-wallet', () => getProfilesForWallet(address))
    const { isLoading, isSuccess, error, data } = useQuery([`getFeed`,id,store.profile], () => getFeed(id as string, store?.profile?.profileId))
    console.log(id, isSuccess, data)


    const [{ data: signerData, error: signerError, loading }, getSigner] = useSigner()
    const lensHubContract = useContract(
        {
            addressOrName: deployments.contracts['LensHubProxy'].address,
            contractInterface: deployments.contracts['LensHubProxy'].abi,
            signerOrProvider: signerData
        }
    )

    function createPost() {}

    async function follow(profileId: string) {
        const fromProfileId: string | undefined = store?.profile?.profileId
        if (!fromProfileId) {
            console.warn("Not following from a profile")
            return
        }

        console.log([
            [profileId],
            [fromProfileId],
            [[]]
        ])
        const tx = await lensHubContract.follow(
            [profileId],
            [fromProfileId],
            [[]]
        )
        await tx.wait(1)
    }

    async function unfollow(profileId: string) {
        
    }

    return <>
        {
            isSuccess && <>
                <pre>
                    {'\n'}
                    {'\n'}
                    <b>{data.feed.name}</b> {'@'}<ProfileHandleInlineLink profile={data.feed.profile} />{'\n'}
                    { data.isFollowing 
                      ? <Action onClick={() => unfollow(data.feed.profile.profileId)}>unfollow</Action>
                      : <Action onClick={() => follow(data.feed.profile.profileId)}>follow</Action>
                    } <b>{data.feed.profile.followersCount} followers</b>{'\n'}
                    {'\n'}
                    <b>posts{'\n'}</b>
                    {'=====\n\n'}
                    {data.feed.feedPubs.map(Item)}
                    {/* owner: {data.feed.owner}{'\n'}
                    authors: <Action>add/remove</Action>{'\n'}
                    {' -> '}{data.feed.authors.map((author: any) => <ProfileHandleInlineLink profile={author.profile} />).map(x => <>{x}{`, `}</>)}{'\n'}

                    {'\n'}
                    <b>{data.feed.profile.pubCount} posts</b> <Action onClick={createPost}>create</Action>{'\n'}

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
        <ViewFeed id={id} />
    </BaseLayout>
}

export default ViewFeedPage