import type { AppProps } from 'next/app'
import 'nextra-theme-docs/style.css'
import '../styles/figure.css'
import '../styles/figure-gallery.css'

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
