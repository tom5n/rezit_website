import React from 'react'
import Layout from '@/components/Layout'
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
  return (
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
  )
}

// Explicit export for static generation
export async function getStaticProps() {
  return {
    props: {},
  }
}
