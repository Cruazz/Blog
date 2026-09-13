# Cruaz — Web Developer & Data Analyst

Personal portfolio and blog built with React + Vite (frontend) and Node.js + Express + PostgreSQL (backend).

## Stack

- **Frontend:** React, Vite, Vanilla CSS
- **Backend:** Node.js, Express
- **Database:** PostgreSQL (Neon)

## Development

```bash
# Frontend
npm install
npm run dev

# Backend
cd server
npm install
node --watch index.js
```

## Environment

Create `server/.env`:
```
PORT=3001
DATABASE_URL=your_neon_connection_string
JWT_SECRET=replace_with_a_random_secret_at_least_32_characters
ADMIN_USERNAME=your_username
ADMIN_PASSWORD=your_password
```

The server refuses to start without a username, a unique JWT secret (32+ characters),
and a password (12+ characters) or bcrypt hash. Generate a secret with
`node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`.
Changing the secret invalidates existing sessions. New sessions last 8 hours.

The frontend uses `/api` by default: Vite proxies it locally and Vercel rewrites it
in production. `VITE_API_URL` is only needed for a separate API origin.
Use `CORS_ORIGINS` for additional exact origins, separated by commas.

Behind a reverse proxy, set `TRUST_PROXY_HOPS` to the verified proxy count (for
example, `1` for a single proxy). Leaving it unset limits login attempts by the
direct connection address. The in-memory limiter allows 10 attempts per 15 minutes;
multiple server replicas require a shared limiter store.

Neon connections verify TLS certificates. Image uploads accept JPEG, PNG, WebP,
and GIF, up to 5 MB; Cloudinary also validates the decoded image format. Article
HTML is sanitized before rendering, including removal of embedded styles and forms.

Checks: `npm run build`, `npm run lint`, and `node --test server/tests/security.test.js`.
The security check uses a temporary local HTTP server and does not access the database.

## Reading mode

Use **Read blog** below the navigation to read without the game canvas. Search,
categories, article URLs, and browser Back work in both views. The browser saves
the selected view; **Explore village** returns to the map. No extra dependency is
needed for reading mode.

Articles include a scroll progress bar and a collapsible table of contents when
they contain at least two H2/H3 headings. These work in both reading mode and the
village modal, including keyboard navigation and reduced-motion preferences.

## Village friends

- Waddles waits south of the starting area. Press E to have the duck follow for
  45 seconds; interact again to ask it to wait. It follows the player's trail.
- A suspicious rock east of Waddles reveals more dialogue with each interaction.
- Boo appears near the observatory only in night mode.

All three also support the mobile E button. Run `node --test tests/village-friends.test.js`
for the duck movement check. Browser checks are in `tests/friends-check.cjs`.
