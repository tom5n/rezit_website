import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { Toaster } from 'react-hot-toast'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>rezit - Rezervační systém bez měsíčních poplatků</title>
        <meta name="description" content="Rezervační systém šitý na míru bez měsíčních poplatků. Ušetřete tisíce ročně s jednorázovou investicí." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/images/favicon.ico" />
      </Head>
      <Component {...pageProps} />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#1F2937', // gray-800
            borderRadius: '8px',
            padding: '16px 24px',
            fontSize: '14px',
            fontWeight: '500',
            border: '2px solid #3B82F6',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          },
          success: {
            iconTheme: {
              primary: '#3B82F6',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444', // red-500
              secondary: '#fff',
            },
            style: {
              background: '#fff',
              color: '#EF4444',
              border: '2px solid #EF4444',
            },
          },
        }}
      />
    </>
  )
}
