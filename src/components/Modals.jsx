import { useState, useEffect, useRef } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

const Loader = () => (
  <div className="loading-dots"><span></span><span></span><span></span></div>
);

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const Icons = {
  Github: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.28 1.15-.28 2.35 0 3.5-.73 1.02-1.08 2.25-1 3.5 0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" /><path d="M9 18c-4.51 2-5-2-7-2" /></svg>
  ),
  Instagram: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
  ),
  Discord: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.618-1.25.077.077 0 0 0-.079-.037A19.73 19.73 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.1 18.099a.082.082 0 0 0 .031.058 20.2 20.2 0 0 0 5.922 2.766.075.075 0 0 0 .08-.037c.469-.824.896-1.697 1.264-2.585a.075.075 0 0 0-.04-.105 13.25 13.25 0 0 1-1.905-.91.077.077 0 0 1-.007-.127c.126-.094.252-.192.375-.292a.077.077 0 0 1 .082-.01c3.41 1.564 7.103 1.564 10.45 0a.077.077 0 0 1 .082.01c.123.1.25.198.375.292a.077.077 0 0 1-.007.127 13.25 13.25 0 0 1-1.905.91.075.075 0 0 0-.04.105c.37.888.796 1.761 1.264 2.585a.075.075 0 0 0 .08.037 20.2 20.2 0 0 0 5.922-2.766.082.082 0 0 0 .031-.058c.484-5.068-.372-9.61-3.57-14.286a.07.07 0 0 0-.032-.027ZM8.02 15.332c-1.18 0-2.156-1.085-2.156-2.419 0-1.333.955-2.418 2.156-2.418 1.21 0 2.176 1.095 2.156 2.418 0 1.334-.955 2.419-2.156 2.419Zm7.975 0c-1.18 0-2.156-1.085-2.156-2.419 0-1.333.955-2.418 2.156-2.418 1.21 0 2.176 1.095 2.156 2.418 0 1.334-.955 2.419-2.156 2.419Z" />
    </svg>
  ),
  Email: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
  ),
  Arrow: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" /></svg>
  )
};

// ── Common Modal Wrapper ─────────────────────────────────────────────────────
function ModalWrapper({ title, subtitle, icon, onClose, children }) {
  return (
    <div className="game-modal-overlay">
      <div className="game-modal-content">
        <div className="game-modal-header">
          <div className="game-modal-header-left">
            {icon && <span className="game-modal-icon">{icon}</span>}
            <div>
              <h2 className="game-modal-title">{title}</h2>
              {subtitle && <p className="game-modal-subtitle">{subtitle}</p>}
            </div>
          </div>
          <button className="game-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="game-modal-body">{children}</div>
      </div>
    </div>
  );
}

