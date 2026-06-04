import { useState, useEffect, useRef } from "react";
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

const API = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

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
    <nav className="blog-nav">
      <a href="/" className="blog-nav-logo" onClick={(e) => handlePageChange(e, "home")}>
        Cruaz
      </a>

      <ul className={`blog-nav-links${menuOpen ? " open" : ""}`}>
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
        <button className="theme-toggle" onClick={() => setLight(v => !v)}>
          <span className="theme-toggle-icon">{light ? "☾" : "☀"}</span>
          <span className="theme-toggle-text">{light ? " Night" : " Day"}</span>
        </button>
        <button className={`hamburger${menuOpen ? " open" : ""}`} onClick={() => setMenuOpen(!menuOpen)}>
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
  const [scholarPost, setScholarPost] = useState(null); // post recommended by scholar
  const scholarPostRef = useRef(null); // ref so LibraryModal reads it synchronously at mount
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(() => localStorage.getItem("blog_token"));
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const handleLocation = (allPosts = posts) => {
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
    };

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

  async function fetchPosts() {
    try {
      const res = await fetch(`${API}/posts`);
      const data = await res.json();
      const allPosts = Array.isArray(data) ? data : [];
      setPosts(allPosts);
      return allPosts;
    } catch {
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
    <div className={`blog-root${light ? " light" : ""}`}>
      {/* HUD navigation styled top bar */}
      <Nav
        page={page}
        setPage={go}
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
        <div className="game-screen-wrapper">
          {page === "loading" && (
            <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Loader />
            </div>
          )}
          
          <GameWorld
            activeModal={page !== "home" && page !== "loading" ? page : null}
            onTriggerBuilding={handleTriggerBuilding}
            onTriggerNPC={handleTriggerNPC}
            light={light}
          />

          {/* Render Modal Overlays on top of the running Game Canvas */}
          {page === "blog" && (
            <LibraryModal
              key={scholarPostRef.current ? `scholar-${scholarPostRef.current.id}` : "library"}
              posts={posts}
              categories={categories}
              loading={loading}
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
  );
}