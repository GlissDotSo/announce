import { useQuery } from 'react-query'
import Link from 'next/link'
import { ANNONCE_SUBGRAPH_URL } from '../../../config'

async function getInbox(profileId: string) {
    // Fetch the follows for this user.

    // return profiles
    // profiles {
    //     handle,
    //     profileId,
    //     following {
    //         to {
    //             id
    //         }
    //     }
    // },
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
                    profiles {
                        handle,
                        profileId,
                        following {
                            to {
                                id
                            }
                        }
                    }
                }
            `
        })
    })
    .then(x => x.json())
    
    
    console.log(res1.data.profiles)


    // Fetch the recent stream of posts from their follows.
    // posts(filter: { profileId: { in: [1, 5] } }, orderBy: timestamp, orderDirection: desc) {
    //     pubId,
    //         timestamp,
    //         profileId {
    //         id
    //     }
    // }

    // posts(filter: { profileId: { in: [${ followingProfileIds }] } }, orderBy: timestamp, orderDirection: desc) {
    //     pubId,
    //         contentURI,
    //         timestamp,
    //         profileId {
    //         id,
    //             handle,
    //             imageURI
    //     }
    // }
    const following = res1.data.profiles[parseInt(profileId)].following
    if(following.length === 0) {
        return []
    }
    const followingProfileIds = following.map((edge: any) => edge.to.id).join(',')

    console.log(followingProfileIds)
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
                    feedPubs(filter: { author_in: [${followingProfileIds}] }, orderBy: createdAt, orderDirection: desc) {
                        id,
                        feed {
                            name,
                            feedId,
                            profile {
                                profileId,
                                imageURI,
                                handle
                            }
                        },
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
                    }
                }
            `
        })
    })
    .then(x => x.json())

    console.log(res2.data.feedPubs)

    const posts = res2.data.feedPubs
    return posts
}


const ProfileHandleInlineLink = ({ profile }: any) => {
    return <Link href={`/profiles/${profile.handle}`}>{profile.handle}</Link>
}



// const ProfileHandleInlineLink = ({ profile }: any) => {
//     return <Link href={`/profiles/${profile.handle}`}>{profile.handle}</Link>
// }

import spotifyStyleTime from 'spotify-style-times'

const Item = ({ id, feed, author, pub }: any) => {
    return <pre key={id}>
        <b>
            {/* <ProfileHandleInlineLink profile={feed.profile}/> */}
            <Link href={`/feeds/${feed.feedId}`}>
                {feed.profile.handle + ` — ` + feed.name}
            </Link>
            
            {`\n`}
        </b>
        
        {`@`}
        <ProfileHandleInlineLink profile={author} />
        
        {`  `}
        {spotifyStyleTime(new Date(pub.timestamp * 1000))}
        {` ago`}
        {`\n`}
        
        {`${pub.content || "Available at " + pub.contentURI}`}
    </pre>
}

const ViewInboxPage = () => {
    // Fetch from subgraph.
    const { isLoading, error, data } = useQuery('getInbox', () => getInbox('1'))

    return <>
        {/* Show all items in a user's inbox */}
        <pre>
            {'\n'}
            {'\n'}
        </pre>
        {
            // Show posts.
            // data && data.map(({ pubId, timestamp, profileId, contentURI }: any) => <>
            //     <pre>
            //     {`@${profileId.handle} at ${timestamp}\n${contentURI}`}
            //     </pre>
            // </>)

            // Show feedPubs.
            data && data.map(Item)
        }
    </>
}

export default ViewInboxPage