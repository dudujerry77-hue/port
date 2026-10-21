// projects.js — used by index.html AND projects.html.
// Holds the project list, the project cards, the small preview window,
// the big window, and the small pop-up message (toast).
//
// ══════════════════════════════════════════════════════════════
// PROJECTS — the Featured Projects section is built from this list,
// directly in the page. No database or backend needed.
// To add a project, add one more object to the list below.
// ══════════════════════════════════════════════════════════════
const STATIC_PROJECTS = [
  {
    id: 'grubglass',
    name: 'GrubGlass',
    description: 'Food ordering web app with menu, favourites, cart, order history and an admin dashboard. Orders go straight to WhatsApp.',
    tags: ['HTML', 'CSS', 'JavaScript'],
    liveUrl: 'https://dudujerry77-hue.github.io/webapp/',
    githubUrl: 'https://github.com/dudujerry77-hue/webapp',
    featured: true,
  },
  {
    id: 'forge-gym',
    name: 'FORGE Fitness',
    description: 'Gym website with membership plans, trainer profiles, BMI calculator, FAQ and contact form.',
    tags: ['HTML', 'CSS', 'JavaScript'],
    liveUrl: 'https://dudujerry77-hue.github.io/gymweb/',
    githubUrl: 'https://github.com/dudujerry77-hue/gymweb',
    featured: true,
  },
  {
    id: 'blossom',
    name: 'Blossom Restaurant',
    description: 'Restaurant website with a menu, favourites, cart and one-tap ordering on WhatsApp.',
    tags: ['HTML', 'CSS', 'JavaScript'],
    liveUrl: 'https://dudujerry77-hue.github.io/bloss/',
    githubUrl: 'https://github.com/dudujerry77-hue/bloss',
    featured: true,
  },
  {
    id: 'maison-table',
    name: 'Maison Table',
    description: 'Restaurant delivery site with categories, cart, saved dishes and a customer profile page.',
    tags: ['HTML', 'CSS', 'JavaScript'],
    liveUrl: 'https://dudujerry77-hue.github.io/rest/',
    githubUrl: 'https://github.com/dudujerry77-hue/rest',
    featured: true,
  },
  {
    id: 'kova-store',
    name: 'KOVA Store',
    description: 'Online store with product listing, cart and an admin panel for adding and managing products.',
    tags: ['HTML', 'CSS', 'JavaScript'],
    liveUrl: 'https://dudujerry77-hue.github.io/dev/',
    githubUrl: 'https://github.com/dudujerry77-hue/dev',
    featured: true,
  },
  {
    id: 'expense',
    name: 'Expense Tracker',
    description: 'Track your expenses and income with this simple web app. View your financial history and manage your budget.',
    tags: ['HTML', 'CSS', 'JavaScript'],
    liveUrl: 'https://dudujerry77-hue.github.io/Expenses/',
    githubUrl: 'https://github.com/dudujerry77-hue/Expenses',
    featured: true,
  },
  {
    id: 'elite',
    name: 'Elite Project',
    description: 'Elite is a demo site for a fictional Abuja barbershop, featuring services, barbers, booking, a gallery, and an admin panel.',
    tags: ['HTML', 'CSS', 'JavaScript'],
    liveUrl: 'https://dudujerry77-hue.github.io/elite/',
    githubUrl: 'https://github.com/dudujerry77-hue/elite',
    featured: true,
  },
  {
    id: 'aura',
    name: 'Aura Project',
    description: 'AURA is a modern, fully responsive e-commerce clothing website built with vanilla.',
    tags: ['HTML', 'CSS', 'JavaScript'],
    liveUrl: 'https://dudujerry77-hue.github.io/aura/',
    githubUrl: 'https://github.com/dudujerry77-hue/aura',
    featured: true,
  },
];

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function hostnameFor(url) {
  try { return new URL(url).hostname; } catch (e) { return url; }
}