// ── TAVERN MODAL — Now Playing / Status ─────────────────────────────────────
export function TavernModal({ onClose }) {
  const [spotify, setSpotify] = useState(null);
  const [spotifyLoading, setSpotifyLoading] = useState(true);
  const [status, setStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/spotify/now-playing`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        setSpotify(data);
        setSpotifyLoading(false);
      })
      .catch(() => {
        setSpotify(null);
        setSpotifyLoading(false);
      });

    fetch(`${API}/tavern/status`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        setStatus(data || { currently: "...", learning: [], stack: [], mood: "...", hoursToday: "..." });
        setStatusLoading(false);
      })
      .catch(() => {
        setStatus({ currently: "...", learning: [], stack: [], mood: "...", hoursToday: "..." });
        setStatusLoading(false);
      });
  }, []);

  return (
    <ModalWrapper title="The Tavern" subtitle="Take a seat, traveller..." icon="🍺" onClose={onClose}>
      <div className="tavern-board">

        {/* ── Bard's Corner: Now Playing ── */}
        <div className="tavern-card tavern-card-bard">
          <div className="tavern-card-corner tavern-card-corner-tl" />
          <div className="tavern-card-corner tavern-card-corner-tr" />
          <div className="tavern-card-corner tavern-card-corner-bl" />
          <div className="tavern-card-corner tavern-card-corner-br" />
          <div className="tavern-card-header">
            <span className="tavern-card-icon">🎵</span>
            <span className="tavern-card-title">Bard&apos;s Corner</span>
          </div>
          <div className="tavern-card-body">
            {spotifyLoading ? (
              <div className="tavern-bard-loading">
                <span className="tavern-bard-icon tavern-bard-spin">🎶</span>
                <span>Tuning the lute...</span>
              </div>
            ) : spotify && spotify.isPlaying ? (
              <div className="tavern-bard-active">
                <div className="tavern-bard-art">
                  {spotify.albumArt
                    ? <img src={spotify.albumArt} alt="Album" />
                    : <div className="tavern-bard-art-placeholder">🎵</div>}
                </div>
                <div className="tavern-bard-info">
                  <div className="tavern-bard-title">{spotify.title}</div>
                  <div className="tavern-bard-artist">{spotify.artist}</div>
                  <div className="tavern-bard-album">{spotify.album}</div>
                  {spotify.progress !== undefined && (
                    <div className="tavern-bard-progress">
                      <div className="tavern-bard-progress-fill" style={{ width: `${(spotify.progress / spotify.duration) * 100}%` }} />
                    </div>
                  )}
                </div>
                <div className="tavern-bard-eq">
                  <span /><span /><span /><span />
                </div>
              </div>
            ) : (
              <div className="tavern-bard-idle">
                <span className="tavern-bard-icon">🎶</span>
                <span>The bard is resting... no music playing</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Quest Board: Current Quest ── */}
        {statusLoading ? (
          <>
            <div className="tavern-card tavern-card-quest">
              <div className="tavern-card-corner tavern-card-corner-tl" />
              <div className="tavern-card-corner tavern-card-corner-tr" />
              <div className="tavern-card-corner tavern-card-corner-bl" />
              <div className="tavern-card-corner tavern-card-corner-br" />
              <div className="tavern-card-header">
                <span className="tavern-card-icon">⚔️</span>
                <span className="tavern-card-title">Quest Board</span>
              </div>
              <div className="tavern-card-body">
                <div className="tavern-bard-loading"><span className="tavern-bard-icon tavern-bard-spin">⏳</span><span>Loading...</span></div>
              </div>
            </div>
          </>
        ) : status && (
          <>
            <div className="tavern-card tavern-card-quest">
              <div className="tavern-card-corner tavern-card-corner-tl" />
              <div className="tavern-card-corner tavern-card-corner-tr" />
              <div className="tavern-card-corner tavern-card-corner-bl" />
              <div className="tavern-card-corner tavern-card-corner-br" />
              <div className="tavern-card-header">
                <span className="tavern-card-icon">⚔️</span>
                <span className="tavern-card-title">Quest Board</span>
              </div>
              <div className="tavern-card-body">
                <p className="tavern-quest-text">{status.currently}</p>
                <div className="tavern-quest-divider" />
                <div className="tavern-quest-meta">
                  <div className="tavern-quest-stat">
                    <span className="tavern-quest-stat-label">Mood</span>
                    <span className="tavern-quest-stat-value">🎭 {status.mood}</span>
                  </div>
                  <div className="tavern-quest-stat">
                    <span className="tavern-quest-stat-label">Today</span>
                    <span className="tavern-quest-stat-value">⏳ {status.hoursToday}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Scholar's Desk: Studying ── */}
            <div className="tavern-card tavern-card-study">
              <div className="tavern-card-corner tavern-card-corner-tl" />
              <div className="tavern-card-corner tavern-card-corner-tr" />
              <div className="tavern-card-corner tavern-card-corner-bl" />
              <div className="tavern-card-corner tavern-card-corner-br" />
              <div className="tavern-card-header">
                <span className="tavern-card-icon">📖</span>
                <span className="tavern-card-title">Scholar&apos;s Desk</span>
              </div>
              <div className="tavern-card-body">
                <div className="tavern-study-list">
                  {(status.learning || []).map((item, i) => (
                    <div key={i} className="tavern-study-item" style={{ animationDelay: `${i * 0.06}s` }}>
                      <span className="tavern-study-bullet">◆</span>
                      <span className="tavern-study-name">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── The Arsenal: Tech Stack ── */}
            <div className="tavern-card tavern-card-arsenal">
              <div className="tavern-card-corner tavern-card-corner-tl" />
              <div className="tavern-card-corner tavern-card-corner-tr" />
              <div className="tavern-card-corner tavern-card-corner-bl" />
              <div className="tavern-card-corner tavern-card-corner-br" />
              <div className="tavern-card-header">
                <span className="tavern-card-icon">🛡️</span>
                <span className="tavern-card-title">The Arsenal</span>
              </div>
              <div className="tavern-card-body">
                <div className="tavern-arsenal-grid">
                  {(status.stack || []).map((tech, i) => (
                    <div key={i} className="tavern-arsenal-item" style={{ animationDelay: `${i * 0.05}s` }}>
                      <div className="tavern-arsenal-head">
                        <span className="tavern-arsenal-icon">{tech.icon}</span>
                        <span className="tavern-arsenal-name">{tech.name}</span>
                        <span className="tavern-arsenal-lvl">Lv.{tech.level}</span>
                      </div>
                      <div className="tavern-arsenal-bar">
                        <div className="tavern-arsenal-fill" style={{ width: `${tech.level}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── Tavern atmosphere ── */}
        <div className="tavern-atmosphere">
          <span>🔥 Fireplace crackling...</span>
          <span className="tavern-atmo-dot">·</span>
          <span>🍺 Ale on the table</span>
          <span className="tavern-atmo-dot">·</span>
          <span>🎻 Faint music in the air</span>
        </div>
      </div>
    </ModalWrapper>
  );
}

