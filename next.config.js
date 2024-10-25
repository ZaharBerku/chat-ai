/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    APP_ENV: process.env.APP_ENV,
    APP_NAME: process.env.APP_NAME,
    GA_MEASUREMENT_ID: process.env.GA_MEASUREMENT_ID,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/pgahq/image/upload/**'
      }
    ]
  }
}

module.exports = nextConfig