// A public card shows the live site itself, previewed edge to edge —
// no title, description, or buttons at rest. Hovering (or tapping, on
// touch) grows an interactive mini-browser over the same spot. The
// resting preview's iframe is pointer-events:none — it's a passive
// visual; the mini-browser underneath it is the real interactive one,
// only present in the DOM's hit-testing once .active is applied.
//
// jsAttr() produces a properly escaped JS string literal for use inside
// an inline HTML event-handler attribute: JSON.stringify() gives valid,
// fully-escaped JS source (handles quotes/backslashes/unicode), and
// wrapping that in escapeHtml() escapes the quote characters so they
// survive sitting inside an HTML attribute — the browser decodes the
// HTML entities back to `"` before treating the attribute as JS, so the
// script that actually runs is exactly the JSON.stringify() output.
function jsAttr(value) {
  return escapeHtml(JSON.stringify(value));
}

function projectCardHTML(p) {
  const host = hostnameFor(p.liveUrl);
  const tags = (p.tags || []).map(t => `<span class="project-tag">${escapeHtml(t)}</span>`).join('');
  const label = p.name ? `${p.name} — ${host}` : host;
  return `
    <div class="project-showcase" tabindex="0" role="button" aria-label="Preview ${escapeHtml(label)}"
         data-project-id="${escapeHtml(p.id)}"
         onclick="openProjectPreview(this)"
         onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openProjectPreview(this)}">
      <div class="pp-frame-wrap">
        <iframe class="pp-frame" src="${escapeHtml(p.liveUrl)}" tabindex="-1" aria-hidden="true" title=""></iframe>
        <div class="pp-fallback">
          <span class="pp-fallback-title">Preview unavailable</span>
          <span class="pp-fallback-sub">Open project to view</span>
        </div>
      </div>

      <div class="project-hint">Click to preview</div>
      <div class="project-info">
        <h3 class="project-name">${escapeHtml(p.name || host)}</h3>
        <p class="project-desc">${escapeHtml(p.description || '')}</p>
        <div class="project-tags">${tags}</div>
      </div>

      <div class="mini-browser-popover">
        <div class="pm-chrome">
          <span class="bc-dot bc-r"></span><span class="bc-dot bc-y"></span><span class="bc-dot bc-g"></span>
          <span class="bc-addr">&#128274; <span class="bc-url">${escapeHtml(host)}</span></span>
          <div class="pm-menu">
            <button class="pm-menu-btn" type="button" aria-label="More options" aria-haspopup="true" onclick="toggleShowcaseMenu(this)">&#8942;</button>
            <div class="pm-menu-dropdown">
              <button type="button" onclick="openInRealBrowser(${jsAttr(p.liveUrl)})"><svg><use href="#ico-external"/></svg> Open in Browser</button>
              ${p.githubUrl ? `<button type="button" onclick="openInRealBrowser(${jsAttr(p.githubUrl)})"><svg><use href="#ico-github"/></svg> View code</button>` : ''}
              <button type="button" onclick="shareProject(${jsAttr(p.liveUrl)}, ${jsAttr(p.name || host)})"><svg><use href="#ico-send"/></svg> Share</button>
            </div>
          </div>
          <button class="pm-expand" type="button" title="Open in bigger window" aria-label="Open in bigger window" onclick="openProjectModal(${jsAttr(p.liveUrl)}, ${jsAttr(p.name || host)})"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg></button>
          <button class="pm-close" type="button" aria-label="Close preview" onclick="deactivateShowcase(this.closest('.project-showcase'))">&times;</button>
        </div>
        <div class="pm-body">
          <iframe class="pm-frame" src="about:blank" tabindex="-1" title="${escapeHtml(label)} interactive preview"></iframe>
          <div class="pm-fallback">
            <svg><use href="#ico-alert"/></svg>
            <p>Preview unavailable</p>
            <span>Open project to view</span>
          </div>
        </div>
      </div>
    </div>`;
}

