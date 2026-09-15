import { test } from 'node:test';
import assert from 'node:assert/strict';
import { followDuck, wanderFriend, FRIENDS, ROCK_LINES } from '../src/components/villageFriends.js';

test('duck follows a trail, waits when stopped, respects obstacles and expires', () => {
  const duck = { ...FRIENDS[0], followUntil: 45000, trail: [] };
  const player = { x: duck.x + 100, y: duck.y };
  const start = duck.x;
  for (let i = 0; i < 20; i++) followDuck(duck, player, () => false, 1000);
  assert.ok(duck.x > start && duck.x < player.x);
  const blockedX = duck.x;
  followDuck(duck, player, () => true, 1000);
  assert.equal(duck.x, blockedX);
  followDuck(duck, player, () => false, 46000);
  assert.equal(duck.x, blockedX);
  assert.equal(duck.trail.length, 0);
  duck.followUntil = 0;
  followDuck(duck, player, () => false, 47000);
  assert.equal(duck.x, blockedX);
  assert.equal(ROCK_LINES[3], 'Bro. I am a rock.');
});

test('idle friends roam, respect collision, and pause before choosing another target', () => {
  for (const home of [FRIENDS[0], FRIENDS[2]]) {
    const friend = { ...home };
    wanderFriend(friend, home, () => false, 1000, () => 0);
    assert.ok(friend.x > home.x);
    assert.equal(friend.moving, true);
    const x = friend.x;
    wanderFriend(friend, home, () => true, 1001, () => 0);
    assert.equal(friend.x, x);
    assert.equal(friend.moving, false);
    wanderFriend(friend, home, () => false, 1100, () => 0);
    assert.equal(friend.x, x);
  }
});
