import {basePath} from '@/sanity/env'

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap site-footer__inner">
        <p>Orvane is a fictional company. Every name, figure and quote on this site is invented for the sample.</p>
        <a className="maker" href="https://theaipipe.com">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${basePath}/the-ai-pipe.png`} alt="" width={20} height={20} />
          <span>Built by The AI Pipe with Sanity and Next.js</span>
        </a>
      </div>
    </footer>
  )
}
