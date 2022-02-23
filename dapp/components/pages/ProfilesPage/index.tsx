import { BaseLayout } from "../../layouts"
import { useRouter } from 'next/router'
import { useQuery } from "react-query"
import { ANNONCE_SUBGRAPH_URL } from "../../../config"
import { ProfileHandleInlineLink } from "../../utils"


function ProfilesPage(args: any) {
    return <BaseLayout>
        <pre>Nothing here...yet</pre>
        <pre>Click on a profile in the "Inbox" to explore!</pre>
    </BaseLayout>
}

export default ProfilesPage