import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="cs">
      <Head>
        <title>rezit - Rezervační systém bez měsíčních poplatků</title>
        <meta name="description" content="Rezervační systém šitý na míru bez měsíčních poplatků. Ušetřete tisíce ročně s jednorázovou investicí." />
        <link rel="icon" href="/images/favicon.ico" />
        <link rel="shortcut icon" href="/images/favicon.ico" />
        <link rel="apple-touch-icon" href="/images/favicon.ico" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
