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
                    profiles( where: { profileId_in: ${JSON.stringify(ids)} } ) {
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
    // FIXME: in the subgraph
    // Error: `edge.to` is undefined.
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

const ViewProfile = ({ id }) => {
    const { isLoading, isSuccess, error, data } = useQuery(`getProfile-${id}`, () => getProfile(id as string))
    console.log(id, isSuccess, data)

    return <>
    {
        isSuccess && <>
            <pre>
                {'\n'}
                {'\n'}
                {'@'}<ProfileHandleInlineLink profile={data.profile} />{'\n'}
                {`owned by ${data.profile.owner}\n`}
                {'\n'}

                <b>{data.following.length} following</b>{'\n'}
                {data.following.map(profile => <ProfileHandleInlineLink profile={profile} />).map(x => <>{x}{`\n`}</>)}
                
                {'\n'}
                <b>{data.followers.length} followers</b>{'\n'}
                {data.followers.map(profile => <ProfileHandleInlineLink profile={profile} />).map(x => <>{x}{`\n`}</>)}
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
        <ViewProfile id={id}/>
    </BaseLayout>
}

export default ViewProfilePage