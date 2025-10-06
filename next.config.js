/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'localhost',
      'res.cloudinary.com',
      'static.nike.com',
      'images.samsung.com',
      'store.storeimages.cdn-apple.com',
      'images.unsplash.com',
      'via.placeholder.com',
      'i.imgur.com',
      'googleusercontent.com',
      'lh3.googleusercontent.com'
    ],
    remotePatterns: [
      { protocol: 'https', hostname: 'googleusercontent.com' },
      { protocol: 'http', hostname: 'googleusercontent.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'http', hostname: 'lh3.googleusercontent.com' }
    ]
  },
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    WHATSAPP_SESSION_PATH: process.env.WHATSAPP_SESSION_PATH,
  },
}

module.exports = nextConfig;
