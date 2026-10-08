import {draftMode} from 'next/headers'
import {NextResponse, type NextRequest} from 'next/server'
import {basePath} from '@/sanity/env'

export async function GET(request: NextRequest) {
  ;(await draftMode()).disable()
  return NextResponse.redirect(new URL(basePath || '/', request.url))
}
