import { useEffect, useMemo, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import Scene from './Scene.jsx'
import Overlay from './Overlay.jsx'
import { rig } from './rig.js'
import { STOPS } from './stops.js'

gsap.registerPlugin(ScrollTrigger)

function hasWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

export default function App() {
  const rootRef = useRef(null)
  const barRef = useRef(null)
  const lenisRef = useRef(null)
  const webgl = useMemo(hasWebGL, [])

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Smooth scrolling, driven by GSAP's ticker so ScrollTrigger and the camera stay in sync
    const lenis = new Lenis({ duration: 1.2, smoothWheel: !reduced })
    lenisRef.current = lenis
    lenis.stop()
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (t) => lenis.raf(t * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    const onMove = (e) => {
      rig.mx = (e.clientX / window.innerWidth) * 2 - 1
      rig.my = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('pointermove', onMove)

    const ctx = gsap.context(() => {
      Object.assign(rig, STOPS[0])

      // One timeline over the whole page. Each tween moves the shot to the next stop.
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: rootRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
          onUpdate: (self) => {
            if (barRef.current) barRef.current.style.transform = `scaleY(${self.progress})`
          },
        },
      })
      STOPS.slice(1).forEach((stop, i) => {
        tl.to(rig, { ...stop, duration: 1, ease: 'power2.inOut' }, i)
      })

      if (!reduced) {
        // Hero text is part of the intro. The other panels fade with the scroll.
        gsap.set('.panel--hero .reveal', { opacity: 0 })
        gsap.utils.toArray('.panel:not(.panel--hero)').forEach((panel) => {
          const els = panel.querySelectorAll('.reveal')
          gsap.set(els, { opacity: 0 })
          gsap.to(els, {
            opacity: 1,
            duration: 0.9,
            stagger: 0.1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: panel,
              start: 'top 55%',
              end: 'bottom 45%',
              toggleActions: 'play reverse play reverse',
            },
          })
        })
      }

      const done = () => {
        lenis.start()
        const pre = document.querySelector('.preloader')
        if (pre) pre.style.display = 'none'
      }

      if (reduced) {
        rig.intro = 1
        done()
      } else {
        // The one orchestrated moment: line draws, curtain lifts, camera pushes in, headline arrives.
        gsap
          .timeline({ delay: 0.1 })
          .fromTo('.preloader__line', { scaleX: 0 }, { scaleX: 1, duration: 1.4, ease: 'power2.inOut' })
          .to('.preloader__brand', { opacity: 0, duration: 0.4 })
          .to('.preloader', { yPercent: -100, duration: 1.1, ease: 'power4.inOut' }, '>-0.1')
          .to(rig, { intro: 1, duration: 2.6, ease: 'power3.out' }, '<0.2')
          .to(
            '.panel--hero .reveal',
            { opacity: 1, duration: 1.2, stagger: 0.15, ease: 'power2.out' },
            '<0.6'
          )
          .add(done)
      }
    }, rootRef)

    return () => {
      ctx.revert()
      window.removeEventListener('pointermove', onMove)
      gsap.ticker.remove(tick)
      lenis.destroy()
    }
  }, [])

  const goToVisit = (e) => {
    // Keep the in-page smooth scroll for the nav link; let the email link open normally.
    if (e.currentTarget.getAttribute('href') === '#visit') {
      e.preventDefault()
      lenisRef.current?.scrollTo('#visit')
    }
  }

  return (
    <>
      <div className="preloader" aria-hidden="true">
        <div className="preloader__brand">ReJoyce</div>
        <div className="preloader__line" />
      </div>

      <div className="stage" aria-hidden="true">
        {webgl ? <Scene /> : <div className="stage__fallback" />}
      </div>

      <header className="nav">
        <a className="nav__brand" href="#top">
          ReJoyce
        </a>
        <a className="nav__link" href="#visit" onClick={goToVisit}>
          Book a viewing
        </a>
      </header>

      <div className="progress" aria-hidden="true">
        <span ref={barRef} />
      </div>

      <main className="scroll-root" id="top" ref={rootRef}>
        <Overlay />
      </main>
    </>
  )
}
