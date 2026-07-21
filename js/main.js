/* ==========================================================================
   FABC — shared site behavior (nav, reveal-on-scroll, toasts)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // mobile nav toggle
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links){
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => links.classList.remove('open')));
  }

  // reveal on scroll
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length){
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting){
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in'));
  }
});

// --- toast helper, used across pages ---
function fabcToast(message, type = 'success'){
  let el = document.querySelector('.toast');
  if (!el){
    el = document.createElement('div');
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.className = `toast ${type}`;
  el.textContent = message;
  requestAnimationFrame(() => el.classList.add('show'));
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 3600);
}

// --- small dom helper ---
function fabcEl(html){
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}