// The resting preview shows the site at desktop width (1280px) shrunk to
// fit the card, so the visitor sees the whole page layout at a glance,
// not a cropped phone-sized corner of it. Re-fitted whenever the card
// changes size (window resize, rotating a phone, etc.).
function fitPreviewFrame(wrap, iframe) {
  // function-local on purpose: this runs during the very first render at
  // the top of the file, before any later top-level const would exist
  const PREVIEW_DESKTOP_WIDTH = 1280;
  const w = wrap.clientWidth;
  const h = wrap.clientHeight;
  if (!w || !h) return;
  const scale = w / PREVIEW_DESKTOP_WIDTH;
  iframe.style.width = PREVIEW_DESKTOP_WIDTH + 'px';
  iframe.style.height = (h / scale) + 'px';
  iframe.style.transform = 'scale(' + scale + ')';
  iframe.style.transformOrigin = 'top left';
}

function wireProjectPreviews(root) {
  root.querySelectorAll('.pp-frame-wrap').forEach(wrap => {
    const iframe = wrap.querySelector('.pp-frame');
    const fallback = wrap.querySelector('.pp-fallback');
    if (!iframe || !fallback) return;
    fitPreviewFrame(wrap, iframe);
    if (window.ResizeObserver) {
      new ResizeObserver(() => fitPreviewFrame(wrap, iframe)).observe(wrap);
    } else {
      window.addEventListener('resize', () => fitPreviewFrame(wrap, iframe));
    }
    detectEmbedBlocked(iframe, () => fallback.classList.add('show'));
  });
}

// ─── BIGGER WINDOW ─────────────────────────────────────────────
// The expand button in the mini-browser header opens the project in a
// large window over the page (about 94% of the screen), with its own
// close button and an "open in new tab" button. Closes with the X,
// the Escape key, or a click on the dark area around it.
let projectModal = null;

function ensureProjectModal() {
  if (projectModal) return projectModal;
  const el = document.createElement('div');
  el.className = 'proj-modal';
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-modal', 'true');
  el.setAttribute('aria-label', 'Project preview');
  el.innerHTML = `
    <div class="proj-modal-box">
      <div class="pm-chrome">
        <span class="bc-dot bc-r"></span><span class="bc-dot bc-y"></span><span class="bc-dot bc-g"></span>
        <span class="bc-addr">&#128274; <span class="bc-url"></span></span>
        <button class="pm-expand pjm-newtab" type="button" title="Open in new tab" aria-label="Open in new tab"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></button>
        <button class="pm-close pjm-close" type="button" aria-label="Close window">&times;</button>
      </div>
      <div class="proj-modal-body"><iframe class="proj-modal-frame" src="about:blank" title="Project preview"></iframe></div>
    </div>`;
  el.addEventListener('click', e => { if (e.target === el) closeProjectModal(); });
  el.querySelector('.pjm-close').addEventListener('click', closeProjectModal);
  document.body.appendChild(el);
  projectModal = el;
  return el;
}

