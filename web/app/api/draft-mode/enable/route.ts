import {defineEnableDraftMode} from 'next-sanity/draft-mode'
import {client} from '@/sanity/client'
import {token} from '@/sanity/token'

// The maintained handler: it checks the preview secret the Studio sends before switching Draft Mode on.
export const {GET} = defineEnableDraftMode({client: client.withConfig({token})})
