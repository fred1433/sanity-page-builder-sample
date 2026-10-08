'use client'

import {useIsPresentationTool} from 'next-sanity/hooks'
import {basePath} from '@/sanity/env'

/** Shown only in Draft Mode outside the Studio, so a stray preview session can always be left. */
export function DraftModeBar() {
  const inPresentation = useIsPresentationTool()
  if (inPresentation !== false) return null
  return (
    <div className="draftbar" role="status">
      <span>Draft preview</span>
      <span aria-hidden="true"> · </span>
      <a href={`${basePath}/api/draft-mode/disable/`}>Exit preview</a>
    </div>
  )
}
