import Link from "next/link"
import { useState } from "react"

export const ProfileHandleInlineLink = ({ profile }: any) => {
    return <Link href={`/profiles/${profile.handle}`}>{profile.handle}</Link>
}

export const ShortenedAddy = ({ addr }: { addr: string }) => {
    const [expanded, setExpanded] = useState(false)

    let s = addr
    if(!expanded) {
        s = `${ addr.slice(0, 6)}…${ addr.slice(-4) }.`
    }
    
    return <span onClick={() => setExpanded(!expanded)}>{s}</span>
}