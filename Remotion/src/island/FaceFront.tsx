import React from "react";
import { CAST, CastId } from "./cast";
import { mix } from "./Person";

const has = (id: CastId, a: string) => CAST[id].accessories.includes(a as never);

/** One front-facing head and shoulders, centred on (0,0) = the middle of the face, face half-height about 108. */
const Head: React.FC<{ id: CastId; smile: number; frame: number; dirt: number; glance: number }> = ({ id, smile, frame, dirt, glance }) => {
  const c = CAST[id];
  const lip = id === "irin" ? "#b5303a" : "#8a4a3a";
  const blink = Math.max(0, 1 - Math.abs(((frame % 130) - 6) / 3)); // quick blink every ~4 s
  const lid = 0.35 + blink * 0.65; // eyes are half-lidded (smug) and close fully on a blink
  const eyeY = -14;
  const brow = smile * 7; // the raised brow of a smirk (left eyebrow only)
  const cloth = mix(c.top, "#3a342b", dirt * 0.65);
  const hairC = c.hair;
  return (
    <g>
      {/* hair behind the head */}
      {has(id, "longHair") && <path d="M-118 -40 Q-150 120 -112 250 L-40 232 L-52 -20 Z M118 -40 Q150 120 112 250 L40 232 L52 -20 Z" fill={hairC} />}
      {has(id, "longHair") && <path d="M-110 -50 Q0 -190 110 -50 L112 120 L-112 120 Z" fill={hairC} />}
      {/* shoulders and neck */}
      <path d="M-210 330 Q-190 200 -90 176 L90 176 Q190 200 210 330 Z" fill={cloth} />
      {has(id, "dress") && <path d="M-66 176 Q0 236 66 176 L56 168 Q0 214 -56 168 Z" fill={mix(cloth, "#000000", 0.12)} />}
      {has(id, "tie") && <path d="M0 190 l16 24 -8 90 -8 12 -8 -12 -8 -90 z" fill="#7a1f2a" />}
      <rect x={-34} y={96} width={68} height={92} rx={26} fill={mix(c.skin, "#000000", 0.14)} />
      {has(id, "backpack") && <path d="M-196 330 L-176 220 L-150 330 Z M196 330 L176 220 L150 330 Z" fill={c.accent ?? "#2d3a52"} />}
      {/* ears */}
      <ellipse cx={-96} cy={4} rx={13} ry={22} fill={mix(c.skin, "#000000", 0.08)} />
      <ellipse cx={96} cy={4} rx={13} ry={22} fill={mix(c.skin, "#000000", 0.08)} />
      {/* face */}
      <ellipse cx={0} cy={0} rx={92} ry={108} fill={c.skin} />
      <ellipse cx={-52} cy={52} rx={20} ry={11} fill="#e08a80" opacity={0.22 + 0.2 * smile} />
      <ellipse cx={52} cy={52} rx={20} ry={11} fill="#e08a80" opacity={0.22 + 0.2 * smile} />
      {dirt > 0.05 && (
        <g fill="#3a342b" opacity={0.28 * dirt}>
          <ellipse cx={-58} cy={38} rx={18} ry={8} />
          <ellipse cx={66} cy={64} rx={14} ry={7} />
          <ellipse cx={8} cy={-70} rx={22} ry={6} />
        </g>
      )}
      {/* hair on top */}
      {has(id, "bald") ? (
        <path d="M-92 -20 Q-98 -48 -78 -62 L-82 -14 Z M92 -20 Q98 -48 78 -62 L82 -14 Z" fill={hairC} />
      ) : has(id, "longHair") ? (
        <path d="M-92 -10 Q-96 -112 0 -116 Q96 -112 92 -10 Q70 -84 14 -80 Q-34 -76 -92 -10 Z" fill={hairC} />
      ) : (
        <path d="M-94 -14 Q-100 -118 0 -120 Q100 -118 94 -14 Q74 -86 0 -88 Q-74 -86 -94 -14 Z" fill={hairC} />
      )}
      {has(id, "bun") && <circle cx={0} cy={-132} r={34} fill={hairC} />}
      {has(id, "shadesOnHead") && (
        <g>
          <rect x={-58} y={-112} width={50} height={20} rx={9} fill="#14181b" />
          <rect x={8} y={-112} width={50} height={20} rx={9} fill="#14181b" />
          <rect x={-10} y={-106} width={20} height={5} fill="#14181b" />
        </g>
      )}
      {has(id, "cap") && (
        <g>
          <path d="M-100 -40 Q-100 -150 0 -152 Q100 -150 100 -40 Z" fill={c.accent ?? "#e84a4a"} />
          <ellipse cx={0} cy={-38} rx={116} ry={18} fill={mix(c.accent ?? "#e84a4a", "#000000", 0.25)} />
        </g>
      )}
      {/* brows */}
      <path d={`M-66 ${-44 - 0} Q-44 ${-54 - brow * 0.4} -22 ${-44 - brow}`} stroke={hairC} strokeWidth={9} strokeLinecap="round" fill="none" />
      <path d={`M22 ${-44 - brow * 0.2} Q44 ${-52 - brow * 0.3} 66 ${-42}`} stroke={hairC} strokeWidth={9} strokeLinecap="round" fill="none" />
      {/* eyes */}
      {[-44, 44].map((ex, i) => (
        <g key={i} transform={`translate(${ex},${eyeY})`}>
          <ellipse rx={22} ry={13} fill="#f4f1ec" />
          <circle cx={glance * 4} cy={1} r={9} fill={id === "irin" ? "#4a3a2a" : "#2b1d17"} />
          <circle cx={glance * 4 + 3} cy={-2} r={3} fill="#fff" />
          <path d={`M-24 -14 Q0 ${-22 + lid * 10} 24 -14 L24 ${-14 + lid * 22} Q0 ${-18 + lid * 22} -24 ${-14 + lid * 22} Z`} fill={c.skin} />
          <path d={`M-24 ${-14 + lid * 18} Q0 ${-20 + lid * 22} 24 ${-14 + lid * 18}`} stroke="#2a1f1a" strokeWidth={4} strokeLinecap="round" fill="none" />
          {id === "irin" && <path d={`M${i ? 20 : -26} ${-16 + lid * 16} l${i ? 10 : -10} -8 M${i ? 14 : -20} ${-18 + lid * 16} l${i ? 8 : -8} -10`} stroke="#2a1f1a" strokeWidth={3} strokeLinecap="round" />}
        </g>
      ))}
      {/* glasses / shades */}
      {has(id, "glasses") && (
        <g stroke="#1c1c1c" strokeWidth={6} fill="none">
          <circle cx={-44} cy={eyeY} r={34} />
          <circle cx={44} cy={eyeY} r={34} />
          <path d="M-10 -16 q10 -8 20 0" />
        </g>
      )}
      {has(id, "shades") && (
        <g fill="#0b0d10">
          <rect x={-84} y={-36} width={72} height={40} rx={14} />
          <rect x={12} y={-36} width={72} height={40} rx={14} />
          <rect x={-14} y={-30} width={28} height={7} />
        </g>
      )}
      {/* nose */}
      <path d="M0 -4 Q-10 30 -8 38 Q0 44 8 38" stroke={mix(c.skin, "#000000", 0.28)} strokeWidth={4} fill="none" strokeLinecap="round" />
      {/* mouth: neutral -> smirk (one corner higher, a lopsided smile) */}
      <path d={`M-36 66 Q0 ${66 + 6 + 20 * smile} 38 ${66 - 16 * smile}`} stroke={lip} strokeWidth={id === "irin" ? 12 : 8} strokeLinecap="round" fill="none" />
      {smile > 0.4 && <path d={`M-26 70 Q0 ${80 + 12 * smile} 30 ${64 - 10 * smile}`} stroke="#f4f1ec" strokeWidth={5} strokeLinecap="round" fill="none" opacity={0.7} />}
      {smile > 0.25 && <path d={`M40 ${52 - 14 * smile} q10 8 4 20`} stroke={mix(c.skin, "#000000", 0.25)} strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.8} />}
      {has(id, "beard") && <path d="M-88 12 Q-84 128 0 134 Q84 128 88 12 Q70 78 0 80 Q-70 78 -88 12 Z" fill={hairC} opacity={0.95} />}
      {has(id, "beard") && <path d={`M-30 66 Q0 ${70 + 18 * smile} 30 ${64 - 8 * smile}`} stroke="#c58b7a" strokeWidth={6} strokeLinecap="round" fill="none" />}
    </g>
  );
};

