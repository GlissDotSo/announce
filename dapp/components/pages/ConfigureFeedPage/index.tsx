import { BaseLayout } from "../../layouts"
import { useRouter } from 'next/router'
import { useQuery } from "react-query"
import { ANNONCE_SUBGRAPH_URL } from "../../../config"
import { ProfileHandleInlineLink } from "../../utils"
import { useState } from "react"
import { useContract, useSigner } from "wagmi"
import styles from '../../../styles/Home.module.css'


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
                        authors {
                            profile {
                                profileId,
                                handle
                            }
                        },
                        profile {
                            handle,
                            profileId,
                            pubCount,
                            followersCount,
                            followingCount,
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
        const followersProfileIds = followers.map((edge: any) => edge.from.id)
        followersProfiles = await getProfiles(followersProfileIds)
    }

    const data = {
        feed,
        // following: followingProfiles,
        followers: followersProfiles
    }

    return data;
}

const Action = ({ onClick, href = '#', children }) => {
    return <span href={href} style={{ color: '#00d034', textDecoration: 'none', cursor: "pointer" }} onClick={onClick}>[{children}]</span>
}

const USERNAME_HANDLE_PATTERN = /[a-z0-9]{1,31}$/

const deployments = require('../../../../deployments/localhost.json')

const ConfigureFeed = ({ id }) => {
    const { isLoading, isSuccess, error, data } = useQuery(`getFeed-${id}`, () => getFeed(id as string))

    const [usernameInput, setUsernameInput] = useState("")

    const [{ data: signerData, error: signerError, loading }, getSigner] = useSigner()
    const lensHubContract = useContract(
        {
            addressOrName: deployments.contracts['LensHubProxy'].address,
            contractInterface: deployments.contracts['LensHubProxy'].abi,
            signerOrProvider: signerData
        }
    )
    const feedContract = useContract(
        {
            addressOrName: deployments.contracts['Feed'].address,
            contractInterface: deployments.contracts['Feed'].abi,
            signerOrProvider: signerData
        }
    )

    async function setProfilePermissions({ feedId, profileHandle, createPost }: any) {
        const profileId = await lensHubContract.getProfileIdByHandle(profileHandle)
        
        if (profileId.toString() == '0') {
            throw Error(`Profile for handle "${profileHandle}" not found`)
        }
        
        const tx = await feedContract.setProfilePermissions(
            feedId,
            profileId,
            createPost
        )

        await tx.wait(1)
    }

    async function addAuthor() {
        await setProfilePermissions({
            feedId: id,
            profileHandle: usernameInput,
            createPost: true
        })
    }
    async function removeAuthor(handle: string) {
        await setProfilePermissions({
            feedId: id,
            profileHandle: handle,
            createPost: false
        })
    }

    function onUsernameKeyDown(ev: any) {
        // console.log(ev.key)
        if (!USERNAME_HANDLE_PATTERN.test(ev.key) && ev.key != 'Backspace') {
            ev.preventDefault();
            ev.stopPropagation();
        }
    }

    function onUsernameInputChange(ev: any) {
        let { value } = ev.target
        // console.log(USERNAME_HANDLE_PATTERN.exec(value), USERNAME_HANDLE_PATTERN.test(value))
        // if (USERNAME_HANDLE_PATTERN.test(value)) {
            
        // }
        setUsernameInput(value)
    }

    return <>
        {
            isSuccess && <>
                <pre>
                    {'\n'}
                    {'\n'}
                    <b>{data.feed.name}</b> {'@'}<ProfileHandleInlineLink profile={data.feed.profile} />{'\n'}
                    owner: {data.feed.owner}{'\n'}
                    authors: {'\n'}
                    {data.feed.authors
                        .map((author: any) => {
                            return <>
                                {'-> '}<ProfileHandleInlineLink profile={author.profile} />{' '}
                                <Action onClick={() => removeAuthor(author.profile.handle)}>remove</Action>{'\n'}
                            </>
                        })
                    }
                    -> <input type='text' className={styles.textInput} value={usernameInput} onChange={onUsernameInputChange} onKeyDown={onUsernameKeyDown} style={{ width: 180 }} placeholder='profile username'/>{' '}
                    <Action onClick={addAuthor}>add</Action>{'\n'}

                    {/* authors: <Action>add/remove</Action>{'\n'} */}
                    

                    {'\n'}
                    <b>{data.feed.profile.pubCount} posts</b>{'\n'}

                    {/* <b>{data.following.length} following</b>{'\n'}
                    {data.following.map(profile => <ProfileHandleInlineLink profile={profile} />).map(x => <>{x}{`\n`}</>)} */}

                    {'\n'}
                    <b>{data.followers.length} followers</b>{'\n'}
                    {data.followers.map((profile: any) => <ProfileHandleInlineLink profile={profile} />).map(x => <>{x}{`\n`}</>)}
                </pre>
            </>
        }
    </>
}

function ConfigureFeedPage(args: any) {
    const router = useRouter()
    const { id } = router.query
    if (!id) {
        return <></>
    }

    return <BaseLayout>
        <ConfigureFeed id={id} />
    </BaseLayout>
}

export default ConfigureFeedPage