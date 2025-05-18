/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // This allows all domains
      },
    ],
    // Alternatively, you can use the deprecated domains array (still works in current versions)
    // domains: ['*'], // This also allows all domains
  },
};

export default nextConfig;