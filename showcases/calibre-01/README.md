# Halden Calibre 01: 3D scroll site starter

A single-page, scroll-driven 3D product site: a lit gold watch, camera moves tied to scroll, smooth scrolling, post-processing, and a preloader. The brand, copy and watch are placeholders.

Stack: Vite, React, Three.js via React Three Fiber and Drei, GSAP ScrollTrigger, Lenis.

## Run it

```bash
npm install react react-dom three @react-three/fiber @react-three/drei @react-three/postprocessing postprocessing gsap lenis
npm install -D vite @vitejs/plugin-react
npm run dev
```

Open the URL Vite prints. `npm run build` makes the production bundle.

If a dependency complains about React or three versions, install the versions its peer dependencies ask for. R3F 9 pairs with React 19.

## Where to change things

| To change | Edit |
| --- | --- |
| Camera moves, watch angle, framing per section | `src/stops.js` |
| Words | `src/Overlay.jsx` |
| Colours, type, layout | `src/styles.css` |
| Reflections and lighting | `Studio` in `src/Scene.jsx` |
| Bloom, grain, vignette | `EffectComposer` in `src/Scene.jsx` |
| The watch itself | `src/Watch.jsx` |

`stops.js` has one entry per section. The page scrolls through them in order and the camera eases between them. Each field is explained at the top of that file.

## Replace the procedural watch with your Blender model

1. In Blender, export a GLB with PBR materials (File > Export > glTF 2.0).
2. Compress it: `npx gltfpack -i watch.glb -o public/watch.glb -cc -tc` (Meshopt plus KTX2 textures).
3. In `Watch.jsx`, load it:

```jsx
import { useGLTF } from '@react-three/drei'
useGLTF.preload('/watch.glb')

export default function Watch(props) {
  const { scene } = useGLTF('/watch.glb')
  return <primitive object={scene} {...props} />
}
```

For the hands to keep moving, give them their own objects in Blender (named `hour`, `minute`, `second`, origin at the centre of the dial) and rotate them with `scene.getObjectByName('second')` in a `useFrame`.

For real loading progress, use drei's `useProgress` in the preloader instead of the timed line.

## Performance and accessibility built in

- `PerformanceMonitor` drops post-processing and resolution if the frame rate falls.
- The scene state lives in a plain object (`src/rig.js`), so scrolling never re-renders React.
- Text is real HTML. `prefers-reduced-motion` turns off smooth scrolling, the intro and the fades.
- With no WebGL, the page falls back to a gradient and the text still works.
- Portrait screens move the watch above the text and pull the camera back.
