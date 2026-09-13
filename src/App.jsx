import { useState, useEffect, useRef, useEffectEvent } from "react";
import GameWorld from "./components/GameWorld.jsx";
import {
  LibraryModal,
  WorkshopModal,
  StudyModal,
  PostOfficeModal,
  ObservatoryModal,
  ScholarModal,
  TavernModal
} from "./components/Modals.jsx";
import { AdminLogin, AdminPanel } from "./components/Admin.jsx";
import { ReadingModeContext } from './ReadingModeContext.js';

const API = import.meta.env.VITE_API_URL || "/api";

const Loader = () => (
  <div className="loading-dots">
    <span></span><span></span><span></span>
  </div>
);

// ── Nav Component ────────────────────────────────────────────────────────────
function Nav({ page, setPage, light, setLight, token, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const links = [
    { id: "home", label: "Village Map", path: "/" },
    { id: "blog", label: "Library (Blog)", path: "/blog" },
    { id: "portfolio", label: "Workshop (Projects)", path: "/portfolio" },
    { id: "about", label: "Study (About)", path: "/about" },
    { id: "tavern", label: "Tavern (Status)", path: "/tavern" },
    { id: "contact", label: "Post (Contact)", path: "/contact" },
  ];

  const handlePageChange = (e, id) => {
    e.preventDefault();
    setPage(id);
    setMenuOpen(false);
  };

  return (
    <nav className="blog-nav" aria-label="Main navigation" onKeyDown={e => { if (e.key === 'Escape') setMenuOpen(false); }}>
      <a href="/" className="blog-nav-logo" onClick={(e) => handlePageChange(e, "home")}>
        Cruaz
      </a>

      <ul id="main-navigation" className={`blog-nav-links${menuOpen ? " open" : ""}`}>
        {links.map(l => (
          <li key={l.id}>
            <a
              href={l.path}
              className={page === l.id ? "active" : ""}
              onClick={(e) => handlePageChange(e, l.id)}
            >
              {l.label}
            </a>
          </li>
        ))}
        {token && (
          <li>
            <a
              href="/admin"
              className={page === "admin" ? "active" : ""}
              onClick={(e) => handlePageChange(e, "admin")}
              style={{ color: "var(--accent)" }}
            >
              Admin
            </a>
          </li>
        )}
      </ul>

      <div className="nav-actions">
        {token && <button className="theme-toggle" onClick={onLogout}>Log out</button>}
        <button className="theme-toggle" aria-label={light ? 'Switch to night theme' : 'Switch to day theme'} onClick={() => setLight(v => !v)}>
          <span className="theme-toggle-icon">{light ? "☾" : "☀"}</span>
          <span className="theme-toggle-text">{light ? " Night" : " Day"}</span>
        </button>
        <button aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} aria-controls="main-navigation" className={`hamburger${menuOpen ? " open" : ""}`} onClick={() => setMenuOpen(!menuOpen)}>
          <span></span><span></span><span></span>
        </button>
      </div>
    </nav>
  );
}

