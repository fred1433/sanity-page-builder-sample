import {defineCloudflareConfig} from '@opennextjs/cloudflare'

// No incremental cache: every request reads Sanity, so a publish shows up without a redeploy.
export default defineCloudflareConfig({})
