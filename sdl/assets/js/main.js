// Liten og avhengighetsfri: meny, header-tilstand, scroll-animasjoner, aktiv lenke og videoknapp.
(() => {
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('nav');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // header border + progress line (CSS scroll timeline where supported, JS otherwise)
  const progress = document.querySelector('.progress');
  const cssTimeline = window.CSS && CSS.supports('animation-timeline: scroll()');
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
      if (!cssTimeline && progress) {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        progress.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
      }
      ticking = false;
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // mobile menu
  const setMenu = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.textContent = open ? 'Lukk' : 'Meny';
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
  };
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { setMenu(false); toggle.focus(); }
  });
  window.matchMedia('(min-width: 1000px)').addEventListener('change', (m) => { if (m.matches) setMenu(false); });

  // reveal: highlighter sweeps, bars, the route line
  const reveals = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add('is-in'); io.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.2 });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-in'));
  }

  // current section in the menu
  const links = [...nav.querySelectorAll('a[href^="#"]')];
  const byId = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((l) => l.removeAttribute('aria-current'));
        const link = byId.get(entry.target.id); // sections without a menu link (the hero) just clear it
        if (link) link.setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('main > section[id]').forEach((s) => spy.observe(s));
  }

  // video: big play button over the poster, native controls after that
  const player = document.querySelector('.player');
  if (player) {
    const video = player.querySelector('video');
    const button = player.querySelector('.play');
    video.controls = false; // the big button replaces them until playback starts (no-JS keeps native controls)
    video.addEventListener('play', () => { video.controls = true; });
    button.addEventListener('click', () => {
      const p = video.play();
      if (p && typeof p.catch === 'function') p.catch(() => player.classList.add('is-playing'));
      video.focus({ preventScroll: true });
    });
    video.addEventListener('play', () => player.classList.add('is-playing'));
  }
})();
