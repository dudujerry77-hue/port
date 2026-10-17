// ─── SKILLS DATA ───────────────────────────────────────────────
// Only tools actually used in my projects are listed here.
const row1Skills = [
  { label: 'HTML5',       color: '#E34F26', svg: '<path d="M1.5 0l1.74 19.54L9.996 21.5l6.74-1.95L18.5 0zm14.19 4.5H5.67l.27 3h9.78l-.8 9-3.94 1.09-3.93-1.09-.27-3H9.5l.13 1.5 2.37.66 2.38-.66.25-2.77H6.87L6.34 7.5h11.32z" fill="currentColor"/>' },
  { label: 'CSS3',        color: '#2965F1', svg: '<path d="M1.5 0l1.74 19.54L9.996 21.5l6.74-1.95L18.5 0zm14.19 4.5H5.67l.27 3h9.28l-.28 3H9.5l.14 1.5 2.37.66 2.38-.66.18-2h-4.7l-.27-3h9.56z" fill="currentColor"/>' },
  { label: 'JavaScript',  color: '#F7DF1E', svg: '<rect width="20" height="20" x="1" y="1" rx="1" fill="currentColor"/><path d="M13.5 14.5c.28.48.63.83 1.27.83.53 0 .88-.27.88-.63 0-.44-.35-.6-1-.86l-.34-.15c-1-.42-1.65-.94-1.65-2.05 0-1.02.78-1.8 2-1.8.87 0 1.5.3 1.94 1.1l-1.06.68c-.23-.42-.48-.58-.88-.58-.4 0-.65.25-.65.58 0 .4.25.57.84.82l.34.14c1.17.5 1.83 1 1.83 2.15 0 1.23-.97 1.9-2.27 1.9-1.28 0-2.1-.6-2.5-1.4zm-4.5.1c.2.36.38.67.82.67.42 0 .68-.16.68-.8v-4.47h1.34v4.5c0 1.32-.77 1.92-1.9 1.92-1.02 0-1.6-.53-1.9-1.17z" fill="#000"/>' },
];

