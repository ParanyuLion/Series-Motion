# BTS zombie series: design

Status: draft for the user's approval. Nothing is built yet. This replaces the island survival series as the series being made now; the island series is paused and its Part 1 stays in the repository untouched.

## Intent

A short-video series for Instagram Reels and TikTok in the format "what would happen if you were on the BTS (Bangkok Skytrain) with zombies, and had to survive". It is told in Thai, in the second person: a narrator speaks to the viewer as "คุณ", and the picture follows a male university student who stands in for "you". The hook is the title itself and the feeling that it could happen to the viewer on a train they actually ride. Viewers should be excited the whole way, and each part should leave them wanting the next.

## Goals

- 5 parts of about 60 seconds each (a few seconds over is fine), plus a 4.5 second outro that says to watch the next part (the outro is on top of the 60 seconds). Vertical 9:16.
- Each part carries 3 to 5 significant events, so a clip never has a slow stretch. The user asked for more content per clip than a first draft had.
- Every part ends on an unresolved moment. The series ends in relief mixed with danger (see Ending).
- All pictures are drawn by code (SVG animated in Remotion), as in the island Part 1. One AI narrator speaks Thai.
- Excitement comes from an infection that spreads through the train, and from people fighting to survive.
- Part 1 has an opening hook animation; each part carries explainer graphics (see Explainer graphics).

## Non-goals and anti-goals

