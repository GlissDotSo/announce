import { BaseLayout } from "../../layouts"
import { useRouter } from 'next/router'
import { useQuery } from "react-query"
import { ANNONCE_SUBGRAPH_URL } from "../../../config"
import { ProfileHandleInlineLink } from "../../utils"


async function getProfiles(ids: string[]) {
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
                    profiles( filter: { profileId: { in: [${ids}] } } ) {
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

async function getFeed(id: string) {
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
                        profile {
                            handle,
                            profileId,
                            
                            followers {
                                from {
                                    id
                                }
                            }
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
    const followers = feed.profile.followers
    // let followingProfiles = []
    let followersProfiles = []

    // if (following.length > 0) {
    //     const followingProfileIds = following.map((edge: any) => edge.to.id).join(',')
    //     followingProfiles = await getProfiles(followingProfileIds)
    // }
    if (followers.length) {
        const followersProfileIds = followers.map((edge: any) => edge.from.id).join(',')
        followersProfiles = await getProfiles(followersProfileIds)
    }




    const data = {
        feed,
        // following: followingProfiles,
        followers: followersProfiles
    }

    return data;
}

const ViewFeed = ({ id }) => {
    const { isLoading, isSuccess, error, data } = useQuery(`getFeed-${id}`, () => getFeed(id as string))
    console.log(id, isSuccess, data)

    return <>
        {
            isSuccess && <>
                <pre>
                    {'\n'}
                    {'\n'}
                    <b>{data.feed.name}</b> {'@'}<ProfileHandleInlineLink profile={data.feed.profile} />{'\n'}
                    {'\n'}

                    {/* <b>{data.following.length} following</b>{'\n'}
                    {data.following.map(profile => <ProfileHandleInlineLink profile={profile} />).map(x => <>{x}{`\n`}</>)} */}

                    {'\n'}
                    <b>{data.followers.length} followers</b>{'\n'}
                    {data.followers.map(profile => <ProfileHandleInlineLink profile={profile} />).map(x => <>{x}{`\n`}</>)}
                </pre>
            </>
        }
    </>
}

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