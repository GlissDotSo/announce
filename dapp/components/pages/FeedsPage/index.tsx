import { BaseLayout } from "../../layouts"
import { useRouter } from 'next/router'
import { useQuery } from "react-query"
import { ANNONCE_SUBGRAPH_URL } from "../../../config"
import { ProfileHandleInlineLink } from "../../utils"
import { Container, Row } from "react-bootstrap"
import Link from "next/link"


async function getFeeds(ids: string[]) {
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
    return <Link href={`/feeds/${feed.feedId}`}>
        {feed.profile.handle + ` — ` + feed.name}
    </Link>
}

const Feeds = () => {
    const { isLoading, isSuccess, error, data } = useQuery(`getFeeds`, () => getFeeds())

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
            isSuccess && <>
                <pre>
                    {'\n'}

                    {data.map(feed => renderFeed(feed))}

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