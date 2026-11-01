import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'

// A procedural stand-in for the real product model. Swap it for a Blender GLB when you have
// one (see README). Units are arbitrary; the case radius is 1.
const TAU = Math.PI * 2

function drawDial(canvas) {
  const s = canvas.width
  const c = s / 2
  const ctx = canvas.getContext('2d')

  const base = ctx.createRadialGradient(c, c, 0, c, c, c)
  base.addColorStop(0, '#24573f')
  base.addColorStop(0.65, '#123325')
  base.addColorStop(1, '#07150e')
  ctx.fillStyle = base
  ctx.fillRect(0, 0, s, s)

  // Fine radial brushing, the "sunburst" that moves with the light
  ctx.save()
  ctx.translate(c, c)
  for (let i = 0; i < 720; i++) {
    ctx.rotate(TAU / 720)
    ctx.strokeStyle = `rgba(255,255,255,${i % 3 === 0 ? 0.05 : 0.018})`
    ctx.lineWidth = 1.1
    ctx.beginPath()
    ctx.moveTo(0, c * 0.08)
    ctx.lineTo(0, c)
    ctx.stroke()
  }
  ctx.restore()

  // Minute track
  ctx.save()
  ctx.translate(c, c)
  for (let i = 0; i < 60; i++) {
    ctx.rotate(TAU / 60)
    const major = i % 5 === 4
    ctx.strokeStyle = major ? 'rgba(230,201,143,0.95)' : 'rgba(230,201,143,0.45)'
    ctx.lineWidth = major ? s * 0.005 : s * 0.002
    ctx.beginPath()
    ctx.moveTo(0, -c * 0.965)
    ctx.lineTo(0, -c * (major ? 0.915 : 0.94))
    ctx.stroke()
  }
  ctx.restore()

  // Printed text
  ctx.fillStyle = '#e6c98f'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${s * 0.008}px`
  ctx.font = `500 ${s * 0.056}px "Bodoni Moda", Georgia, serif`
  ctx.fillText('ReJoyce', c, c - s * 0.2)
  ctx.font = `400 ${s * 0.02}px "Instrument Sans", system-ui, sans-serif`
  ctx.fillText('AUTOMATIC', c, c - s * 0.14)
  ctx.fillText('18K', c, c + s * 0.26)
}

function useDialTexture() {
  const tex = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 1024
    drawDial(canvas)
    const t = new THREE.CanvasTexture(canvas)
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = 8
    return t
  }, [])

  // Redraw once the web fonts are actually loaded so the dial text uses them.
  useEffect(() => {
    let alive = true
    if (!document.fonts) return
    Promise.all([
      document.fonts.load('500 48px "Bodoni Moda"'),
      document.fonts.load('400 24px "Instrument Sans"'),
    ])
      .then(() => {
        if (!alive) return
        drawDial(tex.image)
        tex.needsUpdate = true
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [tex])

  return tex
}

function Hand({ innerRef, length, tail, width, z, material, children }) {
  return (
    <group ref={innerRef} position-z={z}>
      <mesh position-y={(length - tail) / 2} material={material}>
        <boxGeometry args={[width, length + tail, 0.012]} />
      </mesh>
      {children}
    </group>
  )
}

export default function Watch(props) {
  const hour = useRef()
  const minute = useRef()
  const second = useRef()
  const dialTex = useDialTexture()

  const m = useMemo(
    () => ({
      gold: new THREE.MeshPhysicalMaterial({
        color: '#d9b46f',
        metalness: 1,
        roughness: 0.22,
        clearcoat: 0.4,
        clearcoatRoughness: 0.15,
        envMapIntensity: 1.3,
      }),
      polished: new THREE.MeshPhysicalMaterial({
        color: '#e3c07e',
        metalness: 1,
        roughness: 0.08,
        envMapIntensity: 1.6,
      }),
      crown: new THREE.MeshPhysicalMaterial({
        color: '#d9b46f',
        metalness: 1,
        roughness: 0.3,
        flatShading: true,
      }),
      dial: new THREE.MeshStandardMaterial({
        map: dialTex,
        roughness: 0.45,
        metalness: 0.25,
        envMapIntensity: 0.7,
      }),
      // Black glass that only adds reflections on top of what is behind it
      glass: new THREE.MeshStandardMaterial({
        color: '#000000',
        roughness: 0,
        metalness: 0,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        envMapIntensity: 3,
      }),
      leather: new THREE.MeshPhysicalMaterial({
        color: '#2a1a10',
        roughness: 0.55,
        clearcoat: 0.25,
        clearcoatRoughness: 0.5,
      }),
      stitch: new THREE.MeshStandardMaterial({ color: '#b99660', roughness: 0.8 }),
    }),
    [dialTex]
  )

  // Time is fixed at 6:35. The seconds hand still sweeps like an automatic movement.
  useFrame(() => {
    const d = new Date()
    const s = d.getSeconds() + d.getMilliseconds() / 1000
    const min = 35
    const h = 6 + 35 / 60
    if (second.current) second.current.rotation.z = -(s / 60) * TAU
    if (minute.current) minute.current.rotation.z = -(min / 60) * TAU
    if (hour.current) hour.current.rotation.z = -(h / 12) * TAU
  })

  return (
    <group {...props}>
      {/* Case */}
      <mesh rotation-x={Math.PI / 2} material={m.gold}>
        <cylinderGeometry args={[1, 1, 0.42, 160]} />
      </mesh>

      {/* Bezel */}
      <mesh position-z={0.21} material={m.polished}>
        <torusGeometry args={[0.93, 0.07, 48, 160]} />
      </mesh>

      {/* Dial */}
      <mesh position-z={0.22} material={m.dial}>
        <circleGeometry args={[0.88, 128]} />
      </mesh>

      {/* Hour markers */}
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * TAU
        const major = i % 3 === 0
        return (
          <mesh
            key={i}
            position={[Math.sin(a) * 0.66, Math.cos(a) * 0.66, 0.24]}
            rotation-z={-a}
            material={m.polished}
          >
            <boxGeometry args={[major ? 0.06 : 0.04, major ? 0.2 : 0.15, 0.035]} />
          </mesh>
        )
      })}

      {/* Hands: hour, minute, seconds */}
      <Hand innerRef={hour} length={0.45} tail={0.08} width={0.065} z={0.255} material={m.polished} />
      <Hand innerRef={minute} length={0.72} tail={0.08} width={0.045} z={0.27} material={m.polished} />
      <Hand innerRef={second} length={0.8} tail={0.18} width={0.012} z={0.285} material={m.gold}>
        <mesh position-y={-0.16} rotation-x={Math.PI / 2} material={m.gold}>
          <cylinderGeometry args={[0.03, 0.03, 0.012, 24]} />
        </mesh>
      </Hand>
      <mesh position-z={0.295} rotation-x={Math.PI / 2} material={m.polished}>
        <cylinderGeometry args={[0.04, 0.04, 0.03, 32]} />
      </mesh>

      {/* Domed crystal (base z = 0.30, dome radius 4) */}
      <mesh position={[0, 0, -3.5974]} rotation-x={Math.PI / 2} material={m.glass} renderOrder={10}>
        <sphereGeometry args={[4, 96, 24, 0, TAU, 0, 0.2269]} />
      </mesh>

      {/* Crown */}
      <mesh position={[1.04, 0, 0]} rotation-z={Math.PI / 2} material={m.gold}>
        <cylinderGeometry args={[0.07, 0.07, 0.1, 32]} />
      </mesh>
      <mesh position={[1.14, 0, 0]} rotation-z={Math.PI / 2} material={m.crown}>
        <cylinderGeometry args={[0.13, 0.13, 0.18, 20]} />
      </mesh>

      {/* Lugs */}
      {[
        [-1, 1],
        [1, 1],
        [-1, -1],
        [1, -1],
      ].map(([sx, sy]) => (
        <RoundedBox
          key={`${sx}${sy}`}
          args={[0.3, 0.5, 0.34]}
          radius={0.07}
          smoothness={4}
          position={[sx * 0.56, sy * 1.0, 0]}
          material={m.gold}
        />
      ))}

      {/* Strap, with stitching */}
      {[1, -1].map((dir) => (
        <RoundedBox
          key={dir}
          args={[0.98, 2.2, 0.14]}
          radius={0.05}
          smoothness={4}
          position={[0, dir * 2.05, -0.12]}
          rotation-x={-dir * 0.12}
          material={m.leather}
        >
          {[-0.41, 0.41].map((x) => (
            <mesh key={x} position={[x, 0, 0.072]} material={m.stitch}>
              <boxGeometry args={[0.012, 2.1, 0.004]} />
            </mesh>
          ))}
        </RoundedBox>
      ))}
    </group>
  )
}
