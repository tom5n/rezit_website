import React from 'react'
import Layout from '@/components/Layout'
import SEO from '@/components/SEO'
import HeroSection from '@/components/HeroSection'
import SectionSeparator from '@/components/SectionSeparator'
import ClientLogos from '@/components/ClientLogos'
import WhyChooseUs from '@/components/WhyChooseUs'
import ProcessSteps from '@/components/ProcessSteps'
import ModernApp from '@/components/ModernApp'
import Calculator from '@/components/Calculator'
import PricingSection from '@/components/PricingSection'
import TestimonialsSection from '@/components/TestimonialsSection'
import FAQSection from '@/components/FAQSection'
import ContactSection from '@/components/ContactSection'

export default function Home() {
  // Structured Data pro hlavní stránku
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'rezit - Rezervační systém',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        offers: [
          {
            '@type': 'Offer',
            name: 'Lite',
            price: '8000',
            priceCurrency: 'CZK',
            availability: 'https://schema.org/InStock'
          },
          {
            '@type': 'Offer',
            name: 'Smart',
            price: '15000',
            priceCurrency: 'CZK',
            availability: 'https://schema.org/InStock'
          },
          {
            '@type': 'Offer',
            name: 'Pro',
            price: '25000',
            priceCurrency: 'CZK',
            availability: 'https://schema.org/InStock'
          }
        ],
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '5',
          ratingCount: '10',
          bestRating: '5',
          worstRating: '1'
        },
        description: 'Rezervační systém na míru pro kadeřnictví, salony a barber shopy. Bez měsíčních poplatků, jednorázová investice. Online rezervace, správa klientů, kalendář služeb.',
        url: 'https://rezit.cz',
        provider: {
          '@type': 'LocalBusiness',
          name: 'rezit',
          url: 'https://rezit.cz',
          address: {
            '@type': 'PostalAddress',
            addressCountry: 'CZ'
          }
        },
        featureList: [
          'Online rezervace',
          'Kalendář služeb',
          'Správa klientů',
          'E-mailové notifikace',
          'SMS připomínky',
          'Analytika a statistiky',
          'Správa zaměstnanců',
          'Nastavení služeb a cen'
        ]
      },
      {
        '@type': 'Organization',
        name: 'rezit',
        url: 'https://rezit.cz',
        logo: 'https://rezit.cz/images/rezit_logoo.png',
        sameAs: [
          'https://instagram.com/rezit.cz'
        ],
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'customer service',
          email: 'info@rezit.cz'
        }
      },
      {
        '@type': 'WebSite',
        name: 'rezit',
        url: 'https://rezit.cz',
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://rezit.cz/?s={search_term_string}',
          'query-input': 'required name=search_term_string'
        }
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'Kolik stojí rezervační systém rezit?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Ceny začínají od 8 000 Kč za balíček Lite, 15 000 Kč za Smart a 25 000 Kč za Pro. Jedná se o jednorázovou investici bez měsíčních poplatků.'
            }
          },
          {
            '@type': 'Question',
            name: 'Je rezervační systém vhodný pro kadeřnictví?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Ano, rezit je ideální pro kadeřnictví, salony a barber shopy. Systém je šitý na míru vašim službám a potřebám.'
            }
          },
          {
            '@type': 'Question',
            name: 'Jak dlouho trvá implementace?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Implementace probíhá rychle a efektivně. Obvykle je systém připraven k použití během několika dní.'
            }
          }
        ]
      }
    ]
  }

  return (
    <>
      <SEO
        title="rezit - Rezervační systém bez měsíčních poplatků | Kadeřnictví, Salony, Barber"
        description="Rezervační systém na míru pro kadeřnictví, salony a barber shopy. Bez měsíčních poplatků, jednorázová investice od 8 000 Kč. Online rezervace, správa klientů, kalendář služeb, SMS připomínky. Ušetřete tisíce ročně."
        keywords="rezervační systém, kadeřnictví, salon, barber shop, online rezervace, rezervační systém bez poplatků, rezervační systém na míru, booking systém, rezervace služeb, správa klientů, kalendář služeb, rezervační systém pro salony, rezervační systém pro kadeřnictví, rezervační systém pro barber, rezervační systém bez měsíčních poplatků, jednorázová investice, rezervační systém cena"
        url="https://rezit.cz"
        structuredData={structuredData}
      />
      <Layout>
        <HeroSection />
      <SectionSeparator src="/images/assets/1.svg" />
      <ClientLogos />
      <SectionSeparator src="/images/assets/2.svg" rotate={true} />
      <WhyChooseUs />
      <TestimonialsSection />
      <ProcessSteps />
      <ModernApp />
      <SectionSeparator src="/images/assets/3.svg" />
      <Calculator />
      <SectionSeparator src="/images/assets/4.svg" />
      <PricingSection />
      <ContactSection />
      <FAQSection />
    </Layout>
    </>
  )
}

// Explicit export for static generation
export async function getStaticProps() {
  return {
    props: {},
  }
}
