'use client'

import {useRef} from 'react'
import {basePath} from '@/sanity/env'

const REPO = process.env.NEXT_PUBLIC_REPO_URL || 'https://github.com/fred1433/sanity-page-builder-sample'

/** The one line that says what this site is. Opens the editor walkthrough in a dialog. */
export function SampleBanner() {
  const dialog = useRef<HTMLDialogElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const close = () => {
    video.current?.pause()
    dialog.current?.close()
  }
  return (
    <>
      <div className="sample">
        <p className="wrap sample__line">
          <span>Independent Sanity development sample. Fictional content.</span>{' '}
          <button type="button" className="sample__link" onClick={() => dialog.current?.showModal()}>
            Watch the editor workflow
          </button>
          <span aria-hidden="true"> · </span>
          <a className="sample__link" href={REPO}>
            View the implementation
          </a>
        </p>
      </div>
      <dialog ref={dialog} className="walkthrough" aria-label="Editor workflow, 80 seconds" onClick={(e) => e.target === dialog.current && close()} onClose={() => video.current?.pause()}>
        <div className="walkthrough__frame">
          <video ref={video} controls playsInline preload="none" poster={`${basePath}/workflow-poster.jpg`}>
            <source src={`${basePath}/workflow.mp4`} type="video/mp4" />
            <track kind="captions" src={`${basePath}/workflow.vtt`} srcLang="en" label="English" />
          </video>
          <div className="walkthrough__bar">
            <p>The editor workflow in the Studio, filmed on this site. Captions are on the video.</p>
            <button type="button" className="btn btn--secondary" onClick={close}>
              Close
            </button>
          </div>
        </div>
      </dialog>
    </>
  )
}
