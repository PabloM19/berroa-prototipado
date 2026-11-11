const header = document.querySelector('.site-header');
const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-navigation');
const plants = document.querySelector('.plants-menu');
const mobile = window.matchMedia('(max-width: 760px)');
function closeNavigation({ restoreFocus = false } = {}) {
  const wasOpen = toggle.getAttribute('aria-expanded') === 'true';
  header.dataset.navOpen = 'false';
  toggle.setAttribute('aria-expanded', 'false');
  plants.open = false;
  if (restoreFocus && wasOpen) toggle.focus();
}
toggle.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') !== 'true';
  header.dataset.navOpen = String(open);
  toggle.setAttribute('aria-expanded', String(open));
  if (!open) plants.open = false;
});
nav.addEventListener('click', event => { if (event.target.closest('a')) closeNavigation(); });
document.addEventListener('click', event => {
  if (!header.contains(event.target)) closeNavigation();
  else if (!plants.contains(event.target)) plants.open = false;
});
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  if (mobile.matches && toggle.getAttribute('aria-expanded') === 'true') closeNavigation({ restoreFocus: true });
  else if (plants.open) { plants.open = false; plants.querySelector('summary').focus(); }
});
header.addEventListener('focusout', () => { requestAnimationFrame(() => { if (!header.contains(document.activeElement)) closeNavigation(); }); });
mobile.addEventListener('change', () => closeNavigation());
function syncHeader() { header.dataset.scrolled = String(window.scrollY > 15); }
window.addEventListener('scroll', syncHeader, { passive: true }); syncHeader();
document.querySelector('[data-year]').textContent = String(new Date().getFullYear());
if (location.hostname === '127.0.0.1' || location.hostname === 'localhost') {
  const updates = new EventSource('/__reload');
  updates.addEventListener('change', () => location.reload());
}

const carousel = document.querySelector('.campaign-section');
if (carousel) {
  const track = carousel.querySelector('.campaign-track');
  const slides = [...carousel.querySelectorAll('.campaign-slide')];
  const dots = [...carousel.querySelectorAll('[data-carousel-dot]')];
  const pauseButton = carousel.querySelector('[data-carousel-pause]');
  const count = carousel.querySelector('[data-carousel-count]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const campaignInterval = 3500;
  let slideIndex = 0;
  let userPaused = reducedMotion.matches;
  let hovering = false;
  let focusPaused = false;
  let carouselTimer;
  function updatePauseButton() {
    pauseButton.setAttribute('aria-label', userPaused ? 'Reproducir carrusel de temporada' : 'Pausar carrusel de temporada');
    pauseButton.querySelector('[data-pause-label]').textContent = userPaused ? 'Reproducir' : 'Pausar';
    pauseButton.querySelector('.pause-symbol').textContent = userPaused ? '▷' : 'Ⅱ';
    count.setAttribute('aria-live', userPaused ? 'polite' : 'off');
  }
  function scheduleCarousel() {
    clearInterval(carouselTimer);
    if (userPaused || hovering || document.hidden || focusPaused) return;
    carouselTimer = setInterval(() => showSlide(slideIndex + 1), campaignInterval);
  }
  function showSlide(index, manual = false) {
    slideIndex = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${slideIndex * 100}%)`;
    slides.forEach((slide, i) => { slide.inert = i !== slideIndex; slide.setAttribute('aria-hidden', String(i !== slideIndex)); });
    dots.forEach((dot, i) => dot.setAttribute('aria-current', String(i === slideIndex)));
    count.textContent = `${String(slideIndex + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
    if (manual) { userPaused = true; updatePauseButton(); scheduleCarousel(); }
  }
  carousel.querySelector('[data-carousel-prev]').addEventListener('click', () => showSlide(slideIndex - 1, true));
  carousel.querySelector('[data-carousel-next]').addEventListener('click', () => showSlide(slideIndex + 1, true));
  dots.forEach((dot, index) => dot.addEventListener('click', () => showSlide(index, true)));
  pauseButton.addEventListener('click', () => { userPaused = !userPaused; if (!userPaused) { focusPaused = false; hovering = false; } updatePauseButton(); scheduleCarousel(); });
  carousel.addEventListener('mouseenter', () => { hovering = true; scheduleCarousel(); });
  carousel.addEventListener('mouseleave', () => { hovering = false; scheduleCarousel(); });
  carousel.addEventListener('focusin', () => { focusPaused = true; scheduleCarousel(); });
  carousel.addEventListener('focusout', () => requestAnimationFrame(() => { focusPaused = carousel.contains(document.activeElement); scheduleCarousel(); }));
  carousel.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); showSlide(slideIndex + (event.key === 'ArrowRight' ? 1 : -1), true); }
  });
  let swipeStart;
  track.addEventListener('pointerdown', event => { swipeStart = { x: event.clientX, y: event.clientY }; });
  track.addEventListener('pointerup', event => {
    if (!swipeStart) return;
    const dx = event.clientX - swipeStart.x, dy = event.clientY - swipeStart.y;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) showSlide(slideIndex + (dx < 0 ? 1 : -1), true);
    swipeStart = null;
  });
  track.addEventListener('pointercancel', () => { swipeStart = null; });
  document.addEventListener('visibilitychange', scheduleCarousel);
  reducedMotion.addEventListener('change', () => { if (reducedMotion.matches) userPaused = true; updatePauseButton(); scheduleCarousel(); });
  updatePauseButton();
  scheduleCarousel();
}

