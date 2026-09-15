export const FRIENDS = [
  { id: 'duck', name: 'WADDLES', x: 224, y: 432 },
  { id: 'rock', name: 'SUSPICIOUS ROCK', x: 416, y: 432 },
  { id: 'ghost', name: 'BOO', x: 528, y: 336 },
];

export const ROCK_LINES = [
  '...',
  'Still a rock.',
  'You have places to be. I have this exact spot.',
  'Bro. I am a rock.',
  'Fine. My secret? I have been standing here the entire time.',
];
export const GHOST_LINES = [
  'BOO! ...Was that too loud? Sorry.',
  'I only come out at night. Unfortunately, I am afraid of the dark.',
  'Could you stay a little longer? That tree looks suspicious.',
  'Please tell everyone I was terrifying. My ghost exam is tomorrow.',
];

export function followDuck(duck, player, blocked, now) {
  if (now >= duck.followUntil) { duck.trail.length = 0; return; }
  const last = duck.trail.at(-1);
  if (!last || Math.hypot(last.x - player.x, last.y - player.y) > 4) {
    duck.trail.push({ x: player.x, y: player.y });
  }
  if (Math.hypot(player.x - duck.x, player.y - duck.y) < 24) return;
  const target = duck.trail[0];
  const distance = Math.hypot(target.x - duck.x, target.y - duck.y);
  if (distance < 3) { duck.trail.shift(); return; }
  const speed = Math.min(2.8, distance);
  const nx = duck.x + (target.x - duck.x) / distance * speed;
  const ny = duck.y + (target.y - duck.y) / distance * speed;
  if (!blocked(nx, duck.y)) duck.x = nx;
  if (!blocked(duck.x, ny)) duck.y = ny;
  duck.facingLeft = target.x < duck.x;
  // Wait if the trail gets too long rather than growing memory indefinitely.
  if (duck.trail.length > 300) { duck.followUntil = 0; duck.trail.length = 0; }
}

export function wanderFriend(friend, home, blocked, now, random = Math.random) {
  if (now < (friend.restUntil || 0)) { friend.moving = false; return; }
  if (!friend.target) {
    const angle = random() * Math.PI * 2;
    const radius = 20 + random() * 35;
    friend.target = { x: home.x + Math.cos(angle) * radius, y: home.y + Math.sin(angle) * radius };
  }
  const dx = friend.target.x - friend.x, dy = friend.target.y - friend.y;
  const distance = Math.hypot(dx, dy);
  const speed = friend.id === 'ghost' ? .35 : .65;
  const beforeX = friend.x, beforeY = friend.y;
  if (distance > 2) {
    const nx = friend.x + dx / distance * speed, ny = friend.y + dy / distance * speed;
    if (!blocked(nx, friend.y)) friend.x = nx;
    if (!blocked(friend.x, ny)) friend.y = ny;
  }
  friend.moving = friend.x !== beforeX || friend.y !== beforeY;
  if (dx) friend.facingLeft = dx < 0;
  if (!friend.moving || distance <= 2) {
    friend.target = null;
    friend.restUntil = now + 1800 + random() * 2500;
  }
}

export function drawName(ctx, name, x, y) {
  ctx.save();
  ctx.font = "bold 6px 'Press Start 2P', monospace";
  const width = Math.max(64, ctx.measureText(name).width + 12);
  ctx.fillStyle = 'rgba(12,16,28,0.82)'; ctx.fillRect(x - width / 2, y, width, 12);
  ctx.strokeStyle = '#8d6428'; ctx.lineWidth = 1; ctx.strokeRect(x - width / 2, y, width, 12);
  ctx.fillStyle = '#f5a060'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(name, x, y + 6); ctx.restore();
}

export function drawSpeech(ctx, text, x, y) {
  if (!text) return;
  ctx.save(); ctx.imageSmoothingEnabled = true;
  ctx.font = "600 12px 'Segoe UI', Arial, sans-serif";
  const lines = []; let line = '';
  for (const word of text.split(' ')) {
    const next = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(next).width > 180) { lines.push(line); line = word; }
    else line = next;
  }
  if (line) lines.push(line);
  const width = 200, height = lines.length * 15 + 16;
  const left = x - width / 2, top = y - height;
  ctx.fillStyle = '#fff8e8'; ctx.strokeStyle = '#5a3d16'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.roundRect(left, top, width, height, 6); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x - 5, y - 1); ctx.lineTo(x, y + 8); ctx.lineTo(x + 5, y - 1); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x - 5, y); ctx.lineTo(x, y + 8); ctx.lineTo(x + 5, y); ctx.stroke();
  ctx.fillStyle = '#2b1f11'; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
  lines.forEach((value, index) => ctx.fillText(value, left + 10, top + 8 + index * 15));
  ctx.restore();
}

export function drawFriend(ctx, friend, following, now) {
  const { x, y, id } = friend;
  const bob = Math.sin(now / 220) * (id === 'ghost' ? 3 : following ? 1.5 : 0);
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y + bob));
  ctx.save();
  if (id === 'duck' && friend.facingLeft) ctx.scale(-1, 1);
  ctx.fillStyle = 'rgba(0,0,0,.2)';
  ctx.fillRect(-10, 2, 20, 4);
  if (id === 'duck') {
    ctx.fillStyle = '#f5d35c'; ctx.fillRect(-9, -10, 18, 12); ctx.fillRect(2, -20, 10, 13);
    ctx.fillStyle = '#fff1a0'; ctx.fillRect(-6, -9, 9, 6);
    const step = following ? Math.sin(now / 110) * 2 : 0;
    ctx.fillStyle = '#ee8b32'; ctx.fillRect(10, -13, 7, 4); ctx.fillRect(-5, 2 + step, 4, 3); ctx.fillRect(4, 2 - step, 4, 3);
    ctx.fillStyle = '#202533'; ctx.fillRect(7, -17, 2, 2);
  } else if (id === 'rock') {
    ctx.fillStyle = '#666e7c'; ctx.fillRect(-13, -10, 26, 13); ctx.fillRect(-9, -16, 17, 6);
    ctx.fillStyle = '#aab3bf'; ctx.fillRect(-8, -14, 12, 3); ctx.fillRect(-11, -9, 4, 7);
    ctx.fillStyle = '#414956'; ctx.fillRect(3, -6, 8, 7);
  } else {
    ctx.globalAlpha = .85;
    ctx.fillStyle = '#dce9ff'; ctx.fillRect(-10, -20, 20, 21); ctx.fillRect(-6, -25, 12, 5);
    ctx.fillRect(-10, 1, 5, 5); ctx.fillRect(-2, 1, 4, 4); ctx.fillRect(5, 1, 5, 5);
    ctx.fillStyle = '#34395d'; ctx.fillRect(-6, -16, 3, 5); ctx.fillRect(3, -16, 3, 5); ctx.fillRect(-2, -6, 4, 3);
    ctx.fillStyle = '#efabc9'; ctx.fillRect(-8, -8, 4, 2); ctx.fillRect(4, -8, 4, 2);
  }
  ctx.restore();
  drawName(ctx, friend.name, 0, id === 'ghost' ? -38 : -30);
  ctx.restore();
}
