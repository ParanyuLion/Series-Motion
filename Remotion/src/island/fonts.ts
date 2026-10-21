import { loadFont } from "@remotion/google-fonts/Prompt";

// Loaded once for the whole composition; weight 500 is the only one used.
export const { fontFamily } = loadFont("normal", { weights: ["500"], subsets: ["thai", "latin"] });
