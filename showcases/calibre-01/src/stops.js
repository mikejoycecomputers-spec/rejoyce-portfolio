// Camera and watch choreography: one entry per page section, in scroll order.
// This is the file you art-direct. Edit numbers, save, and the page updates.
//
//   px py pz  camera position
//   tx ty tz  point the camera looks at
//   rotX/Y/Z  watch rotation (radians). Negative rotY turns the crown toward the viewer.
//   fov       lens. Lower = tighter, more "product photography".
//   ox        sideways shift of the whole shot. Negative puts the watch on the right
//             of the screen (text on the left); positive puts it on the left.
//   spin      idle turntable speed (radians/second)
export const STOPS = [
  // Hero: text left, watch right
  { px: 0, py: 0.1, pz: 5.8, tx: 0, ty: 0, tz: 0, rotX: 0.04, rotY: -0.32, rotZ: 0, fov: 32, ox: -1.0, spin: 0 },
  // Dial: text right, watch left, close
  { px: 0, py: 0.1, pz: 3.8, tx: 0, ty: 0.05, tz: 0.2, rotX: 0, rotY: 0.12, rotZ: -0.05, fov: 32, ox: 0.75, spin: 0 },
  // Crown macro: text left, crown on the right
  { px: 2.3, py: 0.3, pz: 2.9, tx: 0.7, ty: 0, tz: 0.8, rotX: 0.08, rotY: -0.9, rotZ: 0, fov: 28, ox: -0.6, spin: 0 },
  // Case profile: text right, watch tilted to show thickness and strap
  { px: 0, py: -0.2, pz: 6.0, tx: 0, ty: -0.3, tz: 0, rotX: 0.5, rotY: 0.7, rotZ: 0.12, fov: 30, ox: 0.9, spin: 0 },
  // Finale: centred, slow turntable
  { px: 0, py: 0, pz: 8.0, tx: 0, ty: 0, tz: 0, rotX: 0, rotY: 0, rotZ: 0, fov: 32, ox: 0, spin: 0.3 },
]
