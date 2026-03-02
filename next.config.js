/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Expose GEMINI_API_KEY to the client if needed, 
  // but guidelines say it's already in the environment.
  // In Next.js, we might need to handle it in a specific way if it's not NEXT_PUBLIC_
};

export default nextConfig;
