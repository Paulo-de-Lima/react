/* =========================================================
   react.guide — interações leves (sem dependências)
   ========================================================= */
(function () {
  'use strict';

  const progress = document.getElementById('scrollProgress');
  const railFill = document.getElementById('railFill');
  const toTop = document.getElementById('toTop');
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = Array.from(document.querySelectorAll('.nav-menu a'));
  const railLinks = Array.from(document.querySelectorAll('.rail-list a'));
  const chapters = Array.from(document.querySelectorAll('.chapter'));
  const trackedSections = chapters.concat([document.getElementById('projetos')].filter(Boolean));
  const reveals = Array.from(document.querySelectorAll('.reveal'));

  /* ---------- menu mobile ---------- */
  function closeMenu() {
    navMenu.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  }
  navToggle.addEventListener('click', function () {
    const open = navMenu.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
  });
  navLinks.forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });

  /* ---------- progresso de rolagem ---------- */
  let ticking = false;
  function onScroll() {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = scrollable > 0 ? Math.min(1, window.scrollY / scrollable) : 0;
    progress.style.transform = 'scaleX(' + ratio + ')';
    railFill.style.width = (ratio * 100).toFixed(1) + '%';
    toTop.classList.toggle('show', window.scrollY > 500);
    updateActiveLink();
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });
  window.addEventListener('resize', onScroll);

  /* ---------- link ativo na navegação ---------- */
  function updateActiveLink() {
    const offset = window.scrollY + window.innerHeight * 0.32;
    let currentId = null;
    trackedSections.forEach(function (section) {
      if (section.offsetTop <= offset) currentId = section.id;
    });
    const targets = [].concat(railLinks, navLinks.slice(0, -1));
    targets.forEach(function (link) {
      const id = link.getAttribute('href').slice(1);
      link.classList.toggle('active', id === currentId);
    });
  }

  /* ---------- revelar elementos ao rolar ---------- */
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { observer.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- botão copiar código ---------- */
  document.querySelectorAll('.copy-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const pre = btn.closest('.code-window').querySelector('pre');
      const text = pre.innerText;
      const done = function () {
        const original = 'Copiar';
        btn.textContent = 'Copiado ✓';
        window.setTimeout(function () { btn.textContent = original; }, 1600);
      };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(done).catch(fallback);
      } else {
        fallback();
      }
      function fallback() {
        const area = document.createElement('textarea');
        area.value = text;
        area.style.position = 'fixed';
        area.style.opacity = '0';
        document.body.appendChild(area);
        area.select();
        try { document.execCommand('copy'); done(); } catch (err) { btn.textContent = 'Erro'; }
        document.body.removeChild(area);
      }
    });
  });

  /* ---------- voltar ao topo ---------- */
  toTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  onScroll();
})();
