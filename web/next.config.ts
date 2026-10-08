import type {NextConfig} from 'next'
import {initOpenNextCloudflareForDev} from '@opennextjs/cloudflare'

// The site can live under a sub path (it does in the hosted sample). Empty means the domain root.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

const nextConfig: NextConfig = {
  basePath,
  // Trailing slashes keep every URL under the base path in one canonical form.
  trailingSlash: true,
  images: {unoptimized: true},
  env: {NEXT_PUBLIC_BASE_PATH: basePath},
}

export default nextConfig

initOpenNextCloudflareForDev()