- Not a faithful simulation of the real BTS: the story's rules below win over reality where they differ.
- No graphic gore: bites and deaths are implied (silhouettes, sound, cuts, the narrator's reaction), both for platform rules and because the user's style has been dark but not gory.
- No AI-generated video clips and no separate character voices (see Voice).
- Anti-goals: a slow part with one event; zombies who feel fast or unstoppable (they are slow, the danger is being cornered); infection that is not clear to the viewer; the viewer losing track of who is where in the train.

## World rules (all from the user)

- The story starts as "you" board the BTS at Siam on the way to class. As the doors close, one passenger turns into a zombie. Nobody gets out in time.
- Zombies walk slowly. A bite infects. A bitten person turns into a zombie after exactly 1 minute (so the clock matches the length of a clip). A bitten person may try to hide the bite.
- The train's cars are joined by an open walkway, with no doors between them. Zombies and survivors can walk through the whole train.
- The driver was told there were zombies, walked out of the cab to look, was bitten, thought he was fine and went back to drive on. He turned into a zombie inside the cab. His body keeps the train moving (the assistant's guess: it is slumped on the throttle). The train does not stop at stations.
- The cab door opens from both the inside and the outside. The cab is the one space that can be closed off.
- Goal of the survivors: reach the cab at the front, deal with the driver, stop the train and open the doors.

## Ending (from the user)

When the train stops and the doors open, the survivors are glad to be alive but must run at once. The series closes on relief and danger together, not on a clean resolution. The assistant's guess, to be developed by the builder and approved by the user: a few survivors (3 to 4) flee while the zombies from the train follow, and the outside is not entirely safe either, which opens a second season.

## Character

- **"You":** a male university student on the way to class. **He has a near-bite (the user's answer: "เกือบถูกกัด"):** a zombie's teeth catch his sleeve or bag strap and for a moment he, and the viewer, fear he is bitten; he checks his arm and the skin is unbroken. It is a scare, not an infection, so the series keeps its protagonist but the stakes are real. It is placed in Part 4 (the assistant's call). Drawn in a white long-sleeve shirt, a green tie, black trousers, with a backpack and a student lanyard (the user's choice). He has only what is in his bag. The narrator speaks to the viewer as "คุณ" and describes what "you" do.
- **Other passengers (the assistant's proposal, not yet approved):** an office worker, an older woman, a schoolboy, a foreign tourist, and others as the story needs, each with a distinct silhouette and colour so they stay readable at phone size. The builder proposes names and roles with the Part 1 script and the user approves them.

## Look and feel (decided unless marked)

- Interior of the train as an animated side view, bright morning light (the user picked option A, "bright like a real car in the morning") with **yellow seats** (the user's change). The real BTS look is adapted, not copied.
- The city passes outside the windows with parallax. Station name boards pass by even though the train does not stop.
- Characters are flat 2D figures like the island series, reusing the rig and the front-facing close-up from the island code where possible. Zombies are slow: heads tilted, arms forward, pale green-grey skin, little blood.
- The bite and the 1 minute: an on-screen countdown for the bitten person; the skin goes pale, sweaty, then veined, then turned.
- Camera: continuous moving camera with zoom, several angles, and a face-on close-up at key moments, as the user has asked for in the island series. A rule from the island series applies here too: nothing floats, and the picture is never empty.
- Safe area and subtitles: as in the island series (burned-in Thai subtitles, 60 px left, 160 px right, 340 px bottom, figures above the subtitle band).

## Explainer graphics

- A map of the whole train, car by car, showing where "you" and the survivors are, where the infected are, and how many remain, updating through each part. This is the counterpart of the island map in Part 1.
- The bite countdown (60 seconds) on screen.
- Station name boards passing the windows, with a running sense of how far the train is from the end of the line.
- (The assistant's guess) short "rules" cards for the viewer, such as "ถูกกัด = 1 นาที".

## Voice (guesses, to be confirmed)

- One narrator in Thai, second person ("คุณ"), short present-tense sentences. The assistant proposes Gemini voice **Charon** (as in the island series), and a question to the viewer at the end of a part ("ถ้าเป็นคุณ จะ...?") to invite comments.
- The island series rule is kept: only a woman speaking aloud would get Gemini voice **Leda** inside the narration line; other characters have no voices of their own, and the narrator reports what they say.
- Narration budget: about 400 Thai characters per part at the chosen speed (measured on the island Part 1: about 7.5 characters per second, excluding spaces). With 3 to 5 events per part, more information must be carried by the picture, the countdown, the map and short on-screen text instead of narration.

## Plan of the five parts (the assistant's proposal, revised for 3 to 5 events per part; not yet approved)

Each part lists its events; the builder expands them in the script.

1. **ประตูปิด:** (a) the hook: doors close at Siam, a passenger turns; (b) the first bite, the first 1-minute clock; (c) panic, people trapped in the car; (d) "you" retreat to the end of the car; (e) the driver says over the speakers he will come and look. Ends as the cab door opens and he steps out.
2. **คนขับ:** (a) the driver walks through the car and is bitten; (b) he says "ไม่เป็นไร" and goes back to the cab; (c) "you" see the bite and say so, nobody believes it; (d) the first person who hid a bite turns; (e) the train does not stop at the next station, no announcement.
3. **รถไม่จอด:** (a) stations pass without stopping; (b) the group splits and argues; (c) a bitten friend, the 60 second clock: do you push them away?; (d) the survivor count drops; (e) through the cab glass, the driver is slumped over the controls.
4. **ฝ่าไปหัวขบวน:** (a) the plan: move car by car to the cab; (b) improvised tools (umbrella, fire extinguisher, bags); (c) a car full of zombies, a clever way past; (d) a death, and "you" have the near-bite scare; (e) the cab door is in front of them and the horde is behind.
5. **ห้องคนขับ:** (a) open the cab door; (b) the zombie driver; (c) get him off the throttle; (d) pull the brake, the train slows; (e) it stops, the doors open: relief, then run (open ending).

## Constraints

- Same toolchain as the island series: Remotion 4 in `E:\Coding\animation\Remotion`, Windows 11, narration from Gemini TTS through the key in `Remotion/.env`, music and effects synthesised in code, loudness between -20 and -14 LUFS. The steps are recorded in `series-animation/references/pipeline.md`; the standing preferences and lessons are in `series-animation/SKILL.md`.
- Gemini free-tier limits: about 10 requests per day per model; plan generation around that (cached lines, one model per run).
- Code is committed and pushed to the `main` branch of the Series-Motion repository. The `series-animation` skill's references must be updated with this series' decisions and feedback.
- One part at a time, with the Thai script approved by the user in chat before any animation is built.

## Assistant's calls (settled after the builder check; the user may overrule any)

- **Hook length:** the opening hook animation of Part 1 sits inside the roughly 60 seconds (about the first 6 seconds, with the first narration line playing over it); only the outro is on top.
- **Mostly visual events:** a part may have events with no narration at all (the countdown, the map update, the station boards, the rules cards, a reaction shot). Part 1 also has to teach the rules (slow zombies, bite, 1 minute, open walkway); it does this through the picture and on-screen text first, narration second.
- **The 1 minute clock is a story device, not real time on screen.** The countdown is shown on screen, and a scene may cut away and come back; a bite near the end of a part may resolve in the next part (this is also a cliffhanger tool).
- **Train geometry:** 4 cars joined by an open walkway, shown on the map as one long strip. "You" board at car 3 and retreat toward the rear (car 4) in Part 1; the cab is at the front of car 1, so the survivors cross three cars toward the front in Part 4.
- **The driver in Part 5:** he is knocked down with the fire extinguisher (implied: a silhouette and a sound, then the narrator's reaction), dragged off the throttle and shut out of the cab; the survivors then brake. No graphic detail.
- **The final scene:** a simple platform with a few implied threats is enough; no larger outdoor set is budgeted.
- **Rig:** whether the island rig can be reused for the student, passengers and slow zombies is for the builder to check in the repository.

- **The near-bite:** in Part 4, a zombie's teeth catch the student's sleeve or bag strap; a shot of the countdown number appears as the viewer's fear, then the skin is shown unbroken. No real infection clock runs on him.

## Proposed cast and fates (not yet approved by the user)

| Character | Role | Fate |
|---|---|---|
| "You" (the student) | The viewer's stand-in. | Survives. |
| พี่นุ่น | Calm office worker; helps "you" plan. | Survives. |
| ไมค์ | Foreign tourist who does not speak Thai; shows how confusing it is. | Survives. |
| น้องเต้ย | Schoolboy "you" befriend in Parts 1 and 2. | Bitten in Part 3: "you" must decide; turns in Part 4. |
| ป้าสมจิตร | Older woman, kind but slow. | Holds a door so the others get through; dies in Part 4. |
| ลุงประเสริฐ | Middle-aged man who hides his bite. | Turns in Part 2. |
| The driver | Not a passenger. | Part 2: bitten; Part 5: the zombie in the cab. |

Three survive. The assistant proposes this list so the builder can size the art and the map; the user approves or changes it with the Part 1 script.

## Left to the builder

- The Thai scripts for each part, the on-screen title of each clip, the names and roles of the passengers (proposed to the user with the Part 1 script).
- The exact layout of the train, the map graphic, the staging and camera work, the opening animation of Part 1.
- The sound design: train motion, announcements, the 1-minute countdown, zombie sounds.
- How the train interior is drawn from a side view, how the windows move, and how the drawing is reused across all parts.
- Whether to rebuild or extend the island rig so the student, the zombies and the passengers are distinct and animate well.

## Open items

- The narrator's voice (Charon proposed) and the closing question at the end of each part are the assistant's proposals.
- The ending's final image and the cast beyond "you" are not decided.
- The series' working title is "จะเกิดอะไรขึ้นถ้าคุณอยู่บน BTS ที่มีซอมบี้" (from the user's words); the on-screen title is for the builder to propose.
