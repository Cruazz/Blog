import express from "express";
import pool from "../db.js";

const router = express.Router();

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI || "https://www.cruaz.my.id/api/spotify/callback";

// Spotify API endpoints
const SPOTIFY_AUTH_URL = "https://accounts.spotify.com/authorize";
const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_NOW_PLAYING_URL = "https://api.spotify.com/v1/me/player/currently-playing";

// Scopes needed
const SCOPES = ["user-read-currently-playing"].join(" ");

// ── Init table ──────────────────────────────────────────────────────────────
export async function initSpotifyTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS spotify_tokens (
      id            INT PRIMARY KEY DEFAULT 1,
      access_token  TEXT,
      refresh_token TEXT,
      expires_at    TIMESTAMPTZ
    )
  `);
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function getBasicAuth() {
  return Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");
}

async function exchangeCodeForTokens(code) {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: REDIRECT_URI,
  });

  const res = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${getBasicAuth()}`,
    },
    body: body.toString(),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Token exchange failed: ${res.status} ${err}`);
  }
  return res.json();
}

async function refreshAccessToken(refreshToken) {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  const res = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${getBasicAuth()}`,
    },
    body: body.toString(),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Token refresh failed: ${res.status} ${err}`);
  }
  return res.json();
}

async function getValidAccessToken() {
  const { rows } = await pool.query("SELECT * FROM spotify_tokens WHERE id = 1");
  if (rows.length === 0 || !rows[0].refresh_token) return null;

  const row = rows[0];

  // If access token still valid (with 60s buffer)
  if (row.access_token && row.expires_at && new Date(row.expires_at) > new Date(Date.now() + 60000)) {
    return row.access_token;
  }

  // Refresh the token
  const tokenData = await refreshAccessToken(row.refresh_token);
  const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000);

  await pool.query(
    `UPDATE spotify_tokens SET access_token = $1, expires_at = $2 WHERE id = 1`,
    [tokenData.access_token, expiresAt]
  );

  return tokenData.access_token;
}

// ── Step 1: Start OAuth — GET /api/spotify/auth ─────────────────────────────
// Visit this URL once to authorize (redirects to Spotify login)
router.get("/spotify/auth", (req, res) => {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    return res.status(500).json({ error: "Spotify credentials not configured on server" });
  }

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: "code",
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
    show_dialog: "true",
  });

  res.redirect(`${SPOTIFY_AUTH_URL}?${params.toString()}`);
});

// ── Step 2: Callback — GET /api/spotify/callback ────────────────────────────
// Spotify redirects here after user approves
router.get("/spotify/callback", async (req, res) => {
  const { code, error } = req.query;

  if (error) {
    return res.status(400).send(`<h2>Spotify auth error</h2><p>${error}</p>`);
  }
  if (!code) {
    return res.status(400).send("<h2>No code received from Spotify</h2>");
  }

  try {
    const tokenData = await exchangeCodeForTokens(code);
    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000);

    await pool.query(
      `INSERT INTO spotify_tokens (id, access_token, refresh_token, expires_at)
       VALUES (1, $1, $2, $3)
       ON CONFLICT (id) DO UPDATE SET access_token = $1, refresh_token = $2, expires_at = $3`,
      [tokenData.access_token, tokenData.refresh_token, expiresAt]
    );

    res.send(`
      <html>
        <head><title>Spotify Connected!</title></head>
        <body style="background:#1a1a2e;color:#e0e0e0;font-family:monospace;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
          <div style="text-align:center;">
            <h1 style="color:#1db954;">🎵 Spotify Connected!</h1>
            <p>The Tavern bard is ready to play.</p>
            <p style="color:#888;">You can close this tab now.</p>
          </div>
        </body>
      </html>
    `);
  } catch (err) {
    console.error("Spotify callback error:", err);
    res.status(500).send(`<h2>Failed to connect Spotify</h2><p>${err.message}</p>`);
  }
});

// ── Debug: GET /api/spotify/debug ────────────────────────────────────────────
// Shows what Spotify API returns WITHOUT deleting the token
router.get("/spotify/debug", async (req, res) => {
  try {
    if (!CLIENT_ID || !CLIENT_SECRET) {
      return res.json({ error: "Spotify credentials not configured" });
    }

    const accessToken = await getValidAccessToken();
    if (!accessToken) {
      return res.json({ error: "No token — visit /api/spotify/auth first" });
    }

    // Test the currently-playing endpoint
    const cpResponse = await fetch(SPOTIFY_NOW_PLAYING_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const cpBody = await cpResponse.text();
    let cpData;
    try { cpData = JSON.parse(cpBody); } catch { cpData = cpBody; }

    // Also test the profile endpoint to verify token validity
    const profileResponse = await fetch("https://api.spotify.com/v1/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const profileBody = await profileResponse.text();
    let profileData;
    try { profileData = JSON.parse(profileBody); } catch { profileData = profileBody; }

    res.json({
      tokenPreview: accessToken.substring(0, 20) + "...",
      currentlyPlaying: {
        status: cpResponse.status,
        body: cpData,
      },
      profile: {
        status: profileResponse.status,
        body: profileData,
      },
    });
  } catch (err) {
    res.json({ error: err.message });
  }
});

// ── Step 3: Now Playing — GET /api/spotify/now-playing ──────────────────────
// Public endpoint — TavernModal fetches from here
router.get("/spotify/now-playing", async (req, res) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate");
  res.set("Pragma", "no-cache");

  try {
    // Check if credentials are configured
    if (!CLIENT_ID || !CLIENT_SECRET) {
      console.warn("Spotify: credentials not configured");
      return res.json({ isPlaying: false, error: "Spotify not configured on server" });
    }

    const accessToken = await getValidAccessToken();
    if (!accessToken) {
      console.warn("Spotify: no valid access token (authorize at /api/spotify/auth)");
      return res.json({ isPlaying: false, error: "Not authorized — visit /api/spotify/auth" });
    }

    const response = await fetch(SPOTIFY_NOW_PLAYING_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    // 204 = no content (nothing playing)
    if (response.status === 204) {
      return res.json({ isPlaying: false });
    }

    if (!response.ok) {
      const errBody = await response.text();
      console.error(`Spotify API ${response.status}:`, errBody);
      // Try to extract error message
      let errMsg;
      try { const e = JSON.parse(errBody); errMsg = e.error?.message || e.error; } catch { errMsg = errBody; }
      console.error("→", errMsg);

      if (response.status === 403) {
        await pool.query("DELETE FROM spotify_tokens WHERE id = 1");
        return res.json({ isPlaying: false, error: `Spotify returned 403: ${errMsg}` });
      }
      return res.json({ isPlaying: false, error: `Spotify API ${response.status}` });
    }

    const data = await response.json();

    if (!data.is_playing || !data.item) {
      return res.json({ isPlaying: false });
    }

    res.json({
      isPlaying: true,
      title: data.item.name,
      artist: data.item.artists.map(a => a.name).join(", "),
      album: data.item.album.name,
      albumArt: data.item.album.images?.[0]?.url || null,
      progress: data.progress_ms,
      duration: data.item.duration_ms,
    });
  } catch (err) {
    console.error("Spotify now-playing error:", err.message);
    res.json({ isPlaying: false, error: err.message });
  }
});

export default router;
