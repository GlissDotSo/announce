import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Nav, Button } from 'react-bootstrap';
import { useRouter } from 'next/router'

import styles from '../../styles/Home.module.css'

// WORKAROUND: https://github.com/tmm/wagmi/issues/28
const WalletConnector = dynamic(() => import('../wallet/connector'), { ssr: false })
const WalletProfile = dynamic(() => import('../wallet/profile'), { ssr: false })



const BaseLayout = ({ children }: { children: any }) => {
    const router = useRouter()

    return <div className={styles.container}>
        <Head>
            <title>Anno</title>
            <link rel="icon" href="/favicon.png" />
        </Head>

        <header className={styles.header}>
            <WalletProfile />
        </header>

        <main className={styles.main}>

            <pre></pre>

            <Nav variant="pills" defaultActiveKey="/">
                <Nav.Item>
                    <Link href="/">
                    <Nav.Link active={router.pathname === '/' || router.pathname.startsWith('/inbox')} href='/'>
                        Inbox
                    </Nav.Link>
                    </Link>
                </Nav.Item>
                <Nav.Item>
                    <Link href="/publications">
                        <Nav.Link active={router.pathname.startsWith('/publications')} href='/publications'>
                            Publications
                        </Nav.Link>
                    </Link>
                </Nav.Item>
                <Nav.Item>
                    <Link href="/profiles">
                        <Nav.Link active={router.pathname.startsWith('/profiles')} href='/profiles'>
                            Profiles
                        </Nav.Link>
                    </Link>
                </Nav.Item>
            </Nav>

            {children}
        </main>
    </div>
}

export { BaseLayout }