import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'

import dynamic from 'next/dynamic'
import ViewInboxPage from '../components/Inbox'

import { Nav, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import ViewProfilePage from '../components/pages/ViewProfilePage'
import { BaseLayout } from '../components/layouts'

// WORKAROUND: https://github.com/tmm/wagmi/issues/28
const WalletConnector = dynamic(() => import('../components/wallet/connector'), { ssr: false })
const WalletProfile = dynamic(() => import('../components/wallet/profile'), { ssr: false })

const Home: NextPage = () => {
  return (
    <BaseLayout>
      <ViewInboxPage/>
    </BaseLayout>
  )
}

export default Home
