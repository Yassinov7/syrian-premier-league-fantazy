/** @type {import('next').NextConfig} */
const nextConfig = {
    // appDir is now default in Next.js 13+ and deprecated in 14
    reactStrictMode: true,
    eslint: {
        ignoreDuringBuilds: true,
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
    },
}
module.exports = nextConfig 