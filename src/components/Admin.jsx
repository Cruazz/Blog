import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const Loader = () => (
  <div className="loading-dots">
    <span></span><span></span><span></span>
  </div>
);

// ── Settings Panel ───────────────────────────────────────────────────────────
export function SettingsPanel({ token, categories, onCategoriesChange }) {
  const [newCatName, setNewCatName] = useState("");
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState("");
  const h = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  useEffect(() => { loadSkills(); }, []);

  async function loadSkills() {
    try {
      const res = await fetch(`${API}/admin/skills`, { headers: h });
      if (res.ok) setSkills(await res.json());
    } catch { }
  }

  async function addCategory() {
    if (!newCatName.trim()) return;
    const name = newCatName.trim();
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const res = await fetch(`${API}/admin/categories`, { method: "POST", headers: h, body: JSON.stringify({ name, slug }) });
    if (res.ok) { setNewCatName(""); onCategoriesChange(); }
  }

  async function deleteCategory(id) {
    if (!confirm("Delete this category? Posts using it won't be removed.")) return;
    await fetch(`${API}/admin/categories/${id}`, { method: "DELETE", headers: h });
    onCategoriesChange();
  }

  async function addSkill() {
    if (!newSkill.trim()) return;
    const res = await fetch(`${API}/admin/skills`, { method: "POST", headers: h, body: JSON.stringify({ name: newSkill.trim() }) });
    if (res.ok) { setNewSkill(""); await loadSkills(); }
  }

  async function deleteSkill(id) {
    await fetch(`${API}/admin/skills/${id}`, { method: "DELETE", headers: h });
    await loadSkills();
  }

  return (
    <div className="settings-grid">
      <div>
        <div className="section-label">Post Categories</div>
        <div className="settings-list">
          {categories.map(c => (
            <div key={c.id} className="settings-row">
              <div><span className="settings-name">{c.name}</span><span className="settings-slug">{c.slug}</span></div>
              <button className="btn btn-danger btn-sm" onClick={() => deleteCategory(c.id)}>Delete</button>
            </div>
          ))}
          {categories.length === 0 && <div style={{ padding: "1rem", color: "var(--muted)", fontSize: "13px", fontFamily: "var(--font-mono)" }}>No categories yet.</div>}
        </div>
        <div style={{ display: "flex", gap: "8px", marginTop: "1rem" }}>
          <input className="editor-input" value={newCatName} onChange={e => setNewCatName(e.target.value)} onKeyDown={e => e.key === "Enter" && addCategory()} placeholder="Category name…" style={{ flex: 1 }} />
          <button className="btn btn-primary btn-sm" onClick={addCategory}>Add</button>
        </div>
      </div>
      <div>
        <div className="section-label">Technologies / Skills</div>
        <div className="settings-list">
          {skills.map(s => (
            <div key={s.id} className="settings-row">
              <span className="settings-name">{s.name}</span>
              <button className="btn btn-danger btn-sm" onClick={() => deleteSkill(s.id)}>Delete</button>
            </div>
          ))}
          {skills.length === 0 && <div style={{ padding: "1rem", color: "var(--muted)", fontSize: "13px", fontFamily: "var(--font-mono)" }}>No skills yet.</div>}
        </div>
        <div style={{ display: "flex", gap: "8px", marginTop: "1rem" }}>
          <input className="editor-input" value={newSkill} onChange={e => setNewSkill(e.target.value)} onKeyDown={e => e.key === "Enter" && addSkill()} placeholder="Technology name…" style={{ flex: 1 }} />
          <button className="btn btn-primary btn-sm" onClick={addSkill}>Add</button>
        </div>
      </div>
    </div>
  );
}

// ── Projects Admin ───────────────────────────────────────────────────────────
const EMPTY_PROJECT = { name: "", description: "", tags: "", github_url: "", live_url: "", featured: true, sort_order: 0, display_urls: [] };

