import Link from "next/link"
import { useState } from "react"
import { useContract, useSigner } from "wagmi"
import { useDeployments } from "../../hooks"
import styles from '../../styles/Home.module.css'

export const ProfileHandleInlineLink = ({ profile }: any) => {
    return <Link href={`/profiles/${profile.handle}`}>{profile.handle}</Link>
}

export const ShortenedAddy = ({ addr }: { addr: string }) => {
    const [expanded, setExpanded] = useState(false)

    let s = addr
    if(!expanded) {
        s = `${ addr.slice(0, 6)}…${ addr.slice(-4) }`
    }
    
    return <span onClick={() => setExpanded(!expanded)}>{s}</span>
}

export const Action = (props: any) => {
    const { onClick, disabled, children } = props
    return <button disabled={disabled} onClick={onClick}>{children}</button>
}

export const ActionInline = ({ onClick, href = '#', children }: any) => {
    return <span style={{ color: '#00d034', textDecoration: 'none', cursor: "pointer" }} onClick={onClick}>[{children}]</span>
}

export const LensUsernameInput = (props: any) => {
    const { onChange, handleUsernameExists, value, inputProps, errorOn } = props

    const [message, setMessage] = useState('')
    const USERNAME_HANDLE_PATTERN = /[a-z0-9\.]{1,31}$/

    function onUsernameKeyDown(ev: any) {
        // Only allow valid characters.
        if (!USERNAME_HANDLE_PATTERN.test(ev.key) && ev.key != 'Backspace') {
            ev.preventDefault();
            ev.stopPropagation();
        }
    }

    async function onUsernameInputChange(ev: any) {
        let { value } = ev.target
        onChange(value)

        // Update the validity checks.
        const handle = value
        const profileId = await lensHubContract.getProfileIdByHandle(handle)

        const exists = profileId.toString() != '0'
        handleUsernameExists(exists)

        let error = ''
        if (errorOn == 'not-exists') {
            if (!exists) error = 'no such user'
        } else {
            if (exists) error = 'username taken'
        }
        
        setMessage(error)
    }

    
    
    const [{ deployments }] = useDeployments()

    const [{ data: signerData, error: signerError, loading }, getSigner] = useSigner()
    const lensHubContract = useContract(
        {
            addressOrName: deployments.contracts['LensHubProxy'].address,
            contractInterface: deployments.contracts['LensHubProxy'].abi,
            signerOrProvider: signerData
        }
    )

    return <>
        <input type='text' className={styles.textInput} value={value} onChange={onUsernameInputChange} onKeyDown={onUsernameKeyDown} style={{ width: 180 }} placeholder='profile username' {...inputProps} />
        {' ' + message}
    </>
}