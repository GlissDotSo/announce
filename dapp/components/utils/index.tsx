import Link from "next/link"
import { useState } from "react"
import styles from '../../styles/Home.module.css'

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

export const Action = ({ onClick, href = '#', children }: any) => {
    return <button onClick={onClick}>{children}</button>
}

export const ActionInline = ({ onClick, href = '#', children }: any) => {
    return <span style={{ color: '#00d034', textDecoration: 'none', cursor: "pointer" }} onClick={onClick}>[{children}]</span>
}

export const LensUsernameInput = ({ onChange, value, inputProps }: any) => {
    const USERNAME_HANDLE_PATTERN = /[a-z0-9]{1,31}$/

    function onUsernameKeyDown(ev: any) {
        // console.log(ev.key)
        if (!USERNAME_HANDLE_PATTERN.test(ev.key) && ev.key != 'Backspace') {
            ev.preventDefault();
            ev.stopPropagation();
        }
    }

    function onUsernameInputChange(ev: any) {
        let { value } = ev.target
        onChange(value)
    }

    return <input type='text' className={styles.textInput} value={value} onChange={onUsernameInputChange} onKeyDown={onUsernameKeyDown} style={{ width: 180 }} placeholder='profile username' {...inputProps} />
}