export function ProjectsAdmin({ token, handleUpload }) {
  const [projects, setProjects] = useState([]);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");
  const h = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const res = await fetch(`${API}/admin/projects`, { headers: h });
      if (res.ok) setProjects(await res.json());
    } catch { }
  }

  async function save() {
    setSaving(true); setMsg("");
    try {
      const tags = typeof editing.tags === "string"
        ? editing.tags.split(",").map(t => t.trim()).filter(Boolean)
        : editing.tags;
      const payload = { ...editing, tags };
      const isNew = !editing.id;
      const url = isNew ? `${API}/admin/projects` : `${API}/admin/projects/${editing.id}`;
      const res = await fetch(url, { method: isNew ? "POST" : "PUT", headers: h, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error((await res.json()).error);
      setMsg("Saved!");
      await load();
      setTimeout(() => { setMsg(""); setEditing(null); }, 1200);
    } catch (err) { setMsg(`Error: ${err.message}`); }
    finally { setSaving(false); }
  }

  async function del(id) {
    if (!confirm("Delete this project?")) return;
    await fetch(`${API}/admin/projects/${id}`, { method: "DELETE", headers: h });
    await load();
  }

  function f(key, val) { setEditing(prev => ({ ...prev, [key]: val })); }

  async function onFileChange(file, index) {
    if (!file) return;
    setUploading(true);
    try {
      const url = await handleUpload(file);
      if (url) {
        const nextUrls = [...(editing.display_urls || [])];
        nextUrls[index] = url;
        f("display_urls", nextUrls);
      }
    } finally {
      setUploading(false);
    }
  }

  function removeImg(index) {
    const nextUrls = [...(editing.display_urls || [])];
    nextUrls.splice(index, 1);
    f("display_urls", nextUrls.filter(Boolean));
  }

  if (editing !== null) return (
    <div className="post-editor">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 300 }}>{editing.id ? "Edit Project" : "New Project"}</h3>
        <button className="btn btn-outline btn-sm" onClick={() => setEditing(null)}>← Back</button>
      </div>

      <div className="section-label" style={{ marginTop: "0" }}>Display Images (Max 5)</div>
      <div className="project-editor-images">
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} className="project-img-slot">
            {editing.display_urls?.[i] ? (
              <img src={editing.display_urls[i]} className="project-slot-preview" alt="" />
            ) : (
              <div className="project-slot-empty">Slot {i + 1}</div>
            )}
            <div style={{ display: "flex", gap: "4px", width: "100%" }}>
              <input type="file" id={`proj-img-${i}`} className="hidden-input" accept="image/*" onChange={e => onFileChange(e.target.files[0], i)} />
              <button className="btn btn-outline btn-sm" style={{ flex: 1, fontSize: "10px", padding: "4px" }} onClick={() => document.getElementById(`proj-img-${i}`).click()}>
                {editing.display_urls?.[i] ? "Change" : "Upload"}
              </button>
              {editing.display_urls?.[i] && (
                <button className="btn btn-danger btn-sm" style={{ padding: "4px 8px" }} onClick={() => removeImg(i)}>×</button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="editor-grid">
        <div><label className="editor-label">Name</label><input className="editor-input" value={editing.name} onChange={e => f("name", e.target.value)} placeholder="Project name" /></div>
        <div><label className="editor-label">Sort Order</label><input className="editor-input" type="number" value={editing.sort_order} onChange={e => f("sort_order", +e.target.value)} /></div>
        <div><label className="editor-label">GitHub URL</label><input className="editor-input" value={editing.github_url || ""} onChange={e => f("github_url", e.target.value)} placeholder="https://github.com/..." /></div>
        <div><label className="editor-label">Live URL</label><input className="editor-input" value={editing.live_url || ""} onChange={e => f("live_url", e.target.value)} placeholder="https://..." /></div>
      </div>
      <div className="editor-row"><label className="editor-label">Tags (comma separated)</label><input className="editor-input" value={Array.isArray(editing.tags) ? editing.tags.join(", ") : editing.tags} onChange={e => f("tags", e.target.value)} placeholder="React, PostgreSQL, Node.js" /></div>
      <div className="editor-row"><label className="editor-label">Description</label><textarea className="editor-textarea" style={{ minHeight: "120px" }} value={editing.description || ""} onChange={e => f("description", e.target.value)} placeholder="What does this project do?" /></div>
      <div className="editor-footer">
        <div className="editor-footer-left">
          <label className="toggle-label"><input type="checkbox" checked={editing.featured} onChange={e => f("featured", e.target.checked)} /> Featured on Work page</label>
          {msg && <span className="success-msg">{msg}</span>}
          {uploading && <span className="success-msg" style={{ color: "var(--accent)" }}>Uploading...</span>}
        </div>
        <div className="editor-footer-right">
          <button className="btn btn-outline btn-sm" onClick={() => setEditing(null)}>Cancel</button>
          <button className="btn btn-primary btn-sm" onClick={save} disabled={saving || uploading}>{saving ? "Saving…" : "Save project"}</button>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
        <button className="btn btn-primary btn-sm" onClick={() => setEditing({ ...EMPTY_PROJECT })}>+ New project</button>
      </div>
      <div className="admin-table-container">
        <table className="admin-table">
          <thead><tr><th>Name</th><th>Tags</th><th>Visibility</th><th></th></tr></thead>
          <tbody>
            {projects.map(p => (
              <tr key={p.id}>
                <td style={{ fontFamily: "var(--font-display)", fontSize: "1rem" }}>{p.name}</td>
                <td><div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>{(p.tags || []).map(t => <span key={t} className="tech-tag">{t}</span>)}</div></td>
                <td>{p.featured ? <span className="pub-badge">Featured</span> : <span className="draft-badge">Hidden</span>}</td>
                <td><div className="admin-actions">
                  <button className="btn btn-outline btn-sm" onClick={() => setEditing({ ...p, tags: (p.tags || []).join(", ") })}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => del(p.id)}>Delete</button>
                </div></td>
              </tr>
            ))}
            {projects.length === 0 && <tr><td colSpan={4} style={{ textAlign: "center", color: "var(--muted)", padding: "2rem", fontFamily: "var(--font-mono)", fontSize: "13px" }}>No projects yet. Add your first one!</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Tavern Admin ─────────────────────────────────────────────────────────────
const DEFAULT_STACK_ITEM = { name: "", icon: "", level: 50 };

export function TavernAdmin({ token }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const h = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const res = await fetch(`${API}/admin/tavern/status`, { headers: h });
      if (res.ok) {
        const data = await res.json();
        setStatus({
          currently: data.currently || "",
          learning: data.learning || [],
          stack: data.stack || [],
          mood: data.mood || "",
          hoursToday: data.hoursToday || "",
        });
      }
    } catch { }
    finally { setLoading(false); }
  }

  async function save() {
    setSaving(true); setMsg("");
    try {
      const res = await fetch(`${API}/admin/tavern/status`, {
        method: "PUT", headers: h, body: JSON.stringify(status),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setMsg("Saved!");
      setTimeout(() => setMsg(""), 2000);
    } catch (err) { setMsg(`Error: ${err.message}`); }
    finally { setSaving(false); }
  }

  function updateField(key, val) {
    setStatus(prev => ({ ...prev, [key]: val }));
  }

  // Learning list helpers
  function addLearning() {
    setStatus(prev => ({ ...prev, learning: [...prev.learning, ""] }));
  }
  function updateLearning(i, val) {
    setStatus(prev => {
      const next = [...prev.learning];
      next[i] = val;
      return { ...prev, learning: next };
    });
  }
  function removeLearning(i) {
    setStatus(prev => ({ ...prev, learning: prev.learning.filter((_, idx) => idx !== i) }));
  }

  // Stack helpers
  function addStack() {
    setStatus(prev => ({ ...prev, stack: [...prev.stack, { ...DEFAULT_STACK_ITEM }] }));
  }
  function updateStack(i, key, val) {
    setStatus(prev => {
      const next = [...prev.stack];
      next[i] = { ...next[i], [key]: key === "level" ? Number(val) : val };
      return { ...prev, stack: next };
    });
  }
  function removeStack(i) {
    setStatus(prev => ({ ...prev, stack: prev.stack.filter((_, idx) => idx !== i) }));
  }

  if (loading) return <Loader />;
  if (!status) return <p style={{ color: "var(--muted)", fontFamily: "var(--font-mono)", fontSize: "13px" }}>Failed to load tavern status.</p>;

  return (
    <div className="post-editor" style={{ maxWidth: "700px" }}>
      {/* Quest */}
      <div className="editor-row">
        <label className="editor-label">⚔️ Current Quest</label>
        <input className="editor-input" value={status.currently} onChange={e => updateField("currently", e.target.value)} placeholder="What are you working on?" />
      </div>

      {/* Mood + Hours */}
      <div className="editor-grid">
        <div>
          <label className="editor-label">🎭 Mood</label>
          <input className="editor-input" value={status.mood} onChange={e => updateField("mood", e.target.value)} placeholder="e.g. Focused & caffeinated" />
        </div>
        <div>
          <label className="editor-label">⏳ Coded Today</label>
          <input className="editor-input" value={status.hoursToday} onChange={e => updateField("hoursToday", e.target.value)} placeholder="e.g. 4h 32m" />
        </div>
      </div>

      {/* Learning */}
      <div style={{ marginTop: "1.5rem" }}>
        <div className="section-label" style={{ marginTop: 0 }}>📖 Studying</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {status.learning.map((item, i) => (
            <div key={i} style={{ display: "flex", gap: "6px" }}>
              <input className="editor-input" style={{ flex: 1 }} value={item} onChange={e => updateLearning(i, e.target.value)} placeholder="Technology or topic..." />
              <button className="btn btn-danger btn-sm" style={{ padding: "4px 10px" }} onClick={() => removeLearning(i)}>×</button>
            </div>
          ))}
        </div>
        <button className="btn btn-outline btn-sm" style={{ marginTop: "8px" }} onClick={addLearning}>+ Add topic</button>
      </div>

      {/* Stack / Arsenal */}
      <div style={{ marginTop: "1.5rem" }}>
        <div className="section-label" style={{ marginTop: 0 }}>🛡️ Arsenal (Tech Stack)</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {status.stack.map((item, i) => (
            <div key={i} style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              <input className="editor-input" style={{ width: "50px", textAlign: "center" }} value={item.icon} onChange={e => updateStack(i, "icon", e.target.value)} placeholder="🎨" title="Icon/emoji" />
              <input className="editor-input" style={{ flex: 1 }} value={item.name} onChange={e => updateStack(i, "name", e.target.value)} placeholder="Technology name" />
              <input className="editor-input" style={{ width: "60px" }} type="number" min="0" max="100" value={item.level} onChange={e => updateStack(i, "level", e.target.value)} title="Level (0-100)" />
              <button className="btn btn-danger btn-sm" style={{ padding: "4px 10px" }} onClick={() => removeStack(i)}>×</button>
            </div>
          ))}
        </div>
        <button className="btn btn-outline btn-sm" style={{ marginTop: "8px" }} onClick={addStack}>+ Add tech</button>
      </div>

      {/* Save row */}
      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "12px", marginTop: "2rem", paddingTop: "1rem", borderTop: "1px solid var(--border)" }}>
        {msg && <span style={{ color: msg.startsWith("Error") ? "#cc3333" : "var(--accent)", fontFamily: "var(--font-mono)", fontSize: "13px" }}>{msg}</span>}
        <button className="btn btn-primary btn-sm" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save Tavern Status"}</button>
      </div>
    </div>
  );
}

