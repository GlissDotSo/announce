import type { NextPage } from 'next'
import ViewInboxPage from '../components/pages/ViewInboxPage'
import { BaseLayout } from '../components/layouts'

const Home: NextPage = () => {
  return (
    <BaseLayout>
      <ViewInboxPage/>
    </BaseLayout>
  )
}

export default Home
