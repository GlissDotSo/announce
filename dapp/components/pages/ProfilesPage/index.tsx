import { BaseLayout } from "../../layouts"
import { useRouter } from 'next/router'
import { useQuery } from "react-query"
import { ANNONCE_SUBGRAPH_URL } from "../../../config"
import { ProfileHandleInlineLink } from "../../utils"
import { Container, Row } from "react-bootstrap"
import Link from "next/link"


async function getProfiles() {
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
                    profiles {
                        handle,
                        profileId,
                        imageURI,
                        pubCount,
                        followersCount,
                        followingCount
                    }
                }
            `
        })
    })
        .then(x => x.json())


    return res2.data.profiles
}

const Profiles = () => {
    const { isLoading, isSuccess, error, data } = useQuery(`getProfiles`, () => getProfiles())

    const renderProfile = (profile: any) => {
        return <pre>
            {'\n'}
            {'@'}<ProfileHandleInlineLink profile={profile} />{'\n'}
            <b>{profile.followersCount} followers</b> &middot; <b>{profile.followingCount} following</b>{'\n'}
        </pre>
    }

    return <>
        {
            isSuccess && <>
                <pre>
                    {'\n'}

                    {data.map((profile: any) => renderProfile(profile))}

                    {'\n'}
                </pre>
            </>
        }
    </>
}




function ProfilesPage(args: any) {
    return <BaseLayout>
        <Profiles />
    </BaseLayout>
}

export default ProfilesPage