// ── Admin Login ─────────────────────────────────────────────────────────────
export function AdminLogin({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      onLogin(data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <div className="admin-login">
        <h2>Admin</h2>
        <p>Sign in to manage your posts.</p>
        <div className="form-group">
          <label className="form-label">Username</label>
          <input className="form-input" type="text" value={username} onChange={e => setUsername(e.target.value)} autoFocus />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()} />
        </div>
        <button className="btn btn-primary" onClick={handleLogin} disabled={loading}>{loading ? "Signing in…" : "Sign in"}</button>
        {error && <div className="admin-error">{error}</div>}
      </div>
    </div>
  );
}

// ── Admin Panel ──────────────────────────────────────────────────────────────
const EMPTY = { title: "", slug: "", tag: "", excerpt: "", body: "", published: false, image_url: "" };

export function AdminPanel({ token, onLogout, onPostsChange, categories, onCategoriesChange }) {
  const [posts, setPosts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");
  const [tab, setTab] = useState("posts");
  const h = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  useEffect(() => { load(); }, []);

  async function load() {
    const res = await fetch(`${API}/admin/posts`, { headers: h });
    if (res.status === 401) { onLogout(); return; }
    setPosts(await res.json());
  }

  async function save() {
    setSaving(true); setMsg("");
    try {
      const isNew = !editing.id;
      const res = await fetch(isNew ? `${API}/admin/posts` : `${API}/admin/posts/${editing.id}`, {
        method: isNew ? "POST" : "PUT", headers: h, body: JSON.stringify(editing),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setMsg("Saved!");
      await load(); onPostsChange();
      setTimeout(() => { setMsg(""); setEditing(null); }, 1200);
    } catch (err) { setMsg(`Error: ${err.message}`); }
    finally { setSaving(false); }
  }

  async function del(id) {
    if (!confirm("Delete this post?")) return;
    await fetch(`${API}/admin/posts/${id}`, { method: "DELETE", headers: h });
    await load(); onPostsChange();
  }

  function field(key, val) {
    setEditing(prev => {
      const next = { ...prev, [key]: val };
      if (key === "title" && !prev.id) next.slug = slugify(val);
      return next;
    });
  }

  async function handleUpload(file, fieldKey) {
    if (!file) return;
    setUploading(true);
    setMsg("");
    const formData = new FormData();
    formData.append("image", file);
    try {
      const res = await fetch(`${API}/admin/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (fieldKey) field(fieldKey, data.url);
      setMsg("Photo uploaded!");
      return data.url;
    } catch (err) {
      setMsg(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  }

  if (editing !== null) return (
    <div className="page">
      <div className="admin-panel">
        <div className="admin-header">
          <h2>{editing.id ? "Edit post" : "New post"}</h2>
          <button className="btn btn-outline btn-sm" onClick={() => setEditing(null)}>← Back</button>
        </div>
        <div className="post-editor">
          <div className="editor-grid">
            <div style={{ gridColumn: "span 2" }}>
              <label className="editor-label">Featured Image</label>
              {editing.image_url && <img src={editing.image_url} alt="Preview" className="featured-image-preview" />}
              <div className="upload-btn-container">
                <input type="file" id="featured-image-upload" className="hidden-input" accept="image/*" onChange={e => handleUpload(e.target.files[0], "image_url")} />
                <button className="btn btn-outline btn-sm" onClick={() => document.getElementById("featured-image-upload").click()}>
                  {uploading ? "Uploading..." : editing.image_url ? "Change image" : "Upload image"}
                </button>
                {editing.image_url && <button className="btn btn-danger btn-sm" onClick={() => field("image_url", "")}>Remove</button>}
              </div>
            </div>
            <div><label className="editor-label">Title</label><input className="editor-input" value={editing.title} onChange={e => field("title", e.target.value)} placeholder="Post title" /></div>
            <div><label className="editor-label">Slug</label><input className="editor-input" value={editing.slug} onChange={e => field("slug", e.target.value)} /></div>
            <div>
              <label className="editor-label">Tag</label>
              <select className="editor-input" value={editing.tag} onChange={e => field("tag", e.target.value)}>
                {categories.length > 0
                  ? categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)
                  : <option value={editing.tag}>{editing.tag || "development"}</option>}
              </select>
            </div>
            <div><label className="editor-label">Excerpt</label><input className="editor-input" value={editing.excerpt} onChange={e => field("excerpt", e.target.value)} placeholder="Short preview…" /></div>
          </div>
          <div className="editor-row">
            <label className="editor-label">Body (HTML)</label>
            <textarea className="editor-textarea" value={editing.body} onChange={e => field("body", e.target.value)} placeholder="<p>Write your post here…</p>" />
            <div className="img-utility-row">
              <input type="file" id="content-image-upload" className="hidden-input" accept="image/*" onChange={async (e) => {
                const url = await handleUpload(e.target.files[0]);
                if (url) {
                  const tag = `<img src="${url}" alt="" />`;
                  navigator.clipboard.writeText(tag);
                  setMsg("Img tag copied to clipboard!");
                }
              }} />
              <button className="btn btn-outline btn-sm" onClick={() => document.getElementById("content-image-upload").click()}>
                + Upload photo for text
              </button>
              <span style={{ fontSize: "11px", color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
                Upload to get an &lt;img&gt; tag copied to your clipboard
              </span>
            </div>
          </div>
          <div className="editor-footer">
            <div className="editor-footer-left">
              <label className="toggle-label">
                <input type="checkbox" checked={editing.published} onChange={e => field("published", e.target.checked)} /> Publish
              </label>
              {msg && <span className="success-msg">{msg}</span>}
            </div>
            <div className="editor-footer-right">
              <button className="btn btn-outline btn-sm" onClick={() => setEditing(null)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save post"}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="page">
      <div className="admin-panel">
        <div className="admin-header">
          <h2>{tab === "posts" ? "Posts" : tab === "projects" ? "Projects" : tab === "tavern" ? "Tavern" : "Settings"}</h2>
          <div className="admin-header-right">
            <div className="admin-tabs">
              <button className={`admin-tab${tab === "posts" ? " active" : ""}`} onClick={() => setTab("posts")}>Posts</button>
              <button className={`admin-tab${tab === "projects" ? " active" : ""}`} onClick={() => setTab("projects")}>Projects</button>
              <button className={`admin-tab${tab === "tavern" ? " active" : ""}`} onClick={() => setTab("tavern")}>Tavern</button>
              <button className={`admin-tab${tab === "settings" ? " active" : ""}`} onClick={() => setTab("settings")}>Settings</button>
            </div>
            {tab === "posts" && (
              <button className="btn btn-primary btn-sm" onClick={() => setEditing({ ...EMPTY, tag: categories[0]?.slug || "development" })}>+ New post</button>
            )}
          </div>
        </div>
        {tab === "posts" && (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead><tr><th>Title</th><th>Tag</th><th>Status</th><th>Date</th><th></th></tr></thead>
              <tbody>
                {posts.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontFamily: "var(--font-display)", fontSize: "1rem" }}>{p.title}</td>
                    <td><span className="tag-badge">{p.tag}</span></td>
                    <td>{p.published ? <span className="pub-badge">Published</span> : <span className="draft-badge">Draft</span>}</td>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--muted)" }}>{formatDate(p.created_at)}</td>
                    <td><div className="admin-actions">
                      <button className="btn btn-outline btn-sm" onClick={() => setEditing({ ...p })}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => del(p.id)}>Delete</button>
                    </div></td>
                  </tr>
                ))}
                {posts.length === 0 && <tr><td colSpan={5} style={{ textAlign: "center", color: "var(--muted)", padding: "2rem", fontFamily: "var(--font-mono)", fontSize: "13px" }}>No posts yet. Create your first one!</td></tr>}
              </tbody>
            </table>
          </div>
        )}
        {tab === "projects" && <ProjectsAdmin token={token} handleUpload={handleUpload} />}
        {tab === "tavern" && <TavernAdmin token={token} />}
        {tab === "settings" && <SettingsPanel token={token} categories={categories} onCategoriesChange={onCategoriesChange} />}
      </div>
    </div>
  );
}
