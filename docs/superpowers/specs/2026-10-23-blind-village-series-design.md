# Series 3 design (working title): "หมู่บ้านที่ทุกคนตาบอด" (for the user's approval)

Written 2026-10-23 from the user's own description in chat. Parts the user decided are marked **(user)**; the assistant's guesses and calls are marked **(call)** and listed again at the end. The workflow, the pipeline and the standing rules of `series-animation/SKILL.md` apply unchanged unless this document says otherwise.

## Intent

A short, vertical (9:16), Thai-narrated cartoon series for Instagram Reels and TikTok, all pictures drawn by code (Remotion SVG), one narrator speaking to the viewer as "คุณ" **(user)**. The genre is **unsettling horror that is frightening because something is wrong, not because of ghosts** **(user)**: no jump scares, no ghosts, no gore; fear comes from small abnormal details that the viewer notices before "you" can react, and from "you" having to act normal. Unpredictable: the story must keep turning the viewer's guess (the kind helper is a threat, the village is a stage, the escape is not an escape).

## The premise **(user)**

"You" wake up in a village in the middle of a forest with no memory of how you came there. Everybody in the village is blind. You can see. The village head welcomes you, says something like "มีคนมาที่นี่อีกแล้วหรอ", and asks whether you are blind too, because everybody here is. You do not tell the truth and answer yes. The head walks you around the village. Everyone wears the same shirt: a pattern of a snake with a human head. You are frightened by the pattern but must behave normally, for fear that they find out you can see.

## The truth behind it (user, told only at the end, never explained in full)

- The village is a place where **snakes with human heads** keep humans to watch them for entertainment. The villagers' shirt pattern shows the ones who bring humans here.
- The snakes made every villager blind in the beginning, to see how humans live blind in a village in the forest.
- The snakes then **let people who can see arrive on purpose, at random**. The first seeing people vanished in the forest (the snakes took them).
- The villagers, afraid of losing people, **began to make the "slipped through" seeing newcomers blind themselves**, out of care, to stop them vanishing. They tell "you" so openly ("we once made someone blind so that he would not disappear"), kindly, as the most natural thing. **The seeing newcomers were not a mistake: the snakes meant them (user, correction).**
- **The village head is the first person who could see (user).** He vanished in the forest and the snakes turned him into one of them; he wears a human shape as the blind village head. He is a snake in disguise who knew from the first minute that "you" can see, and the ending is "you" and the head talking in snake form (user).
- "You" amuse the snakes more than anyone before. At the end "you" escape the forest and go home, but the snakes, delighted, **turn "you" into one of them: a snake with a human head** (user). That is what comes home with "you". The recurring shirt pattern now reads as the picture of what "you" are becoming.

## Story rules (call, except where marked)

- **The abnormal, never the supernatural effect:** the scary tells are things like the blind villagers walking too surely, everyone turning their face toward "you" at the same moment, eyes that are clouded white while the hands never fumble, the same pattern on every shirt and on the walls and cups, a village with no mirrors, no doors that close, no one ever calling anyone's name, the head's sentences that mean two things (the line "ถ้าคุณมองเห็น เราคงลำบากกันน่าดู" is kindly meant and also a threat).
- **"You" must never show that they can see.** The rule gives every scene its tension: eyes do not follow things, no flinch at a sudden thing, no reaching for what only a seeing person would find. The viewer must always know what "you" see that the others cannot.
- **Violence is only told or implied** (a silhouette, a sound, a sentence); blinding is never drawn.
- Every part opens with a spoken hook "จะเกิดอะไรขึ้น ถ้าคุณ..." that does not give away the part's event, and ends on an unresolved, more frightening moment (the standing rules).
- **Quiet:** the sound bed is mostly forest ambience (insects, wind, distant birds) with sudden pauses and low drones, not loud stingers; silence is allowed only as a short deliberate beat (viewer feedback: long silences lose focus), and the pacing stays tight.

## Format

