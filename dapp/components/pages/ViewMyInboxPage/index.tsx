import { useContext } from "react"
import { StoreContext } from "../../../providers/wagmi"
import { ViewInbox } from "../ViewInboxPage"
import { observer } from "mobx-react-lite"

const ViewMyInbox = observer(() => {
    const store = useContext(StoreContext)
    return <ViewInbox profileId={store.profile?.handle} />
})

function ViewMyInboxPage() {
    return <ViewMyInbox/>
}

export default ViewMyInboxPage