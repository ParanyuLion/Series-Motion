# Series bible: BTS zombie series (the series being made now)

Full design: `docs/superpowers/specs/2026-10-22-bts-zombie-series-design.md`. Part 1 script draft: `docs/superpowers/specs/bts-part1-script-draft.md`. The island series (`series-bible.md`) is paused; its Part 1 stays in the repository.

## Concept

"จะเกิดอะไรขึ้นถ้าคุณอยู่บน BTS ที่มีซอมบี้". Second-person narrator ("คุณ"), a male university student is "you" (white long-sleeve shirt, green tie, black trousers, backpack, lanyard). 5 parts of about 60 s + a 4.5 s outro; 3 to 5 significant events per part (the user asked for denser clips); the hook animation is inside the 60 s of Part 1.

## World rules (from the user)

- You board the BTS at Siam to go to class; as the doors close one passenger turns; nobody escapes.
- Zombies are slow. A bite infects. A bitten person turns after exactly 1 minute and may hide the bite.
- Cars are joined by an open walkway. The driver was told about zombies, went out to look, was bitten, thought he was fine, went back to the cab and turned there; his body keeps the train running; the train does not stop at stations. The cab door opens from both sides.
- Goal: reach the cab, deal with the driver, stop the train, open the doors. Ending: relieved but must run at once; open for a second season.
- "You" has a near-bite in Part 4 (a scare, no real infection).

## Look

Bright morning interior with **yellow seats** (the user picked option A and changed the seats to yellow); the city passes outside the windows with parallax. Slow zombies: head tilted, arms forward, pale green-grey skin, little blood; implied violence only. On-screen graphics: the 60 s countdown, a map of the 4-car train showing who is where, station boards. Camera and style rules from `visual-style.md` apply (continuous camera, face-on close-ups, nothing floats, never empty).

## Cast and fates (approved with the design)

"You" (survives); พี่นุ่น (office worker, survives); ไมค์ (tourist, survives); น้องเต้ย (schoolboy, bitten Part 3, turns Part 4); ป้าสมจิตร (older woman, holds a door, dies Part 4); ลุงประเสริฐ (hides a bite, turns Part 2); the driver (bitten Part 2, the zombie in the cab in Part 5, knocked down with the fire extinguisher, implied). Part outline in the design document.

## Voice

Narrator: Gemini Charon proposed (as in the island series), second person, with a question to the viewer at the end of a part. A woman speaking aloud would use Leda. Other characters have no voices; the narrator reports what they say.

## Opening line of every part

The first spoken sentence is the hook, in the form "จะเกิดอะไรขึ้น ถ้าคุณ..." and it names the zombies. Part 1: "จะเกิดอะไรขึ้น ถ้าคุณอยู่บน BTS ตอนซอมบี้เข้ามาพอดี" (the user's own wording).


## Part 2 "คนขับ" (v2 built 2026-10-23; script approved by the user, the first version was replaced)

Title card: "คนขับเดินเข้าไปเตือน... ซอมบี้". Hook (the user's wording): "จะเกิดอะไรขึ้น ถ้าคุณเห็นคนขับ BTS เดินเข้าไปเตือนซอมบี้". Events: the driver (healthy, cap, navy uniform) hears the commotion, walks in from the front (left), goes up to the two Part 1 zombies and raises a hand to warn them, then realises something is wrong (face-on close-up: the smile fades to shock); the survivors shout at him to run; he turns too late and the zombie in front of him loses its balance and falls forward onto him (zombies never jump; the user's idea) and bites a fingertip (silhouette, small red mark); he panics and runs back to the cab, the door shuts (insert); a viewer-only 60 s clock "คนขับ" runs to 0:00; "you" know, nobody believes you ("it is only a fingertip"); ลุงประเสริฐ (bitten in the panic of Part 1) sits pale and sweating, the clock hits 0:00 and he rises as the third zombie; the others flee toward the walkway; the train passes เพลินจิต (the station after ชิดลม) without stopping, the speaker stays silent (the sound bed drops out for that one line), final question "ถ้าเป็นคุณ จะเข้าไปในห้องคนขับไหม". Outro: "ตอนต่อไป: รถไม่จอด... และคนในตู้เริ่มแตกกัน", "ติดตามตอนที่ 3".

Continuity for Part 3: the survivors (you, พี่นุ่น (id `nun`), น้องเต้ย (`nueng`), ไมค์, ป้าสมจิตร) run from the walkway end of car 3 through it into car 4; the three zombies (man, woman, uncle) shamble slowly after them; the driver is in the cab and turning; the train does not stop. Staging used in `src/bts2/Part2.tsx`: uncle on the bench at x 1230, nun 1330, you 1430, nueng 1530, mike 1620, aunt 1700; the walkway starts at x 1760.

## Part 3 "รถไม่จอด" (built 2026-10-23; script approved by the user)

Title card: "รถไม่จอด... แล้วทุกคนเริ่มเถียงกัน". Hook: "จะเกิดอะไรขึ้น ถ้าคุณหนีซอมบี้ ในรถไฟที่ไม่มีวันจอด". Events: a platform with waving people and three station boards (นานา, อโศก, พร้อมพงษ์) flash past; the three zombies (man, woman, uncle) come out of the walkway into car 4 (the last car; its walkway to car 3 is at the LEFT end, so the interior is drawn mirrored) while the survivors back away to the rear; map card (cab at the front of car 1, survivors in car 4, three zombies in car 3); พี่นุ่น wants to go to the front to stop the train, ไมค์ refuses; they quarrel and ไมค์ shoves พี่นุ่น (the user's idea: the quarrel causes the bite); she staggers into น้องเต้ย, who falls in front of the nearest zombie; silhouette and sound: a zombie bites his wrist; a real-time clock "น้องเต้ย" runs to the end of the part (still running: cliffhanger); card "ผู้รอดชีวิต 5 → 4"; ป้าสมจิตร goes to him, ไมค์ says to push him out; face-on close-up of "you" deciding; a perspective view down the three cars to the cab: the driver slumped over the controls; the final question "ถ้าเป็นคุณ จะผลักน้องเต้ยออกไปไหม". Outro: "ตอนต่อไป: ฝ่าไปหัวขบวน...", "ติดตามตอนที่ 4".

Continuity for Part 4: the five survivors (you, พี่นุ่น `nun`, ไมค์ `mike`, ป้าสมจิตร `aunt`, น้องเต้ย `nueng`, bitten, about 0:45 left on the clock) are at the rear of car 4 (positions x 1420 to 1870, rear wall at x 2000 in `src/bts3/Part3.tsx`); the three zombies shamble slowly toward them from the walkway; the driver is slumped in the cab (turned, or turning). The decision about น้องเต้ย (push him out or not) is resolved at the start of Part 4; he turns in Part 4 (design). Part 4 plan: move car by car to the cab, improvised tools, a car full of zombies, a death (ป้าสมจิตร holds a door) and the near-bite of "you".

