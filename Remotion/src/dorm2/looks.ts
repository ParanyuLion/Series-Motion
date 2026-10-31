import { LOOKS } from "../shadow1/Figure";

// พี่ปีสี่ (a woman): long dark hair with soft bangs, a white short-sleeved blouse, a black short skirt, fair skin, eyelashes, no glasses
LOOKS.senior = { hair: "fringe", hairColor: "#2a1a1e", body: "#f4f1ea", bodyKind: "lean", lady: true, bodyH: 178, bodyW: 43, skirtLen: 30, legH: 150, skirt: "#1b1a20", detail: "none", sleeve: "short", skin: "#f7e0cd" };

// variant B (trial): the same woman with the men's plain eyes and only a few lash strokes, no lid line, blush or coloured lips
LOOKS.seniorB = { ...LOOKS.senior, lashesOnly: true };

// the two who die in Part 2: a third-floor girl (pink top, jeans, bob-like bowl hair) and a man (green tee, grey trousers, tousled hair)
LOOKS.girl3 = { hair: "bowl", hairColor: "#3a2418", body: "#e07fa6", bodyKind: "bean", detail: "none", pants: "#5a6f94", sleeve: "short" };
LOOKS.man3 = { hair: "tousle", hairColor: "#2a2220", body: "#5c9a6e", bodyKind: "bean", detail: "none", pants: "#6a6a72", sleeve: "short", skin: "#d9a67c" };
