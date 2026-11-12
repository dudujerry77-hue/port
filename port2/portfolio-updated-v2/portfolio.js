/* Visitor-side portfolio controls. Each visitor changes only their own browser view. */
(() => {
  'use strict';
  const STORAGE_KEY = 'irmiya-portfolio-visibility-v2';
  const defaults = {
    sections: { hero:true, services:true, projects:true, why:true, process:true, skills:true, pricing:true, faq:true, contact:true },
    topButtons: { services:true, projects:true, viewCV:true, pricing:true, faq:true, hireMe:true, themeToggle:true }
  };
  const card = document.getElementById('portfolioEditor');
  const toggle = document.getElementById('portfolioEditorToggle');
  const body = document.getElementById('portfolioCode');
  if (!card || !toggle || !body) return;

  function readSaved() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
    catch (_) { return {}; }
  }
  const saved = readSaved();
  const state = {
    sections: { ...defaults.sections, ...(saved.sections || {}) },
    topButtons: { ...defaults.topButtons, ...(saved.topButtons || {}) }
  };
  const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const boolRow = (key, value, group, last) => `
    <div class="editor-line indent-2"><span class="c-prop">${key}</span><span class="c-punc">: </span><span class="c-bool" contenteditable="true" spellcheck="false" role="textbox" aria-label="${key}: type true or false" data-group="${group}" data-key="${key}">${value}</span><span class="c-punc">${last ? '' : ','}</span></div>`;

  function render() {
    body.innerHTML = `
      <div class="editor-line"><span class="c-keyword">const</span> <span class="c-variable">portfolio</span> <span class="c-punc">= {</span></div>
      <div class="editor-line indent-1"><span class="c-prop">developer</span><span class="c-punc">: </span><span class="c-brace">{</span></div>
      <div class="editor-line indent-2"><span class="c-prop">name</span><span class="c-punc">: </span><span class="c-string">"Irmiya Bulus"</span>,</div>
      <div class="editor-line indent-2"><span class="c-prop">role</span><span class="c-punc">: </span><span class="c-string">"Frontend Dev"</span>,</div>
      <div class="editor-line indent-2"><span class="c-prop">skills</span><span class="c-punc">: </span><span class="c-brace">[</span><span class="c-string">"HTML", "CSS", "JavaScript"</span><span class="c-brace">]</span>,</div>
      <div class="editor-line indent-2"><span class="c-prop">location</span><span class="c-punc">: </span><span class="c-string">"Nigeria"</span></div>
      <div class="editor-line indent-1"><span class="c-brace">},</span></div>
      <div class="editor-line indent-1"><span class="c-prop">sections</span><span class="c-punc">: </span><span class="c-brace">{</span></div>
      ${Object.entries(state.sections).map(([k,v],i,a)=>boolRow(k,v,'sections',i===a.length-1)).join('')}
      <div class="editor-line indent-1"><span class="c-brace">},</span></div>
      <div class="editor-line indent-1"><span class="c-prop">topButtons</span><span class="c-punc">: </span><span class="c-brace">{</span></div>
      ${Object.entries(state.topButtons).map(([k,v],i,a)=>boolRow(k,v,'topButtons',i===a.length-1)).join('')}
      <div class="editor-line indent-1"><span class="c-brace">}</span></div>
      <div class="editor-line"><span class="c-punc">};</span></div>
      <div class="editor-footer">Only section and navigation visibility can be changed. Type true or false, then click outside the card to finish.</div>`;
    applyVisibility();
  }
  function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  function applyVisibility() {
    Object.entries(state.sections).forEach(([id, visible]) => {
      const el = document.getElementById(id);
      if (el && id !== 'hero') el.hidden = !visible;
    });
    const navMap = {
      services: ['a[href="#services"]'], projects: ['a[href="#projects"]'],
      viewCV: ['a[href="#viCV"]'], pricing: ['a[href="#pricing"]'],
      faq: ['a[href="#faq"]'], hireMe: ['.nav-links a[href="#contact"]', '.hero-actions a[href="#contact"]']
    };
    Object.entries(navMap).forEach(([key, selectors]) => selectors.forEach(sel =>
      document.querySelectorAll(sel).forEach(el => { el.hidden = !state.topButtons[key]; })
    ));
    const theme = document.getElementById('themeBtn');
    if (theme) theme.hidden = !state.topButtons.themeToggle;
  }
  function setEditing(open) {
    card.classList.toggle('is-editing', open);
    toggle.setAttribute('aria-expanded', String(open));
    const hint = toggle.querySelector('.editor-hint');
    if (hint) hint.textContent = open ? '· editing' : '· click to edit';
    body.querySelectorAll('.c-bool').forEach(token => token.setAttribute('contenteditable', String(open)));
    if (open) body.scrollTop = 0;
  }
  toggle.addEventListener('click', () => setEditing(!card.classList.contains('is-editing')));
  card.addEventListener('click', event => {
    if (!card.classList.contains('is-editing') && !event.target.closest('button')) setEditing(true);
  });
  // Clicking anywhere outside the card ends editing and validates the active true/false value.
  document.addEventListener('pointerdown', event => {
    if (card.classList.contains('is-editing') && !card.contains(event.target)) {
      if (document.activeElement?.classList.contains('c-bool')) document.activeElement.blur();
      setEditing(false);
    }
  });
  body.addEventListener('keydown', event => {
    if (event.target.classList.contains('c-bool') && event.key === 'Enter') {
      event.preventDefault(); event.target.blur();
    }
  });
  body.addEventListener('focusout', event => {
    const target = event.target;
    if (!target.classList.contains('c-bool')) return;
    const value = target.textContent.trim().toLowerCase();
    const { group, key } = target.dataset;
    if (value === 'true' || value === 'false') {
      state[group][key] = value === 'true';
      save();
    }
    render();
  });

  // CV opens as a modal page. The download button opens the browser's Save as PDF flow.
  const cv = document.getElementById('viCV');
  const closeCV = () => { if (!cv) return; cv.hidden = true; document.body.classList.remove('cv-open'); history.replaceState(null, '', location.pathname + location.search); };
  const openCV = event => {
    if (!cv) return;
    event.preventDefault(); cv.hidden = false; document.body.classList.add('cv-open');
    history.replaceState(null, '', '#viCV');
  };
  document.querySelectorAll('a[href="#viCV"]').forEach(link => link.addEventListener('click', openCV));
  document.getElementById('closeCV')?.addEventListener('click', closeCV);
  cv?.addEventListener('click', event => { if (event.target === cv) closeCV(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && cv && !cv.hidden) closeCV(); });
  document.getElementById('downloadCV')?.addEventListener('click', () => window.print());

  render();
  setEditing(false);
})();
