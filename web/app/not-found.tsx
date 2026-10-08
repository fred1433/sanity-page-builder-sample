import NextLink from 'next/link'

export default function NotFound() {
  return (
    <section className="empty wrap">
      <h1 className="section-heading">This page is not published.</h1>
      <p>
        It may still be a draft, or its web address changed. <NextLink href="/">Go to the home page</NextLink>.
      </p>
    </section>
  )
}
