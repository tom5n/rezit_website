import Head from 'next/head'
import { useRouter } from 'next/router'

interface SEOProps {
  title?: string
  description?: string
  keywords?: string
  image?: string
  url?: string
  type?: string
  noindex?: boolean
  structuredData?: object
}

const SEO: React.FC<SEOProps> = ({
  title = 'rezit - Rezervační systém bez měsíčních poplatků | Kadeřnictví, Salony, Barber',
  description = 'Rezervační systém na míru pro kadeřnictví, salony a barber shopy. Bez měsíčních poplatků, jednorázová investice. Online rezervace, správa klientů, kalendář služeb. Ušetřete tisíce ročně.',
  keywords = 'rezervační systém, kadeřnictví, salon, barber shop, online rezervace, rezervační systém bez poplatků, rezervační systém na míru, booking systém, rezervace služeb, správa klientů, kalendář služeb, rezervační systém pro salony, rezervační systém pro kadeřnictví, rezervační systém pro barber',
  image = 'https://rezit.cz/images/rezitOGimage.png',
  url,
  type = 'website',
  noindex = false,
  structuredData
}) => {
  const router = useRouter()
  const canonicalUrl = url || `https://rezit.cz${router.asPath}`

  // Default structured data pro hlavní stránku
  const defaultStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'rezit - Rezervační systém',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '8000',
      priceCurrency: 'CZK',
      availability: 'https://schema.org/InStock'
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '5',
      ratingCount: '10'
    },
    description: description,
    url: 'https://rezit.cz',
    provider: {
      '@type': 'LocalBusiness',
      name: 'rezit',
      url: 'https://rezit.cz',
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'CZ'
      }
    }
  }

  const finalStructuredData = structuredData || defaultStructuredData

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="rezit" />
      <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'} />
      <meta name="googlebot" content="index, follow" />
      <meta name="language" content="Czech" />
      <meta name="revisit-after" content="7 days" />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content="rezit - Rezervační systém bez měsíčních poplatků" />
      <meta property="og:locale" content="cs_CZ" />
      <meta property="og:site_name" content="rezit" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:image:alt" content="rezit - Rezervační systém bez měsíčních poplatků" />

      {/* Additional SEO Tags */}
      <meta name="theme-color" content="#3B82F6" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="rezit" />

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(finalStructuredData) }}
      />
    </Head>
  )
}

export default SEO

