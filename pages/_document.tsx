import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="cs">
      <Head>
        {/* Favicons */}
        <link rel="icon" href="/images/favicon.ico" />
        <link rel="shortcut icon" href="/images/favicon.ico" />
        <link rel="apple-touch-icon" href="/images/favicon.ico" />
        
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* DNS Prefetch */}
        <link rel="dns-prefetch" href="https://kmaphjllonhkprofophw.supabase.co" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