// ── LIBRARY MODAL — Scroll Picker ────────────────────────────────────────────
export function LibraryModal({ posts, categories, loading, onClose, initialActivePost = null, onOpenPost, onBackToList }) {
  const [activePost, setActivePost] = useState(initialActivePost);
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState("all");

  const sortedCategories = [
    ...categories.filter(c => c.slug.toLowerCase() !== "other"),
    ...categories.filter(c => c.slug.toLowerCase() === "other"),
  ];
  const tags = ["all", ...sortedCategories.map(c => c.slug)];

  const filteredPosts = posts.filter(p => {
    const matchTag = tag === "all" || p.tag === tag;
    const matchQ = !query || p.title.toLowerCase().includes(query.toLowerCase()) || (p.excerpt || "").toLowerCase().includes(query.toLowerCase());
    return matchTag && matchQ;
  });

  const openPost = (post) => {
    if (onOpenPost) {
      onOpenPost(post);
    } else {
      setActivePost(post);
    }
  };

  const backToList = () => {
    setActivePost(null);
    if (onBackToList) {
      onBackToList();
    }
  };

  if (activePost) {
    return (
      <ModalWrapper title="The Library" subtitle="Reading scroll..." icon="📜" onClose={onClose}>
        <div className="scroll-reading-view">
          <button className="scroll-back-btn" onClick={backToList}>
            ← Back to shelves
          </button>
          <div className="scroll-open-paper">
            <div className="scroll-rod scroll-rod-top" />
            <div className="scroll-open-content">
              <div className="post-meta" style={{ marginBottom: "1.5rem" }}>
                <span className="post-tag">{activePost.tag}</span>
                <h1 className="post-title" style={{ marginTop: "0.75rem" }}>{activePost.title}</h1>
                <span className="post-byline">Cruaz · {formatDate(activePost.created_at)}</span>
              </div>
              {activePost.image_url && <img src={activePost.image_url} alt="" className="post-hero-image" />}
              <div className="post-body" dangerouslySetInnerHTML={{ __html: activePost.body }} />
            </div>
            <div className="scroll-rod scroll-rod-bottom" />
          </div>
        </div>
      </ModalWrapper>
    );
  }

  return (
    <ModalWrapper title="The Library" subtitle="Choose a scroll to read." icon="📚" onClose={onClose}>
      {/* Search & filter bar */}
      <div className="library-controls">
        <input
          className="search-input"
          type="text"
          placeholder="Search scrolls…"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <div className="tag-filters-container">
          {tags.map(t => (
            <button key={t} className={`tag-filter${tag === t ? " active" : ""}`} onClick={() => setTag(t)}>{t}</button>
          ))}
        </div>
      </div>

      {/* Scroll shelf */}
      <div className="scroll-shelf">
        {loading ? <Loader /> : filteredPosts.length === 0 ? (
          <div className="scroll-empty">No scrolls found.</div>
        ) : filteredPosts.map((p, i) => (
          <div
            key={p.id}
            className="scroll-item"
            onClick={() => openPost(p)}
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div className="scroll-roll-icon">📜</div>
            <div className="scroll-item-body">
              <div className="scroll-item-tag">{p.tag}</div>
              <div className="scroll-item-title">{p.title}</div>
              <div className="scroll-item-date">{formatDate(p.created_at)}</div>
              {p.excerpt && <div className="scroll-item-excerpt">{p.excerpt}</div>}
            </div>
            <div className="scroll-item-arrow">▶</div>
          </div>
        ))}
      </div>
    </ModalWrapper>
  );
}

