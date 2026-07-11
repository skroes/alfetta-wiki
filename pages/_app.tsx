import type { AppProps } from 'next/app'
import 'nextra-theme-docs/style.css'
import '../styles/alfetta-theme.css'
import '../styles/figure.css'
import '../styles/figure-gallery.css'
import '../styles/jargon.css'

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