const row2Skills = [
  { label: 'Git',         color: '#F05032', svg: '<path d="M19.14 10.93l-8.07-8.07a1.54 1.54 0 0 0-2.18 0L7.14 4.6l2.76 2.76a1.83 1.83 0 0 1 2.31 2.33l2.66 2.66a1.83 1.83 0 1 1-1.1 1.03l-2.49-2.49v6.53a1.83 1.83 0 1 1-1.5-.02V10.7a1.83 1.83 0 0 1-.99-2.4L5.76 5.5 1.93 9.33a1.54 1.54 0 0 0 0 2.18l8.07 8.07a1.54 1.54 0 0 0 2.18 0l6.96-6.96a1.54 1.54 0 0 0 0-2.18v-.51z" fill="currentColor"/>' },
  { label: 'GitHub',      color: '#aaaaaa', svg: '<path d="M10 1a9 9 0 0 0-2.85 17.53c.45.08.62-.2.62-.43v-1.5c-2.5.54-3.03-1.2-3.03-1.2-.41-1.04-1-1.32-1-1.32-.82-.56.06-.55.06-.55.9.06 1.38.93 1.38.93.8 1.37 2.1.97 2.62.74.08-.58.31-.97.56-1.2-2-.23-4.1-1-4.1-4.45 0-.98.35-1.78.93-2.41-.09-.23-.4-1.14.09-2.37 0 0 .75-.24 2.48.92A8.62 8.62 0 0 1 10 5.55c.77 0 1.54.1 2.26.3 1.72-1.16 2.47-.92 2.47-.92.49 1.23.18 2.14.09 2.37.58.63.93 1.43.93 2.41 0 3.46-2.1 4.22-4.1 4.45.32.28.61.83.61 1.67v2.48c0 .23.16.52.63.43A9 9 0 0 0 10 1z" fill="currentColor"/>' },
  { label: 'VS Code',     color: '#007ACC', svg: '<path d="M14.5 2L3.5 8.5V13L14.5 18l3-1.5V3.5zm0 2.5v11l-2-1V5.5zm-2.5 1.5v8l-7-4z" fill="currentColor"/>' },
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
  // the list is short, so repeat it 8 times; the CSS animation scrolls
  // exactly half of the track, which keeps the loop seamless
  const html = Array.from({ length: 8 }, () => skills).flat().map(makePill).join('');
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

// ─── PRICING: "Get Started" POPUP ──────────────────────────────
// Clicking Get Started on a plan opens a small window. The visitor picks
// the type of website, describes the project, and sends it by WhatsApp or
// email. The message always contains the plan details (name, price and
// everything the plan includes), read from the pricing card itself.
const CONTACT_EMAIL = 'dudujerry77@gmail.com';   // change here if your email changes

let currentPlan = null;

function openPlanModal(btn) {
  const card = btn.closest('.pricing-card');
  currentPlan = {
    name: card.querySelector('.pricing-plan').textContent.trim(),
    price: card.querySelector('.pricing-price').textContent.replace(/\s+/g, ''),
    tagline: card.querySelector('.pricing-desc').textContent.trim(),
    features: [...card.querySelectorAll('.pricing-features li')].map(li => li.textContent.trim()),
  };
  document.getElementById('planModalTitle').textContent = currentPlan.name + ' plan';
  document.getElementById('planName').textContent = currentPlan.name;
  document.getElementById('planPrice').textContent = currentPlan.price;
  document.getElementById('planTagline').textContent = currentPlan.tagline;
  document.getElementById('planFeatures').innerHTML =
    currentPlan.features.map(f => '<li>' + escapeHtml(f) + '</li>').join('');
  document.getElementById('planError').textContent = '';
  const modal = document.getElementById('planModal');
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  setTimeout(() => document.getElementById('plan-type').focus(), 50);
}

function closePlanModal() {
  const modal = document.getElementById('planModal');
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

// kind = 'whatsapp' (uses *bold* marks) or 'email' (plain text)
function buildPlanMessage(kind) {
  const b = (t) => kind === 'whatsapp' ? '*' + t + '*' : t;
  const type = document.getElementById('plan-type').value;
  const desc = document.getElementById('plan-desc').value.trim();
  const name = document.getElementById('plan-name').value.trim();
  return [
    "Hello Irmiya, I'd like to start a project with you.",
    '',
    b('PLAN:') + ' ' + currentPlan.name + ' (' + currentPlan.price + ')',
    currentPlan.tagline,
    '',
    b('The plan includes:'),
    ...currentPlan.features.map(f => '- ' + f),
    '',
    b('TYPE OF WEBSITE:') + ' ' + type,
    '',
    b('PROJECT DESCRIPTION:'),
    desc,
    name ? '' : null,
    name ? b('NAME:') + ' ' + name : null,
  ].filter(l => l !== null).join('\n');
}

// returns true when the form is filled in; otherwise shows what is missing
function planFormOk() {
  const err = document.getElementById('planError');
  if (!document.getElementById('plan-type').value) {
    err.textContent = 'Please choose the type of website.';
    return false;
  }
  if (document.getElementById('plan-desc').value.trim().length < 10) {
    err.textContent = 'Please describe your project in a few words.';
    return false;
  }
  err.textContent = '';
  return true;
}

function sendPlan(kind) {
  if (!planFormOk()) return;
  const text = buildPlanMessage(kind);
  const type = document.getElementById('plan-type').value;
  if (kind === 'whatsapp') {
    window.open('https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(text), '_blank');
    showToast('Opening WhatsApp — message ready to send!', '#ico-check');
  } else {
    const subject = currentPlan.name + ' plan (' + currentPlan.price + ') - ' + type;
    window.location.href = 'mailto:' + CONTACT_EMAIL +
      '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(text);
    showToast('Opening your email app — message ready to send!', '#ico-check');
  }
  closePlanModal();
  document.getElementById('plan-desc').value = '';
  document.getElementById('plan-name').value = '';
}

async function copyPlanMessage() {
  if (!planFormOk()) return;
  try {
    await navigator.clipboard.writeText(buildPlanMessage('email'));
    showToast('Message copied. Paste it anywhere you like.', '#ico-check');
  } catch (e) {
    document.getElementById('planError').textContent = 'Could not copy. Please use WhatsApp or Email.';
  }
}

document.addEventListener('click', e => {
  if (e.target.id === 'planModal') closePlanModal();   // click on the dark area
});
window.addEventListener('keydown', e => {
  if (e.key === 'Escape' && document.getElementById('planModal').classList.contains('open')) closePlanModal();
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