function openProjectModal(liveUrl, name) {
  // close the small popover first, so only the big window is on screen
  if (activeShowcase) deactivateShowcase(activeShowcase);
  const el = ensureProjectModal();
  el.querySelector('.bc-url').textContent = hostnameFor(liveUrl) + (name ? '  ·  ' + name : '');
  el.querySelector('.pjm-newtab').onclick = () => window.open(liveUrl, '_blank', 'noopener,noreferrer');
  el.querySelector('.proj-modal-frame').src = liveUrl;
  el.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeProjectModal() {
  if (!projectModal) return;
  projectModal.classList.remove('open');
  projectModal.querySelector('.proj-modal-frame').src = 'about:blank';
  document.body.style.overflow = '';
}

// Block detection — tried hard, and it genuinely cannot be done
// reliably from client-side JS. Documented in detail because it would
// be worse to silently ship something that looks like it works.
//
// Directly instrumented all three cases in Chromium/Edge before writing
// this:
//   - A page that embeds fine (example.com): fires 'load', never 'error'.
//   - A page blocked by "X-Frame-Options: SAMEORIGIN" (google.com):
//     ALSO fires 'load' (at the same speed), never 'error'.
//   - A fully nonexistent domain (DNS failure): ALSO fires 'load'
//     (Chromium's internal "can't reach this page" error page counts
//     as a completed navigation) — often within a few hundred ms —
//     and 'error' still never fires.
// So 'load' fires identically in every case, and 'error' effectively
// never fires at all for cross-origin iframe navigation in Chromium.
// (An earlier version of this tried reading iframe.contentWindow after
// load to see if it was still "about:blank" — that also fails, because
// Chromium assigns the frame the target's origin as soon as navigation
// is attempted, whether or not it then refuses to render the response,
// so the read throws the same cross-origin SecurityError either way.)
//
// The only thing left that's real: a timeout for a frame that never
// fires 'load' at all (a server that accepts the connection but never
// responds). That's a narrow, uncommon case — it will NOT catch
// X-Frame-Options/CSP frame-ancestors blocks, 404s, or DNS failures,
// because all of those fire 'load' quickly just like a real embed.
// In practice, when a site refuses to be framed, visitors will most
// likely see the browser's own built-in "refused to connect" placeholder
// inside the frame rather than our "Preview unavailable" message —
// Chromium does render something there itself, it's just not something
// this page's JS can detect and swap out. Closing this gap for real
// would require a backend to check response headers server-side, which
// is outside what a static client-only page can do. Used identically
// for both the small resting-state preview and the interactive
// mini-browser popover.
function detectEmbedBlocked(iframe, onBlocked) {
  let settled = false;
  const finish = (blocked) => {
    if (settled) return;
    settled = true;
    if (blocked) onBlocked();
  };
  iframe.addEventListener('load', () => finish(false));
  iframe.addEventListener('error', () => finish(true));
  // No timeout fallback any more. A slow page (lots of images) used to be
  // marked "Preview unavailable" after 10 seconds even though it was still
  // loading fine. GitHub Pages sites allow embedding, so the frame is
  // simply left to finish loading.
}

// ─── RENDERING ─────────────────────────────────────────────────
// Home page (#projectsGrid): phones show at most 4 cards (2 per row,
// 2 rows); bigger screens show at most 6. If there are more projects than
// that, the "View all projects" button (#projectsMore) appears and
// leads to projects.html.
// Projects page (#allProjectsGrid): every project, no limit.
const HOME_LIMIT_PHONE = 4;     // change here: cards on the home page, phones
const HOME_LIMIT_DESKTOP = 6;   // change here: cards on the home page, bigger screens
const phoneQuery = window.matchMedia('(max-width: 600px)');

function renderFeaturedProjects() {
  const projects = STATIC_PROJECTS.filter(p => p.featured && p.liveUrl);
  const home = document.getElementById('projectsGrid');
  const all = document.getElementById('allProjectsGrid');
  const more = document.getElementById('projectsMore');

  // close an open preview before the cards are redrawn
  if (activeShowcase) deactivateShowcase(activeShowcase);

  const fill = (grid, list) => {
    if (list.length === 0) {
      grid.innerHTML = '<p class="projects-empty">New projects coming soon.</p>';
      return;
    }
    grid.innerHTML = list.map(p => projectCardHTML(p)).join('');
    wireProjectPreviews(grid);
  };

  if (home) {
    const limit = phoneQuery.matches ? HOME_LIMIT_PHONE : HOME_LIMIT_DESKTOP;
    fill(home, projects.slice(0, limit));
    if (more) more.classList.toggle('show', projects.length > limit);
  }
  if (all) fill(all, projects);
}

// ─── INLINE MINI-BROWSER PREVIEW ───────────────────────────────
// Hovering (or tapping/focusing, for touch and keyboard users — hover
// doesn't exist on touch, so click/Enter is the same trigger, not a
// separate code path) grows an interactive mini-browser directly over
// the project card. Because .mini-browser-popover is a DOM *child* of
// .project-showcase, moving the pointer from the base preview into the
// popover never fires 'mouseleave' on the wrapper — that event ignores
// moves onto descendant elements by definition — so "stay open while
// moving from the preview into the mini-browser" needs no manual
// hit-testing or hover-bridging, just normal DOM nesting.
let activeShowcase = null;
let closeTimer = null;

function openProjectPreview(wrapper) {
  const id = wrapper.dataset.projectId;
  const project = STATIC_PROJECTS.find(p => p.id === id);
  if (!project || !project.liveUrl) return;

  clearTimeout(closeTimer);
  if (activeShowcase && activeShowcase !== wrapper) deactivateShowcase(activeShowcase);
  activeShowcase = wrapper;
  if (wrapper.classList.contains('active')) return; // already open

  const frame = wrapper.querySelector('.pm-frame');
  const fallback = wrapper.querySelector('.pm-fallback');
  const hostEl = wrapper.querySelector('.mini-browser-popover .bc-url');
  hostEl.textContent = hostnameFor(project.liveUrl);
  fallback.classList.remove('show');
  frame.src = project.liveUrl;
  wrapper.classList.add('active');

  detectEmbedBlocked(frame, () => fallback.classList.add('show'));
}

function deactivateShowcase(wrapper) {
  if (!wrapper) return;
  clearTimeout(closeTimer);
  wrapper.classList.remove('active');
  const frame = wrapper.querySelector('.pm-frame');
  if (frame) frame.src = 'about:blank'; // stop whatever the embedded site was doing
  const menu = wrapper.querySelector('.pm-menu');
  if (menu) menu.classList.remove('open');
  if (activeShowcase === wrapper) activeShowcase = null;
}

function toggleShowcaseMenu(btn) {
  const menu = btn.closest('.pm-menu');
  const wasOpen = menu.classList.contains('open');
  document.querySelectorAll('.pm-menu.open').forEach(m => m.classList.remove('open'));
  if (!wasOpen) menu.classList.add('open');
}

function openInRealBrowser(liveUrl) {
  window.open(liveUrl, '_blank', 'noopener,noreferrer');
  document.querySelectorAll('.pm-menu.open').forEach(m => m.classList.remove('open'));
}

async function shareProject(liveUrl, name) {
  document.querySelectorAll('.pm-menu.open').forEach(m => m.classList.remove('open'));
  if (navigator.share) {
    try { await navigator.share({ title: name, url: liveUrl }); }
    catch (e) { /* user dismissed the native share sheet — not an error */ }
    return;
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(liveUrl);
      showToast('Link copied to clipboard!', '#ico-check');
      return;
    } catch (e) { /* clipboard permission denied — fall through to prompt */ }
  }
  window.prompt('Copy this link:', liveUrl);
}

