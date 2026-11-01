import { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Lightformer, PerformanceMonitor } from '@react-three/drei'
import { EffectComposer, Bloom, Noise, Vignette, ToneMapping } from '@react-three/postprocessing'
import { BlendFunction, ToneMappingMode } from 'postprocessing'
import { MathUtils, Vector3 } from 'three'
import Watch from './Watch.jsx'
import { rig } from './rig.js'

const { damp } = MathUtils
const TAU = Math.PI * 2

// Reads the shared `rig` (written by GSAP on scroll) and eases the camera and watch toward it.
function Rig() {
  const group = useRef()
  const look = useRef(new Vector3())
  const spin = useRef(0)
  const first = useRef(true)

  useFrame((state, delta) => {
    const { camera, size, clock } = state
    const dt = Math.min(delta, 0.05)
    const aspect = size.width / size.height

    // Portrait screens: centre the shot, lift the watch above the text, pull the camera back
    const portrait = aspect < 0.9
    const ox = portrait ? 0 : rig.ox
    const oy = portrait ? -0.85 : 0
    const zf = aspect < 1 ? 1 + (1 - aspect) * 0.9 : 1
    const introK = 1 - rig.intro

    const want = {
      x: rig.px + ox + rig.mx * 0.12,
      y: rig.py + oy + rig.my * 0.08,
      z: rig.pz * zf + introK * 2.5,
      lx: rig.tx + ox,
      ly: rig.ty + oy,
      lz: rig.tz,
    }

    if (first.current) {
      camera.position.set(want.x, want.y, want.z)
      look.current.set(want.lx, want.ly, want.lz)
      first.current = false
    } else {
      const k = 4
      camera.position.x = damp(camera.position.x, want.x, k, dt)
      camera.position.y = damp(camera.position.y, want.y, k, dt)
      camera.position.z = damp(camera.position.z, want.z, k, dt)
      look.current.x = damp(look.current.x, want.lx, k, dt)
      look.current.y = damp(look.current.y, want.ly, k, dt)
      look.current.z = damp(look.current.z, want.lz, k, dt)
    }
    camera.lookAt(look.current)

    if (Math.abs(camera.fov - rig.fov) > 0.001) {
      camera.fov = damp(camera.fov, rig.fov, 4, dt)
      camera.updateProjectionMatrix()
    }

    // Idle turntable. When it stops, settle back to the nearest whole turn.
    if (rig.spin > 0.01) spin.current += rig.spin * dt
    else spin.current = damp(spin.current, Math.round(spin.current / TAU) * TAU, 2.5, dt)

    const g = group.current
    g.rotation.x = damp(g.rotation.x, rig.rotX - rig.my * 0.08, 4, dt)
    g.rotation.y = damp(g.rotation.y, rig.rotY + rig.mx * 0.14 + spin.current - introK * 0.9, 4, dt)
    g.rotation.z = damp(g.rotation.z, rig.rotZ, 4, dt)
    g.position.y = Math.sin(clock.elapsedTime * 0.9) * 0.03
  })

  return (
    <group ref={group}>
      <Watch />
    </group>
  )
}

// Soft boxes. The reflections these make on the gold and glass are most of the "luxury" look.
function Studio() {
  return (
    <Environment resolution={512} frames={1}>
      <Lightformer form="rect" intensity={5} color="#fff4e0" position={[0, 5, -1]} rotation-x={Math.PI / 2} scale={[12, 1.6, 1]} />
      <Lightformer form="rect" intensity={3} color="#ffffff" position={[-6, 1, 1]} rotation-y={Math.PI / 2} scale={[2, 9, 1]} />
      <Lightformer form="rect" intensity={2.5} color="#ffd9a3" position={[6, -0.5, 2]} rotation-y={-Math.PI / 2} scale={[1.5, 7, 1]} />
      <Lightformer form="rect" intensity={1} color="#ffffff" position={[0, -4, 2]} rotation-x={-Math.PI / 2} scale={[8, 2, 1]} />
      <Lightformer form="ring" intensity={1.5} color="#9fc9b4" position={[0, 0, -7]} scale={7} />
    </Environment>
  )
}

export default function Scene() {
  const [dpr, setDpr] = useState(1.5)
  const [quality, setQuality] = useState('high')

  return (
    <Canvas
      dpr={dpr}
      camera={{ fov: rig.fov, near: 0.1, far: 50, position: [0, 0.1, 8.3] }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      <color attach="background" args={['#0b1512']} />

      {/* If the frame rate drops, shed the post-processing and lower the resolution. */}
      <PerformanceMonitor
        onDecline={() => {
          setQuality('low')
          setDpr(1)
        }}
      />

      <Studio />
      <Rig />

      {quality === 'high' && (
        <EffectComposer multisampling={4}>
          <Bloom intensity={0.35} luminanceThreshold={0.9} luminanceSmoothing={0.2} mipmapBlur />
          <Noise opacity={0.03} blendFunction={BlendFunction.SOFT_LIGHT} />
          <Vignette offset={0.2} darkness={0.85} />
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        </EffectComposer>
      )}
    </Canvas>
  )
}
