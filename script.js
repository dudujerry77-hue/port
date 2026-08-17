
// ══════════════════════════════════════════════════════════════
// PROJECT DATA + PUBLIC "FEATURED PROJECTS" RENDERING
//
// Projects live in Supabase (table: projects) — that table is the single
// source of truth. Rows use snake_case columns (github_url, live_url);
// mapRowToProject() converts each row to the plain-object shape the rest
// of this file already works with: { id, name, description, githubUrl,
// liveUrl, featured }. The admin dashboard (further below) writes
// directly to that table; the public Featured Projects section
// (#projectsGrid) only ever reads from it. name/description/githubUrl
// exist purely so the admin can tell projects apart in their own
// dashboard list — the public grid is 100% visual and never renders
// them (see renderFeaturedProjects). Only featured:true projects that
// also have a liveUrl show up publicly, since a "visual preview of the
// actual site" has nothing to show without one.
//
// projectsCache is a local in-memory mirror of that table, kept in sync
// by loadProjects() so the rest of the file (openProjectPreview,
// renderAdminList, etc.) can keep reading getProjects() synchronously
// instead of every call site needing to be async.
// ─────────────────────────────────────────────────────────────
const SUPABASE_URL = 'https://vlvvxmdbowsmjrdhezxs.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_48f2a8nLvxNyNMh7fwRugw_vmB5mphV';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let projectsCache = [];

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function hostnameFor(url) {
  try { return new URL(url).hostname; } catch (e) { return url; }
}

function mapRowToProject(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    githubUrl: row.github_url,
    liveUrl: row.live_url,
    featured: row.featured,
  };
}

async function loadProjects() {
  const { data, error } = await supabaseClient
    .from('projects')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) {
    console.error('Failed to load projects from Supabase:', error);
    projectsCache = [];
    return;
  }
  projectsCache = (data || []).map(mapRowToProject);
}

