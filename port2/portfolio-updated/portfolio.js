/* portfolio.js
   Visitor-editable portfolio profile + visibility switches.
   Edits are saved only in the visitor's own browser (localStorage).
*/
(() => {
  'use strict';

  const STORAGE_KEY = 'irmiya-portfolio-editor-v1';

  const defaults = {
    name: 'Irmiya Bulus',
    role: 'Frontend Dev',
    skills: ['HTML', 'CSS', 'JavaScript'],
    available: true,
    location: 'Nigeria',
    quote: "Let's build",
    sections: {
      hero: true, services: true, projects: true, why: true,
      process: true, skills: true, pricing: true, faq: true, contact: true
    },
    topButtons: {
      services: true, projects: true, viewCV: true,
      pricing: true, faq: true, hireMe: true, themeToggle: true
    }
  };

  let profile = loadProfile();
  const card = document.getElementById('portfolioEditor');
  const toggle = document.getElementById('portfolioEditorToggle');
  const body = document.getElementById('portfolioCode');
  if (!card || !toggle || !body) return;

  function loadProfile() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return saved ? mergeDefaults(saved) : structuredClone(defaults);
    } catch (_) {
      return structuredClone(defaults);
    }
  }

  function mergeDefaults(saved) {
    return {
      ...structuredClone(defaults),
      ...saved,
      skills: Array.isArray(saved.skills) ? saved.skills : [...defaults.skills],
      sections: { ...defaults.sections, ...(saved.sections || {}) },
      topButtons: { ...defaults.topButtons, ...(saved.topButtons || {}) }
    };
  }

  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(profile)); } catch (_) {}
  }

  const esc = value => String(value).replace(/[&<>"']/g, ch => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
  })[ch]);

  function editable(key, value, type = 'string') {
    return `<span class="c-str editor-value" contenteditable="true" spellcheck="false"
      data-field="${key}" data-type="${type}" aria-label="Edit ${key}">"${esc(value)}"</span>`;
  }

  function boolLine(label, value, group, key, comma = true) {
    return `<div class="editor-line">&nbsp;&nbsp;&nbsp;&nbsp;<span class="c-str">${label}</span><span class="c-obj">: </span><button type="button" class="editor-bool" data-group="${group}" data-key="${key}" aria-pressed="${value}">${value}</button><span class="c-obj">${comma ? ',' : ''}</span></div>`;
  }

  function render() {
    body.innerHTML = `
      <div class="editor-line"><span class="c-key">const</span> <span class="c-fn">developer</span> <span class="c-obj">= {</span></div>
      <div class="editor-line">&nbsp;&nbsp;<span class="c-str">name</span><span class="c-obj">: </span>${editable('name', profile.name)},</div>
      <div class="editor-line">&nbsp;&nbsp;<span class="c-str">role</span><span class="c-obj">: </span>${editable('role', profile.role)},</div>
      <div class="editor-line">&nbsp;&nbsp;<span class="c-str">skills</span><span class="c-obj">: [</span></div>
      <div class="editor-line">&nbsp;&nbsp;&nbsp;&nbsp;${editable('skills', profile.skills.join(', '), 'list')}</div>
      <div class="editor-line">&nbsp;&nbsp;<span class="c-obj">],</span></div>
      <div class="editor-line">&nbsp;&nbsp;<span class="c-str">available</span><span class="c-obj">: </span><button type="button" class="editor-bool" data-group="root" data-key="available" aria-pressed="${profile.available}">${profile.available}</button>,</div>
      <div class="editor-line">&nbsp;&nbsp;<span class="c-str">location</span><span class="c-obj">: </span>${editable('location', profile.location)},</div>
      <div class="editor-line">&nbsp;&nbsp;<span class="c-str">quote</span><span class="c-obj">: </span>${editable('quote', profile.quote)}</div>
      <div class="editor-line">&nbsp;&nbsp;<span class="c-obj">},</span></div>
      <div class="editor-line"><span class="c-str">sections</span><span class="c-obj">: {</span></div>
      ${Object.entries(profile.sections).map(([key,val],i,arr)=>boolLine(key,val,'sections',key,i!==arr.length-1)).join('')}
      <div class="editor-line"><span class="c-obj">},</span></div>
      <div class="editor-line"><span class="c-str">topButtons</span><span class="c-obj">: {</span></div>
      ${Object.entries(profile.topButtons).map(([key,val],i,arr)=>boolLine(key,val,'topButtons',key,i!==arr.length-1)).join('')}
      <div class="editor-line"><span class="c-obj">}</span></div>
      <div class="editor-line"><span class="c-obj">};</span></div>
      <div class="editor-footer">Click text values to edit · Click true/false to switch · Changes save in this browser</div>
    `;
    applyVisibility();
  }

  function applyVisibility() {
    Object.entries(profile.sections).forEach(([id, visible]) => {
      const section = document.getElementById(id);
      if (section) section.hidden = !visible;
    });

    const navTargets = {
      services: ['a[href="#services"]'],
      projects: ['a[href="#projects"]'],
      viewCV: ['a[href="#viCV"]'],
      pricing: ['a[href="#pricing"]'],
      faq: ['a[href="#faq"]'],
      hireMe: ['a[href="#contact"].btn', '.hero-actions a[href="#contact"]']
    };
    Object.entries(navTargets).forEach(([key, selectors]) => {
      selectors.forEach(selector => document.querySelectorAll(selector).forEach(el => {
        el.hidden = !profile.topButtons[key];
      }));
    });

    const theme = document.getElementById('themeBtn');
    if (theme) theme.hidden = !profile.topButtons.themeToggle;
  }

  function setEditing(active) {
    card.classList.toggle('is-editing', active);
    toggle.setAttribute('aria-expanded', String(active));
    const hint = toggle.querySelector('.editor-hint');
    if (hint) hint.textContent = active ? '· editing' : '· click to edit';
    if (active) body.scrollTop = 0;
  }

  toggle.addEventListener('click', () => {
    setEditing(!card.classList.contains('is-editing'));
  });

  // The card itself can be clicked to open the editor, including its body.
  card.addEventListener('click', event => {
    if (!card.classList.contains('is-editing') && !event.target.closest('button')) {
      setEditing(true);
    }
  });

  body.addEventListener('click', event => {
    const button = event.target.closest('.editor-bool');
    if (!button) return;
    const { group, key } = button.dataset;
    if (group === 'root') profile[key] = !profile[key];
    else profile[group][key] = !profile[group][key];
    save();
    render();
  });

  body.addEventListener('keydown', event => {
    if (event.target.matches('[contenteditable="true"]') && event.key === 'Enter') {
      event.preventDefault();
      event.target.blur();
    }
  });

  body.addEventListener('focusout', event => {
    const target = event.target;
    if (!target.matches('[contenteditable="true"]')) return;
    const key = target.dataset.field;
    const raw = target.textContent.replace(/^["']|["']$/g, '').trim();
    if (target.dataset.type === 'list') {
      profile.skills = raw.split(',').map(item => item.trim()).filter(Boolean);
    } else {
      profile[key] = raw;
    }
    save();
    render();
  });

  // The CV stays completely hidden until a visitor explicitly opens it.
  const cvSection = document.getElementById('viCV');
  document.querySelectorAll('a[href="#viCV"]').forEach(link => {
    link.addEventListener('click', event => {
      if (!cvSection) return;
      event.preventDefault();
      cvSection.hidden = false;
      cvSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.replaceState(null, '', '#viCV');
    });
  });

  render();
})();
