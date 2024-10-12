/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        DB_URL: process.env.DB_URL,
        WEB3_AUTH_CLIENT_ID: process.env.WEB3_AUTH_CLIENT_ID
    }
};

export default nextConfig;
