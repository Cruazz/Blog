import { useEffect, useRef, useState } from "react";

const TILE_SIZE = 32;
const MAP_COLS = 32;
const MAP_ROWS = 24;
const MAP_WIDTH = MAP_COLS * TILE_SIZE;
const MAP_HEIGHT = MAP_ROWS * TILE_SIZE;

// ── Buildings Setup ──────────────────────────────────────────────────────────
const BUILDINGS = [
  {
    id: "library",
    name: "LIBRARY",
    x: 2 * TILE_SIZE,
    y: 1 * TILE_SIZE,
    width: 4 * TILE_SIZE,
    height: 3 * TILE_SIZE,
    doorX: 4 * TILE_SIZE,
    doorY: 4 * TILE_SIZE,
    color: "#d15147",
    label: "Library"
  },
  {
    id: "workshop",
    name: "WORKSHOP",
    x: 9 * TILE_SIZE,
    y: 1 * TILE_SIZE,
    width: 4 * TILE_SIZE,
    height: 3 * TILE_SIZE,
    doorX: 10.5 * TILE_SIZE,
    doorY: 4 * TILE_SIZE,
    color: "#3b68af",
    label: "Workshop"
  },
  {
    id: "study",
    name: "STUDY",
    x: 2 * TILE_SIZE,
    y: 9 * TILE_SIZE,
    width: 4 * TILE_SIZE,
    height: 3 * TILE_SIZE,
    doorX: 4 * TILE_SIZE,
    doorY: 12 * TILE_SIZE,
    color: "#8147a3",
    label: "Study"
  },
  {
    id: "post",
    name: "POST",
    x: 10 * TILE_SIZE,
    y: 10 * TILE_SIZE,
    width: 2 * TILE_SIZE,
    height: 2 * TILE_SIZE,
    doorX: 11 * TILE_SIZE,
    doorY: 12 * TILE_SIZE,
    color: "#8e5d38",
    label: "Post Office"
  },
  {
    id: "observatory",
    name: "OBSERVATORY",
    x: 17 * TILE_SIZE,
    y: 6 * TILE_SIZE,
    width: 3 * TILE_SIZE,
    height: 3 * TILE_SIZE,
    doorX: 18.5 * TILE_SIZE,
    doorY: 9 * TILE_SIZE,
    color: "#2a4a6b",
    label: "Observatory"
  },
  {
    id: "tavern",
    name: "TAVERN",
    x: 9 * TILE_SIZE,
    y: 7 * TILE_SIZE,
    width: 4 * TILE_SIZE,
    height: 3 * TILE_SIZE,
    doorX: 11 * TILE_SIZE,
    doorY: 10 * TILE_SIZE,
    color: "#b8742d",
    label: "Tavern"
  }
];

// ── NPCs Setup ───────────────────────────────────────────────────────────────
const NPCS = [
  {
    id: "scholar",
    name: "THE SCHOLAR",
    x: 4.5 * TILE_SIZE,   // just in front of the Library entrance
    y: 5.5 * TILE_SIZE,   // south of the door, not blocking entry
    color: "#7b5ea7",
    interactRadius: 32,
    dialogue: [
      "Greetings, traveller!",
      "I've read every scroll in that library...",
      "Let me recommend one for you."
    ]
  }
];

// ── Cat NPC Setup ────────────────────────────────────────────────────────────
const CAT_QUOTES = [
  "Meow. I mean... hello, adventurer.",
  "Did you know cats sleep 16 hours a day? I'm living my best life.",
  "Fun fact: A group of cats is called a 'clowder'.",
  "I once caught a bug and it ate my homework. True story.",
  "The internet is basically 90% cats. You're welcome.",
  "Purr... I mean, nice weather today, don't you think?",
  "Cats have 32 muscles in each ear. I can hear your code bugs.",
  "A cat's purr vibrates at 25-150 Hz. Science says it heals bones.",
  "Fun fact: Cats can't taste sweetness. I prefer my snacks savory anyway.",
  "I've walked every tile of this village. Trust me, the Post Office is tiny.",
  "Schrödinger's cat? Never heard of him.",
  "Meow? Oh sorry, I thought we were having a conversation.",
  "Cats were worshipped in ancient Egypt. I'm still waiting for my temple.",
  "Pro tip: Try pressing E near buildings. There's cool stuff inside.",
  "I can jump 6 times my height. The Scholar just uses the stairs."
];

const CAT_CONFIG = {
  id: "cat",
  name: "AMING",
  startX: 8 * TILE_SIZE,
  startY: 8 * TILE_SIZE,
  speed: 0.8,
  interactRadius: 28,
  wanderRadius: 120,
  idleMin: 2000,
  idleMax: 5000,
  walkMin: 1500,
  walkMax: 3500
};

// ── Trees Setup ──────────────────────────────────────────────────────────────
const TREES = [
  { x: 1 * TILE_SIZE, y: 5 * TILE_SIZE },
  { x: 2 * TILE_SIZE, y: 5 * TILE_SIZE },
  { x: 14 * TILE_SIZE, y: 1 * TILE_SIZE },
  { x: 15 * TILE_SIZE, y: 1 * TILE_SIZE },
  { x: 14 * TILE_SIZE, y: 2 * TILE_SIZE },
  { x: 15 * TILE_SIZE, y: 2 * TILE_SIZE },
  { x: 14 * TILE_SIZE, y: 5 * TILE_SIZE },
  { x: 15 * TILE_SIZE, y: 5 * TILE_SIZE },
  { x: 13 * TILE_SIZE, y: 8 * TILE_SIZE },
  { x: 15 * TILE_SIZE, y: 10 * TILE_SIZE },
  { x: 14 * TILE_SIZE, y: 13 * TILE_SIZE },
  { x: 1 * TILE_SIZE, y: 13 * TILE_SIZE },
  { x: 0 * TILE_SIZE, y: 10 * TILE_SIZE },
  // Forest on the right side
  { x: 18 * TILE_SIZE, y: 3 * TILE_SIZE },
  { x: 19 * TILE_SIZE, y: 4 * TILE_SIZE },
  { x: 21 * TILE_SIZE, y: 2 * TILE_SIZE },
  { x: 23 * TILE_SIZE, y: 3 * TILE_SIZE },
  { x: 20 * TILE_SIZE, y: 7 * TILE_SIZE },
  { x: 22 * TILE_SIZE, y: 8 * TILE_SIZE },
  { x: 25 * TILE_SIZE, y: 5 * TILE_SIZE },
  { x: 27 * TILE_SIZE, y: 4 * TILE_SIZE },
  { x: 28 * TILE_SIZE, y: 6 * TILE_SIZE },
  { x: 18 * TILE_SIZE, y: 11 * TILE_SIZE },
  { x: 20 * TILE_SIZE, y: 12 * TILE_SIZE },
  { x: 22 * TILE_SIZE, y: 13 * TILE_SIZE },
  { x: 25 * TILE_SIZE, y: 11 * TILE_SIZE },
  { x: 27 * TILE_SIZE, y: 12 * TILE_SIZE },
  { x: 29 * TILE_SIZE, y: 10 * TILE_SIZE }
];

// ── Lamp Posts Setup ─────────────────────────────────────────────────────────
const LAMPS = [
  { x: 6 * TILE_SIZE - 8, y: 4 * TILE_SIZE },
  { x: 8 * TILE_SIZE + 8, y: 4 * TILE_SIZE },
  { x: 6 * TILE_SIZE - 8, y: 12 * TILE_SIZE },
  { x: 8 * TILE_SIZE + 8, y: 12 * TILE_SIZE }
];

// ── Flowers Setup ────────────────────────────────────────────────────────────
const FLOWERS = [
  { x: 5 * TILE_SIZE, y: 4.5 * TILE_SIZE, color: "#f5d35c" },
  { x: 5.2 * TILE_SIZE, y: 6.2 * TILE_SIZE, color: "#e8627e" },
  { x: 8.8 * TILE_SIZE, y: 4.5 * TILE_SIZE, color: "#f5d35c" },
  { x: 8.5 * TILE_SIZE, y: 6.5 * TILE_SIZE, color: "#f5d35c" },
  { x: 5 * TILE_SIZE, y: 11.2 * TILE_SIZE, color: "#e8627e" },
  { x: 8.8 * TILE_SIZE, y: 11.5 * TILE_SIZE, color: "#f5d35c" }
];

