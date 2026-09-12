import { useCallback, useContext, useEffect, useId, useMemo, useRef, useState } from 'react';
import DOMPurify from 'dompurify';
import { ReadingModeContext } from '../ReadingModeContext.js';

export default function ArticleBody({ html }) {
  const readingMode = useContext(ReadingModeContext);
  const prefix = useId();
  const bodyRef = useRef(null);
  const toolsRef = useRef(null);
  const [position, setPosition] = useState({ percent: 0, section: '' });
  const article = useMemo(() => {
    const content = document.createElement('template');
    content.innerHTML = DOMPurify.sanitize(html || '', {
      USE_PROFILES: { html: true }, FORBID_TAGS: ['style', 'form', 'input', 'button'], FORBID_ATTR: ['style'],
    });
    const ids = [...content.content.querySelectorAll('[id]')].map(el => el.id);
    const headings = [...content.content.querySelectorAll('h2, h3')].filter(el => el.textContent.trim());
    const sections = headings.map((el, index) => {
      if (!el.id || ids.filter(id => id === el.id).length > 1) el.id = `${prefix}-section-${index}`;
      el.tabIndex = -1;
      return { id: el.id, title: el.textContent.trim(), level: el.tagName };
    });
    return { html: content.innerHTML, sections };
  }, [html, prefix]);

  const scrollBounds = useCallback(() => {
    const scroller = readingMode ? null : bodyRef.current.closest('.game-modal-body');
    const top = scroller ? scroller.getBoundingClientRect().top :
      document.querySelector('.view-mode-switch').getBoundingClientRect().bottom;
    return { scroller, top: top + toolsRef.current.offsetHeight + 12,
      bottom: scroller ? scroller.getBoundingClientRect().bottom : window.innerHeight };
  }, [readingMode]);

  useEffect(() => {
    const body = bodyRef.current;
    const scroller = readingMode ? window : body.closest('.game-modal-body');
    let frame;
    const measure = () => {
      const { top, bottom } = scrollBounds();
      const rect = body.getBoundingClientRect();
      const distance = rect.height - Math.max(1, bottom - top);
      const percent = distance <= 0 ? (rect.bottom <= bottom ? 100 : 0) :
        Math.round(Math.max(0, Math.min(1, (top - rect.top) / distance)) * 100);
      let section = article.sections[0]?.id || '';
      for (const heading of body.querySelectorAll('h2, h3')) {
        if (heading.getBoundingClientRect().top <= top + 12) section = heading.id;
      }
      setPosition(previous => previous.percent === percent && previous.section === section ? previous : { percent, section });
    };
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(measure); };
    const observer = new ResizeObserver(schedule);
    observer.observe(body);
    observer.observe(toolsRef.current);
    scroller.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    schedule();
    return () => {
      observer.disconnect(); cancelAnimationFrame(frame);
      scroller.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [article, readingMode, scrollBounds]);

  function jump(event, id) {
    event.preventDefault();
    toolsRef.current.querySelector('details').open = false;
    const heading = [...bodyRef.current.querySelectorAll('h2, h3')].find(el => el.id === id);
    const { scroller, top } = scrollBounds();
    heading.focus({ preventScroll: true });
    (scroller || window).scrollBy({ top: heading.getBoundingClientRect().top - top,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }

  return <>
    <div className="article-tools" ref={toolsRef}>
      <div className="article-progress-row">
        <span>Reading progress</span><span>{position.percent}%</span>
      </div>
      <progress aria-label="Reading progress" max="100" value={position.percent} />
      {article.sections.length > 1 && <details className="article-toc">
        <summary>Contents · {article.sections.length} sections</summary>
        <nav aria-label="Table of contents">
          {article.sections.map(section => <a key={section.id} href={`#${encodeURIComponent(section.id)}`}
            className={section.level === 'H3' ? 'toc-subsection' : undefined}
            aria-current={position.section === section.id ? 'location' : undefined}
            onClick={event => jump(event, section.id)}>{section.title}</a>)}
        </nav>
      </details>}
    </div>
    <div className="post-body" ref={bodyRef} dangerouslySetInnerHTML={{ __html: article.html }} />
  </>;
}
