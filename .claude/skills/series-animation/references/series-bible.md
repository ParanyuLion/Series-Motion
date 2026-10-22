# Series bible: island survival series

Update this file when the story, cast or voice decisions change.

## Concept and hook

Seven strangers wake up on a deserted island with no explanation. The hero is right but is mocked and undermined; the others hesitate to side with him, which is what keeps viewers watching (frustration as the engine). Mood: bleak, hopeless, quiet. Platforms: Instagram Reels and TikTok, 9:16. Each part is about 60 s (a few seconds over is fine) plus a 4.5 s outro that says to watch the next part. Every part ends on an unresolved question. Part 1 also has an opening hook animation (a flash-forward of the storm and a hand slipping out of frame, then the title card).

The whole island mystery (why they are here) stays unresolved for a later season; give a new clue in each part.

## Cast (names approved by the user with the Part 1 script)

| Character | Role |
|---|---|
| นที (hero, narrator "ผม") | Fisherman, knows the sea and the island. Handsome, bearded, muscular. Right but ignored. |
| ไอริณ (villain) | Rich young woman, beautiful, always indulged, never told she is wrong. Not a murderer: her ego gets people killed and she deflects blame. Her dress gets dirtier each part. She survives; her guilt and her denial are the lasting consequence. |
| ก้อง | Bodyguard, loyal to Irin. Dies in part 4. |
| เจ | Content-creator teen, thinks he knows best. Dies in part 2. |
| คุณวิชัย | Middle-aged businessman, backs whoever has connections. Dies in part 3. |
| พลอย | Nurse, privately believes the hero. Survives. |
| ต้น | Frightened student, wavers; the deciding vote in part 4. Survives. |

Four survive (นที, ไอริณ, พลอย, ต้น). People who die are always ones who ignored the hero's warning. Acceptance of the hero grows in visible steps, not all at once.

## The five parts (approved outline; details inside each part are written and approved one at a time)

1. **ตื่น** (done): wake on the beach, the hero reads the danger (no birds, no waves, a waterline stain on the trees higher than his head), Irin brushes the warning off and takes charge, the sky changes colour. Outro: "คืนแรก... มีคนไม่ได้ตื่นขึ้นมาอีก".
2. **คืนแรก:** the first person who ignored the hero (เจ) dies. Irin says it was not her fault. Ends on a clue that nobody came here by chance.
3. **ขาดแคลน:** food and water run short, Irin makes an ego-driven wrong call, a second person dies (คุณวิชัย), the group splits and the middle begins to doubt her. Ends with the hero holding a secret about the island.
4. **ลงมติ:** the group votes on a leader and still hesitates to back the hero. A third person dies (ก้อง). Irin breaks down but still blames the hero. Ends with the hero warning that the next night is the worst.
5. **คืนสุดท้าย:** the four who remain finally follow the hero; Irin must choose between admitting her guilt and running. Big unresolved hook for the next season (a sign at dawn that the island is not done with them). The exact reveal is still to be proposed and approved.

## Part 1 facts that later parts must stay consistent with

- Narration lines (approved, in `docs/superpowers/specs/part1-script-draft.md`): the hero warns, nobody listens; wakes on the beach with six strangers; he is a fisherman; the sea is wrong (no birds, no waves, waterline stain above his head); the water will reach where they sleep; he says move to high ground; Irin smiles with the corner of her mouth and says "ที่นี่ฉันเป็นคนตัดสินใจ"; he did not yet know the price; the sky changes colour.
- The island map shows: where they woke, the waterline, the high ground, and Irin's camp, which sits inside the flood contour and lower than the high ground.
- Irin's camp fire is the only warm light on the beach at night.
- Hero walks along the shore to a palm with a flood stain on the trunk; beach rows: back (jay, ton), middle (ploy, kong), front (นที, ไอริณ, วิชัย).

## Voice decisions

- One narrator, the hero, first person "ผม", calm and low. Gemini voice **Charon**.
- **Irin's spoken lines use Gemini voice Leda** (a woman speaking). Implemented as `segments` inside one narration line, so the subtitle stays one sentence: `{"text": "...", "segments": [{"voice": "Leda", "text": "..."}, {"voice": "Charon", "text": "..."}]}`. Other characters have no voices of their own: the narrator reports what they say, and short important lines may also appear as subtitles. If another character must speak aloud in a later part, ask the user which Gemini voice to use before generating.
- Overall speed: Gemini speed 1.1 at generation, then `--post-speed 1.25` so the story ends near 58 s. The user accepted this; if they find it too fast, lower `--post-speed` (free, uses the cache).
