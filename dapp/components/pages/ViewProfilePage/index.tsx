import { BaseLayout } from "../../layouts"
import { useRouter } from 'next/router'
import { useQuery } from "react-query"
import { ANNONCE_SUBGRAPH_URL } from "../../../config"
import { ProfileHandleInlineLink } from "../../utils"
import Link from "next/link"

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
                    profiles( where: { profileId_in: ${JSON.stringify(ids)} } ) {
                        handle,
                        profileId
                    },
                    feeds(where:{ profile_in: ${JSON.stringify(ids)} }) {
                        feedId,
                        profile {
                            id
                        }
                    }
                }
            `
        })
    })
        .then(x => x.json())


    const data = res2.data

    if(!res2.data.profiles) return []

    // TODO: improve the schema here.
    let profiles: any = {}
    data.profiles.forEach((profile: any) => {
        profiles[profile.profileId] = profile;
    })
    data.feeds.forEach((feed: any) => {
        profiles[feed.profile.id].feedId = feed.feedId;
    })

    return Object.values(profiles)
}

async function getProfile(handle: string) {
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
                    profiles(where: { handle: "${handle}" }) {
                        handle,
                        profileId,
                        owner,
                        following {
                            to {
                                id
                            }
                        },
                        followers {
                            from {
                                id
                            }
                        }
                    }
                }
            `
        })
    })
    .then(x => x.json())


    const profile = res1.data.profiles[0]

    
    // 2. Get following.
    // 
    const following = profile.following
    const followers = profile.followers
    let followingProfiles = []
    let followersProfiles = []

    if (following.length > 0) {
        const followingProfileIds = following.map((edge: any) => edge.to.id)
        followingProfiles = await getProfiles(followingProfileIds)
    }
    if(followers.length) {
        const followersProfileIds = followers.map((edge: any) => edge.from.id)
        followersProfiles = await getProfiles(followersProfileIds) 
    }

    const data = {
        profile: profile,
        following: followingProfiles,
        followers: followersProfiles
    }

    return data;
}

export const SmartInlineProfileHandleLink = ({ profile }: any) => {
    if(profile.feedId) {
        return <Link href={`/publications/${profile.feedId}`}>{profile.handle}</Link>
    }
    return <Link href={`/profiles/${profile.handle}`}>{profile.handle}</Link>
}

const ViewProfile = ({ id }: { id: string }) => {
    const { isLoading, isSuccess, error, data } = useQuery(`getProfile-${id}`, () => getProfile(id as string))
    console.log(id, isSuccess, data)

    return <>
    {
        (isSuccess && data) && <>
            <pre>
                {'\n'}
                {'\n'}
                {'@'}<ProfileHandleInlineLink profile={data.profile} />{'\n'}
                {`owned by ${data.profile.owner}\n`}
                {'\n'}

                <b>{data.following.length} following</b>{'\n'}
                {data.following.map((profile: any) => <SmartInlineProfileHandleLink key={profile.profileId} profile={profile} />).map((x: JSX.Element) => <>{x}{`\n`}</>)}
                
                {'\n'}
                <b>{data.followers.length} followers</b>{'\n'}
                {data.followers.map((profile: any) => <ProfileHandleInlineLink key={profile.profileId} profile={profile} />).map((x: JSX.Element) => <>{x}{`\n`}</>)}
            </pre>
        </>
    }
    </>
}

function ViewProfilePage(args: any) {
    const router = useRouter()
    const { id } = router.query
    if(!id) {
        return <></>
    }

    return <BaseLayout>
        <ViewProfile id={id as string}/>
    </BaseLayout>
}

export default ViewProfilePage