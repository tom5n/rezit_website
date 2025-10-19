import React from 'react'
import Header from './Header'
import Footer from './Footer'
import SmoothScroll from './SmoothScroll'
import ScrollToTop from './ScrollToTop'
import ScrollProgress from './ScrollProgress'
import CookieConsent from './CookieConsent'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <ScrollProgress />
      <SmoothScroll />
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
      <ScrollToTop />
      <CookieConsent />
    </div>
  )
}

export default Layout
