import { BaseLayout } from "../../layouts"
import { useRouter } from 'next/router'
import { useQuery } from "react-query"
import { ANNONCE_SUBGRAPH_URL } from "../../../config"
import { Action, ProfileHandleInlineLink } from "../../utils"
import { Container, Row } from "react-bootstrap"
import Link from "next/link"
import { useContext } from "react"
import { StoreContext } from "../../../providers/wagmi"
import { useAccount } from "wagmi"

async function getOwnedFeeds(account: string) {
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
                    feeds(filter: {
                        owner: "${account}"
                    }) {
                        id,
                        feedId,
                        name,
                        authors {
                            profile {
                                handle
                            },
                        },
                        profile {
                            handle,
                            profileId,
                            imageURI,
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


    return res2.data?.feeds
}

or: { owner: "${account}" }

async function getYourFeeds(profileId: string) {
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
                    feedAuthors(filter: { 
                        author_in: ["${profileId}"]
                    }) {
                        id,
                        feed {
                            feedId,
                            name,
                            authors {
                                profile {
                                    handle
                                },
                            },
                            profile {
                                handle,
                                profileId,
                                imageURI,
                                pubCount,
                                followersCount,
                                followingCount
                            }
                        }
                    }
                }
            `
        })
    })
        .then(x => x.json())


    return res2.data?.feedAuthors.map((feedAuthor: any) => feedAuthor.feed)
}

async function getFeeds() {
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
                    feeds {
                        id,
                        feedId,
                        name,
                        authors {
                            profile {
                                handle
                            },
                        },
                        profile {
                            handle,
                            profileId,
                            imageURI,
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


    return res2.data.feeds
}

const FeedInlineLink = ({ feed }: any) => {
    return <Link href={`/publications/${feed.feedId}`}>
        {feed.profile.handle + ` — ` + feed.name}
    </Link>
}

const Feeds = () => {
    const store = useContext(StoreContext)

    const [{ data: accountData }] = useAccount()
    
    // const { isLoading, isSuccess, error, data } = useQuery(`getFeeds`, () => getFeeds())
    const yourFeedsQuery = useQuery(
        [`getYourFeeds`, store.profile?.profileId], 
        () => getYourFeeds(store.profile?.profileId),
        {
            enabled: store.profile?.profileId !== null
        }
    )
    const ownedFeedsQuery = useQuery(
        [`getOwnedFeeds`, accountData?.address], 
        () => getOwnedFeeds(accountData?.address?.toLowerCase() as string),
        {
            enabled: accountData?.address !== null
        }
    )



    const router = useRouter()
    const renderFeed = (feed: any) => {
        return <pre>
            {'\n'}
            
            {/* <b>{feed.name}</b> {'@'}<ProfileHandleInlineLink profile={feed.profile} />{'\n'} */}
            <FeedInlineLink feed={feed} />{'\n'}
            <b>{feed.profile.followersCount} followers</b> &middot; <b>{feed.profile.pubCount.length} posts</b>{'\n'}
        </pre>
    }

    return <>
        {
            (yourFeedsQuery.isSuccess && ownedFeedsQuery.isSuccess) && <>
                <pre>

                    {'\n'}
                    {'\n'}
                    <Action onClick={() => router.push('/publications/create')}>create a publication</Action>
                    {'\n'}
                    {'\n'}
                    {'\n'}

                    <b>publications you own</b>{'\n'}
                    {"publications you own".split(/./).map(x => '=')}{'\n'}

                    {ownedFeedsQuery.data.map((feed: any) => renderFeed(feed))}
                    {'\n'}
                    {'\n'}

                    <b>publications you contribute to</b>{'\n'}
                    {"publications you contribute to".split(/./).map(x => '=')}{'\n'}

                    {yourFeedsQuery.data.map((feed: any) => renderFeed(feed))}
                    {'\n'}
                    {'\n'}

                    {/* <b>all publications</b>{'\n'}
                    {`================`}{'\n'}
                    {data.map(feed => renderFeed(feed))} */}

                    {'\n'}
                    {'\n'}
                </pre>
            </>
        }
    </>
}




function FeedsPage(args: any) {
    return <BaseLayout>
        <Feeds/>
    </BaseLayout>
}

export default FeedsPage