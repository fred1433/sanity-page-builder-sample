import {defineCliConfig} from 'sanity/cli'
import {dataset, projectId} from './env'

export default defineCliConfig({
  api: {projectId, dataset},
  studioHost: process.env.SANITY_STUDIO_HOST || 'orvane-sample',
  deployment: {autoUpdates: true},
})