/**
 * Front-facing close-up of a character, used as a cut-in when they smile. `t` runs 0..1 over the shot; the
 * smile eases in over the first part. Lit from the left by the camp fire and cool light from the right.
 */
export const FaceFront: React.FC<{ id: CastId; frame: number; t: number; dirt?: number }> = ({ id, frame, t, dirt = 0.15 }) => {
  const smile = Math.min(1, Math.max(0, (t - 0.08) / 0.3));
  const zoom = 1.02 + 0.1 * t; // a slow push-in
  const sway = Math.sin(frame * 0.04) * 1.2;
  const glance = Math.min(1, Math.max(0, (t - 0.15) / 0.2)); // eyes slide to the lens as she smiles
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ display: "block" }}>
      <defs>
        <linearGradient id="ff-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4a545c" />
          <stop offset="0.6" stopColor="#2a3136" />
          <stop offset="1" stopColor="#14181b" />
        </linearGradient>
        <radialGradient id="ff-fire" cx="0" cy="0.55" r="0.9">
          <stop offset="0" stopColor="#ff9a3c" stopOpacity={0.55} />
          <stop offset="1" stopColor="#ff9a3c" stopOpacity={0} />
        </radialGradient>
        <linearGradient id="ff-rim" x1="1" y1="0" x2="0" y2="0">
          <stop offset="0" stopColor="#bcd0e0" stopOpacity={0.5} />
          <stop offset="0.25" stopColor="#bcd0e0" stopOpacity={0} />
        </linearGradient>
        <filter id="ff-bokeh"><feGaussianBlur stdDeviation="10" /></filter>
      </defs>
      <rect width={1080} height={1920} fill="url(#ff-bg)" />
      {/* out-of-focus beach: horizon haze and warm fire bokeh */}
      <rect y={560} width={1080} height={140} fill="#8c949a" opacity={0.18} filter="url(#ff-bokeh)" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <circle key={i} cx={80 + i * 170 + Math.sin(frame * 0.02 + i) * 8} cy={520 + (i % 3) * 90} r={26 + (i % 2) * 14} fill="#ffb54a" opacity={0.28} filter="url(#ff-bokeh)" />
      ))}
      <g transform={`translate(540,800) scale(${zoom * 3.0}) rotate(${sway}) `}>
        <Head id={id} smile={smile} frame={frame} dirt={dirt} glance={glance} />
      </g>
      <rect width={1080} height={1920} fill="url(#ff-fire)" style={{ mixBlendMode: "screen" }} />
      <rect width={1080} height={1920} fill="url(#ff-rim)" style={{ mixBlendMode: "screen" }} />
    </svg>
  );
};
