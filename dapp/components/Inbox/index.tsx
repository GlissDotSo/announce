


const InboxItem = ({ feedPub }: { feedPub: any }) => {
    
}

const ANNONCE_SUBGRAPH_URL = 'http://127.0.0.1:8000/subgraphs/name/liamzebedee/annonce'



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
                    feedPubs(filter: { author: { in: [${followingProfileIds}] } }, orderBy: createdAt, orderDirection: desc) {
                        id,
                        feed {
                            name
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

import { useQuery } from 'react-query'

const Inbox = () => {
    // Fetch from subgraph.
    
    const { isLoading, error, data } = useQuery('repoData', () => getInbox('1'))

    /*
    inbox(user: ${userAddress}) {
        items(orderBy: createdAt, orderDirection: desc) {
            feed {
                profile {
                    handle, 
                    imageURI
                }
            },
            author {
                handle,
                imageURI
            },
            pub {
                id,
                contentURI,
                content
            }
        }
    }
    */

    return <>
        <h2>Inbox</h2>
        {/* Show all items in a user's inbox */}
        {
            // Show posts.
            // data && data.map(({ pubId, timestamp, profileId, contentURI }: any) => <>
            //     <pre>
            //     {`@${profileId.handle} at ${timestamp}\n${contentURI}`}
            //     </pre>
            // </>)

            // Show feedPubs.
            data && data.map(({ id, feed, author, pub }: any) => <>
                <pre style={{ width: '40%', whiteSpace: 'pre-wrap' }} key={id}>
                    <b>{`${feed.name}\n`}</b>{`@${author.handle} at ${pub.timestamp}\n${pub.content || "Available at " + pub.contentURI}`}
                </pre>
            </>)
        }
    </>
}

export default Inbox