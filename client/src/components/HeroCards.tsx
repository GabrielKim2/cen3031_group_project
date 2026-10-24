// Home-page illustration: two cards dealt onto the table. Everything here is
// an original drawing (no Wizards of the Coast logos, frames, or symbols).
// Textures come from SVG noise filters, so there are no image files.
import { emblemPaths } from "./Emblem";

const CARD_W = 250;
const CARD_H = 350;

function CardBack() {
  return (
    <g>
      <rect width={CARD_W} height={CARD_H} rx="14" fill="#110b06" />
      {/* Mottled field: a warm base with olive-gold noise on top. */}
      <rect x="11" y="11" width="228" height="328" rx="5" fill="#3f2e19" />
      <rect
        x="11"
        y="11"
        width="228"
        height="328"
        rx="5"
        filter="url(#hc-mottle)"
      />
      <rect
        x="11"
        y="11"
        width="228"
        height="328"
        rx="5"
        fill="url(#hc-vignette)"
      />
      {/* Engraved double border. */}
      <rect
        x="21"
        y="21"
        width="208"
        height="308"
        rx="3"
        fill="none"
        stroke="#b9a768"
        strokeOpacity="0.7"
      />
      <rect
        x="25"
        y="25"
        width="200"
        height="300"
        rx="2"
        fill="none"
        stroke="#0d0905"
        strokeOpacity="0.6"
      />
      {/* Diamond studs in the corners. */}
      {[
        [35, 35],
        [215, 35],
        [35, 315],
        [215, 315],
      ].map(([x, y]) => (
        <path
          key={`${x}-${y}`}
          d={`M${x} ${y - 5}l5 5-5 5-5-5Z`}
          fill="url(#hc-gilt)"
          stroke="#2a1d0e"
          strokeWidth="0.8"
        />
      ))}
      {/* Medallion holding the Collected Company mark. */}
      <circle cx="125" cy="160" r="62" fill="#22180c" fillOpacity="0.55" />
      <circle
        cx="125"
        cy="160"
        r="62"
        fill="none"
        stroke="url(#hc-gilt)"
        strokeWidth="3"
      />
      <circle
        cx="125"
        cy="160"
        r="54"
        fill="none"
        stroke="#d9ce9c"
        strokeOpacity="0.35"
        strokeDasharray="1 5"
        strokeLinecap="round"
      />
      <g
        transform="translate(83 118) scale(1.3)"
        color="#e6d49a"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        {emblemPaths.brand}
      </g>
      <text
        x="125"
        y="282"
        textAnchor="middle"
        fontFamily="'IM Fell English SC', Georgia, serif"
        fontSize="17"
        letterSpacing="1.5"
        fill="#e6d49a"
        stroke="#1a1209"
        strokeWidth="0.6"
        paintOrder="stroke"
      >
        Collected Company
      </text>
    </g>
  );
}

function ArtScene() {
  // Dusk over a hilltop keep with its windows lit: the local game store,
  // drawn as a fantasy landmark.
  return (
    <g>
      <rect width="210" height="150" fill="url(#hc-sky)" />
      {[
        [18, 16, 0.9],
        [44, 30, 0.6],
        [70, 12, 0.8],
        [112, 22, 0.5],
        [176, 14, 0.9],
        [196, 38, 0.6],
        [150, 40, 0.5],
        [30, 52, 0.4],
      ].map(([x, y, o]) => (
        <circle
          key={`${x}-${y}`}
          cx={x}
          cy={y}
          r="0.9"
          fill="#fff6d8"
          opacity={o}
        />
      ))}
      <circle cx="160" cy="44" r="26" fill="url(#hc-moonglow)" />
      <circle cx="160" cy="44" r="11" fill="#f6ecc8" />
      <path
        d="M0 104 34 86 58 96 92 78 128 94 160 84 210 100V150H0Z"
        fill="#3b4f5a"
        opacity="0.75"
      />
      <path
        d="M0 114 26 104 54 110 84 96 116 106 150 98 210 112V150H0Z"
        fill="#28343b"
      />
      {/* Keep on the hill: two towers joined by a crenellated wall. */}
      <g fill="#141a1e">
        <rect x="70" y="62" width="13" height="52" />
        {[70, 75, 80].map((x) => (
          <rect key={x} x={x} y="57" width="3" height="5" />
        ))}
        <rect x="83" y="86" width="27" height="28" />
        {[84, 90, 96, 102].map((x) => (
          <rect key={x} x={x} y="82" width="3.5" height="4" />
        ))}
        <rect x="110" y="72" width="11" height="42" />
        {[110, 114, 118].map((x) => (
          <rect key={x} x={x} y="68" width="3" height="4" />
        ))}
      </g>
      <g fill="#f0b25c">
        <rect x="75" y="70" width="3" height="5" rx="1.5" />
        <rect x="75" y="84" width="3" height="5" rx="1.5" />
        <rect x="114.5" y="80" width="2.5" height="4.5" rx="1.2" />
        <rect x="88" y="94" width="3" height="4" rx="1" />
        <rect x="101" y="94" width="3" height="4" rx="1" />
        <path d="M93.5 114v-6a3 3 0 0 1 6 0v6Z" />
      </g>
      <path
        d="M0 130 40 122 80 128 130 118 170 126 210 120V150H0Z"
        fill="#0f1416"
      />
      <rect width="210" height="150" filter="url(#hc-grain)" opacity="0.5" />
    </g>
  );
}

