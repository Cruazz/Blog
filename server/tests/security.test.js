import assert from 'node:assert/strict';
import { test } from 'node:test';
import { spawnSync } from 'node:child_process';
import express from 'express';
import jwt from 'jsonwebtoken';

// Isolate checks from deployment credentials and never connect to the database.
process.env.JWT_SECRET = 'test-only-secret-with-more-than-32-characters';
process.env.ADMIN_USERNAME = 'test-admin';
process.env.ADMIN_PASSWORD = 'test-only-password';
const { default: login } = await import('../routes/auth.js');
const { auth } = await import('../middlewares/auth.js');
const { default: postsRouter } = await import('../routes/posts.js');

test('rejects missing credentials, invalid tokens, and repeated login attempts', async () => {
  const child = spawnSync(process.execPath, ['--input-type=module', '-e', "import('./config.js')"], {
    cwd: new URL('../', import.meta.url),
    env: { ...process.env, JWT_SECRET: '' }, encoding: 'utf8',
  });
  assert.notEqual(child.status, 0);
  assert.match(child.stderr, /Set JWT_SECRET/);
  const app = express();
  app.use(express.json());
  app.use(login);
  app.use(postsRouter);
  app.get('/protected', auth, (_req, res) => res.json({ ok: true }));
  app.use((error, _req, res, _next) => res.status(error.code === 'LIMIT_FILE_SIZE' ? 413 : error.status || 500).end());
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const signIn = body => fetch(`${base}/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  try {
    assert.equal((await signIn({ username: {}, password: [] })).status, 400);
    assert.equal((await signIn({ username: 'test-admin', password: 'incorrect' })).status, 401);
    const response = await signIn({ username: 'test-admin', password: 'test-only-password' });
    assert.equal(response.status, 200);
    const { token } = await response.json();
    const upload = async (bytes, type, name) => {
      const form = new FormData();
      form.append('image', new Blob([bytes], { type }), name);
      return fetch(`${base}/admin/upload`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form });
    };
    assert.equal((await upload('<svg/>', 'image/svg+xml', 'test.svg')).status, 415);
    assert.equal((await upload(new Uint8Array(5 * 1024 * 1024 + 1), 'image/png', 'large.png')).status, 413);
    assert.equal((await fetch(`${base}/protected`, { headers: { Authorization: `Bearer ${token}` } })).status, 200);
    const forged = jwt.sign({ username: 'test-admin' }, 'fallback_secret_change_me');
    assert.equal((await fetch(`${base}/protected`, { headers: { Authorization: `Bearer ${forged}` } })).status, 401);
    assert.equal((await fetch(`${base}/protected`)).status, 401);
    for (let i = 0; i < 7; i++) await signIn({ username: 'test-admin', password: 'incorrect' });
    assert.equal((await signIn({ username: 'test-admin', password: 'incorrect' })).status, 429);
  } finally {
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
  }
});
