// Real HTML text, so it is selectable, searchable and readable by screen readers.
// Each panel is one viewport tall and lines up with one entry in stops.js.
// Copy here is placeholder for a fictional brand.
export default function Overlay() {
  return (
    <>
      <section className="panel panel--hero left" aria-labelledby="h-hero">
        <div className="copy">
          <h1 id="h-hero" className="reveal display">
            Calibre 01
          </h1>
          <p className="reveal lede">A 38 mm automatic in yellow gold, with a green sunburst dial.</p>
          <p className="reveal hint">Scroll to look closer.</p>
        </div>
      </section>

      <section className="panel right" aria-labelledby="h-dial">
        <div className="copy">
          <h2 id="h-dial" className="reveal">
            The dial moves with the light
          </h2>
          <p className="reveal">
            Fine radial brushing throws light back differently at every angle, so the green reads deep in shade
            and bright in sun.
          </p>
        </div>
      </section>

      <section className="panel left" aria-labelledby="h-crown">
        <div className="copy">
          <h2 id="h-crown" className="reveal">
            A crown that grips
          </h2>
          <p className="reveal">
            The fluted edge gives your fingers hold when you wind the watch or set the time, even with gloves on.
          </p>
        </div>
      </section>

      <section className="panel right" aria-labelledby="h-case">
        <div className="copy">
          <h2 id="h-case" className="reveal">
            Slim enough for a cuff
          </h2>
          <p className="reveal">
            At 9.8 mm, the case slides under a shirt sleeve. The strap is hand-stitched calfskin.
          </p>
        </div>
      </section>

      <section className="panel center" id="visit" aria-labelledby="h-visit">
        <div className="copy">
          <h2 id="h-visit" className="reveal name">
            ReJoyce
          </h2>
        </div>
      </section>
    </>
  )
}