// ── App Container ────────────────────────────────────────────────────────────
export default function App() {
  const RESERVED_PAGES = ["home", "blog", "portfolio", "about", "contact", "admin", "observatory", "scholar", "tavern"];

  const [page, setPage] = useState(() => {
    const path = window.location.pathname.slice(1);
    if (!path || path === "home") return "home";
    if (RESERVED_PAGES.includes(path)) return path;
    return "loading";
  });

  const [light, setLight] = useState(() => localStorage.getItem("blog_theme") === "light");
  const [activePost, setActivePost] = useState(null);
  const [, setScholarPost] = useState(null); // post recommended by scholar
  const scholarPostRef = useRef(null); // ref so LibraryModal reads it synchronously at mount
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postsError, setPostsError] = useState('');
  const [token, setToken] = useState(() => localStorage.getItem("blog_token"));
  const [categories, setCategories] = useState([]);
  const [readingMode, setReadingMode] = useState(() => {
    try { return localStorage.getItem('blog_reading_mode') === 'true'; }
    catch { return false; }
  });

  function changeMode(reading) {
    setReadingMode(reading);
    try { localStorage.setItem('blog_reading_mode', String(reading)); }
    catch { /* The mode still works when browser storage is unavailable. */ }
    if (reading && !['blog', 'post'].includes(page)) go('blog');
    if (!reading) go('home');
  }

  const handleLocation = useEffectEvent((allPosts = posts) => {
      const path = window.location.pathname.slice(1); // e.g. "" or "blog" or "blog/slug"
      if (!path || path === "home") {
        setPage("home");
        setActivePost(null);
      } else if (path === "blog") {
        setPage("blog");
        setActivePost(null);
      } else if (path.startsWith("blog/")) {
        // /blog/slug → open post
        const slug = path.slice(5);
        const p = allPosts.find(x => x.slug === slug);
        if (p) {
          setActivePost(p);
          setPage("post");
        } else {
          setPage("blog"); // Fallback to blog list
        }
      } else if (RESERVED_PAGES.includes(path)) {
        setPage(path);
        setActivePost(null);
      } else {
        // Legacy: bare /slug URLs redirect to /blog/slug
        const p = allPosts.find(x => x.slug === path);
        if (p) {
          setActivePost(p);
          setPage("post");
          window.history.replaceState({}, "", `/blog/${p.slug}`);
        } else {
          setPage("home"); // Fallback
        }
      }
  });

  useEffect(() => {
    fetchPosts().then(allPosts => {
      handleLocation(allPosts);
    });
    fetchCategories();

    const onPopState = () => handleLocation();
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    localStorage.setItem("blog_theme", light ? "light" : "dark");
  }, [light]);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    const syncHeight = () => {
      // Preserve pinch zoom while accounting for the on-screen keyboard.
      if (viewport.scale === 1) document.documentElement.style.setProperty('--viewport-height', `${viewport.height}px`);
    };
    syncHeight();
    viewport.addEventListener('resize', syncHeight);
    return () => {
      viewport.removeEventListener('resize', syncHeight);
      document.documentElement.style.removeProperty('--viewport-height');
    };
  }, []);

  async function fetchPosts() {
    setLoading(true);
    setPostsError('');
    try {
      const res = await fetch(`${API}/posts`);
      if (!res.ok) throw new Error('Failed to load posts');
      const data = await res.json();
      const allPosts = Array.isArray(data) ? data : [];
      setPosts(allPosts);
      return allPosts;
    } catch {
      setPostsError('The library could not load. Please try again.');
      setPosts([]);
      return [];
    } finally {
      setLoading(false);
    }
  }

  async function fetchCategories() {
    try {
      const res = await fetch(`${API}/categories`);
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      setCategories([]);
    }
  }

  function handleLogin(t) {
    setToken(t);
    localStorage.setItem("blog_token", t);
    go("admin");
  }

  function handleLogout() {
    setToken(null);
    localStorage.removeItem("blog_token");
    go("home");
  }

  function go(p, postObj = null) {
    setPage(p);
    if (postObj) setActivePost(postObj);

    let path = `/${p}`;
    if (p === "home") path = "/";
    else if (p === "post" && postObj) path = `/blog/${postObj.slug}`;
    else if (p === "post" && !postObj && activePost) path = `/blog/${activePost.slug}`;

    if (window.location.pathname !== path) {
      window.history.pushState({}, "", path);
    }
    window.scrollTo(0, 0);
  }
  const handleTriggerBuilding = (buildingId) => {
    if (buildingId === "library") go("blog");
    else if (buildingId === "workshop") go("portfolio");
    else if (buildingId === "study") go("about");
    else if (buildingId === "post") go("contact");
    else if (buildingId === "observatory") go("observatory");
    else if (buildingId === "tavern") go("tavern");
  };

  const handleTriggerNPC = (npcId) => {
    if (npcId === "scholar") go("scholar");
  };

  return (
    <ReadingModeContext.Provider value={readingMode}>
    <div className={`blog-root${light ? " light" : ""}${readingMode ? ' reading-mode' : ''}`}>
      {/* HUD navigation styled top bar */}
      <Nav
        page={readingMode && page === 'home' ? 'blog' : page}
        setPage={(destination) => {
          if (destination === 'home') changeMode(false);
          else go(destination);
        }}
        light={light}
        setLight={setLight}
        token={token}
        onLogout={handleLogout}
      />

      {page === "admin" ? (
        // Admin View bypasses the GameWorld
        !token ? (
          <AdminLogin onLogin={handleLogin} />
        ) : (
          <AdminPanel
            token={token}
            onLogout={handleLogout}
            onPostsChange={fetchPosts}
            categories={categories}
            onCategoriesChange={fetchCategories}
          />
        )
      ) : (
        // Main view renders the Exploratory Game World canvas
        <div className={readingMode ? 'reader-screen-wrapper' : 'game-screen-wrapper'}>
          <div className="view-mode-switch" role="group" aria-label="Website view">
            <button type="button" aria-pressed={!readingMode} onClick={() => changeMode(false)}>Explore village</button>
            <button type="button" aria-pressed={readingMode} onClick={() => changeMode(true)}>Read blog</button>
          </div>
          {page === "loading" && (
            <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Loader />
            </div>
          )}
          
          {!readingMode && <GameWorld
            activeModal={page !== "home" && page !== "loading" ? page : null}
            onTriggerBuilding={handleTriggerBuilding}
            onTriggerNPC={handleTriggerNPC}
            light={light}
          />}

          {/* Render Modal Overlays on top of the running Game Canvas */}
          {(page === "blog" || (readingMode && page === 'home')) && (
            <LibraryModal
              key={scholarPostRef.current ? `scholar-${scholarPostRef.current.id}` : "library"}
              posts={posts}
              categories={categories}
              loading={loading}
              error={postsError}
              onRetry={fetchPosts}
              initialActivePost={scholarPostRef.current}
              onOpenPost={(post) => { scholarPostRef.current = null; setScholarPost(null); setActivePost(post); setPage("post"); const path = `/blog/${post.slug}`; if (window.location.pathname !== path) window.history.pushState({}, "", path); }}
              onBackToList={() => { scholarPostRef.current = null; setScholarPost(null); }}
              onClose={() => { scholarPostRef.current = null; setScholarPost(null); go("home"); }}
            />
          )}

          {page === "post" && activePost && (
            <LibraryModal
              key={activePost.id}
              posts={posts}
              categories={categories}
              loading={loading}
              error={postsError}
              onRetry={fetchPosts}
              initialActivePost={activePost}
              onOpenPost={(post) => { setActivePost(post); const path = `/blog/${post.slug}`; if (window.location.pathname !== path) window.history.pushState({}, "", path); }}
              onBackToList={() => { setActivePost(null); setPage("blog"); window.history.pushState({}, "", "/blog"); }}
              onClose={() => { setActivePost(null); go("home"); }}
            />
          )}

          {page === "portfolio" && (
            <WorkshopModal onClose={() => go("home")} />
          )}

          {page === "about" && (
            <StudyModal onClose={() => go("home")} />
          )}

          {page === "contact" && (
            <PostOfficeModal onClose={() => go("home")} />
          )}

          {page === "observatory" && (
            <ObservatoryModal onClose={() => go("home")} />
          )}

          {page === "scholar" && (
            <ScholarModal
              posts={posts}
              loading={loading}
              error={postsError}
              onRetry={fetchPosts}
              onClose={() => go("home")}
              onOpenPost={(post) => {
                scholarPostRef.current = null;
                setScholarPost(null);
                go("post", post);
              }}
            />
          )}

          {page === "tavern" && (
            <TavernModal onClose={() => go("home")} />
          )}
        </div>
      )}
    </div>
    </ReadingModeContext.Provider>
  );
}