// Click-outside-closes, for both the popover itself (requirement) and
// its "⋮" dropdown (so picking an action then clicking elsewhere in the
// popover dismisses the menu without also closing the whole preview).
// Clicks that land *inside* the live iframe never reach this listener
// at all — cross-origin frame content doesn't bubble click events into
// the parent document — so interacting with the embedded site can never
// accidentally trigger this.
document.addEventListener('click', e => {
  document.querySelectorAll('.pm-menu.open').forEach(menu => {
    if (!menu.contains(e.target)) menu.classList.remove('open');
  });
  if (activeShowcase && !activeShowcase.contains(e.target)) {
    deactivateShowcase(activeShowcase);
  }
});

window.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (projectModal && projectModal.classList.contains('open')) { closeProjectModal(); return; }
  if (activeShowcase) deactivateShowcase(activeShowcase);
});

function showToast(text,icon){
  const t=document.getElementById('toast');
  if(!t) return;
  document.querySelector('#toast svg use').setAttribute('href',icon);
  document.getElementById('toast-msg').textContent=text;
  t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),4000);
}

// ─── START ─────────────────────────────────────────────────────
// (kept at the very end so every function and variable above exists)
renderFeaturedProjects();
// phones and bigger screens show a different number of cards on the home
// page, so draw again when the screen crosses that line
if (phoneQuery.addEventListener) phoneQuery.addEventListener('change', renderFeaturedProjects);
