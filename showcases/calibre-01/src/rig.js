// Shared, mutable state. GSAP writes to it on scroll; the R3F scene reads it every frame.
// Keeping it outside React means scrolling never triggers a React re-render.
import { STOPS } from './stops.js'

export const rig = {
  ...STOPS[0],
  intro: 0, // 0 -> 1 entrance, driven by the preloader timeline
  mx: 0, // pointer, -1..1
  my: 0,
}