function getProjects() {
  return projectsCache;
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
  const label = p.name ? `${p.name} — ${host}` : host;
  return `
    <div class="project-showcase" tabindex="0" role="button" aria-label="Preview ${escapeHtml(label)}"
         data-project-id="${escapeHtml(p.id)}"
         onmouseenter="openProjectPreview(this)" onmouseleave="scheduleClosePreview()"
         onclick="openProjectPreview(this)"
         onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openProjectPreview(this)}">
      <div class="pp-frame-wrap">
        <iframe class="pp-frame" src="${escapeHtml(p.liveUrl)}" tabindex="-1" aria-hidden="true" title=""></iframe>
        <div class="pp-fallback">
          <span class="pp-fallback-title">Preview unavailable</span>
          <span class="pp-fallback-sub">Open project to view</span>
        </div>
      </div>

      <div class="mini-browser-popover">
        <div class="pm-chrome">
          <span class="bc-dot bc-r"></span><span class="bc-dot bc-y"></span><span class="bc-dot bc-g"></span>
          <span class="bc-addr">&#128274; <span class="bc-url">${escapeHtml(host)}</span></span>
          <div class="pm-menu">
            <button class="pm-menu-btn" type="button" aria-label="More options" aria-haspopup="true" onclick="toggleShowcaseMenu(this)">&#8942;</button>
            <div class="pm-menu-dropdown">
              <button type="button" onclick="openInRealBrowser(${jsAttr(p.liveUrl)})"><svg><use href="#ico-external"/></svg> Open in Browser</button>
              <button type="button" onclick="shareProject(${jsAttr(p.liveUrl)}, ${jsAttr(p.name || host)})"><svg><use href="#ico-send"/></svg> Share</button>
            </div>
          </div>
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

function wireProjectPreviews(root) {
  root.querySelectorAll('.pp-frame-wrap').forEach(wrap => {
    const iframe = wrap.querySelector('.pp-frame');
    const fallback = wrap.querySelector('.pp-fallback');
    if (!iframe || !fallback) return;
    detectEmbedBlocked(iframe, () => fallback.classList.add('show'));
  });
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
function detectEmbedBlocked(iframe, onBlocked, timeoutMs = 10000) {
  let settled = false;
  const finish = (blocked) => {
    if (settled) return;
    settled = true;
    if (blocked) onBlocked();
  };
  iframe.addEventListener('load', () => finish(false));
  iframe.addEventListener('error', () => finish(true));
  setTimeout(() => finish(true), timeoutMs);
}

function renderFeaturedProjects() {
  const grid = document.getElementById('projectsGrid');
  if (!grid) return;
  // Public grid = visual showcase only: featured AND has an actual site
  // to preview. A project with no liveUrl has nothing to visually show,
  // so (unlike earlier versions of this section) it's simply not
  // rendered publicly rather than falling back to a logo/gradient card.
  const projects = getProjects().filter(p => p.featured && p.liveUrl);

  if (projects.length === 0) {
    grid.innerHTML = '<p class="projects-empty">New projects coming soon.</p>';
    return;
  }

  grid.innerHTML = projects.map(p => projectCardHTML(p)).join('');
  wireProjectPreviews(grid);
}

loadProjects().then(() => {
  renderFeaturedProjects();
  updateAdminVisibility();
});

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
  const project = getProjects().find(p => p.id === id);
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

// A short grace period, not an instant close: guards against the
// pointer briefly leaving during fast movement, and gives the CSS
// opacity/scale transition something to animate. Cancelled by
// openProjectPreview() if the pointer re-enters (the wrapper or the
// popover — same element as far as 'mouseenter' on the wrapper cares).
function scheduleClosePreview() {
  clearTimeout(closeTimer);
  closeTimer = setTimeout(() => {
    if (activeShowcase) deactivateShowcase(activeShowcase);
  }, 220);
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
  if (e.key === 'Escape' && activeShowcase) deactivateShowcase(activeShowcase);
});

// ══════════════════════════════════════════════════════════════
// PRIVATE ADMIN DASHBOARD
//
// SECURITY NOTE (read this before relying on it):
// This gate is a hardcoded string compared entirely in client-side JS.
// It is trivial to bypass — anyone can open DevTools, read ADMIN_PASSWORD
// below, or just run `sessionStorage.setItem('jb_admin_authed','1')` and
// reload. It stops a casual visitor from stumbling into the dashboard;
// it does NOT stop a determined one. It is not a substitute for real
// authentication. See the implementation report for what that requires.
// ─────────────────────────────────────────────────────────────
const ADMIN_PASSWORD = 'jeremaih-admin';
const ADMIN_SESSION_KEY = 'jb_admin_authed';

function isAdminHash() {
  return window.location.hash === '#admin';
}

function updateAdminVisibility() {
  const overlay = document.getElementById('adminOverlay');
  const login = document.getElementById('adminLogin');
  const panel = document.getElementById('adminPanel');
  if (!overlay || !login || !panel) return;

  if (!isAdminHash()) {
    overlay.classList.remove('show');
    overlay.setAttribute('aria-hidden', 'true');
    return;
  }

  overlay.classList.add('show');
  overlay.setAttribute('aria-hidden', 'false');

  if (sessionStorage.getItem(ADMIN_SESSION_KEY) === '1') {
    login.style.display = 'none';
    panel.style.display = 'block';
    renderAdminList();
  } else {
    login.style.display = 'flex';
    panel.style.display = 'none';
  }
}

function tryAdminLogin() {
  const input = document.getElementById('adminPassInput');
  const errorEl = document.getElementById('adminError');
  if (input.value === ADMIN_PASSWORD) {
    sessionStorage.setItem(ADMIN_SESSION_KEY, '1');
    errorEl.textContent = '';
    input.value = '';
    updateAdminVisibility();
  } else {
    errorEl.textContent = 'Incorrect password.';
  }
}

function closeAdmin() {
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
  history.replaceState(null, '', window.location.pathname + window.location.search);
  updateAdminVisibility();
}

async function addProject() {
  const liveUrl = document.getElementById('adm-live').value.trim();
  const name = document.getElementById('adm-name').value.trim();
  const description = document.getElementById('adm-desc').value.trim();
  const githubUrl = document.getElementById('adm-github').value.trim();
  const featured = document.getElementById('adm-featured').checked;

  // liveUrl is the one field the public site actually depends on now —
  // the visual preview has nothing to show without it. name is kept
  // required too since it's how projects stay identifiable in this
  // list below; description/GitHub are admin-only and optional.
  if (!liveUrl || !name) {
    alert('Please fill in at least the project URL and a name (for your own reference in this list).');
    return;
  }

  const { error } = await supabaseClient.from('projects').insert({
    name, description, github_url: githubUrl, live_url: liveUrl, featured,
  });
  if (error) {
    alert('Failed to save project: ' + error.message);
    return;
  }

  ['adm-name', 'adm-desc', 'adm-github', 'adm-live'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('adm-featured').checked = true;

  await loadProjects();
  renderAdminList();
  renderFeaturedProjects();
}

async function deleteProject(id) {
  if (!confirm('Delete this project?')) return;
  const { error } = await supabaseClient.from('projects').delete().eq('id', id);
  if (error) {
    alert('Failed to delete project: ' + error.message);
    return;
  }
  await loadProjects();
  renderAdminList();
  renderFeaturedProjects();
}

async function toggleFeatured(id) {
  const project = getProjects().find(p => p.id === id);
  if (!project) return;
  const { error } = await supabaseClient.from('projects').update({ featured: !project.featured }).eq('id', id);
  if (error) {
    alert('Failed to update project: ' + error.message);
    return;
  }
  await loadProjects();
  renderAdminList();
  renderFeaturedProjects();
}

function renderAdminList() {
  const container = document.getElementById('adminProjectList');
  if (!container) return;
  const list = getProjects();

  if (list.length === 0) {
    container.innerHTML = '<p class="admin-empty">No projects yet. Add one above.</p>';
    return;
  }

  container.innerHTML = list.map(p => `
    <div class="admin-project-row">
      <div class="admin-project-info">
        <strong>${escapeHtml(p.name)}</strong>
        ${p.featured ? '<span class="admin-tag admin-tag-on">Featured</span>' : '<span class="admin-tag">Hidden</span>'}
        <p>${escapeHtml(p.description)}</p>
        <div class="admin-project-links">
          <a href="${escapeHtml(p.githubUrl)}" target="_blank" rel="noopener noreferrer">GitHub</a>
          ${p.liveUrl ? `<a href="${escapeHtml(p.liveUrl)}" target="_blank" rel="noopener noreferrer">Live</a>` : ''}
        </div>
      </div>
      <div class="admin-project-actions">
        <button class="btn-sm btn-sm-ghost" onclick="toggleFeatured('${p.id}')">${p.featured ? 'Unfeature' : 'Feature'}</button>
        <button class="btn-sm btn-sm-ghost admin-danger" onclick="deleteProject('${p.id}')">Delete</button>
      </div>
    </div>
  `).join('');
}

window.addEventListener('hashchange', updateAdminVisibility);
updateAdminVisibility();

// ─── SKILLS DATA ───────────────────────────────────────────────
const row1Skills = [
  { label: 'HTML5',       color: '#E34F26', svg: '<path d="M1.5 0l1.74 19.54L9.996 21.5l6.74-1.95L18.5 0zm14.19 4.5H5.67l.27 3h9.78l-.8 9-3.94 1.09-3.93-1.09-.27-3H9.5l.13 1.5 2.37.66 2.38-.66.25-2.77H6.87L6.34 7.5h11.32z" fill="currentColor"/>' },
  { label: 'CSS3',        color: '#2965F1', svg: '<path d="M1.5 0l1.74 19.54L9.996 21.5l6.74-1.95L18.5 0zm14.19 4.5H5.67l.27 3h9.28l-.28 3H9.5l.14 1.5 2.37.66 2.38-.66.18-2h-4.7l-.27-3h9.56z" fill="currentColor"/>' },
  { label: 'JavaScript',  color: '#F7DF1E', svg: '<rect width="20" height="20" x="1" y="1" rx="1" fill="currentColor"/><path d="M13.5 14.5c.28.48.63.83 1.27.83.53 0 .88-.27.88-.63 0-.44-.35-.6-1-.86l-.34-.15c-1-.42-1.65-.94-1.65-2.05 0-1.02.78-1.8 2-1.8.87 0 1.5.3 1.94 1.1l-1.06.68c-.23-.42-.48-.58-.88-.58-.4 0-.65.25-.65.58 0 .4.25.57.84.82l.34.14c1.17.5 1.83 1 1.83 2.15 0 1.23-.97 1.9-2.27 1.9-1.28 0-2.1-.6-2.5-1.4zm-4.5.1c.2.36.38.67.82.67.42 0 .68-.16.68-.8v-4.47h1.34v4.5c0 1.32-.77 1.92-1.9 1.92-1.02 0-1.6-.53-1.9-1.17z" fill="#000"/>' },
  { label: 'React',       color: '#61DAFB', svg: '<circle cx="11" cy="11" r="2.5" fill="currentColor"/><ellipse cx="11" cy="11" rx="10" ry="4" fill="none" stroke="currentColor" stroke-width="1.5"/><ellipse cx="11" cy="11" rx="10" ry="4" fill="none" stroke="currentColor" stroke-width="1.5" transform="rotate(60 11 11)"/><ellipse cx="11" cy="11" rx="10" ry="4" fill="none" stroke="currentColor" stroke-width="1.5" transform="rotate(120 11 11)"/>' },
  { label: 'Next.js',     color: '#ffffff', svg: '<path d="M10 2a8 8 0 1 0 0 16A8 8 0 0 0 10 2zm3.5 11L7 6h1.5l5.25 7.5H12z" fill="currentColor"/>' },
  { label: 'Node.js',     color: '#68A063', svg: '<path d="M10 1.5L2 6v8l8 4.5 8-4.5V6zm0 1.8l6.5 3.7-6.5 3.7L3.5 7z" fill="currentColor"/>' },
  { label: 'Tailwind',    color: '#38BDF8', svg: '<path d="M10 4c-2.67 0-4.33 1.33-5 4 1-1.33 2.17-1.83 3.5-1.5.76.19 1.3.74 1.9 1.35.98 1 2.1 2.15 4.6 2.15 2.67 0 4.33-1.33 5-4-1 1.33-2.17 1.83-3.5 1.5-.76-.19-1.3-.74-1.9-1.35C13.62 5.15 12.5 4 10 4zm-5 6c-2.67 0-4.33 1.33-5 4 1-1.33 2.17-1.83 3.5-1.5.76.19 1.3.74 1.9 1.35C6.38 14.85 7.5 16 10 16c2.67 0 4.33-1.33 5-4-1 1.33-2.17 1.83-3.5 1.5-.76-.19-1.3-.74-1.9-1.35C8.62 11.15 7.5 10 5 10z" fill="currentColor"/>' },
  { label: 'Figma',       color: '#A259FF', svg: '<path d="M7.5 2H10.5A2.5 2.5 0 0 1 10.5 7H7.5ZM7.5 7H10.5A2.5 2.5 0 0 1 10.5 12H7.5ZM7.5 12H10A2.5 2.5 0 1 1 7.5 14.5ZM5 2H7.5V7H5A2.5 2.5 0 0 1 5 2ZM5 7H7.5V12H5A2.5 2.5 0 0 1 5 7Z" fill="currentColor"/>' },
];

const row2Skills = [
  { label: 'Three.js',    color: '#6C63FF', svg: '<path d="M2 18L10 2l8 16H2zm8-12L5.5 16h9L10 6z" fill="currentColor"/>' },
  { label: 'Git',         color: '#F05032', svg: '<path d="M19.14 10.93l-8.07-8.07a1.54 1.54 0 0 0-2.18 0L7.14 4.6l2.76 2.76a1.83 1.83 0 0 1 2.31 2.33l2.66 2.66a1.83 1.83 0 1 1-1.1 1.03l-2.49-2.49v6.53a1.83 1.83 0 1 1-1.5-.02V10.7a1.83 1.83 0 0 1-.99-2.4L5.76 5.5 1.93 9.33a1.54 1.54 0 0 0 0 2.18l8.07 8.07a1.54 1.54 0 0 0 2.18 0l6.96-6.96a1.54 1.54 0 0 0 0-2.18v-.51z" fill="currentColor"/>' },
  { label: 'GitHub',      color: '#aaaaaa', svg: '<path d="M10 1a9 9 0 0 0-2.85 17.53c.45.08.62-.2.62-.43v-1.5c-2.5.54-3.03-1.2-3.03-1.2-.41-1.04-1-1.32-1-1.32-.82-.56.06-.55.06-.55.9.06 1.38.93 1.38.93.8 1.37 2.1.97 2.62.74.08-.58.31-.97.56-1.2-2-.23-4.1-1-4.1-4.45 0-.98.35-1.78.93-2.41-.09-.23-.4-1.14.09-2.37 0 0 .75-.24 2.48.92A8.62 8.62 0 0 1 10 5.55c.77 0 1.54.1 2.26.3 1.72-1.16 2.47-.92 2.47-.92.49 1.23.18 2.14.09 2.37.58.63.93 1.43.93 2.41 0 3.46-2.1 4.22-4.1 4.45.32.28.61.83.61 1.67v2.48c0 .23.16.52.63.43A9 9 0 0 0 10 1z" fill="currentColor"/>' },
  { label: 'Netlify',     color: '#00C7B7', svg: '<path d="M6.5 8.5l-2-2 6-6 6 6-2 2-4-4zm0 3l-2 2 6 6 6-6-2-2-4 4zM4 10a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm12 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" fill="currentColor"/>' },
  { label: 'Paystack',    color: '#00C3F7', svg: '<rect x="2" y="5" width="16" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M2 9h16" stroke="currentColor" stroke-width="1.6"/><rect x="5" y="13" width="4" height="1.5" rx=".75" fill="currentColor"/>' },
  { label: 'VS Code',     color: '#007ACC', svg: '<path d="M14.5 2L3.5 8.5V13L14.5 18l3-1.5V3.5zm0 2.5v11l-2-1V5.5zm-2.5 1.5v8l-7-4z" fill="currentColor"/>' },
  { label: 'Supabase',    color: '#3ECF8E', svg: '<path d="M11.9 1.5L2 14h8.5V20.5L18 8H9.5z" fill="currentColor"/>' },
  { label: 'Vercel',      color: '#ffffff', svg: '<path d="M10 2L19 18H1z" fill="currentColor"/>' },
];

function makePill(skill) {
  return `<span class="skill-pill">
    <svg viewBox="0 0 20 20" style="color:${skill.color};flex-shrink:0;">${skill.svg}</svg>
    ${skill.label}
  </span>`;
}

function buildMarquee(id, skills) {
  const track = document.getElementById(id);
  // Duplicate 3x for seamless infinite scroll
  const html = [...skills, ...skills, ...skills].map(makePill).join('');
  track.innerHTML = html;
}

buildMarquee('row1', row1Skills);
buildMarquee('row2', row2Skills);

// ─── TYPEWRITER ────────────────────────────────────────────────
const phrases = ['building modern UIs...','crafting clean code...','shipping fast...','creating experiences...'];
let pi=0,ci=0,del=false;
const typed=document.getElementById('typed');
function type(){
  const cur=phrases[pi];
  if(!del){typed.textContent=cur.slice(0,++ci);if(ci===cur.length){del=true;setTimeout(type,1600);return;}}
  else{typed.textContent=cur.slice(0,--ci);if(ci===0){del=false;pi=(pi+1)%phrases.length;}}
  setTimeout(type,del?45:80);
}
type();

// ─── THEME ─────────────────────────────────────────────────────
const html=document.documentElement;
const themeBtn=document.getElementById('themeBtn');
let isDark=true;
themeBtn.addEventListener('click',()=>{
  isDark=!isDark;
  html.setAttribute('data-theme',isDark?'dark':'light');
  themeBtn.innerHTML=isDark
    ? '<svg><use href="#ico-sun"/></svg>'
    : '<svg><use href="#ico-moon"/></svg>';
});

// ─── MOBILE MENU ───────────────────────────────────────────────
// const ham=document.getElementById('hamburger');
// const mob=document.getElementById('mobMenu');
// ham.addEventListener('click',()=>mob.classList.toggle('open'));
// function closeMob(){mob.classList.remove('open');}
const ham = document.getElementById('hamburger');
const mob = document.getElementById('mobMenu');

ham.addEventListener('click', (e) => {
  e.stopPropagation();

  mob.classList.toggle('open');

  // Stop/start body scrolling
  document.body.style.overflow = mob.classList.contains('open')
    ? 'hidden'
    : '';

    
});

// Close when clicking outside the menu
document.addEventListener('click', (e) => {
  if (
    mob.classList.contains('open') &&
    !mob.contains(e.target) &&
    !ham.contains(e.target)
  ) {
    closeMob();
  }
});

function closeMob() {
  mob.classList.remove('open');
  document.body.style.overflow = '';
}


// ─── FAQ ───────────────────────────────────────────────────────
function toggleFaq(btn){
  const item=btn.parentElement;
  const wasOpen=item.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(i=>i.classList.remove('open'));
  if(!wasOpen)item.classList.add('open');
}

// ─── SCROLL REVEAL ─────────────────────────────────────────────
const revEls=document.querySelectorAll('.reveal');
const obs=new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');obs.unobserve(e.target);}});
},{threshold:0.1,rootMargin:'0px 0px -40px 0px'});
revEls.forEach(el=>obs.observe(el));

// ─── NAV SCROLL ────────────────────────────────────────────────
window.addEventListener('scroll',()=>{
  document.querySelector('nav').style.borderBottomColor=
    window.scrollY>50?'rgba(255,255,255,0.14)':'rgba(255,255,255,0.08)';
});

// ─── CONTACT FORM — sends to WhatsApp ─────────────────────────
const WA_NUMBER = '2348083252950';

function sendMsg(){
  const name    = document.getElementById('f-name').value.trim();
  const email   = document.getElementById('f-email').value.trim();
  const service = document.getElementById('f-service').value;
  const msg     = document.getElementById('f-msg').value.trim();

  if(!name || !email || !msg){
    showToast('Please fill in all required fields.','#ico-alert');
    return;
  }

  // Build a clean, readable WhatsApp message
  const text = [
    '👋 Hi Irmiya! I found you through your portfolio.',
    '',
    `*Name:* ${name}`,
    `*Email:* ${email}`,
    service ? `*Service:* ${service}` : '',
    '',
    `*Project Details:*`,
    msg,
  ].filter(l => l !== null).join('\n');

  const waURL = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
  window.open(waURL, '_blank');

  showToast("Opening WhatsApp — message ready to send!",'#ico-check');
  ['f-name','f-email','f-msg','f-service'].forEach(id=>document.getElementById(id).value='');
}

function showToast(text,icon){
  const t=document.getElementById('toast');
  document.querySelector('#toast svg use').setAttribute('href',icon);
  document.getElementById('toast-msg').textContent=text;
  t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),4000);
}
