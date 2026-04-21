import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Syne:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { margin: 0; padding: 0; width: 100%; background: #0e0e0e; }

  .blog-root {
    --bg: #0e0e0e; --bg2: #161616; --bg3: #1f1f1f;
    --text: #f0ede6; --muted: #888; --accent: #c9a86c; --accent2: #7eb8a4;
    --border: rgba(255,255,255,0.07);
    --font-display: 'Cormorant Garamond', Georgia, serif;
    --font-body: 'Syne', sans-serif;
    --font-mono: 'JetBrains Mono', monospace;
    background: var(--bg); color: var(--text); font-family: var(--font-body);
    font-size: 15px; line-height: 1.7; min-height: 100vh;
  }
  .blog-root.light {
    --bg: #f8f5ef; --bg2: #efebe2; --bg3: #e8e3d8;
    --text: #1a1a1a; --muted: #777; --border: rgba(0,0,0,0.08);
  }

  .blog-nav { display: flex; align-items: center; justify-content: space-between; padding: 1.2rem 2rem; border-bottom: 1px solid var(--border); position: sticky; top: 0; background: var(--bg); z-index: 100; }
  .blog-nav-logo { font-family: var(--font-display); font-size: 1.2rem; color: var(--text); cursor: pointer; letter-spacing: 0.02em; background: none; border: none; }
  .blog-nav-links { display: flex; gap: 1.8rem; list-style: none; }
  .blog-nav-links button { color: var(--muted); background: none; border: none; font-size: 13px; font-weight: 500; letter-spacing: 0.06em; text-transform: uppercase; cursor: pointer; font-family: var(--font-body); transition: color 0.2s; padding: 0; }
  .blog-nav-links button:hover, .blog-nav-links button.active { color: var(--text); }
  .theme-toggle { background: none; border: 1px solid var(--border); color: var(--muted); padding: 6px 12px; border-radius: 20px; font-size: 12px; cursor: pointer; font-family: var(--font-body); transition: all 0.2s; }
  .theme-toggle:hover { color: var(--text); border-color: var(--muted); }

  .page { animation: fadeIn 0.3s ease; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

  .hero { padding: 5rem 2rem 4rem; max-width: 700px; margin: 0 auto; }
  .hero-eyebrow { font-family: var(--font-mono); font-size: 12px; color: var(--accent); letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 1.2rem; }
  .hero h1 { font-family: var(--font-display); font-size: clamp(3rem, 6vw, 5.5rem); font-weight: 300; line-height: 1.1; margin-bottom: 1.5rem; letter-spacing: -0.01em; }
  .hero h1 em { color: var(--accent); font-style: italic; }
  .hero-sub { color: var(--muted); font-size: 16px; max-width: 480px; margin-bottom: 2.5rem; line-height: 1.8; }
  .hero-cta { display: flex; gap: 12px; }
  .btn { padding: 10px 24px; border-radius: 4px; font-size: 13px; font-weight: 500; letter-spacing: 0.04em; cursor: pointer; transition: all 0.2s; font-family: var(--font-body); text-transform: uppercase; }
  .btn-primary { background: var(--accent); color: #0e0e0e; border: none; }
  .btn-primary:hover { opacity: 0.88; }
  .btn-outline { background: none; border: 1px solid var(--border); color: var(--text); }
  .btn-outline:hover { border-color: var(--muted); }
  .btn-danger { background: #c0392b; color: #fff; border: none; }
  .btn-sm { padding: 6px 14px; font-size: 12px; }

  .home-divider { max-width: 700px; margin: 0 auto; padding: 0 2rem 1rem; border-top: 1px solid var(--border); }
  .section-label { font-family: var(--font-mono); font-size: 11px; color: var(--muted); letter-spacing: 0.12em; text-transform: uppercase; margin: 2.5rem 0 1.5rem; }
  .post-row { padding: 1.2rem 0; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: baseline; gap: 1rem; cursor: pointer; transition: opacity 0.2s; background: none; border-left: none; border-right: none; border-top: none; width: 100%; text-align: left; color: var(--text); font-family: var(--font-body); }
  .post-row:hover { opacity: 0.75; }
  .post-row-left { flex: 1; }
  .post-row-tag { font-family: var(--font-mono); font-size: 11px; color: var(--accent2); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px; }
  .post-row-title { font-family: var(--font-display); font-size: 1.05rem; font-weight: 400; }
  .post-row-date { font-family: var(--font-mono); font-size: 11px; color: var(--muted); white-space: nowrap; }

  .page-header { max-width: 700px; margin: 0 auto; padding: 3.5rem 2rem 2.5rem; border-bottom: 1px solid var(--border); }
  .page-header h2 { font-family: var(--font-display); font-size: 3rem; font-weight: 300; margin-bottom: 0.5rem; letter-spacing: -0.01em; }
  .page-header p { color: var(--muted); font-size: 15px; }

  .blog-controls { max-width: 700px; margin: 0 auto; padding: 1.5rem 2rem; display: flex; gap: 0.8rem; flex-wrap: wrap; align-items: center; }
  .search-input { flex: 1; min-width: 180px; background: var(--bg2); border: 1px solid var(--border); color: var(--text); padding: 8px 14px; border-radius: 4px; font-family: var(--font-body); font-size: 13px; outline: none; transition: border-color 0.2s; }
  .search-input:focus { border-color: var(--accent); }
  .search-input::placeholder { color: var(--muted); }
  .tag-filter { padding: 6px 14px; border-radius: 20px; font-size: 12px; cursor: pointer; border: 1px solid var(--border); background: none; color: var(--muted); font-family: var(--font-mono); letter-spacing: 0.06em; text-transform: uppercase; transition: all 0.2s; }
  .tag-filter:hover { color: var(--text); border-color: var(--muted); }
  .tag-filter.active { background: var(--accent); color: #0e0e0e; border-color: var(--accent); }

  .blog-list { max-width: 700px; margin: 0 auto; padding: 0 2rem; }
  .blog-card { padding: 1.8rem 0; border-bottom: 1px solid var(--border); cursor: pointer; transition: opacity 0.2s; background: none; border-left: none; border-right: none; border-top: none; width: 100%; text-align: left; color: var(--text); font-family: var(--font-body); }
  .blog-card:hover { opacity: 0.75; }
  .blog-card-meta { display: flex; gap: 12px; align-items: center; margin-bottom: 10px; }
  .tag-badge { font-family: var(--font-mono); font-size: 11px; color: var(--accent2); text-transform: uppercase; letter-spacing: 0.1em; }
  .date-badge { font-family: var(--font-mono); font-size: 11px; color: var(--muted); }
  .blog-card h3 { font-family: var(--font-display); font-size: 1.4rem; font-weight: 400; margin-bottom: 8px; }
  .blog-card p { color: var(--muted); font-size: 14px; line-height: 1.7; }

  .post-page { max-width: 660px; margin: 0 auto; padding: 3rem 2rem 5rem; }
  .back-link { font-family: var(--font-mono); font-size: 12px; color: var(--muted); cursor: pointer; letter-spacing: 0.06em; margin-bottom: 2.5rem; display: inline-block; transition: color 0.2s; background: none; border: none; }
  .back-link:hover { color: var(--text); }
  .post-meta { margin-bottom: 2rem; }
  .post-tag { font-family: var(--font-mono); font-size: 12px; color: var(--accent2); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px; display: block; }
  .post-title { font-family: var(--font-display); font-size: clamp(2.5rem, 5vw, 3.8rem); font-weight: 300; line-height: 1.1; margin-bottom: 1rem; letter-spacing: -0.01em; }
  .post-byline { font-family: var(--font-mono); font-size: 12px; color: var(--muted); }
  .post-body { border-top: 1px solid var(--border); padding-top: 2rem; }
  .post-body h2 { font-family: var(--font-display); font-size: 1.5rem; font-weight: 400; margin: 2rem 0 1rem; }
  .post-body p { margin-bottom: 1.4rem; color: var(--text); line-height: 1.85; }
  .post-body code { font-family: var(--font-mono); font-size: 13px; background: var(--bg3); padding: 2px 6px; border-radius: 3px; color: var(--accent); }
  .post-body blockquote { border-left: 2px solid var(--accent); padding-left: 1.2rem; margin: 1.5rem 0; color: var(--muted); font-style: italic; font-family: var(--font-display); font-size: 1.05rem; }

  .portfolio-grid { max-width: 700px; margin: 2rem auto 4rem; padding: 0 2rem; display: grid; gap: 16px; }
  .project-card { background: var(--bg2); border: 1px solid var(--border); border-radius: 6px; padding: 1.5rem; transition: border-color 0.2s; }
  .project-card:hover { border-color: rgba(255,255,255,0.18); }
  .blog-root.light .project-card:hover { border-color: rgba(0,0,0,0.2); }
  .project-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
  .project-name { font-family: var(--font-display); font-size: 1.15rem; font-weight: 400; }
  .project-links { display: flex; gap: 8px; }
  .project-link { font-family: var(--font-mono); font-size: 11px; color: var(--accent); text-decoration: none; letter-spacing: 0.06em; padding: 4px 8px; border: 1px solid rgba(201,168,108,0.3); border-radius: 3px; transition: all 0.2s; cursor: pointer; background: none; }
  .project-link:hover { background: rgba(201,168,108,0.1); }
  .project-desc { color: var(--muted); font-size: 14px; line-height: 1.65; margin-bottom: 14px; }
  .tech-tags { display: flex; flex-wrap: wrap; gap: 6px; }
  .tech-tag { font-family: var(--font-mono); font-size: 11px; background: var(--bg3); color: var(--muted); padding: 3px 9px; border-radius: 3px; letter-spacing: 0.04em; }

  .about-page { max-width: 640px; margin: 0 auto; padding: 3.5rem 2rem 5rem; }
  .about-page h2 { font-family: var(--font-display); font-size: 2.2rem; font-weight: 400; margin-bottom: 2rem; }
  .about-body p { margin-bottom: 1.4rem; line-height: 1.85; }
  .skills-grid { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 1.5rem; }
  .skill-chip { font-family: var(--font-mono); font-size: 12px; border: 1px solid var(--border); color: var(--muted); padding: 5px 12px; border-radius: 3px; }

  .contact-page { max-width: 560px; margin: 0 auto; padding: 3.5rem 2rem 5rem; }
  .contact-page h2 { font-family: var(--font-display); font-size: 2.2rem; font-weight: 400; margin-bottom: 0.5rem; }
  .contact-intro { color: var(--muted); margin-bottom: 2.5rem; }
  .form-group { margin-bottom: 1.4rem; }
  .form-label { font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); display: block; margin-bottom: 8px; }
  .form-input { width: 100%; background: var(--bg2); border: 1px solid var(--border); color: var(--text); padding: 10px 14px; border-radius: 4px; font-family: var(--font-body); font-size: 14px; outline: none; transition: border-color 0.2s; }
  .form-input:focus { border-color: var(--accent); }
  textarea.form-input { resize: vertical; min-height: 120px; line-height: 1.6; }
  .social-row { margin-top: 2.5rem; padding-top: 2rem; border-top: 1px solid var(--border); display: flex; gap: 1.5rem; }
  .social-link { font-family: var(--font-mono); font-size: 12px; color: var(--muted); text-decoration: none; letter-spacing: 0.06em; transition: color 0.2s; cursor: pointer; background: none; border: none; }
  .social-link:hover { color: var(--accent); }
  .contact-meta { display: flex; align-items: center; gap: 8px; margin-top: 1.5rem; }
  .avail-dot { width: 8px; height: 8px; border-radius: 50%; background: #4caf7d; display: inline-block; box-shadow: 0 0 6px rgba(76,175,125,0.6); animation: pulse 2s ease-in-out infinite; }
  @keyframes pulse { 0%,100% { box-shadow: 0 0 6px rgba(76,175,125,0.6); } 50% { box-shadow: 0 0 12px rgba(76,175,125,1); } }
  .avail-text { font-family: var(--font-mono); font-size: 12px; color: #4caf7d; letter-spacing: 0.04em; }
  .avail-reply { font-family: var(--font-mono); font-size: 11px; color: var(--muted); }
  .contact-services { display: flex; flex-wrap: wrap; gap: 8px; }
  .service-chip { font-family: var(--font-mono); font-size: 11px; border: 1px solid var(--border); color: var(--accent); padding: 5px 12px; border-radius: 3px; letter-spacing: 0.04em; background: rgba(201,168,108,0.05); }

  .no-results { padding: 3rem 0; color: var(--muted); font-family: var(--font-mono); font-size: 13px; text-align: center; }
  .loading { padding: 4rem 2rem; text-align: center; color: var(--muted); font-family: var(--font-mono); font-size: 13px; }

  .settings-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-top: 1rem; }
  .settings-list { border: 1px solid var(--border); border-radius: 4px; overflow: hidden; min-height: 60px; }
  .settings-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 14px; border-bottom: 1px solid var(--border); background: var(--bg2); }
  .settings-row:last-child { border-bottom: none; }
  .settings-name { font-size: 13px; }
  .settings-slug { font-family: var(--font-mono); font-size: 10px; color: var(--muted); margin-left: 10px; letter-spacing: 0.04em; }
  .admin-tabs { display: flex; gap: 3px; background: var(--bg2); padding: 3px; border-radius: 6px; border: 1px solid var(--border); }
  .admin-tab { background: none; border: none; color: var(--muted); padding: 4px 14px; border-radius: 4px; font-family: var(--font-body); font-size: 12px; font-weight: 500; cursor: pointer; transition: all 0.15s; letter-spacing: 0.04em; text-transform: uppercase; }
  .admin-tab.active { background: var(--accent); color: #0e0e0e; }

  .admin-login { max-width: 400px; margin: 6rem auto; padding: 2rem; background: var(--bg2); border: 1px solid var(--border); border-radius: 8px; }
  .admin-login h2 { font-family: var(--font-display); font-size: 1.8rem; font-weight: 300; margin-bottom: 0.4rem; }
  .admin-login p { color: var(--muted); font-size: 13px; margin-bottom: 2rem; }
  .admin-error { color: #e74c3c; font-family: var(--font-mono); font-size: 12px; margin-top: 1rem; }

  .admin-panel { max-width: 900px; margin: 0 auto; padding: 2rem; }
  .admin-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 1px solid var(--border); }
  .admin-header h2 { font-family: var(--font-display); font-size: 2rem; font-weight: 300; }
  .admin-header-right { display: flex; gap: 10px; align-items: center; }
  .admin-table { width: 100%; border-collapse: collapse; margin-bottom: 2rem; }
  .admin-table th { font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted); text-align: left; padding: 10px 12px; border-bottom: 1px solid var(--border); }
  .admin-table td { padding: 12px; border-bottom: 1px solid var(--border); font-size: 14px; vertical-align: middle; }
  .admin-table tr:hover td { background: var(--bg2); }
  .draft-badge { font-family: var(--font-mono); font-size: 10px; background: var(--bg3); color: var(--muted); padding: 2px 8px; border-radius: 3px; }
  .pub-badge { font-family: var(--font-mono); font-size: 10px; background: rgba(126,184,164,0.15); color: var(--accent2); padding: 2px 8px; border-radius: 3px; }
  .admin-actions { display: flex; gap: 6px; }

  .post-editor { background: var(--bg2); border: 1px solid var(--border); border-radius: 8px; padding: 2rem; margin-top: 1.5rem; }
  .post-editor h3 { font-family: var(--font-display); font-size: 1.5rem; font-weight: 300; margin-bottom: 1.5rem; }
  .editor-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
  .editor-row { margin-bottom: 1rem; }
  .editor-label { font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted); display: block; margin-bottom: 6px; }
  .editor-input { width: 100%; background: var(--bg3); border: 1px solid var(--border); color: var(--text); padding: 9px 12px; border-radius: 4px; font-family: var(--font-body); font-size: 14px; outline: none; transition: border-color 0.2s; }
  .editor-input:focus { border-color: var(--accent); }
  .editor-textarea { width: 100%; background: var(--bg3); border: 1px solid var(--border); color: var(--text); padding: 9px 12px; border-radius: 4px; font-family: var(--font-mono); font-size: 13px; outline: none; resize: vertical; min-height: 300px; line-height: 1.6; transition: border-color 0.2s; }
  .editor-textarea:focus { border-color: var(--accent); }
  .editor-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--border); }
  .editor-footer-left { display: flex; align-items: center; gap: 10px; }
  .toggle-label { font-family: var(--font-mono); font-size: 12px; color: var(--muted); display: flex; align-items: center; gap: 8px; cursor: pointer; }
  .editor-footer-right { display: flex; gap: 10px; }
  .contact-channels { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem; margin-top: 2rem; }
  .contact-tile { background: var(--bg2); border: 1px solid var(--border); padding: 1.2rem; border-radius: 6px; text-decoration: none; display: flex; align-items: center; gap: 1rem; transition: all 0.2s ease; cursor: pointer; position: relative; }
  .contact-tile:hover { border-color: var(--accent); transform: translateY(-2px); background: var(--bg3); }
  .contact-icon-box { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; background: rgba(201,168,108,0.08); border-radius: 6px; color: var(--accent); flex-shrink: 0; }
  .contact-tile-text { display: flex; flex-direction: column; gap: 2px; overflow: hidden; flex: 1; }
  .contact-label { font-family: var(--font-mono); font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted); }
  .contact-value { font-size: 14px; font-weight: 500; color: var(--text); white-space: nowrap; text-overflow: ellipsis; overflow: hidden; }
  .contact-arrow { color: var(--muted); opacity: 0.4; transition: all 0.2s; }
  .contact-tile:hover .contact-arrow { color: var(--accent); opacity: 1; transform: translate(2px, -2px); }

  .success-msg { color: var(--accent2); font-family: var(--font-mono); font-size: 12px; }

  /* New Image Styles */
  .featured-image-preview { width: 100%; max-height: 200px; object-fit: cover; border-radius: 6px; margin-bottom: 1rem; border: 1px solid var(--border); }
  .upload-btn-container { display: flex; gap: 10px; align-items: center; margin-bottom: 1rem; }
  .hidden-input { display: none; }
  .post-thumbnail { width: 80px; height: 80px; object-fit: cover; border-radius: 4px; flex-shrink: 0; background: var(--bg3); }
  .blog-card { display: flex; gap: 20px; align-items: flex-start; }
  .blog-card-content { flex: 1; }
  .post-hero-image { width: 100%; max-height: 400px; object-fit: cover; border-radius: 8px; margin-bottom: 2rem; border: 1px solid var(--border); }
  .post-body img { display: block; max-width: 100%; height: auto; border-radius: 6px; margin: 1.5rem auto; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
  .post-row { display: flex; align-items: center; gap: 1rem; }
  .post-row-left { flex: 1; }
  .img-utility-row { display: flex; gap: 8px; margin-top: 0.5rem; }
  .img-url-text { font-family: var(--font-mono); font-size: 10px; color: var(--muted); background: var(--bg3); padding: 4px 8px; border-radius: 3px; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

  /* Project Display Styles */
  .project-gallery-slider { 
    display: flex; gap: 12px; margin-top: 1.5rem; overflow-x: auto; 
    scroll-snap-type: x mandatory; padding-bottom: 8px; 
    scrollbar-width: thin; scrollbar-color: var(--accent) transparent;
  }
  .project-gallery-slider::-webkit-scrollbar { height: 4px; }
  .project-gallery-slider::-webkit-scrollbar-track { background: transparent; }
  .project-gallery-slider::-webkit-scrollbar-thumb { background: var(--accent); border-radius: 10px; }
  
  .project-slider-item { 
    flex: 0 0 calc(100% - 24px); scroll-snap-align: center; 
    aspect-ratio: 16/10; border-radius: 6px; overflow: hidden; 
    border: 1px solid var(--border); transition: border-color 0.3s;
  }
  .project-slider-item img { width: 100%; height: 100%; object-fit: cover; cursor: zoom-in; }
  .project-slider-item:hover { border-color: var(--accent); }
  
  @media (min-width: 600px) {
    .project-slider-item { flex: 0 0 85%; }
  }

  /* Project Editor Styles */
  .project-editor-images { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
  .project-img-slot { background: var(--bg3); border: 1px solid var(--border); border-radius: 6px; padding: 10px; display: flex; flex-direction: column; gap: 8px; align-items: center; text-align: center; }
  .project-slot-preview { width: 100%; aspect-ratio: 16/10; object-fit: cover; border-radius: 4px; background: var(--bg); }
  .project-slot-empty { width: 100%; aspect-ratio: 16/10; border-radius: 4px; background: var(--bg); display: flex; align-items: center; justify-content: center; font-family: var(--font-mono); font-size: 10px; color: var(--muted); border: 1px dashed var(--border); }
`
;



function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
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
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.618-1.25.077.077 0 0 0-.079-.037A19.73 19.73 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.1 18.099a.082.082 0 0 0 .031.058 20.2 20.2 0 0 0 5.922 2.766.075.075 0 0 0 .08-.037c.469-.824.896-1.697 1.264-2.585a.075.075 0 0 0-.04-.105 13.25 13.25 0 0 1-1.905-.91.077.077 0 0 1-.007-.127c.126-.094.252-.192.375-.292a.077.077 0 0 1 .082-.01c3.41 1.564 7.103 1.564 10.45 0a.077.077 0 0 1 .082.01c.123.1.25.198.375.292a.077.077 0 0 1-.007.127 13.25 13.25 0 0 1-1.905.91.075.075 0 0 0-.04.105c.37.888.796 1.761 1.264 2.585a.075.075 0 0 0 .08.037 20.2 20.2 0 0 0 5.922-2.766.082.082 0 0 0 .031-.058c.484-5.068-.372-9.61-3.57-14.286a.07.07 0 0 0-.032-.027ZM8.02 15.332c-1.18 0-2.156-1.085-2.156-2.419 0-1.333.955-2.418 2.156-2.418 1.21 0 2.176 1.095 2.156 2.418 0 1.334-.955 2.419-2.156 2.419Zm7.975 0c-1.18 0-2.156-1.085-2.156-2.419 0-1.333.955-2.418 2.156-2.418 1.21 0 2.176 1.095 2.156 2.418 0 1.334-.955 2.419-2.156 2.419Z"/>
    </svg>
  ),
  Email: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
  ),
  Arrow: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
  )
};
function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ── Nav ───────────────────────────────────────────────────────────────────────
function Nav({ page, setPage, light, setLight, token, onLogout }) {
  const links = [
    { id: "home", label: "Home" }, { id: "blog", label: "Writing" },
    { id: "portfolio", label: "Work" }, { id: "about", label: "About" },
    { id: "contact", label: "Contact" },
  ];
  return (
    <nav className="blog-nav">
      <button className="blog-nav-logo" onClick={() => setPage("home")}>Cruaz</button>
      <ul className="blog-nav-links">
        {links.map(l => (
          <li key={l.id}><button className={page === l.id ? "active" : ""} onClick={() => setPage(l.id)}>{l.label}</button></li>
        ))}
        {token && <li><button className={page === "admin" ? "active" : ""} onClick={() => setPage("admin")} style={{ color: "var(--accent)" }}>Admin</button></li>}
      </ul>
      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        {token && <button className="theme-toggle" onClick={onLogout}>Log out</button>}
        <button className="theme-toggle" onClick={() => setLight(v => !v)}>{light ? "☾ Dark" : "☀ Light"}</button>
      </div>
    </nav>
  );
}

// ── Public pages ──────────────────────────────────────────────────────────────
function Home({ posts, setPage, setActivePost, loading }) {
  return (
    <div className="page">
      <div className="hero">
        <div className="hero-eyebrow">Web Developer & Data Analyst</div>
        <h1>Building apps,<br /><em>analysing data</em></h1>
        <p className="hero-sub">I design and build web applications, and turn raw data into insights — working across React, PostgreSQL, and Excel to deliver clean, useful solutions.</p>
        <div className="hero-cta">
          <button className="btn btn-primary" onClick={() => setPage("portfolio")}>See my work</button>
          <button className="btn btn-outline" onClick={() => setPage("blog")}>Read writing</button>
        </div>
      </div>
      <div className="home-divider">
        <div className="section-label">Recent writing</div>
        {loading ? <div className="loading">Loading posts…</div> : posts.slice(0, 4).map(p => (
          <button key={p.id} className="post-row" onClick={() => { setActivePost(p); setPage("post"); }}>
            {p.image_url && <img src={p.image_url} alt="" className="post-thumbnail" />}
            <div className="post-row-left">
              <div className="post-row-tag">{p.tag}</div>
              <div className="post-row-title">{p.title}</div>
            </div>
            <div className="post-row-date">{formatDate(p.created_at)}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function Blog({ posts, setPage, setActivePost, loading, categories }) {
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState("all");
  const sorted = [
    ...categories.filter(c => c.slug.toLowerCase() !== "other"),
    ...categories.filter(c => c.slug.toLowerCase() === "other"),
  ];
  const tags = ["all", ...sorted.map(c => c.slug)];
  const filtered = posts.filter(p => {
    const matchTag = tag === "all" || p.tag === tag;
    const matchQ = !query || p.title.toLowerCase().includes(query.toLowerCase()) || (p.excerpt || "").toLowerCase().includes(query.toLowerCase());
    return matchTag && matchQ;
  });
  return (
    <div className="page">
      <div className="page-header"><h2>Writing</h2><p>Thoughts on web development, data analysis, and building things that matter.</p></div>
      <div className="blog-controls">
        <input className="search-input" type="text" placeholder="Search posts…" value={query} onChange={e => setQuery(e.target.value)} />
        {tags.map(t => (
          <button key={t} className={`tag-filter${tag === t ? " active" : ""}`} onClick={() => setTag(t)}>{t}</button>
        ))}
      </div>
      <div className="blog-list">
        {loading ? <div className="loading">Loading…</div> : filtered.length === 0 ? <div className="no-results">No posts found.</div> : filtered.map(p => (
          <button key={p.id} className="blog-card" onClick={() => { setActivePost(p); setPage("post"); }}>
            {p.image_url && <img src={p.image_url} alt="" className="post-thumbnail" />}
            <div className="blog-card-content">
              <div className="blog-card-meta"><span className="tag-badge">{p.tag}</span><span className="date-badge">{formatDate(p.created_at)}</span></div>
              <h3>{p.title}</h3><p>{p.excerpt}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function Post({ post, setPage }) {
  if (!post) return null;
  return (
    <div className="page">
      <div className="post-page">
        <button className="back-link" onClick={() => setPage("blog")}>← Back to writing</button>
        <div className="post-meta">
          <span className="post-tag">{post.tag}</span>
          <h1 className="post-title">{post.title}</h1>
          <span className="post-byline">Cruaz · {formatDate(post.created_at)}</span>
        </div>
        {post.image_url && <img src={post.image_url} alt="" className="post-hero-image" />}
        <div className="post-body" dangerouslySetInnerHTML={{ __html: post.body }} />
      </div>
    </div>
  );
}

function Portfolio() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/projects`)
      .then(r => r.json())
      .then(data => setProjects(Array.isArray(data) ? data : []))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading projects…</div>;

  return (
    <div className="page">
      <div className="page-header"><h2>Work</h2><p>A selection of projects I've built or contributed to.</p></div>
      <div className="portfolio-grid">
        {projects.map(p => (
          <div key={p.id} className="project-card">
            <div className="project-top">
              <div className="project-name">{p.name}</div>
              <div className="project-links">
                {p.github_url && <a href={p.github_url} className="project-link" target="_blank" rel="noreferrer">GitHub ↗</a>}
                {p.live_url && <a href={p.live_url} className="project-link" target="_blank" rel="noreferrer">Live ↗</a>}
              </div>
            </div>
            <p className="project-desc">{p.description}</p>
            <div className="tech-tags">{(p.tags || []).map(t => <span key={t} className="tech-tag">{t}</span>)}</div>
            {p.display_urls && p.display_urls.length > 0 && (
              <div className="project-gallery-slider">
                {p.display_urls.map((url, idx) => (
                  <div key={idx} className="project-slider-item">
                    <img src={url} alt={`${p.name} display ${idx + 1}`} onClick={() => window.open(url, "_blank")} />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        {projects.length === 0 && <p style={{ color: "var(--muted)", fontFamily: "var(--font-mono)", fontSize: "13px" }}>No projects yet.</p>}
      </div>
    </div>
  );
}

const DEFAULT_SKILLS = ["React", "PostgreSQL", "Excel", "Node.js", "Express", "JavaScript", "SQL", "Python", "Vite", "Chart.js", "REST APIs", "Git"];

function About() {
  const [skills, setSkills] = useState(DEFAULT_SKILLS);

  useEffect(() => {
    fetch(`${API}/skills`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (Array.isArray(data) && data.length > 0) setSkills(data.map(s => s.name)); })
      .catch(() => { });
  }, []);

  return (
    <div className="page">
      <div className="about-page">
        <h2>About me</h2>
        <div className="about-body">
          <p>I'm Cruaz — a web developer and data analyst who enjoys building things that are both useful and well-crafted. My work sits at the intersection of frontend development and data-driven problem solving.</p>
          <p>On the development side, I build full-stack web applications with React and Node.js, backed by PostgreSQL. On the data side, I work extensively with SQL queries, and Excel analysis to help teams make better decisions.</p>
          <p>I care about the full picture: clean code, well-structured databases, and dashboards that actually answer the right questions. When I'm not building, I write about what I'm learning.</p>
          <div className="section-label" style={{ marginTop: "2rem" }}>Technologies I work with</div>
          <div className="skills-grid">{skills.map(s => <span key={s} className="skill-chip">{s}</span>)}</div>
        </div>
      </div>
    </div>
  );
}

function Contact() {
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("Collaborate");
  const [projectType, setProjectType] = useState("Web Application");
  const [timeline, setTimeline] = useState("1–3 months");
  const [message, setMessage] = useState("Here's what I have in mind:\n");

  function handleSubjectChange(val) {
    setSubject(val);
    setMessage(val === "Collaborate"
      ? "I'd like to discuss a project with you.\n\nHere's what I have in mind:\n"
      : "");
  }

  function handleSend() {
    if (!message.trim()) return;
    const sub = encodeURIComponent(subject);
    let bodyText = `Hi, I am ${name || "someone"}, and I want to talk about`;
    if (subject === "Collaborate") {
      bodyText += `\n\nProject Type: ${projectType}\nTimeline: ${timeline}\n\n${message}`;
    } else {
      bodyText += `\n\n${message}`;
    }
    window.open(
      `https://mail.google.com/mail/?view=cm&to=hezekiah.mitchellt@gmail.com&su=${sub}&body=${encodeURIComponent(bodyText)}`,
      "_blank"
    );
  }

  const services = ["Web Applications", "Data Dashboards", "PostgreSQL & SQL", "Excel & Data Analysis", "Consulting"];

  return (
    <div className="page">
      <div className="contact-page">
        <h2>Get in touch</h2>
        <p className="contact-intro">Have a project, question, or just want to say hello.</p>

        <div className="contact-meta">
          <span className="avail-dot"></span>
          <span className="avail-text">Available for new projects</span>
          <span className="avail-reply">· Usually replies within 24h</span>
        </div>

        <div className="section-label" style={{ marginTop: "2rem", marginBottom: "0.8rem" }}>What I can help with</div>
        <div className="contact-services">
          {services.map(s => <span key={s} className="service-chip">{s}</span>)}
        </div>

        <div style={{ marginTop: "2.5rem" }}>
          <div className="form-group">
            <label className="form-label">Your name</label>
            <input className="form-input" type="text" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Subject</label>
            <select className="form-input" value={subject} onChange={e => handleSubjectChange(e.target.value)}>
              <option value="Collaborate">Collaborate</option>
              <option value="Other">Other</option>
            </select>
          </div>
          {subject === "Collaborate" && (
            <>
              <div className="form-group">
                <label className="form-label">Project type</label>
                <select className="form-input" value={projectType} onChange={e => setProjectType(e.target.value)}>
                  <option>Web Application</option>
                  <option>Data Dashboard</option>
                  <option>Data Analysis</option>
                  <option>Consulting</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Timeline</label>
                <select className="form-input" value={timeline} onChange={e => setTimeline(e.target.value)}>
                  <option>Less than 1 month</option>
                  <option>1–3 months</option>
                  <option>3–6 months</option>
                  <option>Ongoing</option>
                </select>
              </div>
            </>
          )}
          <div className="form-group">
            <label className="form-label">Message</label>
            <textarea className="form-input" placeholder="What's on your mind?" value={message} onChange={e => setMessage(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={handleSend} disabled={!message.trim()}>
            Send message ↗
          </button>
        </div>

        <div className="section-label" style={{ marginTop: "3rem", marginBottom: "0.8rem" }}>Direct contact</div>
        <div className="contact-channels">
          <a href="https://github.com/cruazz" className="contact-tile" target="_blank" rel="noreferrer">
            <div className="contact-icon-box"><Icons.Github /></div>
            <div className="contact-tile-text">
              <span className="contact-label">GitHub</span>
              <span className="contact-value">cruazz</span>
            </div>
            <div className="contact-arrow"><Icons.Arrow /></div>
          </a>
          <a href="https://instagram.com/hezmtch" className="contact-tile" target="_blank" rel="noreferrer">
            <div className="contact-icon-box"><Icons.Instagram /></div>
            <div className="contact-tile-text">
              <span className="contact-label">Instagram</span>
              <span className="contact-value">hezmtch</span>
            </div>
            <div className="contact-arrow"><Icons.Arrow /></div>
          </a>
          <a href="https://discord.com/users/792563548990996480" className="contact-tile" target="_blank" rel="noreferrer">
            <div className="contact-icon-box"><Icons.Discord /></div>
            <div className="contact-tile-text">
              <span className="contact-label">Discord</span>
              <span className="contact-value">ccruaz</span>
            </div>
            <div className="contact-arrow"><Icons.Arrow /></div>
          </a>
          <a href="mailto:hezekiah.mitchellt@gmail.com" className="contact-tile">
            <div className="contact-icon-box"><Icons.Email /></div>
            <div className="contact-tile-text">
              <span className="contact-label">Mail</span>
              <span className="contact-value">hezekiah.mitchellt@gmail.com</span>
            </div>
            <div className="contact-arrow"><Icons.Arrow /></div>
          </a>
        </div>
      </div>
    </div>
  );
}

// ── Settings Panel ─────────────────────────────────────────────────────────────────────────
function SettingsPanel({ token, categories, onCategoriesChange }) {
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

// ── Projects Admin ──────────────────────────────────────────────────────────────────────
const EMPTY_PROJECT = { name: "", description: "", tags: "", github_url: "", live_url: "", featured: true, sort_order: 0, display_urls: [] };

function ProjectsAdmin({ token, handleUpload }) {
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
  );
}

// ── Admin Login ───────────────────────────────────────────────────────────────
function AdminLogin({ onLogin }) {
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

// ── Admin Panel ───────────────────────────────────────────────────────────────
const EMPTY = { title: "", slug: "", tag: "", excerpt: "", body: "", published: false, image_url: "" };

function AdminPanel({ token, onLogout, onPostsChange, categories, onCategoriesChange }) {
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
          <h2>{tab === "posts" ? "Posts" : tab === "projects" ? "Projects" : "Settings"}</h2>
          <div className="admin-header-right">
            <div className="admin-tabs">
              <button className={`admin-tab${tab === "posts" ? " active" : ""}`} onClick={() => setTab("posts")}>Posts</button>
              <button className={`admin-tab${tab === "projects" ? " active" : ""}`} onClick={() => setTab("projects")}>Projects</button>
              <button className={`admin-tab${tab === "settings" ? " active" : ""}`} onClick={() => setTab("settings")}>Settings</button>
            </div>
            {tab === "posts" && (
              <button className="btn btn-primary btn-sm" onClick={() => setEditing({ ...EMPTY, tag: categories[0]?.slug || "development" })}>+ New post</button>
            )}
          </div>
        </div>
        {tab === "posts" && (
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
        )}
        {tab === "projects" && <ProjectsAdmin token={token} handleUpload={handleUpload} />}
        {tab === "settings" && <SettingsPanel token={token} categories={categories} onCategoriesChange={onCategoriesChange} />}
      </div>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  const [light, setLight] = useState(false);
  const [activePost, setActivePost] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(() => localStorage.getItem("blog_token"));
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchPosts();
    fetchCategories();
    // Allow direct navigation via /#admin or /admin URL
    if (window.location.hash === "#admin" || window.location.pathname === "/admin") {
      setPage("admin");
    }
  }, []);

  async function fetchPosts() {
    try {
      const res = await fetch(`${API}/posts`);
      const data = await res.json();
      setPosts(Array.isArray(data) ? data : []);
    } catch { setPosts([]); }
    finally { setLoading(false); }
  }

  async function fetchCategories() {
    try {
      const res = await fetch(`${API}/categories`);
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch { setCategories([]); }
  }

  function handleLogin(t) { setToken(t); localStorage.setItem("blog_token", t); setPage("admin"); }
  function handleLogout() { setToken(null); localStorage.removeItem("blog_token"); setPage("home"); }
  function go(p) { setPage(p); window.scrollTo(0, 0); }

  return (
    <>
      <style>{styles}</style>
      <div className={`blog-root${light ? " light" : ""}`}>
        <Nav page={page} setPage={go} light={light} setLight={setLight} token={token} onLogout={handleLogout} />
        {page === "admin" && !token && <AdminLogin onLogin={handleLogin} />}
        {page === "admin" && token && <AdminPanel token={token} onLogout={handleLogout} onPostsChange={fetchPosts} categories={categories} onCategoriesChange={fetchCategories} />}
        {page !== "admin" && (
          <>
            {page === "home" && <Home posts={posts} setPage={go} setActivePost={setActivePost} loading={loading} />}
            {page === "blog" && <Blog posts={posts} setPage={go} setActivePost={setActivePost} loading={loading} categories={categories} />}
            {page === "post" && <Post post={activePost} setPage={go} />}
            {page === "portfolio" && <Portfolio />}
            {page === "about" && <About />}
            {page === "contact" && <Contact />}
          </>
        )}
      </div>
    </>
  );
}