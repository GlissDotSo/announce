import type { AppProps } from 'next/app'

import { Providers } from '../providers/wagmi'

import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/globals.css'

function MyApp({ Component, pageProps }: AppProps) {
  return <>
    <Providers>
      <Component {...pageProps} />
    </Providers>
  </>
}

export default MyApp
