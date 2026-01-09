/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: {
      ignoreBuildErrors: true,
    },
    eslint: {
      ignoreDuringBuilds: true,
    },
    productionBrowserSourceMaps: false,
    experimental: {
        serverActions: {
            bodySizeLimit: '50mb',
        },
    },
    // ESTA LÍNEA ARREGLA EL ERROR DE IMPORTACIÓN
    transpilePackages: ['lucide-react'], 
};

export default nextConfig;