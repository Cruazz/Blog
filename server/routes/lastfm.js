import express from "express";

const router = express.Router();

const LASTFM_API_KEY = process.env.LASTFM_API_KEY;
const LASTFM_USER = process.env.LASTFM_USER || "cruaz";
const LASTFM_URL = `http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${LASTFM_USER}&api_key=${LASTFM_API_KEY}&format=json&limit=1`;

// ── Public: GET /api/lastfm/now-playing ──────────────────────────────────────
router.get("/lastfm/now-playing", async (req, res) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate");
  res.set("Pragma", "no-cache");

  if (!LASTFM_API_KEY) {
    return res.json({ isPlaying: false, error: "Last.fm API key not configured" });
  }

  try {
    const response = await fetch(LASTFM_URL);

    if (!response.ok) {
      const errText = await response.text();
      console.error(`Last.fm API error: ${response.status}`, errText);
      return res.json({ isPlaying: false, error: `Last.fm API ${response.status}` });
    }

    const data = await response.json();
    const tracks = data?.recenttracks?.track;

    if (!tracks || tracks.length === 0) {
      return res.json({ isPlaying: false });
    }

    const current = tracks[0];
    const isNowPlaying = current["@attr"]?.nowplaying === "true";

    if (!isNowPlaying) {
      return res.json({
        isPlaying: false,
        lastPlayed: {
          title: current.name,
          artist: current.artist?.["#text"] || "Unknown Artist",
          album: current.album?.["#text"] || "",
          albumArt: current.image?.[3]?.["#text"] || current.image?.[2]?.["#text"] || null,
          playedAt: current.date?.["#text"] || null,
        },
      });
    }

    res.json({
      isPlaying: true,
      title: current.name,
      artist: current.artist?.["#text"] || "Unknown Artist",
      album: current.album?.["#text"] || "",
      albumArt: current.image?.[3]?.["#text"] || current.image?.[2]?.["#text"] || null,
    });
  } catch (err) {
    console.error("Last.fm fetch error:", err.message);
    res.json({ isPlaying: false, error: err.message });
  }
});

export default router;
