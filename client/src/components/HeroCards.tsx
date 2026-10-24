// Home-page illustration: two cards dealt onto the table. The face-down card
// uses the official Magic card back (Wizards of the Coast property, shown under
// the Fan Content Policy noted in the footer). The face-up card is an original
// drawing, textured with SVG noise filters.
import cardBackImage from "../assets/card-back.jpg";

const CARD_W = 250;
const CARD_H = 350;
const INK = "#1f160b";

function CardBack() {
  return (
    <g>
      <clipPath id="hc-back-clip">
        <rect width={CARD_W} height={CARD_H} rx="14" />
      </clipPath>
      <image
        href={cardBackImage}
        width={CARD_W}
        height={CARD_H}
        preserveAspectRatio="xMidYMid slice"
        clipPath="url(#hc-back-clip)"
      />
    </g>
  );
}

/** Overhead view of one table: four seats, four playmats, one game. */
function ArtScene() {
  const mats = [
    { x: 80, y: 17, w: 50, h: 23, fill: "#2b5444" },
    { x: 80, y: 110, w: 50, h: 23, fill: "#33496f" },
    { x: 45, y: 53, w: 23, h: 44, fill: "#4f3f6e" },
    { x: 142, y: 53, w: 23, h: 44, fill: "#6e3a2c" },
  ];
  // Cards on each mat: [x, y, faceUp], laid out to suit each mat's angle.
  const cards: [number, number, boolean][] = [
    [86, 22, false],
    [97, 22, true],
    [108, 23, true],
    [119, 21, true],
    [86, 116, true],
    [97, 115, true],
    [108, 116, false],
    [119, 115, true],
  ];
  const sideCards: [number, number, boolean][] = [
    [50, 58, false],
    [50, 69, true],
    [50, 80, true],
    [147, 58, true],
    [147, 69, true],
    [147, 81, false],
  ];
  return (
    <g>
      <rect width="210" height="150" fill="#160f08" />
      <rect width="210" height="150" fill="url(#hc-overhead)" />
      {/* Chairs, tucked under the table's edge. */}
      <g fill="#2c1d10" stroke="#0e0905" strokeWidth="1">
        <rect x="83" y="1" width="44" height="13" rx="4" />
        <rect x="83" y="136" width="44" height="13" rx="4" />
        <rect x="27" y="53" width="13" height="44" rx="4" />
        <rect x="170" y="53" width="13" height="44" rx="4" />
      </g>
      <circle cx="105" cy="75" r="64" fill="url(#hc-tabletop)" />
      {[52, 40, 27].map((r) => (
        <circle
          key={r}
          cx="105"
          cy="75"
          r={r}
          fill="none"
          stroke="#2a1708"
          strokeOpacity="0.18"
        />
      ))}
      <circle
        cx="105"
        cy="75"
        r="64"
        fill="none"
        stroke="#2b1a0b"
        strokeWidth="3"
      />
      {mats.map((m) => (
        <rect
          key={`${m.x}-${m.y}`}
          x={m.x}
          y={m.y}
          width={m.w}
          height={m.h}
          rx="3"
          fill={m.fill}
          stroke="#0e0905"
          strokeOpacity="0.5"
        />
      ))}
      <g stroke="#0e0905" strokeWidth="0.6">
        {cards.map(([x, y, up]) => (
          <rect
            key={`${x}-${y}`}
            x={x}
            y={y}
            width="8"
            height="11"
            rx="1"
            fill={up ? "#efe6cc" : "#4a3720"}
          />
        ))}
        {sideCards.map(([x, y, up]) => (
          <rect
            key={`${x}-${y}`}
            x={x}
            y={y}
            width="11"
            height="8"
            rx="1"
            fill={up ? "#efe6cc" : "#4a3720"}
          />
        ))}
      </g>
      {/* Dice in the middle of the table. */}
      <g transform="translate(103 73)">
        <path d="M0-8 7-4V4L0 8-7 4V-4Z" fill="#b5463a" />
        <path
          d="M0-8-4 2H4ZM-4 2 0 8 4 2M-7-4-4 2M7-4 4 2"
          fill="none"
          stroke="#f1c9b8"
          strokeWidth="0.6"
          strokeOpacity="0.8"
        />
      </g>
      <rect
        x="115"
        y="78"
        width="7"
        height="7"
        rx="1.5"
        fill="#e9e2cf"
        transform="rotate(14 118.5 81.5)"
      />
      <circle cx="118.5" cy="81.5" r="0.9" fill="#1f160b" />
      <rect width="210" height="150" fill="url(#hc-art-vignette)" />
      <rect width="210" height="150" filter="url(#hc-grain)" opacity="0.5" />
    </g>
  );
}

/** Face-up card named for the site, in a gold frame. */
function CardFront() {
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
        fill={INK}
      >
        Collected Company
      </text>
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
        fill={INK}
      >
        Instant
      </text>
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
        fill={INK}
      >
        <tspan x="31" y="252">
          Look at the next six tournaments near
        </tspan>
        <tspan x="31" y="265">
          you. Save a seat at up to two of them.
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
          Most players come for the prize packs
        </tspan>
        <tspan x="31" y="307">
          and stay for the people at table four.
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
        <linearGradient id="hc-frame" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#e9dfa6" />
          <stop offset="0.5" stopColor="#cdbf7f" />
          <stop offset="1" stopColor="#b6a668" />
        </linearGradient>
        <linearGradient id="hc-bar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f3efcb" />
          <stop offset="1" stopColor="#d6ca95" />
        </linearGradient>
        <radialGradient id="hc-tabletop" cx="45%" cy="42%" r="65%">
          <stop offset="0" stopColor="#9a6a3c" />
          <stop offset="0.7" stopColor="#6e4826" />
          <stop offset="1" stopColor="#4e3119" />
        </radialGradient>
        <radialGradient id="hc-overhead" cx="50%" cy="50%" r="60%">
          <stop offset="0" stopColor="#ffd98f" stopOpacity="0.22" />
          <stop offset="1" stopColor="#ffd98f" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="hc-art-vignette" cx="50%" cy="60%" r="75%">
          <stop offset="50%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.6" />
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
