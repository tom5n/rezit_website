/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed experimental appDir since we're using Pages Router
  images: {
    domains: ['kmaphjllonhkprofophw.supabase.co'],
    formats: ['image/webp', 'image/avif'],
  },
  // Optimalizace pro produkci
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
}

module.exports = nextConfig
