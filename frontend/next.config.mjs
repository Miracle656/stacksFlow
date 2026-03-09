/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ['@stacks/connect', '@stacks/connect-react', '@stacks/connect-ui', '@stacks/network', '@stacks/transactions'],
    eslint: {
        // Warning: This allows production builds to successfully complete even if
        // your project has ESLint errors.
        ignoreDuringBuilds: true,
    },
};

export default nextConfig;
