import type { NextPage } from 'next'
import ViewInboxPage from '../components/pages/ViewInboxPage'
import { BaseLayout } from '../components/layouts'
import ViewMyInboxPage from '../components/pages/ViewMyInboxPage'

const Home: NextPage = () => {
  return (
    <BaseLayout>
      <ViewMyInboxPage/>
    </BaseLayout>
  )
}

export default Home
