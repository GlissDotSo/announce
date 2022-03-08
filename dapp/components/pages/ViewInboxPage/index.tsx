import { useQuery } from 'react-query'
import Link from 'next/link'
import { ANNONCE_SUBGRAPH_URL, IPFS_NODE_URI } from '../../../config'

async function getInbox(profileId: string) {
    // Fetch the follows for this user.
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
                    profiles(where: { id: "${profileId}" }) {
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

    
    const following = res1.data.profiles[0].following
    if(following.length === 0) {
        return []
    }
    const followingProfileIds = following.map((edge: any) => edge.to.id)

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
                    feeds(where: { profile_in: ${JSON.stringify(followingProfileIds)} }) {
                        id
                    }
                }
            `
        })
    })
        .then(x => x.json())

    console.log(res2.data.feeds)
    const followingFeedIds = res2.data.feeds.map((feed: any) => feed.id)

    const res3 = await fetch(`${ANNONCE_SUBGRAPH_URL}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        mode: 'cors',
        body: JSON.stringify({
            query: `
                {
                    feedPubs(where: { feed_in: ${JSON.stringify(followingFeedIds)} }, orderBy: createdAt, orderDirection: desc) {
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

    console.log(res3.data.feedPubs)

    const posts = res3.data.feedPubs
    return posts
}


const ProfileHandleInlineLink = ({ profile }: any) => {
    return <Link href={`/profiles/${profile.handle}`}>{profile.handle}</Link>
}



// const ProfileHandleInlineLink = ({ profile }: any) => {
//     return <Link href={`/profiles/${profile.handle}`}>{profile.handle}</Link>
// }

import spotifyStyleTime from 'spotify-style-times'
import { StoreContext } from '../../../providers/wagmi'
import { useContext, useEffect, useRef, useState } from 'react'


const Item = ({ id, feed, author, pub }: any) => {
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
            {/* <ProfileHandleInlineLink profile={feed.profile}/> */}
            <Link href={`/publications/${feed.feedId}`}>
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

        {`${pub.content || content}`}
    </pre>
}


/**
 * This is one thing that pisses me off about React's design.
 * Something that is relatively clear code when implemented imperatively,
 * e.g. setInterval, becomes this very opaque mess of constructs and primitives
 * when using React hooks.
 * 
 * e.g. how you would think it works -
    useEffect(() => {
        let id = setInterval(() => {
            setIndex((i + 1) % frames.length)
        }, 333)
        return () => clearInterval(id);
    }, [])
 */
function useInterval(callback: Function, delay: number) {
    const savedCallback = useRef<Function>(callback);

    // Remember the latest callback.
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    // Set up the interval.
    useEffect(() => {
        function tick() {
            savedCallback.current();
        }
        if (delay !== null) {
            let id = setInterval(tick, delay);
            return () => clearInterval(id);
        }
    }, [delay]);
}


const AnimatedLoadingEllipsis = () => {
    const frames = '- / | \\'.split(' ')

    const [i, setIndex] = useState(0)

    useInterval(() => {
        setIndex((i + 1) % frames.length)
    }, 200)

    return <>
        { frames[i] }
    </>
}

const ViewInboxPage = () => {
    // Fetch from subgraph.
    const store = useContext(StoreContext)
    const { isLoading, error, data } = useQuery(['getInbox', store.profile?.profileId], () => getInbox(store.profile?.profileId))

    return <>
        {/* Show all items in a user's inbox */}
        <pre>
            {'\n'}
            {'\n'}
            {isLoading && 'Loading inbox ' }
            { isLoading && <AnimatedLoadingEllipsis /> }
        </pre>
        {
            // Show posts.
            // data && data.map(({ pubId, timestamp, profileId, contentURI }: any) => <>
            //     <pre>
            //     {`@${profileId.handle} at ${timestamp}\n${contentURI}`}
            //     </pre>
            // </>)

            // Show feedPubs.
            data && data.map((x: any, i: number) => <Item key={i} {...x}/>)
        }
    </>
}

export default ViewInboxPage