- 5 parts, each about **1:30 (user: 90 s)**, plus the usual 4.5 s outro card; roughly 14 to 16 narration lines per part (about 56 Thai characters per subtitle line at most, two lines, safe area as in the skill). Verify range is raised to 80 to 100 s and the story must end by about 96 s (call). The pipeline, the Vertex TTS backend, the manifest-driven cues and the per-line cache are reused.
- Narrator: the same pipeline; the voice and delivery are tested with a sample first because this series needs a calmer, colder tone than the zombie series (call). The voice is not changed without the user's say.
- **New cast and art direction (call):** **dull, drab and gloomy (user): desaturated grey-green overcast light, dark forest, a village of plain wooden huts with a covered well and a long communal table, muted ochre, heavy vignette and grain;** the villagers' eyes are drawn clouded pale white (no pupils); "you" are the only person with eyes that have pupils, which makes the secret visible in every shot. The shirt pattern is drawn as one repeatable tile. The existing `Passenger` rig is reused for people (new cast data and an eye style) and a new rig for the snakes (a long body with a human head, drawn in a few stylised poses). A face-on close-up of "you" is used at the key beats (as in the skill).

## Parts

1. **"ตื่นขึ้นมา" (the arrival):** you wake up with no memory; the head's welcome, the question "ตาบอดใช่มั้ย", your lie; a walk through the village; the same pattern on every shirt; a first small wrong thing (everyone turns toward you together). Ends with you starting to be afraid but smiling at the head. (user: welcome, question, walk, pattern)
2. **"คนที่มองเห็น" (the story of the seeing man):** at the communal table the head tells of the man who could see and came before you; the foraging trip in the forest with blind helpers; the man saw something, ran and vanished forever; the line "ถ้าคุณมองเห็น เราคงลำบากกันน่าดู"; and the villagers openly say they once made a seeing newcomer blind so that he would not vanish. The villagers only mention it, as a kind memory; nobody offers anything to "you". Ends on the quiet moment after the story, when the head asks everyone to be glad that "you" cannot see, and you realise what would happen if they found out. (user: the story and that the villagers only talk about it; call: the ending beat)
3. **"คืนแรก" (living blind):** a night and a day of pretending: eating, being led, a game or a ritual that tests you (a villager sets something where only a seeing person would step around it), small tells accumulate; you learn the village has watchers in the trees at the edge; you decide to leave. (call: the whole part, because the story needs the middle)
4. **"ป่า" (the forest):** you look for the way home; you see a crowd of snakes with human heads clinging to the trees, watching you; you remember the head's story and keep pretending to be blind; you walk past them. (user)
5. **"ทางกลับบ้าน" (the way home):** you get out of the forest, a road, home; relief for a short time; then the changes (the shirt pattern appears on your own clothes or skin, your reflection); the last image shows what comes home with you. (user: escape and the thing that comes with you; the snakes were delighted with you)

## Goals, non-goals, anti-goals

- **Goals:** a series that is genuinely uneasy; each part has a visible, nameable abnormal detail the viewer can talk about in comments; the lie is the engine; the ending lands without lengthy explanation.
- **Non-goals:** no ghosts or monsters that jump; no gore; no explanation of the snakes' reason beyond "entertainment" and the ending's conversion; no open-source release yet.
- **Anti-goals (would make it a failure even if it works):** a loud jump-scare feel; the villagers being plain villains; "you" doing something a seeing person could not hide without the story noticing; a part that explains too much too early.

## What is left to the builder (call)

Names of the head and a few recurring villagers (the head, an old cook, a child, a recently blinded man); the tile of the shirt pattern; the exact tests in part 3; the form of the snakes' bodies; the sound palette; the exact opening hook lines (each part's script is written and approved in chat first, as always).

## The assistant's calls (the user may overrule)

"You" are an adult with plain everyday clothes and no stated gender (second person); the villagers' eyes are clouded white so that "you" are the only one with pupils; the part-3 story (the night, the tests); the part-2 ending beat (the head says they are glad that "you" cannot see); the calmer, colder narrator delivery to be tested; the 80 to 100 s verify range; the palette and the village's look; the quiet sound design; the story's "never show you can see" rule; the existing skill rules apply (including no dead silence, the safe area, implied violence, per-platform captions).
