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
  // Wait if the trail gets too long rather than growing memory indefinitely.
  if (duck.trail.length > 300) { duck.followUntil = 0; duck.trail.length = 0; }
}

export function drawFriend(ctx, friend, following, now) {
  const { x, y, id } = friend;
  const bob = Math.sin(now / 220) * (id === 'ghost' ? 3 : following ? 1.5 : 0);
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y + bob));
  ctx.fillStyle = 'rgba(0,0,0,.2)';
  ctx.fillRect(-10, 2, 20, 4);
  if (id === 'duck') {
    ctx.fillStyle = '#f5d35c'; ctx.fillRect(-9, -10, 18, 12); ctx.fillRect(2, -20, 10, 13);
    ctx.fillStyle = '#fff1a0'; ctx.fillRect(-6, -9, 9, 6);
    ctx.fillStyle = '#ee8b32'; ctx.fillRect(10, -13, 7, 4); ctx.fillRect(-5, 2, 4, 3); ctx.fillRect(4, 2, 4, 3);
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
  if (id !== 'rock') {
    ctx.font = '11px monospace'; ctx.textAlign = 'center';
    ctx.fillStyle = '#0c101c'; ctx.fillRect(-32, -42, 64, 14);
    ctx.fillStyle = '#f5ead0'; ctx.fillText(friend.name, 0, -31);
  }
  ctx.restore();
}
