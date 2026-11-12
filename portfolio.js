// The original developer profile is deliberately kept first and read-only.
const developer = {
  name: "Irmiya Bulus",
  role: "Frontend Dev",
  skills: [
    "HTML", "CSS",
    "JavaScript"
  ],
  available: true,
  location: "Nigeria",
  getQuote: () => {
    return "Let's build"
  }
};

// Visitors may change only visibility switches. These changes stay in
// their own browser and never modify the published portfolio.
const portfolioVisibility = {
  sections: {
    hero: true,
    services: true,
    projects: true,
    why: true,
    process: true,
    skills: true,
    pricing: true,
    faq: true,
    contact: true
  },
  topButtons: {
    services: true,
    projects: true,
    viewCV: false,
    pricing: true,
    faq: true,
    hireMe: true,
    themeToggle: true
  }
};

(() => {
  const mount = document.getElementById('portfolioConfig');
  if (!mount) return;

  const sectionNames = {
    hero: 'hero', services: 'services', projects: 'projects', why: 'why',
    process: 'process', skills: 'skills', pricing: 'pricing', faq: 'faq', contact: 'contact'
  };
  const buttonNames = {
    services: 'services', projects: 'projects', viewCV: 'viewCV', pricing: 'pricing',
    faq: 'faq', hireMe: 'hireMe', themeToggle: 'themeToggle'
  };

  const makeGroup = (title, key, values) => `
    <div class="pc-config-group">
      <div class="pc-config-heading">${title}</div>
      ${Object.entries(values).map(([name, value]) => `
        <div class="pc-config-line">
          <span class="pc-code-key">${name}</span><span class="pc-code-punc">:</span>
          <span class="pc-code-bool" contenteditable="false" spellcheck="false"
            role="textbox" aria-label="${title} ${name} value"
            data-config-group="${key}" data-config-key="${name}">${String(value)}</span><span class="pc-code-punc">,</span>
        </div>`).join('')}
    </div>`;

  mount.innerHTML = `
    <div class="pc-config-divider"><span>VISITOR CONTROLS</span><i>editable</i></div>
    <div class="pc-config-code">
      <span class="pc-code-keyword">const</span> <span class="pc-code-name">portfolio</span> <span class="pc-code-punc">= {</span>
      ${makeGroup('sections', 'sections', portfolioVisibility.sections)}
      ${makeGroup('topButtons', 'topButtons', portfolioVisibility.topButtons)}
      <span class="pc-code-punc">};</span>
    </div>
    <p class="pc-config-help">Edit only <b>true</b> / <b>false</b>. Click outside the card to finish.</p>`;

  function applyVisibility() {
    Object.entries(sectionNames).forEach(([key, id]) => {
      const el = document.getElementById(id);
      if (el && key !== 'hero') el.hidden = portfolioVisibility.sections[key] === false;
    });
    Object.entries(buttonNames).forEach(([key, id]) => {
      const selectors = {
        services: 'a[href="#services"]', projects: 'a[href="#projects"]',
        viewCV: 'a[href*="cv" i], [data-action="view-cv"]', pricing: 'a[href="#pricing"]',
        faq: 'a[href="#faq"]', hireMe: 'a[href="#contact"].btn-primary, nav a[href="#contact"]',
        themeToggle: '#themeBtn'
      };
      document.querySelectorAll(selectors[key]).forEach(el => {
        el.hidden = portfolioVisibility.topButtons[key] === false;
      });
    });
  }

  mount.addEventListener('input', event => {
    const token = event.target.closest('.pc-code-bool');
    if (!token) return;
    const value = token.textContent.trim().toLowerCase();
    token.classList.toggle('invalid', value !== 'true' && value !== 'false');
  });

  mount.addEventListener('focusout', event => {
    const token = event.target.closest('.pc-code-bool');
    if (!token) return;
    const value = token.textContent.trim().toLowerCase();
    if (value !== 'true' && value !== 'false') {
      token.textContent = String(portfolioVisibility[token.dataset.configGroup][token.dataset.configKey]);
      token.classList.remove('invalid');
      return;
    }
    portfolioVisibility[token.dataset.configGroup][token.dataset.configKey] = value === 'true';
    token.textContent = value;
    token.classList.remove('invalid');
    applyVisibility();
  });

  // The code window starts compact. Click it to reveal/edit the switches;
  // clicking outside commits the current true/false values and collapses it.
  const codeCard = mount.closest('.code-card');
  if (codeCard) {
    codeCard.addEventListener('click', event => {
      if (!codeCard.classList.contains('is-editing')) {
        codeCard.classList.add('is-editing');
        mount.querySelectorAll('.pc-code-bool').forEach(el => el.setAttribute('contenteditable', 'true'));
      }
    });
  }
  document.addEventListener('pointerdown', event => {
    if (codeCard && !event.target.closest('.code-card')) {
      mount.querySelectorAll('.pc-code-bool').forEach(el => { el.blur(); el.setAttribute('contenteditable', 'false'); });
      codeCard.classList.remove('is-editing');
    }
  });
  applyVisibility();
})();
