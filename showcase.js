(() => {
  const browser = document.querySelector('.project-browser');
  if (!browser) return;
  const slides = [...browser.querySelectorAll('#project-slides > article')];
  const picks = [...browser.querySelectorAll('[data-project]')];
  const status = browser.querySelector('#project-status');
  let active = 0;
  function show(index) {
    active = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      slide.hidden = i !== active;
      const lux = slide.querySelector('[data-lux-src]');
      if (lux && i === active && !lux.hasAttribute('src')) lux.src = lux.dataset.luxSrc;
      if (lux && i !== active) lux.removeAttribute('src');
      slide.setAttribute('aria-roledescription', 'slide');
      slide.setAttribute('aria-label', `${i + 1} of ${slides.length}`);
      if (i !== active) slide.querySelectorAll('video').forEach(video => video.pause());
      picks[i].setAttribute('aria-pressed', String(i === active));
    });
    status.textContent = `${String(active + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')} — ${picks[active].textContent.trim().replace(/^\d+\s*/, '')}`;
  }
  function navigate(index) {
    show(index);
    history.replaceState(null, '', `#${slides[active].id}`);
  }
  browser.querySelector('[data-project-prev]').addEventListener('click', () => navigate(active - 1));
  browser.querySelector('[data-project-next]').addEventListener('click', () => navigate(active + 1));
  picks.forEach((pick, i) => pick.addEventListener('click', () => navigate(i)));
  browser.addEventListener('keydown', event => {
    if (event.target !== browser && !event.target.closest('.project-controls, .project-arrows, .project-picker')) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      navigate(active + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  let start = null;
  browser.addEventListener('touchstart', event => {
    if (event.target.closest('video, iframe, a, button, input, summary')) return;
    const touch = event.changedTouches[0];
    start = { x: touch.clientX, y: touch.clientY };
  }, { passive: true });
  browser.addEventListener('touchend', event => {
    if (!start) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - start.x, dy = touch.clientY - start.y;
    start = null;
    if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.5) navigate(active + (dx < 0 ? 1 : -1));
  }, { passive: true });
  browser.addEventListener('touchcancel', () => { start = null; });
  function fromHash() {
    const index = slides.findIndex(slide => `#${slide.id}` === location.hash);
    if (index >= 0) show(index);
  }
  show(0);
  fromHash();
  window.addEventListener('hashchange', fromHash);
})();