function CardFront() {
  const ink = "#1c150b";
  return (
    <g>
      <rect width={CARD_W} height={CARD_H} rx="14" fill="#110b06" />
      <rect
        x="11"
        y="11"
        width="228"
        height="328"
        rx="6"
        fill="url(#hc-frame)"
      />
      <rect
        x="11"
        y="11"
        width="228"
        height="328"
        rx="6"
        filter="url(#hc-grain)"
        opacity="0.35"
      />
      {/* Title bar */}
      <rect
        x="18"
        y="18"
        width="214"
        height="26"
        rx="6"
        fill="url(#hc-bar)"
        stroke="#6f6640"
        strokeWidth="1.2"
      />
      <text
        x="27"
        y="36"
        fontFamily="'IM Fell English', Georgia, serif"
        fontSize="15"
        fill={ink}
      >
        Seat at the Table
      </text>
      {/* Art */}
      <g transform="translate(20 50)">
        <svg width="210" height="150" viewBox="0 0 210 150">
          <ArtScene />
        </svg>
        <rect
          width="210"
          height="150"
          fill="none"
          stroke="#2a2112"
          strokeWidth="2"
        />
      </g>
      {/* Type line */}
      <rect
        x="18"
        y="205"
        width="214"
        height="22"
        rx="5"
        fill="url(#hc-bar)"
        stroke="#6f6640"
        strokeWidth="1.2"
      />
      <text
        x="27"
        y="220.5"
        fontFamily="'IM Fell English', Georgia, serif"
        fontSize="12.5"
        fill={ink}
      >
        Tournament
      </text>
      {/* Text box */}
      <rect
        x="22"
        y="232"
        width="206"
        height="96"
        rx="2"
        fill="#f4efdc"
        stroke="#8f8458"
      />
      <text
        fontFamily="'Alegreya Sans', Arial, sans-serif"
        fontSize="10.5"
        fill={ink}
      >
        <tspan x="31" y="252">
          Whenever a player registers, put a
        </tspan>
        <tspan x="31" y="265">
          seat counter on this event.
        </tspan>
      </text>
      <line x1="31" y1="277" x2="219" y2="277" stroke="#c9bd8f" />
      <text
        fontFamily="'IM Fell English', Georgia, serif"
        fontStyle="italic"
        fontSize="10.5"
        fill="#3a3020"
      >
        <tspan x="31" y="294">
          The lights at the game store stay
        </tspan>
        <tspan x="31" y="307">
          on late on tournament nights.
        </tspan>
      </text>
    </g>
  );
}

export default function HeroCards() {
  return (
    <svg
      className="hero-cards"
      viewBox="0 0 560 440"
      role="img"
      aria-label="Two cards dealt face up and face down on a table"
    >
      <defs>
        <filter id="hc-mottle" x="0" y="0" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.07"
            numOctaves="5"
            seed="7"
          />
          {/* Map noise to olive-gold flecks with varying opacity. */}
          <feColorMatrix
            values="0 0 0 0 0.62
                    0 0 0 0 0.52
                    0 0 0 0 0.26
                    1.25 0 0 0 -0.52"
          />
        </filter>
        <filter id="hc-grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="2"
            seed="3"
          />
          <feColorMatrix
            values="0 0 0 0 0.2
                    0 0 0 0 0.15
                    0 0 0 0 0.05
                    0 0 0 0.35 0"
          />
        </filter>
        <filter id="hc-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow
            dx="0"
            dy="14"
            stdDeviation="12"
            floodColor="#000"
            floodOpacity="0.55"
          />
        </filter>
        <radialGradient id="hc-vignette" cx="50%" cy="48%" r="70%">
          <stop offset="55%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.55" />
        </radialGradient>
        <linearGradient id="hc-gilt" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f3e2a2" />
          <stop offset="0.5" stopColor="#b9984f" />
          <stop offset="1" stopColor="#e6cf86" />
        </linearGradient>
        <linearGradient id="hc-frame" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#e9dfa6" />
          <stop offset="0.5" stopColor="#cdbf7f" />
          <stop offset="1" stopColor="#b6a668" />
        </linearGradient>
        <linearGradient id="hc-bar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f3efcb" />
          <stop offset="1" stopColor="#d6ca95" />
        </linearGradient>
        <linearGradient id="hc-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#132637" />
          <stop offset="0.38" stopColor="#36506a" />
          <stop offset="0.62" stopColor="#c1844c" />
        </linearGradient>
        <radialGradient id="hc-moonglow">
          <stop offset="0.35" stopColor="#fff2c8" stopOpacity="0.55" />
          <stop offset="1" stopColor="#fff2c8" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="hc-foil" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0.35" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.48" stopColor="#fff" stopOpacity="0.45" />
          <stop offset="0.53" stopColor="#bfe3e4" stopOpacity="0.35" />
          <stop offset="0.65" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <clipPath id="hc-front-clip">
          <rect width={CARD_W} height={CARD_H} rx="14" />
        </clipPath>
      </defs>
      <g
        transform="translate(28 66) rotate(-10 125 175)"
        filter="url(#hc-shadow)"
      >
        <CardBack />
      </g>
      <g
        transform="translate(282 34) rotate(8 125 175)"
        filter="url(#hc-shadow)"
      >
        <CardFront />
        <g clipPath="url(#hc-front-clip)">
          <rect
            className="hero-foil"
            x="-250"
            width="500"
            height={CARD_H}
            fill="url(#hc-foil)"
          />
        </g>
      </g>
    </svg>
  );
}