const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
if ('IntersectionObserver' in window && typeof Element.prototype.animate === 'function' && !motionPreference.matches) {
  const revealStyles = {
    rise: { transform: 'translateY(16px)', opacity: .38, duration: 560 },
    'hero-title': { transform: 'translateY(22px)', opacity: .28, duration: 690 },
    photo: { transform: 'translateY(16px) scale(.984)', opacity: .48, duration: 740 },
    tile: { transform: 'translateY(23px) scale(.992)', opacity: .38, duration: 640 },
    'from-left': { transform: 'translate(-18px, 8px)', opacity: .46, duration: 680 },
    'from-right': { transform: 'translate(18px, 8px)', opacity: .46, duration: 680 },
  };
  const targets = document.querySelectorAll('[data-reveal]');
  const running = new WeakMap();
  const waiting = new Map();
  let lastScrollAt = -Infinity;

  function stopWaiting(target) {
    clearTimeout(waiting.get(target));
    waiting.delete(target);
  }

  function reveal(target, observer, enteredAt) {
    const pending = target.hasAttribute('data-reveal-pending');
    const bounds = target.getBoundingClientRect();
    if (bounds.bottom <= 0 || bounds.top >= window.innerHeight) {
      stopWaiting(target);
      return;
    }

    const now = performance.now();
    const quietTime = 105 - (now - lastScrollAt);
    if (pending && quietTime > 0 && now - enteredAt < 440) {
      waiting.set(target, setTimeout(() => reveal(target, observer, enteredAt), quietTime));
      return;
    }

    stopWaiting(target);
    observer.unobserve(target);
    target.removeAttribute('data-reveal-pending');
    if (motionPreference.matches || target.contains(document.activeElement)) return;

    const { transform, opacity, duration } = revealStyles[target.dataset.reveal] ?? revealStyles.rise;
    const animation = target.animate([
      { transform, opacity: pending ? 0 : Math.max(opacity, .85) },
      { transform: 'none', opacity: 1 },
    ], {
      duration,
      easing: 'cubic-bezier(.2,.72,.24,1)',
    });
    running.set(target, animation);
  }

  const sectionObserver = new IntersectionObserver((entries, observer) => {
    for (const { isIntersecting, target } of entries) {
      if (!isIntersecting) {
        stopWaiting(target);
        continue;
      }
      if (waiting.has(target)) continue;
      const enteredAt = performance.now();
      const baseDelay = target.hasAttribute('data-reveal-pending') ? 155 : 0;
      const delay = baseDelay + Number(target.dataset.revealDelay ?? 0);
      waiting.set(target, setTimeout(() => reveal(target, observer, enteredAt), delay));
    }
  }, { rootMargin: '0px 0px -24px' });

  window.addEventListener('scroll', () => { lastScrollAt = performance.now(); }, { passive: true });
  targets.forEach(target => {
    if (target.getBoundingClientRect().top >= window.innerHeight) target.setAttribute('data-reveal-pending', '');
    sectionObserver.observe(target);
  });

  document.addEventListener('focusin', event => {
    const target = event.target.closest('[data-reveal]');
    if (!target) return;
    sectionObserver.unobserve(target);
    stopWaiting(target);
    target.removeAttribute('data-reveal-pending');
    running.get(target)?.cancel();
  });

  motionPreference.addEventListener('change', () => {
    if (!motionPreference.matches) return;
    sectionObserver.disconnect();
    targets.forEach(target => {
      stopWaiting(target);
      target.removeAttribute('data-reveal-pending');
      running.get(target)?.cancel();
    });
  });
}

