/* eslint-disable @typescript-eslint/no-explicit-any */
export function Sections({sections}: {sections?: any[] | null}) {
  if (!sections?.length) return <p>No sections yet.</p>
  return (
    <>
      {sections.map((s) => (
        <section key={s._key} data-type={s._type}>
          {s._type === "hero" ? <h1>{s.heading}</h1> : <h2>{s.heading}</h2>}
          {s.intro && <p>{s.intro}</p>}
        </section>
      ))}
    </>
  )
}
