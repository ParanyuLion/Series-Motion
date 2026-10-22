# Visual style and camera rules

Update this file when the user changes the look.

## Look

- **Tone A, chosen by the user from two mockups:** steel grey, heavy dull sea, overcast sky, thin fog, desaturated. Light only from small sources (camp fire, shafts of light through cloud). The sky turns a sick yellow-green at the end of Part 1 (`stormAmount`).
- Characters are flat 2D side-on figures drawn in SVG (`src/island/Person.tsx`, data in `cast.ts`). They read as seven distinct people by silhouette and colour: beard, shades, cap, glasses, bun, dress, tie, backpack. Costumes get dirtier and torn as `dirt` rises (Irin's dress is the main storytelling device across parts).
- Poses: stand, walk, point, sit, lie. Faces smile via the `smile` prop. A front-facing bust for any character is `FaceFront.tsx`.
- No birds anywhere on the island (the narration says "ไม่มีนก"; it is a clue).

## Camera

- One continuous virtual camera over the beach, defined in `src/island/camera.ts` as keyframes (frame, focus x, focus y, zoom) built from manifest cues, so it follows the narration if audio changes. Screen anchor is (540, 820) so subjects sit above the subtitle band. A little handheld drift is always on.
- Part 1 shots: close-up on the waking hero then pull back to all seven; pan across the group; a **3.5 s aerial cut** of the island (`IslandAerial.tsx`) while the hero walks off-screen; tilt up the palm trunk to the flood stain; walk back; push to Irin; a **face-on close-up cut-in when Irin smiles**; swing to the hero; pull out as the sky changes.
- The user wants zoom variety and several angles so the picture is never static. Easy options: more cuts between wide, medium and close; a dutch tilt; a low angle with foreground; flipped images. Medium effort (a newly drawn scene each, reusing assets): from the sea looking at the beach, over the hero's shoulder as a silhouette, a top-down view of the group around the fire, into the jungle or hills behind the beach. Hard and not planned: turning characters around in 3D (would need front and back versions of every pose or a rebuild in Three.js).

## Light, shadow and depth (all done in Part 1; reuse)

- Light shafts and water glints through cloud, drifting fog bands, a low haze at the horizon, sea stacks on the horizon.
- Soft long cast shadows falling to the left (light comes from the upper right), plus a small contact shadow. Warm overlay light from the camp fire. Vignette, cool-top/warm-bottom split tone, subtle film grain (these are screen-space overlays at the end of `Part1.tsx`).
- Beach is detailed so it is never empty: wet-sand sheen, ripples, tide pools, pebbles, shells, seaweed, driftwood, boulders, bushes and swaying grass (`IslandDetails.tsx`), plus a screen-space foreground (palm fronds top right, rock bottom left, grass along the bottom) with parallax.
- Render time is about 6 minutes for a 63 s part because of the filters. Reduce grain or shadows first if it needs to be faster.

## Hard rules learned from feedback

- **Nothing floats.** Foreground decoration must touch an edge of the frame. A fern drawn at the left edge, not attached to the ground, was reported as a bug and removed.
- Keep figures above the subtitle band (feet above about y 1414 on screen) and name tags inside x 130 to 880. Name tags appear one at a time.
- Subtitles: Prompt 500, size 52, two lines maximum, 60 px left, 160 px right, 340 px bottom; a line longer than 56 Thai characters (spaces excluded) fails the check.
- A new beach scene needs the world drawn beyond the frame (x from -900 to 1980, y to 2420) because the camera pans and zooms.
- The map card sits near the top of the frame and appears after the aerial shot; it must show all four labels without overlap and Irin's camp lower than the high ground.
- Smooth transitions: Part 1 is one continuous scene with deliberate short fades at the hook cut and the aerial cut. Do not return to hard scene-to-scene cuts.