const featuredViewport = document.querySelector('.featured-viewport');
if (featuredViewport) {
  const track = featuredViewport.querySelector('.featured-list');
  const cards = [...track.children];
  const controls = document.querySelector('.featured-controls');
  const status = document.querySelector('.featured-status');
  const count = cards.length;

  function makeCopies() {
    return cards.map(card => {
      const copy = card.cloneNode(true);
      copy.setAttribute('aria-hidden', 'true');
      copy.inert = true;
      return copy;
    });
  }

  track.prepend(...makeCopies());
  track.append(...makeCopies());
  featuredViewport.dataset.carouselReady = '';
  controls.hidden = false;
  featuredViewport.tabIndex = 0;
  featuredViewport.setAttribute('role', 'group');
  featuredViewport.setAttribute('aria-label', 'Productos destacados. Usa las flechas para recorrerlos.');

  const hintObserver = new IntersectionObserver(([entry], observer) => {
    if (!entry.isIntersecting) return;
    controls.dataset.hint = '';
    observer.disconnect();
  }, { threshold: .25 });
  hintObserver.observe(featuredViewport);

  let active = 0;
  let step = 0;
  let animation;
  let drag;

  function position(index, delta = 0) {
    return `translateX(${-(count + index) * step + delta}px)`;
  }

  function measure() {
    const gap = parseFloat(getComputedStyle(track).columnGap);
    step = cards[0].getBoundingClientRect().width + gap;
    animation?.cancel();
    track.style.transform = position(active);
  }

  function move(direction, delta = 0) {
    animation?.cancel();
    const start = position(active, delta);
    const destination = active + direction;
    const end = position(destination);
    active = (destination + count) % count;
    track.style.transform = position(active);

    // The first and last copies match the real cards at the resting position.
    if (!motionPreference.matches && start !== end) {
      animation = track.animate([{ transform: start }, { transform: end }], {
        duration: 320,
        easing: 'cubic-bezier(.2,.7,.2,1)',
      });
    }

    if (direction) {
      delete controls.dataset.hint;
      const name = cards[active].querySelector('h3').textContent;
      status.textContent = `${name}. ${active + 1} de ${count}.`;
    }
  }

  controls.querySelector('[data-products-previous]').addEventListener('click', () => move(-1));
  controls.querySelector('[data-products-next]').addEventListener('click', () => move(1));
  featuredViewport.addEventListener('keydown', event => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    move(event.key === 'ArrowRight' ? 1 : -1);
  });

  featuredViewport.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0) return;
    delete controls.dataset.hint;
    animation?.cancel();
    drag = { pointer: event.pointerId, startX: event.clientX, delta: 0 };
    featuredViewport.setPointerCapture(event.pointerId);
    featuredViewport.dataset.dragging = '';
  });

  featuredViewport.addEventListener('pointermove', event => {
    if (drag?.pointer !== event.pointerId) return;
    const distance = event.clientX - drag.startX;
    drag.delta = Math.max(-step, Math.min(step, distance));
    track.style.transform = position(active, drag.delta);
  });

  function endDrag(event) {
    if (drag?.pointer !== event.pointerId) return;
    const { delta } = drag;
    drag = undefined;
    delete featuredViewport.dataset.dragging;
    const moved = event.type === 'pointerup' && Math.abs(delta) >= Math.min(58, step * .24);
    move(moved ? -Math.sign(delta) : 0, delta);
  }

  featuredViewport.addEventListener('pointerup', endDrag);
  featuredViewport.addEventListener('pointercancel', endDrag);
  featuredViewport.addEventListener('lostpointercapture', endDrag);
  featuredViewport.addEventListener('dragstart', event => event.preventDefault());
  new ResizeObserver(measure).observe(featuredViewport);
  measure();
}