// ── WORKSHOP MODAL — Crate/Blueprint UI ──────────────────────────────────────
export function WorkshopModal({ onClose }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState(null);
  const perPage = 6;

  useEffect(() => {
    fetch(`${API}/projects`)
      .then(r => r.json())
      .then(data => setProjects(Array.isArray(data) ? data : []))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = projects.filter(p => {
    const pTags = Array.isArray(p.tags) ? p.tags : [];
    const q = query.toLowerCase();
    return !query
      || (p.name||"").toLowerCase().includes(q)
      || (p.description||"").toLowerCase().includes(q)
      || pTags.some(t => t.toLowerCase().includes(q));
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const current = filtered.slice((page-1)*perPage, page*perPage);

  return (
    <ModalWrapper title="The Workshop" subtitle="Inspect a crate to see the blueprint." icon="🔨" onClose={onClose}>
      <div className="workshop-search">
        <input
          className="search-input"
          type="text"
          placeholder="Search projects…"
          value={query}
          onChange={e => { setQuery(e.target.value); setPage(1); }}
        />
      </div>

      <div className="crate-grid">
        {loading ? <Loader /> :
         projects.length === 0 ? <p className="workshop-empty">No projects yet.</p> :
         filtered.length === 0 ? <p className="workshop-empty">No matching projects.</p> :
         current.map(p => (
          <div key={p.id} className="crate-item" onClick={() => setOpenId(openId === p.id ? null : p.id)}>
            {/* Crate lid */}
            <div className={`crate-lid${openId === p.id ? " open" : ""}`}>
              <div className="crate-lid-planks">
                <div className="crate-plank" />
                <div className="crate-plank" />
                <div className="crate-plank" />
              </div>
              <div className="crate-lid-label">{p.name}</div>
              <div className="crate-latch">●</div>
            </div>
            {/* Blueprint inside */}
            {openId === p.id && (
              <div className="blueprint-panel">
                <div className="blueprint-header">
                  <span className="blueprint-title">{p.name}</span>
                  <div className="blueprint-links">
                    {p.github_url && <a href={p.github_url} className="blueprint-link" target="_blank" rel="noreferrer">GitHub ↗</a>}
                    {p.live_url  && <a href={p.live_url}  className="blueprint-link" target="_blank" rel="noreferrer">Live ↗</a>}
                  </div>
                </div>
                <p className="blueprint-desc">{p.description}</p>
                <div className="blueprint-tags">
                  {(p.tags||[]).map(t => <span key={t} className="blueprint-tag">{t}</span>)}
                </div>
                {p.display_urls && p.display_urls.length > 0 && (
                  <div className="project-gallery-slider">
                    {p.display_urls.map((url, idx) => (
                      <div key={idx} className="project-slider-item">
                        <img src={url} alt={`${p.name} screenshot ${idx+1}`} onClick={() => window.open(url,"_blank")} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="workshop-pagination">
          <button className="btn btn-outline btn-sm" disabled={page===1} onClick={() => setPage(page-1)}>← Prev</button>
          <span className="pagination-label">{page} / {totalPages}</span>
          <button className="btn btn-outline btn-sm" disabled={page===totalPages} onClick={() => setPage(page+1)}>Next →</button>
        </div>
      )}
    </ModalWrapper>
  );
}

// ── STUDY MODAL — Open Book UI ───────────────────────────────────────────────
export function StudyModal({ onClose }) {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/skills`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (Array.isArray(data) && data.length > 0) setSkills(data.map(s => s.name)); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <ModalWrapper title="The Study" subtitle="An open book left on the desk." icon="📖" onClose={onClose}>
      <div className="book-container">
        {/* Left page */}
        <div className="book-page book-page-left">
          <div className="book-page-header">About Me</div>
          <div className="book-page-content">
            <p>I&apos;m Cruaz — a web developer and data analyst who enjoys building things that are both useful and well-crafted.</p>
            <p>My work sits at the intersection of frontend development and data-driven problem solving.</p>
            <p>On the dev side, I build full-stack web apps with React and Node.js backed by PostgreSQL. On the data side, I work with SQL, Excel, and dashboards to help teams make better decisions.</p>
            <p>I care about the full picture: clean code, well-structured databases, and dashboards that actually answer the right questions.</p>
          </div>
        </div>
        {/* Book spine */}
        <div className="book-spine" />
        {/* Right page */}
        <div className="book-page book-page-right">
          <div className="book-page-header">Technologies</div>
          <div className="book-page-content">
            {loading ? <Loader /> : (
              <div className="book-skills-grid">
                {skills.map((s, i) => (
                  <div key={s} className="book-skill-row" style={{ animationDelay: `${i * 0.04}s` }}>
                    <span className="book-skill-bullet">◆</span>
                    <span className="book-skill-name">{s}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="book-page-number">— 2 —</div>
        </div>
      </div>
    </ModalWrapper>
  );
}

// ── POST OFFICE MODAL — Letter UI ────────────────────────────────────────────
export function PostOfficeModal({ onClose }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("Collaborate");
  const [projectType, setProjectType] = useState("Web Application");
  const [timeline, setTimeline] = useState("1–3 months");
  const [message, setMessage] = useState("Dear Cruaz,\n\nHere's what I have in mind:\n");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("write"); // "write" | "contact"

  function handleSubjectChange(val) {
    setSubject(val);
    setMessage(val === "Collaborate"
      ? "Dear Cruaz,\n\nI'd like to discuss a project.\n\nHere's what I have in mind:\n"
      : "Dear Cruaz,\n\n");
  }

  function handleSend() {
    if (!message.trim() || !email.trim()) return;
    setSending(true); setError("");
    const data = {
      name, email,
      _subject: `Contact Form from ${name || "Someone"}`,
      _replyto: email,
      projectType: subject === "Collaborate" ? projectType : undefined,
      timeline: subject === "Collaborate" ? timeline : undefined,
      message
    };
    fetch("https://formsubmit.co/ajax/hezekiah.mitchellt@gmail.com", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(data)
    })
      .then(r => { if (!r.ok) throw new Error("Failed"); return r.json(); })
      .then(res => {
        setSending(false);
        if (res.success === "true" || res.success === true) {
          setSent(true); setName(""); setEmail(""); setMessage("");
        } else {
          setError(res.message || "Failed to send. Please try again.");
        }
      })
      .catch(() => { setSending(false); setError("An error occurred. Please try again."); });
  }

  const services = ["Web Applications", "Data Dashboards", "PostgreSQL & SQL", "Excel & Data Analysis", "Consulting"];

  return (
    <ModalWrapper title="The Post Office" subtitle="Write a letter or find other ways to reach me." icon="✉️" onClose={onClose}>
      {/* Tab switcher */}
      <div className="letter-tabs">
        <button className={`letter-tab${tab==="write"?" active":""}`} onClick={() => setTab("write")}>✏️ Write Letter</button>
        <button className={`letter-tab${tab==="contact"?" active":""}`} onClick={() => setTab("contact")}>📌 Direct Contact</button>
      </div>

      {tab === "write" ? (
        <div className="letter-paper">
          <div className="letter-paper-header">
            <div className="letter-wax-seal">✉</div>
            <div className="letter-paper-from">
              <input
                className="letter-field letter-field-name"
                type="text"
                placeholder="Your name…"
                value={name}
                onChange={e => setName(e.target.value)}
              />
              <input
                className="letter-field letter-field-email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="letter-subject-row">
            <label className="letter-label">Re:</label>
            <select className="letter-select" value={subject} onChange={e => handleSubjectChange(e.target.value)}>
              <option value="Collaborate">Collaborate on a project</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {subject === "Collaborate" && (
            <div className="letter-meta-row">
              <div className="letter-meta-field">
                <label className="letter-label">Type</label>
                <select className="letter-select" value={projectType} onChange={e => setProjectType(e.target.value)}>
                  <option>Web Application</option>
                  <option>Data Dashboard</option>
                  <option>Data Analysis</option>
                  <option>Consulting</option>
                </select>
              </div>
              <div className="letter-meta-field">
                <label className="letter-label">Timeline</label>
                <select className="letter-select" value={timeline} onChange={e => setTimeline(e.target.value)}>
                  <option>Less than 1 month</option>
                  <option>1–3 months</option>
                  <option>3–6 months</option>
                  <option>Ongoing</option>
                </select>
              </div>
            </div>
          )}

          <textarea
            className="letter-body"
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Write your message here…"
            rows={7}
          />

          <div className="letter-footer">
            <div className="letter-services">
              {services.map(s => <span key={s} className="service-chip">{s}</span>)}
            </div>
            <div className="letter-send-row">
              {sent ? (
                <div className="letter-sent">📬 Letter delivered!</div>
              ) : (
                <button
                  className="btn btn-primary letter-send-btn"
                  onClick={handleSend}
                  disabled={sending || !message.trim() || !email.trim()}
                >
                  {sending ? "Sending…" : "📨 Send Letter"}
                </button>
              )}
              {error && <span className="letter-error">{error}</span>}
            </div>
          </div>
        </div>
      ) : (
        <div className="direct-contact">
          <div className="contact-meta" style={{ marginBottom: "1rem" }}>
            <span className="avail-dot"></span>
            <span className="avail-text">Available for new projects</span>
          </div>
          <div className="contact-channels">
            <a href="https://github.com/cruazz" className="contact-tile" target="_blank" rel="noreferrer">
              <div className="contact-icon-box"><Icons.Github /></div>
              <div className="contact-tile-text"><span className="contact-label">GitHub</span><span className="contact-value">cruazz</span></div>
              <div className="contact-arrow"><Icons.Arrow /></div>
            </a>
            <a href="https://instagram.com/hezmtch" className="contact-tile" target="_blank" rel="noreferrer">
              <div className="contact-icon-box"><Icons.Instagram /></div>
              <div className="contact-tile-text"><span className="contact-label">Instagram</span><span className="contact-value">hezmtch</span></div>
              <div className="contact-arrow"><Icons.Arrow /></div>
            </a>
            <a href="https://discord.com/users/792563548990996480" className="contact-tile" target="_blank" rel="noreferrer">
              <div className="contact-icon-box"><Icons.Discord /></div>
              <div className="contact-tile-text"><span className="contact-label">Discord</span><span className="contact-value">ccruaz</span></div>
              <div className="contact-arrow"><Icons.Arrow /></div>
            </a>
            <a href="mailto:hezekiah.mitchellt@gmail.com" className="contact-tile">
              <div className="contact-icon-box"><Icons.Email /></div>
              <div className="contact-tile-text"><span className="contact-label">Mail</span><span className="contact-value">hezekiah.mitchellt@gmail.com</span></div>
              <div className="contact-arrow"><Icons.Arrow /></div>
            </a>
          </div>
        </div>
      )}
    </ModalWrapper>
  );
}

// ── OBSERVATORY MODAL — Constellation Map ────────────────────────────────────
export function ObservatoryModal({ onClose }) {
  const canvasRef = useRef(null);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hovered, setHovered] = useState(null);
  const animRef = useRef(null);
  const starsRef = useRef([]);
  const canvasSizeRef = useRef({ w: 800, h: 420 });

  // Skill categories with constellation groupings
  const CATEGORIES = [
    { id: "frontend",  label: "Frontend",   color: "#4facfe", cx: 0.22, cy: 0.30 },
    { id: "backend",   label: "Backend",    color: "#7eb8a4", cx: 0.70, cy: 0.25 },
    { id: "data",      label: "Data",       color: "#f5d35c", cx: 0.75, cy: 0.72 },
    { id: "tools",     label: "Tools",      color: "#e8a090", cx: 0.25, cy: 0.72 },
  ];

  const KEYWORD_MAP = {
    frontend: ["react","vue","angular","html","css","javascript","typescript","tailwind","sass","next","svelte","vite","webpack"],
    backend:  ["node","express","fastapi","django","flask","php","java","spring","ruby","rails","graphql","rest","api","postgres","sql","mysql","mongodb","redis"],
    data:     ["excel","power bi","tableau","pandas","numpy","python","r ","data","analysis","dashboard","bi","etl","sql"],
    tools:    ["git","docker","linux","aws","azure","figma","postman","vs code","nginx","ci/cd","vercel","netlify","github"],
  };

  function categorize(skillName) {
    const lower = skillName.toLowerCase();
    for (const [cat, keywords] of Object.entries(KEYWORD_MAP)) {
      if (keywords.some(k => lower.includes(k))) return cat;
    }
    return "tools";
  }

  useEffect(() => {
    fetch(`${API}/skills`)
      .then(r => r.ok ? r.json() : [])
      .then(data => setSkills(Array.isArray(data) ? data.map(s => s.name) : []))
      .catch(() => setSkills(["React","Node.js","PostgreSQL","SQL","Excel","Python","Git","Tailwind"]))
      .finally(() => setLoading(false));
  }, []);

  // Resize canvas to match its display size for sharp rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver(() => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const w = Math.round(rect.width * dpr);
      const h = Math.round(rect.height * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        canvasSizeRef.current = { w, h };
      }
    });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [loading]);

  useEffect(() => {
    if (loading || !canvasRef.current) return;
    const canvas = canvasRef.current;

    // Build star positions
    const grouped = {};
    for (const cat of CATEGORIES) grouped[cat.id] = [];
    for (const s of skills) {
      const cat = categorize(s);
      grouped[cat].push(s);
    }

    const allStars = [];
    for (const cat of CATEGORIES) {
      const list = grouped[cat.id] || [];
      list.forEach((name, i) => {
        const angle = (i / Math.max(list.length, 1)) * Math.PI * 2 - Math.PI / 2;
        const radius = 0.07 + (i % 3) * 0.035;
        allStars.push({
          name,
          category: cat.id,
          color: cat.color,
          relX: cat.cx + Math.cos(angle) * radius,
          relY: cat.cy + Math.sin(angle) * radius,
          size: 3 + Math.random() * 2,
          twinkle: Math.random() * Math.PI * 2,
          twinkleSpeed: 0.02 + Math.random() * 0.03,
        });
      });
    }

    // Background nebula stars (decorative)
    const bgStars = Array.from({ length: 120 }, () => ({
      x: Math.random(), y: Math.random(),
      size: 0.5 + Math.random() * 1.5,
      opacity: 0.2 + Math.random() * 0.5,
      twinkle: Math.random() * Math.PI * 2,
      speed: 0.01 + Math.random() * 0.02,
    }));

    starsRef.current = allStars;

    const draw = () => {
      const w = canvas.width, h = canvas.height;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, w, h);

      // Sky background
      const skyGrad = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, Math.max(w,h)/1.5);
      skyGrad.addColorStop(0, "#0d1a30");
      skyGrad.addColorStop(1, "#050a14");
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      // Nebula blobs
      for (const cat of CATEGORIES) {
        const gx = cat.cx * w, gy = cat.cy * h;
        const nb = ctx.createRadialGradient(gx, gy, 0, gx, gy, w * 0.15);
        nb.addColorStop(0, cat.color + "22");
        nb.addColorStop(1, "transparent");
        ctx.fillStyle = nb;
        ctx.fillRect(0, 0, w, h);
      }

      // Bg stars
      for (const s of bgStars) {
        s.twinkle += s.speed;
        const op = s.opacity * (0.7 + 0.3 * Math.sin(s.twinkle));
        ctx.fillStyle = `rgba(200,220,255,${op})`;
        ctx.fillRect(s.x * w, s.y * h, s.size, s.size);
      }

      // Constellation lines (connect stars of same category)
      for (const cat of CATEGORIES) {
        const catStars = allStars.filter(s => s.category === cat.id);
        if (catStars.length < 2) continue;
        ctx.strokeStyle = cat.color + "55";
        ctx.lineWidth = 0.8;
        ctx.setLineDash([4, 6]);
        ctx.beginPath();
        catStars.forEach((s, i) => {
          const sx = s.relX * w, sy = s.relY * h;
          i === 0 ? ctx.moveTo(sx, sy) : ctx.lineTo(sx, sy);
        });
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Category labels
      const labelSize = Math.max(8, Math.round(w / 80));
      for (const cat of CATEGORIES) {
        ctx.fillStyle = cat.color + "cc";
        ctx.font = `bold ${labelSize}px 'Press Start 2P', monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillText(cat.label.toUpperCase(), cat.cx * w, cat.cy * h - 38 * (w / 800));
      }

      // Skill stars
      const scaleFactor = w / 800;
      for (const s of allStars) {
        s.twinkle += s.twinkleSpeed;
        const sx = s.relX * w, sy = s.relY * h;
        const isHovered = hovered === s.name;
        const brightness = isHovered ? 1 : 0.6 + 0.4 * Math.sin(s.twinkle);
        const r = isHovered ? s.size + 3 : s.size;

        // Glow
        const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, r * 4);
        glow.addColorStop(0, s.color + Math.round(brightness * 80).toString(16).padStart(2,"0"));
        glow.addColorStop(1, "transparent");
        ctx.fillStyle = glow;
        ctx.beginPath(); ctx.arc(sx, sy, r * 4, 0, Math.PI * 2); ctx.fill();

        // Star core
        ctx.fillStyle = isHovered ? "#ffffff" : s.color;
        ctx.beginPath(); ctx.arc(sx, sy, r, 0, Math.PI * 2); ctx.fill();

        // Name label on hover
        if (isHovered) {
          const tooltipFont = Math.max(9, Math.round(11 * scaleFactor));
          const padding = 6 * scaleFactor;
          ctx.font = `${tooltipFont}px 'VT323', monospace`;
          const tw = ctx.measureText(s.name).width + padding * 2;
          const tooltipH = 18 * scaleFactor;
          const tooltipY = 28 * scaleFactor;
          ctx.fillStyle = "rgba(12,16,28,0.92)";
          ctx.fillRect(sx - tw/2, sy - tooltipY, tw, tooltipH);
          ctx.strokeStyle = s.color;
          ctx.lineWidth = 1;
          ctx.strokeRect(sx - tw/2, sy - tooltipY, tw, tooltipH);
          ctx.fillStyle = s.color;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(s.name, sx, sy - tooltipY + tooltipH / 2);
        }
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [loading, skills, hovered]);

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const my = (e.clientY - rect.top)  * (canvas.height / rect.height);
    const w = canvas.width, h = canvas.height;
    let found = null;
    for (const s of starsRef.current) {
      const sx = s.relX * w, sy = s.relY * h;
      if (Math.hypot(mx - sx, my - sy) < 14) { found = s.name; break; }
    }
    setHovered(found);
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 0) return;
    const touch = e.touches[0];
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = (touch.clientX - rect.left) * (canvas.width / rect.width);
    const my = (touch.clientY - rect.top)  * (canvas.height / rect.height);
    const w = canvas.width, h = canvas.height;
    let found = null;
    for (const s of starsRef.current) {
      const sx = s.relX * w, sy = s.relY * h;
      if (Math.hypot(mx - sx, my - sy) < 20) { found = s.name; break; }
    }
    setHovered(found);
  };

  return (
    <ModalWrapper title="The Observatory" subtitle="Hover over stars to see the technologies." icon="🔭" onClose={onClose}>
      <div className="observatory-body">
        {loading ? <Loader /> : (
          <>
            <canvas
              ref={canvasRef}
              className="constellation-canvas"
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setHovered(null)}
              onTouchMove={handleTouchMove}
              onTouchEnd={() => setHovered(null)}
            />
            <div className="constellation-legend">
              {CATEGORIES.map(cat => (
                <div key={cat.id} className="legend-item">
                  <span className="legend-dot" style={{ background: cat.color }} />
                  <span className="legend-label">{cat.label}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </ModalWrapper>
  );
}

// ── SCHOLAR DIALOGUE MODAL ───────────────────────────────────────────────────
export function ScholarModal({ posts, onClose, onOpenPost }) {
  const [step, setStep] = useState(0);
  const [recommended, setRecommended] = useState(null);

  const dialogue = [
    "Greetings, traveller! I am the Scholar of this village.",
    "I've read every scroll in the Library...",
    "Let me recommend something for your journey.",
  ];

  useEffect(() => {
    if (posts && posts.length > 0) {
      // Pick a random published post
      const pick = posts[Math.floor(Math.random() * posts.length)];
      setRecommended(pick);
    }
  }, [posts]);

  const isLastDialogue = step === dialogue.length - 1;

  return (
    <div className="game-modal-overlay">
      <div className="scholar-dialogue-box">
        {/* NPC Portrait */}
        <div className="scholar-portrait">
          <div className="scholar-portrait-inner">🧙</div>
        </div>

        <div className="scholar-dialogue-content">
          <div className="scholar-name">THE SCHOLAR</div>

          {step < dialogue.length ? (
            <>
              <p className="scholar-text">{dialogue[step]}</p>
              <div className="scholar-dialogue-actions">
                {step < dialogue.length - 1 ? (
                  <button className="scholar-btn" onClick={() => setStep(s => s + 1)}>
                    Next ▶
                  </button>
                ) : (
                  recommended ? (
                    <button
                      className="scholar-btn scholar-btn-recommend"
                      onClick={() => onOpenPost(recommended)}
                    >
                      📜 Read: &ldquo;{recommended.title.slice(0, 40)}{recommended.title.length > 40 ? "…" : ""}&rdquo;
                    </button>
                  ) : (
                    <button className="scholar-btn" onClick={onClose}>
                      Farewell
                    </button>
                  )
                )}
                <button className="scholar-btn scholar-btn-skip" onClick={onClose}>
                  Farewell
                </button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