export default function GameWorld({ activeModal, onTriggerBuilding, onTriggerNPC, light }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  const keysRef = useRef({});

  const playerRef = useRef({
    x: 6.5 * TILE_SIZE,
    y: 11.5 * TILE_SIZE,
    dir: "down",
    isMoving: false,
    speed: 2.2,
    width: 16,
    height: 12,
    walkCycle: 0
  });

  const catRef = useRef({
    x: CAT_CONFIG.startX,
    y: CAT_CONFIG.startY,
    dir: "down",
    isMoving: false,
    state: "idle", // "idle" or "walking"
    stateTimer: Date.now() + 2000,
    targetX: CAT_CONFIG.startX,
    targetY: CAT_CONFIG.startY,
    walkCycle: 0,
    lastQuoteIndex: -1
  });

  const catBubbleRef = useRef(null); // { text }

  const [interactPrompt, setInteractPrompt] = useState(null); // { type: "building"|"npc", ...data }
  const [viewport, setViewport] = useState({ w: 800, h: 600 });
  const viewportRef = useRef(viewport);
  viewportRef.current = viewport;
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0);
    const handleResize = () => {
      if (containerRef.current) {
        setViewport({ w: containerRef.current.clientWidth, h: containerRef.current.clientHeight });
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const catBubbleTimerRef = useRef(null);

  // Trigger cat quote when interacting
  const triggerCatQuote = () => {
    let idx;
    do {
      idx = Math.floor(Math.random() * CAT_QUOTES.length);
    } while (idx === catRef.current.lastQuoteIndex && CAT_QUOTES.length > 1);
    catRef.current.lastQuoteIndex = idx;
    catBubbleRef.current = { text: CAT_QUOTES[idx] };
    if (catBubbleTimerRef.current) clearTimeout(catBubbleTimerRef.current);
    catBubbleTimerRef.current = setTimeout(() => { catBubbleRef.current = null; }, 5000);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      const k = e.key.toLowerCase();
      keysRef.current[k] = true;
      if (k === "e" && interactPrompt && !activeModal) {
        if (interactPrompt.type === "building") onTriggerBuilding(interactPrompt.id);
        else if (interactPrompt.type === "npc") onTriggerNPC(interactPrompt.id);
        else if (interactPrompt.type === "cat") triggerCatQuote();
      }
    };
    const handleKeyUp = (e) => { keysRef.current[e.key.toLowerCase()] = false; };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [interactPrompt, activeModal, onTriggerBuilding, onTriggerNPC]);

  useEffect(() => {
    let animId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const isColliding = (nextX, nextY) => {
      const player = playerRef.current;
      const left = nextX - player.width / 2;
      const right = nextX + player.width / 2;
      const top = nextY - player.height / 2;
      const bottom = nextY + player.height / 2;

      if (left < 0 || right > MAP_WIDTH || top < 0 || bottom > MAP_HEIGHT) return true;

      for (const b of BUILDINGS) {
        const bLeft = b.x, bRight = b.x + b.width;
        const bTop = b.y + TILE_SIZE, bBottom = b.y + b.height;
        if (right > bLeft && left < bRight && bottom > bTop && top < bBottom) return true;
      }

      for (const t of TREES) {
        if (right > t.x + 8 && left < t.x + 24 && bottom > t.y + 20 && top < t.y + 32) return true;
      }

      const wellLeft = 6 * TILE_SIZE, wellRight = 8 * TILE_SIZE;
      const wellTop = 5 * TILE_SIZE, wellBottom = 6 * TILE_SIZE;
      if (right > wellLeft && left < wellRight && bottom > wellTop && top < wellBottom) return true;

      return false;
    };

    const update = () => {
      if (activeModal) return;
      const keys = keysRef.current;
      const player = playerRef.current;
      let dx = 0, dy = 0;

      if (keys["w"] || keys["arrowup"])    { dy = -1; player.dir = "up"; }
      if (keys["s"] || keys["arrowdown"])  { dy =  1; player.dir = "down"; }
      if (keys["a"] || keys["arrowleft"])  { dx = -1; player.dir = "left"; }
      if (keys["d"] || keys["arrowright"]) { dx =  1; player.dir = "right"; }

      if (dx !== 0 && dy !== 0) { dx *= 0.7071; dy *= 0.7071; }
      player.isMoving = dx !== 0 || dy !== 0;

      if (player.isMoving) {
        const nx = player.x + dx * player.speed;
        const ny = player.y + dy * player.speed;
        if (!isColliding(nx, player.y)) player.x = nx;
        if (!isColliding(player.x, ny)) player.y = ny;
        player.walkCycle += 0.2;
      } else {
        player.walkCycle = 0;
      }

      // ── Cat wander AI ──────────────────────────────────────────────
      const cat = catRef.current;
      const now = Date.now();
      if (now > cat.stateTimer) {
        if (cat.state === "idle") {
          // Pick a random target within wanderRadius
          const angle = Math.random() * Math.PI * 2;
          const dist = 20 + Math.random() * CAT_CONFIG.wanderRadius;
          cat.targetX = CAT_CONFIG.startX + Math.cos(angle) * dist;
          cat.targetY = CAT_CONFIG.startY + Math.sin(angle) * dist;
          // Clamp to map bounds
          cat.targetX = Math.max(16, Math.min(MAP_WIDTH - 16, cat.targetX));
          cat.targetY = Math.max(16, Math.min(MAP_HEIGHT - 16, cat.targetY));
          cat.state = "walking";
          cat.stateTimer = now + CAT_CONFIG.walkMin + Math.random() * (CAT_CONFIG.walkMax - CAT_CONFIG.walkMin);
        } else {
          cat.state = "idle";
          cat.stateTimer = now + CAT_CONFIG.idleMin + Math.random() * (CAT_CONFIG.idleMax - CAT_CONFIG.idleMin);
        }
      }

      if (cat.state === "walking") {
        const cdx = cat.targetX - cat.x;
        const cdy = cat.targetY - cat.y;
        const cdist = Math.hypot(cdx, cdy);
        if (cdist > 2) {
          const nx = cat.x + (cdx / cdist) * CAT_CONFIG.speed;
          const ny = cat.y + (cdy / cdist) * CAT_CONFIG.speed;
          if (!isColliding(nx, cat.y)) cat.x = nx;
          if (!isColliding(cat.x, ny)) cat.y = ny;
          cat.dir = Math.abs(cdx) > Math.abs(cdy) ? (cdx > 0 ? "right" : "left") : (cdy > 0 ? "down" : "up");
          cat.isMoving = true;
          cat.walkCycle += 0.25;
        } else {
          cat.isMoving = false;
          cat.state = "idle";
          cat.stateTimer = now + CAT_CONFIG.idleMin + Math.random() * (CAT_CONFIG.idleMax - CAT_CONFIG.idleMin);
        }
      } else {
        cat.isMoving = false;
      }

      // Proximity check — buildings first, then NPCs, then cat
      let nearest = null;
      for (const b of BUILDINGS) {
        const dist = Math.hypot(player.x - b.doorX, player.y - b.doorY);
        if (dist < 28) { nearest = { type: "building", ...b }; break; }
      }
      if (!nearest) {
        for (const npc of NPCS) {
          const dist = Math.hypot(player.x - npc.x, player.y - npc.y);
          if (dist < npc.interactRadius) { nearest = { type: "npc", ...npc }; break; }
        }
      }
      if (!nearest) {
        const catDist = Math.hypot(player.x - cat.x, player.y - cat.y);
        if (catDist < CAT_CONFIG.interactRadius) {
          nearest = { type: "cat", ...CAT_CONFIG, x: cat.x, y: cat.y };
        }
      }
      setInteractPrompt(nearest);
    };

    const drawLightCircle = (lctx, cx, cy, r) => {
      const grad = lctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      grad.addColorStop(0, "rgba(255,255,255,1.0)");
      grad.addColorStop(0.3, "rgba(255,255,255,0.7)");
      grad.addColorStop(1, "rgba(255,255,255,0)");
      lctx.fillStyle = grad;
      lctx.beginPath();
      lctx.arc(cx, cy, r, 0, Math.PI * 2);
      lctx.fill();
    };

    const draw = () => {
      const player = playerRef.current;
      const vp = viewportRef.current;

      if (canvas.width !== vp.w || canvas.height !== vp.h) {
        canvas.width = vp.w;
        canvas.height = vp.h;
      }
      ctx.imageSmoothingEnabled = false;
      ctx.fillStyle = "#2d2d2d";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      let camX = player.x - canvas.width / 2;
      let camY = player.y - canvas.height / 2;
      if (canvas.width < MAP_WIDTH) camX = Math.max(0, Math.min(camX, MAP_WIDTH - canvas.width));
      else camX = (MAP_WIDTH - canvas.width) / 2;
      if (canvas.height < MAP_HEIGHT) camY = Math.max(0, Math.min(camY, MAP_HEIGHT - canvas.height));
      else camY = (MAP_HEIGHT - canvas.height) / 2;

      ctx.save();
      ctx.translate(-Math.round(camX), -Math.round(camY));

      // Ground tiles
      const startCol = Math.floor(camX / TILE_SIZE) - 1;
      const endCol   = startCol + Math.ceil(canvas.width / TILE_SIZE) + 2;
      const startRow = Math.floor(camY / TILE_SIZE) - 1;
      const endRow   = startRow + Math.ceil(canvas.height / TILE_SIZE) + 2;

      // Pre-compute road tiles into a Set for fast lookup
      const isRoadTile = (c, r) => {
        if (c < 0 || c >= MAP_COLS || r < 0 || r >= MAP_ROWS) return false;
        // N-S boulevard
        if (c === 6 || c === 7) return true;
        // E-W main street
        if (r === 4 && c >= 2 && c <= 12) return true;
        // Southern cross street
        if (r === 11 && c >= 2 && c <= 12) return true;
        // Central plaza
        if ((c === 6 || c === 7) && (r === 4 || r === 5)) return true;
        // Library approach (c=4, r=4 → c=6)
        if (r === 4 && c >= 4 && c <= 5) return true;
        // Study approach
        if (c === 3 && r >= 5 && r <= 11) return true;
        if (c === 4 && r === 12) return true;
        // Post Office approach
        if (c === 11 && r === 12) return true;
        // Observatory approach
        if (r === 9 && c >= 8 && c <= 18) return true;
        // Tavern connector: row 7 from main road
        if (r === 7 && c >= 8 && c <= 11) return true;
        // Tavern connector: col 11 from row 7 to door at row 10
        if (c === 11 && r >= 7 && r <= 10) return true;
        return false;
      };

      for (let r = startRow; r < endRow; r++) {
        for (let c = startCol; c < endCol; c++) {
          const x = c * TILE_SIZE, y = r * TILE_SIZE;

          if (isRoadTile(c, r)) {
            // Base road color
            ctx.fillStyle = "#dfd0b0";
            ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

            // Cobblestone texture
            ctx.fillStyle = "#d2c3a2";
            if ((c + r) % 3 === 0) ctx.fillRect(x + 4, y + 6, 5, 3);
            if ((c + r) % 5 === 1) ctx.fillRect(x + 18, y + 20, 4, 3);
            if ((c * 3 + r) % 7 === 0) ctx.fillRect(x + 12, y + 10, 3, 4);
            // Subtle edge darkening
            ctx.fillStyle = "rgba(0,0,0,0.04)";
            ctx.fillRect(x, y, TILE_SIZE, 1);
            ctx.fillRect(x, y, 1, TILE_SIZE);
          } else {
            // Grass with checkerboard
            const isDark = (c + r) % 2 === 0;
            ctx.fillStyle = isDark ? "#7ec850" : "#8cd860";
            ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

            // Grass blade details
            ctx.fillStyle = isDark ? "#6ab840" : "#7cc850";
            if ((c * 7 + r * 3) % 11 === 0) { ctx.fillRect(x + 8, y + 4, 1, 4); ctx.fillRect(x + 9, y + 3, 1, 3); }
            if ((c * 5 + r * 9) % 13 === 0) { ctx.fillRect(x + 22, y + 18, 1, 4); ctx.fillRect(x + 23, y + 17, 1, 3); }
          }
        }
      }

      // ── Road edge borders ──
      ctx.fillStyle = "#b8a888";
      for (let r = startRow; r < endRow; r++) {
        for (let c = startCol; c < endCol; c++) {
          if (!isRoadTile(c, r)) continue;
          const x = c * TILE_SIZE, y = r * TILE_SIZE;
          if (!isRoadTile(c, r - 1)) ctx.fillRect(x, y, TILE_SIZE, 2);
          if (!isRoadTile(c, r + 1)) ctx.fillRect(x, y + TILE_SIZE - 2, TILE_SIZE, 2);
          if (!isRoadTile(c - 1, r)) ctx.fillRect(x, y, 2, TILE_SIZE);
          if (!isRoadTile(c + 1, r)) ctx.fillRect(x + TILE_SIZE - 2, y, 2, TILE_SIZE);
        }
      }

      // Water Well
      ctx.fillStyle = "#4ba3e3";
      ctx.fillRect(6 * TILE_SIZE, 5 * TILE_SIZE, TILE_SIZE * 2, TILE_SIZE);
      ctx.strokeStyle = "#5aaee8"; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(6.2*TILE_SIZE, 5.3*TILE_SIZE); ctx.lineTo(6.6*TILE_SIZE, 5.3*TILE_SIZE);
      ctx.moveTo(7.2*TILE_SIZE, 5.7*TILE_SIZE); ctx.lineTo(7.7*TILE_SIZE, 5.7*TILE_SIZE);
      ctx.stroke();
      ctx.fillStyle = "#8a5833";
      ctx.fillRect(6*TILE_SIZE-2, 5*TILE_SIZE-8, 4, TILE_SIZE+8);
      ctx.fillRect(8*TILE_SIZE-2, 5*TILE_SIZE-8, 4, TILE_SIZE+8);
      ctx.fillRect(6*TILE_SIZE-2, 5*TILE_SIZE-10, TILE_SIZE*2+4, 4);

      // Flowers
      for (const f of FLOWERS) {
        ctx.fillStyle = "#4b9932"; ctx.fillRect(f.x+3, f.y+4, 2, 6);
        ctx.fillStyle = f.color;   ctx.fillRect(f.x+2, f.y,   4, 4);
      }

      // ── Y-sorted entities ────────────────────────────────────────────────
      const entities = [];

      for (const t of TREES) {
        entities.push({ type:"tree", y: t.y+32, draw: () => {
          ctx.fillStyle = "rgba(0,0,0,0.15)";
          ctx.beginPath(); ctx.ellipse(t.x+16, t.y+30, 12, 6, 0, 0, Math.PI*2); ctx.fill();
          ctx.fillStyle = "#83552a"; ctx.fillRect(t.x+13, t.y+16, 6, 16);
          ctx.fillStyle = "#55ab33"; ctx.beginPath(); ctx.arc(t.x+16, t.y+8, 16, 0, Math.PI*2); ctx.fill();
          ctx.fillStyle = "#6cb947"; ctx.beginPath(); ctx.arc(t.x+12, t.y+4, 12, 0, Math.PI*2); ctx.fill();
        }});
      }

      for (const b of BUILDINGS) {
        entities.push({ type:"building", y: b.y+b.height, draw: () => {
          // Shadow
          ctx.fillStyle = "rgba(0,0,0,0.15)";
          ctx.fillRect(b.x-4, b.y+b.height-8, b.width+8, 12);

          if (b.id === "observatory") {
            // ── Observatory: stone tower ─────────────────────────────
            // Base stone walls
            ctx.fillStyle = "#8a9bac";
            ctx.fillRect(b.x, b.y+20, b.width, b.height-20);
            // Stone texture lines
            ctx.fillStyle = "#7a8b9c";
            for (let row = 0; row < 3; row++) {
              for (let col = 0; col < 3; col++) {
                ctx.fillRect(b.x + col*32 + (row%2)*16, b.y+24 + row*14, 28, 12);
              }
            }
            // Archway door
            ctx.fillStyle = "#2d2d2d";
            ctx.fillRect(b.doorX-8, b.doorY-20, 16, 20);
            ctx.beginPath();
            ctx.arc(b.doorX, b.doorY-20, 8, Math.PI, 0);
            ctx.fill();
            // Dome / roof
            ctx.fillStyle = b.color; // deep blue
            ctx.beginPath();
            ctx.ellipse(b.x + b.width/2, b.y+20, b.width/2+4, 22, 0, Math.PI, 0);
            ctx.fill();
            // Dome highlight
            ctx.fillStyle = "#3a6a9b";
            ctx.beginPath();
            ctx.ellipse(b.x + b.width/2 - 4, b.y+12, 8, 12, -0.3, Math.PI, 0);
            ctx.fill();
            // Telescope sticking out of dome
            ctx.fillStyle = "#c0b060";
            ctx.save();
            ctx.translate(b.x + b.width/2 + 10, b.y + 8);
            ctx.rotate(-0.6);
            ctx.fillRect(-3, -18, 6, 20);
            ctx.fillStyle = "#d0c070";
            ctx.fillRect(-5, -22, 10, 5);
            ctx.restore();
            // Stars around dome (small sparkles)
            ctx.fillStyle = "#ffeb90";
            const starPositions = [
              {ox:-18,oy:-4},{ox:22,oy:-2},{ox:-10,oy:-12},{ox:16,oy:-14}
            ];
            for (const sp of starPositions) {
              const sx = b.x + b.width/2 + sp.ox;
              const sy = b.y + 14 + sp.oy;
              ctx.fillRect(sx, sy, 2, 2);
            }
            // Signboard
            ctx.fillStyle = "#e8c992"; ctx.strokeStyle = "#8d6428"; ctx.lineWidth = 2;
            const signW=80, signH=14;
            const signX = b.x + (b.width-signW)/2, signY = b.y+30;
            ctx.fillRect(signX, signY, signW, signH);
            ctx.strokeRect(signX, signY, signW, signH);
            ctx.fillStyle = "#4a3512";
            ctx.font = "bold 8px monospace";
            ctx.textAlign = "center"; ctx.textBaseline = "middle";
            ctx.fillText("OBSERVATORY", b.x+b.width/2, signY+signH/2);
          } else if (b.id === "library") {
            // ── Library: brick manor with chimney ────────────────────
            const roofH = 28;
            const wallTop = b.y + roofH;
            const wallH = b.height - roofH;
            // Brick walls
            ctx.fillStyle = "#c45147";
            ctx.fillRect(b.x, wallTop, b.width, wallH);
            // Brick texture
            ctx.fillStyle = "#a8403c";
            ctx.save();
            ctx.beginPath();
            ctx.rect(b.x, wallTop, b.width, wallH);
            ctx.clip();
            for (let row = 0; row < Math.floor(wallH / 8); row++) {
              const offset = row % 2 === 0 ? 0 : 8;
              for (let col = 0; col < Math.ceil(b.width / 16); col++) {
                const bx = b.x + col * 16 + offset;
                ctx.fillRect(bx, wallTop + 2 + row * 8, 14, 6);
              }
            }
            ctx.restore();
            // Mortar lines
            ctx.fillStyle = "#d8a898";
            for (let row = 0; row < Math.floor(wallH / 8); row++) {
              ctx.fillRect(b.x, wallTop + 2 + row * 8, b.width, 1);
            }
            // Wooden door
            ctx.fillStyle = "#5e3c1b";
            ctx.fillRect(b.doorX - 10, b.doorY - 24, 20, 24);
            ctx.fillStyle = "#7a5030";
            ctx.fillRect(b.doorX - 8, b.doorY - 22, 16, 22);
            // Door knob
            ctx.fillStyle = "#e0a93c";
            ctx.beginPath(); ctx.arc(b.doorX + 5, b.doorY - 10, 2, 0, Math.PI * 2); ctx.fill();
            // Windows with book spines
            const drawLibWindow = (wx, wy) => {
              ctx.fillStyle = "#3a2010"; ctx.fillRect(wx - 1, wy - 1, 14, 18);
              ctx.fillStyle = "#f5e8c0"; ctx.fillRect(wx, wy, 12, 16);
              const bookColors = ["#d15147", "#3b68af", "#55ab33", "#8e5d38", "#8147a3"];
              for (let bi = 0; bi < 4; bi++) {
                ctx.fillStyle = bookColors[bi];
                ctx.fillRect(wx + 1 + bi * 3, wy + 1, 2, 14);
              }
            };
            drawLibWindow(b.x + 10, wallTop + 10);
            drawLibWindow(b.x + b.width - 24, wallTop + 10);
            // Peaked roof
            ctx.fillStyle = "#6b3d10";
            ctx.beginPath();
            ctx.moveTo(b.x - 6, wallTop);
            ctx.lineTo(b.x + b.width / 2, b.y - 4);
            ctx.lineTo(b.x + b.width + 6, wallTop);
            ctx.closePath(); ctx.fill();
            // Roof highlight
            ctx.fillStyle = "#8a5520";
            ctx.beginPath();
            ctx.moveTo(b.x - 4, wallTop);
            ctx.lineTo(b.x + b.width / 2, b.y);
            ctx.lineTo(b.x + b.width / 2, wallTop);
            ctx.closePath(); ctx.fill();
            // Chimney
            ctx.fillStyle = "#7a4030";
            ctx.fillRect(b.x + b.width - 20, b.y + 4, 10, roofH - 4);
            ctx.fillStyle = "#5a2a18";
            ctx.fillRect(b.x + b.width - 22, b.y + 2, 14, 4);
            // Signboard
            ctx.fillStyle = "#e8c992"; ctx.strokeStyle = "#8d6428"; ctx.lineWidth = 2;
            const signW = 60, signH = 14;
            const signX = b.x + (b.width - signW) / 2, signY = wallTop + 4;
            ctx.fillRect(signX, signY, signW, signH);
            ctx.strokeRect(signX, signY, signW, signH);
            ctx.fillStyle = "#4a3512";
            ctx.font = "bold 9px monospace";
            ctx.textAlign = "center"; ctx.textBaseline = "middle";
            ctx.fillText("LIBRARY", b.x + b.width / 2, signY + signH / 2);

          } else if (b.id === "workshop") {
            // ── Workshop: wooden cabin with gear ──────────────────────
            const roofH = 24;
            const wallTop = b.y + roofH;
            const wallH = b.height - roofH;
            // Log cabin walls
            ctx.fillStyle = "#8a6a3a";
            ctx.fillRect(b.x, wallTop, b.width, wallH);
            // Horizontal log lines
            ctx.fillStyle = "#7a5a2a";
            for (let row = 0; row < Math.floor(wallH / 6); row++) {
              ctx.fillRect(b.x, wallTop + 2 + row * 6, b.width, 2);
            }
            // Knots in wood
            ctx.fillStyle = "#6a4a1a";
            ctx.beginPath(); ctx.arc(b.x + 12, wallTop + 10, 3, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(b.x + b.width - 14, wallTop + wallH - 12, 2, 0, Math.PI * 2); ctx.fill();
            // Double barn door
            ctx.fillStyle = "#5e3c1b";
            ctx.fillRect(b.doorX - 12, b.doorY - 24, 24, 24);
            ctx.fillStyle = "#7a5030";
            ctx.fillRect(b.doorX - 10, b.doorY - 22, 10, 20);
            ctx.fillRect(b.doorX + 1, b.doorY - 22, 10, 20);
            // Door X braces
            ctx.strokeStyle = "#5e3c1b"; ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(b.doorX - 9, b.doorY - 21); ctx.lineTo(b.doorX - 1, b.doorY - 3);
            ctx.moveTo(b.doorX - 1, b.doorY - 21); ctx.lineTo(b.doorX - 9, b.doorY - 3);
            ctx.moveTo(b.doorX + 2, b.doorY - 21); ctx.lineTo(b.doorX + 10, b.doorY - 3);
            ctx.moveTo(b.doorX + 10, b.doorY - 21); ctx.lineTo(b.doorX + 2, b.doorY - 3);
            ctx.stroke();
            // Window with shutters
            ctx.fillStyle = "#7ec2e6"; ctx.fillRect(b.x + 10, wallTop + 8, 12, 16);
            ctx.fillStyle = "#5e3c1b";
            ctx.fillRect(b.x + 6, wallTop + 6, 6, 20);
            ctx.fillRect(b.x + 20, wallTop + 6, 6, 20);
            // Workbench under right window
            ctx.fillStyle = "#6b4020";
            ctx.fillRect(b.x + b.width - 26, wallTop + 16, 18, 4);
            // Flat roof with overhang
            ctx.fillStyle = "#4a3520";
            ctx.fillRect(b.x - 6, wallTop - 4, b.width + 12, 6);
            ctx.fillStyle = "#5e4530";
            ctx.fillRect(b.x - 4, wallTop - 8, b.width + 8, 6);
            // Gear icon on roof
            ctx.fillStyle = "#a09070";
            ctx.beginPath(); ctx.arc(b.x + b.width / 2, b.y + 10, 8, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = "#4a3520";
            ctx.beginPath(); ctx.arc(b.x + b.width / 2, b.y + 10, 4, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = "#a09070";
            for (let a = 0; a < 6; a++) {
              const angle = a * Math.PI / 3;
              ctx.fillRect(b.x + b.width / 2 + Math.cos(angle) * 7 - 2, b.y + 10 + Math.sin(angle) * 7 - 2, 4, 4);
            }
            // Signboard
            ctx.fillStyle = "#e8c992"; ctx.strokeStyle = "#8d6428"; ctx.lineWidth = 2;
            const signW = 72, signH = 14;
            const signX = b.x + (b.width - signW) / 2, signY = wallTop + 4;
            ctx.fillRect(signX, signY, signW, signH);
            ctx.strokeRect(signX, signY, signW, signH);
            ctx.fillStyle = "#4a3512";
            ctx.font = "bold 8px monospace";
            ctx.textAlign = "center"; ctx.textBaseline = "middle";
            ctx.fillText("WORKSHOP", b.x + b.width / 2, signY + signH / 2);

          } else if (b.id === "study") {
            // ── Study: stone tower with purple roof ───────────────────
            const roofH = 32;
            const wallTop = b.y + roofH;
            const wallH = b.height - roofH;
            // Stone walls
            ctx.fillStyle = "#b0a898";
            ctx.fillRect(b.x, wallTop, b.width, wallH);
            // Stone blocks texture
            ctx.fillStyle = "#a09888";
            ctx.save();
            ctx.beginPath();
            ctx.rect(b.x, wallTop, b.width, wallH);
            ctx.clip();
            for (let row = 0; row < Math.floor(wallH / 10); row++) {
              const offset = row % 2 === 0 ? 0 : 10;
              for (let col = 0; col < Math.ceil(b.width / 20); col++) {
                const bx = b.x + col * 20 + offset;
                ctx.fillRect(bx, wallTop + 2 + row * 10, 18, 8);
              }
            }
            ctx.restore();
            // Mortar
            ctx.fillStyle = "#c8c0b0";
            for (let row = 0; row <= Math.floor(wallH / 10); row++) {
              ctx.fillRect(b.x, wallTop + 2 + row * 10, b.width, 1);
            }
            // Arched stone doorway
            ctx.fillStyle = "#3a2010";
            ctx.fillRect(b.doorX - 10, b.doorY - 24, 20, 24);
            ctx.beginPath();
            ctx.arc(b.doorX, b.doorY - 24, 10, Math.PI, 0);
            ctx.fill();
            ctx.fillStyle = "#5e3c1b";
            ctx.fillRect(b.doorX - 8, b.doorY - 22, 16, 22);
            ctx.fillStyle = "#e0a93c";
            ctx.beginPath(); ctx.arc(b.doorX + 4, b.doorY - 10, 2, 0, Math.PI * 2); ctx.fill();
            // Tall arched windows
            const drawStoneWindow = (wx, wy) => {
              ctx.fillStyle = "#3a2010";
              ctx.fillRect(wx - 1, wy - 1, 12, 18);
              ctx.fillStyle = "#7ec2e6";
              ctx.fillRect(wx, wy, 10, 16);
              // Window divider
              ctx.fillStyle = "#3a2010";
              ctx.fillRect(wx + 4, wy, 2, 16);
              ctx.fillRect(wx, wy + 7, 10, 2);
            };
            drawStoneWindow(b.x + 10, wallTop + 8);
            drawStoneWindow(b.x + b.width - 22, wallTop + 8);
            // Pointed purple roof (wizard tower)
            ctx.fillStyle = b.color;
            ctx.beginPath();
            ctx.moveTo(b.x - 4, wallTop);
            ctx.lineTo(b.x + b.width / 2, b.y - 4);
            ctx.lineTo(b.x + b.width + 4, wallTop);
            ctx.closePath(); ctx.fill();
            // Roof highlight
            ctx.fillStyle = "#9a57c3";
            ctx.beginPath();
            ctx.moveTo(b.x, wallTop);
            ctx.lineTo(b.x + b.width / 2, b.y);
            ctx.lineTo(b.x + b.width / 2, wallTop);
            ctx.closePath(); ctx.fill();
            // Signboard
            ctx.fillStyle = "#e8c992"; ctx.strokeStyle = "#8d6428"; ctx.lineWidth = 2;
            const signW = 48, signH = 14;
            const signX = b.x + (b.width - signW) / 2, signY = wallTop + 4;
            ctx.fillRect(signX, signY, signW, signH);
            ctx.strokeRect(signX, signY, signW, signH);
            ctx.fillStyle = "#4a3512";
            ctx.font = "bold 9px monospace";
            ctx.textAlign = "center"; ctx.textBaseline = "middle";
            ctx.fillText("STUDY", b.x + b.width / 2, signY + signH / 2);

          } else if (b.id === "post") {
            // ── Post Office: small wooden shack with mailbox ──────────
            const roofH = 18;
            const wallTop = b.y + roofH;
            const wallH = b.height - roofH;
            // Wooden plank walls
            ctx.fillStyle = "#c8985a";
            ctx.fillRect(b.x, wallTop, b.width, wallH);
            // Plank lines
            ctx.fillStyle = "#b08848";
            for (let col = 0; col <= 3; col++) {
              const px = b.x + col * (b.width / 3);
              if (px >= b.x && px <= b.x + b.width) {
                ctx.fillRect(px, wallTop, 1, wallH);
              }
            }
            ctx.fillStyle = "#a07838";
            for (let row = 0; row < Math.floor(wallH / 8); row++) {
              ctx.fillRect(b.x, wallTop + 2 + row * 8, b.width, 1);
            }
            // Simple door
            ctx.fillStyle = "#5e3c1b";
            ctx.fillRect(b.doorX - 8, b.doorY - 18, 16, 18);
            ctx.fillStyle = "#7a5030";
            ctx.fillRect(b.doorX - 6, b.doorY - 16, 12, 16);
            // Door knob
            ctx.fillStyle = "#e0a93c";
            ctx.beginPath(); ctx.arc(b.doorX + 3, b.doorY - 8, 1.5, 0, Math.PI * 2); ctx.fill();
            // Envelope slot on door
            ctx.fillStyle = "#3a2010";
            ctx.fillRect(b.doorX - 3, b.doorY - 14, 6, 2);
            // Mailbox out front
            ctx.fillStyle = "#d15147";
            ctx.fillRect(b.x - 6, b.y + b.height - 12, 6, 12);
            ctx.fillStyle = "#b84038";
            ctx.fillRect(b.x - 8, b.y + b.height - 14, 10, 4);
            ctx.fillStyle = "#e0a93c";
            ctx.fillRect(b.x - 6, b.y + b.height - 8, 6, 2);
            // Flat shingled roof
            ctx.fillStyle = "#8e5d38";
            ctx.fillRect(b.x - 4, wallTop - 4, b.width + 8, 6);
            ctx.fillStyle = "#a06838";
            ctx.fillRect(b.x - 2, wallTop - 8, b.width + 4, 6);
            // Signboard
            ctx.fillStyle = "#e8c992"; ctx.strokeStyle = "#8d6428"; ctx.lineWidth = 2;
            const signW = Math.min(56, b.width - 4), signH = 12;
            const signX = b.x + (b.width - signW) / 2, signY = wallTop + 2;
            ctx.fillRect(signX, signY, signW, signH);
            ctx.strokeRect(signX, signY, signW, signH);
            ctx.fillStyle = "#4a3512";
            ctx.font = "bold 7px monospace";
            ctx.textAlign = "center"; ctx.textBaseline = "middle";
            ctx.fillText("POST OFFICE", b.x + b.width / 2, signY + signH / 2);

          } else if (b.id === "tavern") {
            // ── Tavern: cozy wooden cabin with chimney & warm glow ─────
            const roofH = 26;
            const wallTop = b.y + roofH;
            const wallH = b.height - roofH;

            // Foundation stones
            ctx.fillStyle = "#6a6058";
            ctx.fillRect(b.x - 2, wallTop + wallH - 6, b.width + 4, 6);
            ctx.fillStyle = "#7a7068";
            for (let col = 0; col < Math.ceil(b.width / 12); col++) {
              ctx.fillRect(b.x - 2 + col * 12, wallTop + wallH - 6, 10, 5);
            }

            // Log cabin walls
            ctx.fillStyle = "#a07838";
            ctx.fillRect(b.x, wallTop, b.width, wallH - 6);
            // Log texture (horizontal logs)
            ctx.fillStyle = "#8a6828";
            for (let row = 0; row < Math.floor(wallH / 8); row++) {
              ctx.fillRect(b.x, wallTop + row * 8, b.width, 1);
              // Log end circles on sides
              ctx.fillStyle = "#7a5818";
              ctx.beginPath(); ctx.arc(b.x, wallTop + row * 8 + 4, 3, 0, Math.PI * 2); ctx.fill();
              ctx.beginPath(); ctx.arc(b.x + b.width, wallTop + row * 8 + 4, 3, 0, Math.PI * 2); ctx.fill();
              ctx.fillStyle = "#8a6828";
            }
            // Darker wood grain
            ctx.fillStyle = "#906820";
            ctx.fillRect(b.x + 8, wallTop + 3, 1, wallH - 10);
            ctx.fillRect(b.x + b.width - 10, wallTop + 3, 1, wallH - 10);

            // Warm glowing windows
            const drawTavernWindow = (wx, wy) => {
              // Window frame
              ctx.fillStyle = "#5e3c1b";
              ctx.fillRect(wx - 2, wy - 2, 18, 18);
              // Warm glow inside
              const glow = ctx.createRadialGradient(wx + 7, wy + 7, 0, wx + 7, wy + 7, 12);
              glow.addColorStop(0, "#ffe8a0");
              glow.addColorStop(0.6, "#f5c840");
              glow.addColorStop(1, "#d4a020");
              ctx.fillStyle = glow;
              ctx.fillRect(wx, wy, 14, 14);
              // Window cross
              ctx.fillStyle = "#5e3c1b";
              ctx.fillRect(wx + 6, wy, 2, 14);
              ctx.fillRect(wx, wy + 6, 14, 2);
            };
            drawTavernWindow(b.x + 10, wallTop + 10);
            drawTavernWindow(b.x + b.width - 28, wallTop + 10);

            // Swinging door (wooden saloon style)
            ctx.fillStyle = "#5e3c1b";
            ctx.fillRect(b.doorX - 14, b.doorY - 28, 28, 28);
            // Door panels
            ctx.fillStyle = "#7a5030";
            ctx.fillRect(b.doorX - 12, b.doorY - 26, 11, 24);
            ctx.fillRect(b.doorX + 1, b.doorY - 26, 11, 24);
            // Door handles
            ctx.fillStyle = "#e0a93c";
            ctx.beginPath(); ctx.arc(b.doorX - 3, b.doorY - 14, 2, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(b.doorX + 3, b.doorY - 14, 2, 0, Math.PI * 2); ctx.fill();
            // Warm light spilling from door
            ctx.fillStyle = "rgba(255, 220, 120, 0.15)";
            ctx.beginPath();
            ctx.moveTo(b.doorX - 12, b.doorY);
            ctx.lineTo(b.doorX - 20, b.doorY + 10);
            ctx.lineTo(b.doorX + 20, b.doorY + 10);
            ctx.lineTo(b.doorX + 12, b.doorY);
            ctx.closePath(); ctx.fill();

            // Pitched wooden roof
            ctx.fillStyle = "#7a4a20";
            ctx.beginPath();
            ctx.moveTo(b.x - 6, wallTop);
            ctx.lineTo(b.x + b.width / 2, b.y);
            ctx.lineTo(b.x + b.width + 6, wallTop);
            ctx.closePath(); ctx.fill();
            // Roof planks
            ctx.fillStyle = "#8a5a28";
            ctx.beginPath();
            ctx.moveTo(b.x - 2, wallTop);
            ctx.lineTo(b.x + b.width / 2, b.y + 4);
            ctx.lineTo(b.x + b.width / 2, wallTop);
            ctx.closePath(); ctx.fill();
            // Roof ridge
            ctx.fillStyle = "#6a3a18";
            ctx.fillRect(b.x + b.width / 2 - 2, b.y, 4, 4);

            // Chimney with animated smoke
            const chimX = b.x + b.width - 18;
            const chimY = b.y - 4;
            ctx.fillStyle = "#8a6050";
            ctx.fillRect(chimX, chimY, 12, 16);
            ctx.fillStyle = "#7a5040";
            ctx.fillRect(chimX - 2, chimY - 2, 16, 4);
            ctx.fillRect(chimX - 2, chimY + 12, 16, 4);
            // Smoke particles (animated)
            const smokeT = Date.now() * 0.001;
            ctx.fillStyle = "rgba(180,180,180,0.3)";
            for (let i = 0; i < 4; i++) {
              const sy = chimY - 8 - i * 10 - (smokeT * 8 + i * 3) % 20;
              const sx = chimX + 6 + Math.sin(smokeT + i * 1.5) * 6;
              const sr = 3 + i * 1.5;
              ctx.beginPath(); ctx.arc(sx, sy, sr, 0, Math.PI * 2); ctx.fill();
            }

            // Hanging sign
            const signW = 56, signH = 16;
            const signX = b.x + (b.width - signW) / 2;
            const signY = wallTop + 2;
            // Sign chains
            ctx.fillStyle = "#8d6428";
            ctx.fillRect(signX + 6, wallTop - 4, 2, 6);
            ctx.fillRect(signX + signW - 8, wallTop - 4, 2, 6);
            // Sign board
            ctx.fillStyle = "#3a2010";
            ctx.fillRect(signX, signY, signW, signH);
            ctx.fillStyle = "#5a3818";
            ctx.fillRect(signX + 2, signY + 2, signW - 4, signH - 4);
            ctx.fillStyle = "#e8c992";
            ctx.font = "bold 8px monospace";
            ctx.textAlign = "center"; ctx.textBaseline = "middle";
            ctx.fillText("TAVERN", b.x + b.width / 2, signY + signH / 2);

            // Barrel outside
            ctx.fillStyle = "#8a6030";
            ctx.fillRect(b.x - 10, b.y + b.height - 14, 10, 14);
            ctx.fillStyle = "#6a4820";
            ctx.fillRect(b.x - 11, b.y + b.height - 12, 12, 2);
            ctx.fillRect(b.x - 11, b.y + b.height - 4, 12, 2);
            ctx.fillStyle = "#a07838";
            ctx.fillRect(b.x - 8, b.y + b.height - 10, 6, 6);

            // Lantern by door
            ctx.fillStyle = "#5a4020";
            ctx.fillRect(b.doorX + 18, wallTop + 4, 2, 8);
            ctx.fillStyle = "#ffe080";
            ctx.fillRect(b.doorX + 16, wallTop + 12, 6, 8);
            ctx.fillStyle = "#ffd040";
            ctx.fillRect(b.doorX + 17, wallTop + 13, 4, 6);
          }
        }});
      }

      // ── Scholar NPC ──────────────────────────────────────────────────────
      for (const npc of NPCS) {
        entities.push({ type:"npc", y: npc.y+12, draw: () => {
          const bob = Math.sin(Date.now() * 0.002) * 1.5; // idle breathing

          // Shadow
          ctx.fillStyle = "rgba(0,0,0,0.18)";
          ctx.beginPath(); ctx.ellipse(npc.x, npc.y+4, 8, 3, 0, 0, Math.PI*2); ctx.fill();

          // Robe body
          ctx.fillStyle = npc.color;
          ctx.fillRect(npc.x-7, npc.y-14+bob, 14, 14);
          // Robe bottom flare
          ctx.beginPath();
          ctx.moveTo(npc.x-7, npc.y+bob);
          ctx.lineTo(npc.x-10, npc.y+6+bob);
          ctx.lineTo(npc.x+10, npc.y+6+bob);
          ctx.lineTo(npc.x+7, npc.y+bob);
          ctx.closePath();
          ctx.fill();

          // Head
          ctx.fillStyle = "#eed5c5"; ctx.fillRect(npc.x-5, npc.y-24+bob, 10, 10);
          // Beard
          ctx.fillStyle = "#c8b8a0"; ctx.fillRect(npc.x-4, npc.y-16+bob, 8, 4);
          // Wizard hat
          ctx.fillStyle = "#4a2c6e";
          ctx.beginPath();
          ctx.moveTo(npc.x-8, npc.y-24+bob);
          ctx.lineTo(npc.x, npc.y-38+bob);
          ctx.lineTo(npc.x+8, npc.y-24+bob);
          ctx.closePath(); ctx.fill();
          ctx.fillRect(npc.x-9, npc.y-25+bob, 18, 3); // hat brim
          // Star on hat
          ctx.fillStyle = "#ffeb60"; ctx.fillRect(npc.x-1, npc.y-35+bob, 2, 2);
          // Staff
          ctx.fillStyle = "#8a5833";
          ctx.fillRect(npc.x+8, npc.y-30+bob, 3, 36);
          ctx.fillStyle = "#a0d8ef";
          ctx.beginPath(); ctx.arc(npc.x+9, npc.y-32+bob, 4, 0, Math.PI*2); ctx.fill();

          // Name label
          ctx.fillStyle = "rgba(12,16,28,0.82)";
          const lw = 90;
          ctx.fillRect(npc.x - lw/2, npc.y - 50 + bob, lw, 14);
          ctx.strokeStyle = "#8d6428";
          ctx.lineWidth = 1;
          ctx.strokeRect(npc.x - lw/2, npc.y - 50 + bob, lw, 14);
          ctx.fillStyle = "#ffeb60";
          ctx.font = "bold 7px 'Press Start 2P', monospace";
          ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.fillText("THE SCHOLAR", npc.x, npc.y - 43 + bob);
        }});
      }

      // Lamps
      for (const lamp of LAMPS) {
        entities.push({ type:"lamp", y: lamp.y+32, draw: () => {
          ctx.fillStyle="rgba(0,0,0,0.15)";
          ctx.beginPath(); ctx.ellipse(lamp.x+1,lamp.y+30,4,2,0,0,Math.PI*2); ctx.fill();
          ctx.fillStyle="#4a4a4a"; ctx.fillRect(lamp.x,lamp.y+4,3,28);
          ctx.fillStyle="#2d2d2d";
          ctx.fillRect(lamp.x-3,lamp.y-4,9,3); ctx.fillRect(lamp.x-3,lamp.y+4,9,1);
          ctx.fillRect(lamp.x-3,lamp.y-4,1,8); ctx.fillRect(lamp.x+5,lamp.y-4,1,8);
          ctx.fillStyle="#ffeb60"; ctx.fillRect(lamp.x-2,lamp.y-1,7,5);
        }});
      }

      // Cat NPC
      {
        const cat = catRef.current;
        const catBob = cat.isMoving ? Math.sin(cat.walkCycle) * 1.5 : Math.sin(Date.now() * 0.003) * 0.8;
        entities.push({ type:"cat", y: cat.y+4, draw: () => {
          // Shadow
          ctx.fillStyle = "rgba(0,0,0,0.18)";
          ctx.beginPath(); ctx.ellipse(cat.x, cat.y+4, 7, 3, 0, 0, Math.PI*2); ctx.fill();

          // Body (orange tabby)
          ctx.fillStyle = "#e8923a";
          ctx.fillRect(cat.x-6, cat.y-6+catBob, 12, 8);
          // Darker stripes
          ctx.fillStyle = "#c87428";
          ctx.fillRect(cat.x-4, cat.y-4+catBob, 2, 6);
          ctx.fillRect(cat.x+2, cat.y-4+catBob, 2, 6);

          // Head
          ctx.fillStyle = "#e8923a";
          ctx.fillRect(cat.x-5, cat.y-13+catBob, 10, 8);
          // Ears
          ctx.fillStyle = "#e8923a";
          ctx.beginPath();
          ctx.moveTo(cat.x-5, cat.y-13+catBob);
          ctx.lineTo(cat.x-7, cat.y-19+catBob);
          ctx.lineTo(cat.x-2, cat.y-13+catBob);
          ctx.closePath(); ctx.fill();
          ctx.beginPath();
          ctx.moveTo(cat.x+5, cat.y-13+catBob);
          ctx.lineTo(cat.x+7, cat.y-19+catBob);
          ctx.lineTo(cat.x+2, cat.y-13+catBob);
          ctx.closePath(); ctx.fill();
          // Inner ears
          ctx.fillStyle = "#f5b8a0";
          ctx.beginPath();
          ctx.moveTo(cat.x-4, cat.y-13+catBob);
          ctx.lineTo(cat.x-5, cat.y-16+catBob);
          ctx.lineTo(cat.x-2, cat.y-13+catBob);
          ctx.closePath(); ctx.fill();
          ctx.beginPath();
          ctx.moveTo(cat.x+4, cat.y-13+catBob);
          ctx.lineTo(cat.x+5, cat.y-16+catBob);
          ctx.lineTo(cat.x+2, cat.y-13+catBob);
          ctx.closePath(); ctx.fill();

          // Eyes
          ctx.fillStyle = "#2a2a2a";
          const blinkCycle = Date.now() % 4000;
          const eyeH = blinkCycle > 3850 ? 1 : 3;
          ctx.fillRect(cat.x-3, cat.y-10+catBob, 2, eyeH);
          ctx.fillRect(cat.x+1, cat.y-10+catBob, 2, eyeH);
          // Eye shine
          if (eyeH > 1) {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(cat.x-2, cat.y-10+catBob, 1, 1);
            ctx.fillRect(cat.x+2, cat.y-10+catBob, 1, 1);
          }
          // Nose
          ctx.fillStyle = "#f5a0a0";
          ctx.fillRect(cat.x-1, cat.y-7+catBob, 2, 1);
          // Mouth
          ctx.fillStyle = "#c87428";
          ctx.fillRect(cat.x-2, cat.y-6+catBob, 1, 1);
          ctx.fillRect(cat.x+1, cat.y-6+catBob, 1, 1);

          // Tail (wagging)
          const tailWag = Math.sin(Date.now() * 0.005) * 4;
          ctx.fillStyle = "#e8923a";
          ctx.save();
          ctx.translate(cat.x + (cat.dir === "left" ? -6 : 6), cat.y - 2 + catBob);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.quadraticCurveTo(tailWag, -6, tailWag * 1.5, -12);
          ctx.lineWidth = 3;
          ctx.strokeStyle = "#e8923a";
          ctx.stroke();
          ctx.restore();

          // Legs (walking animation)
          ctx.fillStyle = "#c87428";
          const legOffset = cat.isMoving ? Math.sin(cat.walkCycle) * 3 : 0;
          ctx.fillRect(cat.x-4, cat.y+2+catBob+(legOffset>0?-1:0), 3, 4+legOffset);
          ctx.fillRect(cat.x+1, cat.y+2+catBob+(-legOffset>0?-1:0), 3, 4-legOffset);

          // Name label
          ctx.fillStyle = "rgba(12,16,28,0.82)";
          const clw = 64;
          ctx.fillRect(cat.x - clw/2, cat.y - 28 + catBob, clw, 12);
          ctx.strokeStyle = "#8d6428";
          ctx.lineWidth = 1;
          ctx.strokeRect(cat.x - clw/2, cat.y - 28 + catBob, clw, 12);
          ctx.fillStyle = "#f5a060";
          ctx.font = "bold 6px 'Press Start 2P', monospace";
          ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.fillText(CAT_CONFIG.name, cat.x, cat.y - 22 + catBob);

          // Speech bubble if active
          const catBubble = catBubbleRef.current;
          if (catBubble && catBubble.text) {
            const bubblePadX = 10, bubblePadY = 8;
            ctx.imageSmoothingEnabled = true;
            ctx.font = "600 12px 'Segoe UI', Arial, sans-serif";
            const maxTextW = 180;
            const lines = [];
            const words = catBubble.text.split(" ");
            let line = "";
            for (const w of words) {
              const test = line ? line + " " + w : w;
              if (ctx.measureText(test).width > maxTextW) {
                lines.push(line);
                line = w;
              } else {
                line = test;
              }
            }
            if (line) lines.push(line);
            const lineH = 15;
            const bw = maxTextW + bubblePadX * 2, bh = lines.length * lineH + bubblePadY * 2;
            const bx = cat.x - bw / 2;
            const by = cat.y - 38 + catBob - bh;
            // Bubble bg
            ctx.fillStyle = "#fff8e8";
            ctx.beginPath();
            const r = 6;
            ctx.moveTo(bx + r, by);
            ctx.lineTo(bx + bw - r, by);
            ctx.arcTo(bx + bw, by, bx + bw, by + r, r);
            ctx.lineTo(bx + bw, by + bh - r);
            ctx.arcTo(bx + bw, by + bh, bx + bw - r, by + bh, r);
            ctx.lineTo(bx + r, by + bh);
            ctx.arcTo(bx, by + bh, bx, by + bh - r, r);
            ctx.lineTo(bx, by + r);
            ctx.arcTo(bx, by, bx + r, by, r);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = "#5a3d16";
            ctx.lineWidth = 2;
            ctx.stroke();
            // Tail of bubble
            ctx.fillStyle = "#fff8e8";
            ctx.beginPath();
            ctx.moveTo(cat.x - 5, by + bh - 1);
            ctx.lineTo(cat.x, by + bh + 8);
            ctx.lineTo(cat.x + 5, by + bh - 1);
            ctx.closePath(); ctx.fill();
            ctx.strokeStyle = "#5a3d16";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(cat.x - 5, by + bh);
            ctx.lineTo(cat.x, by + bh + 8);
            ctx.lineTo(cat.x + 5, by + bh);
            ctx.stroke();
            // Cover tail overlap inside bubble
            ctx.fillStyle = "#fff8e8";
            ctx.fillRect(cat.x - 6, by + bh - 3, 12, 4);
            // Text
            ctx.fillStyle = "#2b1f11";
            ctx.textAlign = "left"; ctx.textBaseline = "top";
            lines.forEach((l, i) => {
              ctx.fillText(l, bx + bubblePadX, by + bubblePadY + i * lineH);
            });
            ctx.imageSmoothingEnabled = false;
          }
        }});
      }

      // Player
      entities.push({ type:"player", y: playerRef.current.y, draw: () => {
        const p = playerRef.current;
        ctx.fillStyle="rgba(0,0,0,0.2)";
        ctx.beginPath(); ctx.ellipse(p.x,p.y+2,8,4,0,0,Math.PI*2); ctx.fill();
        const bob = p.isMoving ? Math.sin(p.walkCycle)*2 : 0;
        ctx.fillStyle="#3da35d"; ctx.fillRect(p.x-6, p.y-14+bob, 12, 11);
        ctx.fillStyle="#eed5c5"; ctx.fillRect(p.x-5, p.y-23+bob, 10, 9);
        ctx.fillStyle="#5d3e23";
        if (p.dir==="down") {
          ctx.fillRect(p.x-6,p.y-25+bob,12,4); ctx.fillRect(p.x-6,p.y-21+bob,2,4); ctx.fillRect(p.x+4,p.y-21+bob,2,4);
          ctx.fillStyle="#222"; ctx.fillRect(p.x-3,p.y-19+bob,2,2); ctx.fillRect(p.x+1,p.y-19+bob,2,2);
        } else if (p.dir==="up") {
          ctx.fillRect(p.x-6,p.y-25+bob,12,10);
        } else if (p.dir==="left") {
          ctx.fillRect(p.x-6,p.y-25+bob,10,4); ctx.fillRect(p.x-6,p.y-21+bob,6,8);
          ctx.fillStyle="#222"; ctx.fillRect(p.x-3,p.y-19+bob,2,2);
        } else {
          ctx.fillRect(p.x-4,p.y-25+bob,10,4); ctx.fillRect(p.x,p.y-21+bob,6,8);
          ctx.fillStyle="#222"; ctx.fillRect(p.x+1,p.y-19+bob,2,2);
        }
        ctx.fillStyle="#2d52a8";
        const lo = p.isMoving ? Math.sin(p.walkCycle)*3 : 0;
        const ro = p.isMoving ? -Math.sin(p.walkCycle)*3 : 0;
        ctx.fillRect(p.x-5, p.y-3+bob+(lo>0?-1:0), 3, 5+lo);
        ctx.fillRect(p.x+2, p.y-3+bob+(ro>0?-1:0), 3, 5+ro);
      }});

      entities.sort((a, b) => a.y - b.y);
      for (const e of entities) e.draw();

      // ── E Prompt bubble ──────────────────────────────────────────────────
      if (interactPrompt && !activeModal) {
        let bubbleX, bubbleY;
        if (interactPrompt.type === "building") {
          bubbleX = interactPrompt.doorX;
          bubbleY = interactPrompt.doorY - 36 + Math.sin(Date.now()*0.005)*2.5;
        } else if (interactPrompt.type === "cat") {
          bubbleX = interactPrompt.x;
          bubbleY = interactPrompt.y - 38 + Math.sin(Date.now()*0.005)*2.5;
        } else {
          bubbleX = interactPrompt.x;
          bubbleY = interactPrompt.y - 50 + Math.sin(Date.now()*0.005)*2.5;
        }
        ctx.fillStyle="#5a3d16"; ctx.fillRect(bubbleX-10, bubbleY-10, 20, 20);
        ctx.fillStyle="#ffeb60"; ctx.fillRect(bubbleX-8, bubbleY-8, 16, 16);
        ctx.fillStyle="#2b1f11";
        ctx.font="bold 9px 'Press Start 2P', monospace";
        ctx.textAlign="center"; ctx.textBaseline="middle";
        ctx.fillText("E", bubbleX, bubbleY);
      }

      ctx.restore();

      // Night overlay
      if (!light) {
        const lightCanvas = document.createElement("canvas");
        lightCanvas.width = canvas.width; lightCanvas.height = canvas.height;
        const lctx = lightCanvas.getContext("2d");
        lctx.fillStyle = "rgba(10,14,26,0.62)";
        lctx.fillRect(0,0,canvas.width,canvas.height);
        lctx.globalCompositeOperation = "destination-out";
        for (const lamp of LAMPS) {
          drawLightCircle(lctx, lamp.x+1.5-camX, lamp.y-camY, 80);
        }
        // Observatory light (slightly blue tint sphere)
        const obs = BUILDINGS.find(b => b.id==="observatory");
        if (obs) drawLightCircle(lctx, obs.x+obs.width/2-camX, obs.y+10-camY, 60);
        // Tavern warm light
        const tavern = BUILDINGS.find(b => b.id==="tavern");
        if (tavern) drawLightCircle(lctx, tavern.x+tavern.width/2-camX, tavern.y+tavern.height-camY, 70);
        drawLightCircle(lctx, playerRef.current.x-camX, playerRef.current.y-10-camY, 60);
        ctx.drawImage(lightCanvas,0,0);
        for (const lamp of LAMPS) {
          const sx=lamp.x+1.5-camX, sy=lamp.y-camY;
          const grad=ctx.createRadialGradient(sx,sy,0,sx,sy,80);
          grad.addColorStop(0,"rgba(255,230,100,0.22)");
          grad.addColorStop(0.4,"rgba(255,220,90,0.08)");
          grad.addColorStop(1,"rgba(255,220,90,0)");
          ctx.fillStyle=grad; ctx.beginPath(); ctx.arc(sx,sy,80,0,Math.PI*2); ctx.fill();
        }
        // Observatory blue glow
        if (obs) {
          const ox=obs.x+obs.width/2-camX, oy=obs.y+10-camY;
          const ograd=ctx.createRadialGradient(ox,oy,0,ox,oy,70);
          ograd.addColorStop(0,"rgba(100,160,255,0.18)");
          ograd.addColorStop(1,"rgba(100,160,255,0)");
          ctx.fillStyle=ograd; ctx.beginPath(); ctx.arc(ox,oy,70,0,Math.PI*2); ctx.fill();
        }
        // Tavern warm glow
        if (tavern) {
          const tx=tavern.x+tavern.width/2-camX, ty=tavern.y+tavern.height-camY;
          const tgrad=ctx.createRadialGradient(tx,ty,0,tx,ty,80);
          tgrad.addColorStop(0,"rgba(255,200,80,0.22)");
          tgrad.addColorStop(0.5,"rgba(255,180,60,0.08)");
          tgrad.addColorStop(1,"rgba(255,180,60,0)");
          ctx.fillStyle=tgrad; ctx.beginPath(); ctx.arc(tx,ty,80,0,Math.PI*2); ctx.fill();
        }
      }
    };

    const loop = () => {
      update();
      draw();
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [activeModal, light, interactPrompt]);

  const handleTouchStart = (dir) => { keysRef.current[dir] = true; };
  const handleTouchEnd   = (dir) => { keysRef.current[dir] = false; };
  const handleActionClick = () => {
    if (interactPrompt && !activeModal) {
      if (interactPrompt.type === "building") onTriggerBuilding(interactPrompt.id);
      else if (interactPrompt.type === "npc") onTriggerNPC(interactPrompt.id);
      else if (interactPrompt.type === "cat") triggerCatQuote();
    }
  };

  const promptLabel = interactPrompt
    ? (interactPrompt.type === "building"
        ? `press [E] to enter THE ${interactPrompt.name}`
        : interactPrompt.type === "cat"
          ? `press [E] to pet the cat`
          : `press [E] to talk to ${interactPrompt.name}`)
    : null;

  return (
    <div className="game-world-container" ref={containerRef}>
      <canvas ref={canvasRef} className="game-canvas" />

      <div className="game-hud game-hud-left">
        <span className="game-hud-icon">🌿</span> CRUAZ&apos;S VILLAGE
      </div>

      {!isTouchDevice && (
        <div className="game-hud game-hud-right">
          <div className="hud-line">WASD / ARROWS</div>
          <div className="hud-line">E - INTERACT</div>
        </div>
      )}

      <div className="game-footer-banner">
        {interactPrompt ? (
          <span className="interact-message">
            press <span className="highlight-key">[E]</span> to{" "}
            {interactPrompt.type === "building"
              ? `enter THE ${interactPrompt.name}`
              : interactPrompt.type === "cat"
                ? "pet the cat"
                : `talk to ${interactPrompt.name}`}
          </span>
        ) : (
          <span className="explore-message">use WASD / arrow keys to explore the village</span>
        )}
      </div>

      {isTouchDevice && (
        <div className="virtual-dpad">
          <div className="dpad-row">
            <button className="dpad-btn dpad-up" onTouchStart={() => handleTouchStart("arrowup")} onTouchEnd={() => handleTouchEnd("arrowup")}>▲</button>
          </div>
          <div className="dpad-row">
            <button className="dpad-btn dpad-left" onTouchStart={() => handleTouchStart("arrowleft")} onTouchEnd={() => handleTouchEnd("arrowleft")}>◀</button>
            {interactPrompt
              ? <button className="dpad-btn dpad-action" onClick={handleActionClick}>E</button>
              : <div className="dpad-btn dpad-spacer" />}
            <button className="dpad-btn dpad-right" onTouchStart={() => handleTouchStart("arrowright")} onTouchEnd={() => handleTouchEnd("arrowright")}>▶</button>
          </div>
          <div className="dpad-row">
            <button className="dpad-btn dpad-down" onTouchStart={() => handleTouchStart("arrowdown")} onTouchEnd={() => handleTouchEnd("arrowdown")}>▼</button>
          </div>
        </div>
      )}
    </div>
  );
}
