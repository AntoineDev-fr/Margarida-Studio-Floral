/**
 * Margarida Studio Floral — script.js
 * Hamburger menu · Sticky nav · Scroll animations · Form validation
 */

'use strict';

/* ============================================================
   UTILITAIRES
============================================================ */

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;


/* ============================================================
   NAVBAR — sticky + scroll class
============================================================ */

const navbar  = $('#navbar');
const SCROLL_THRESHOLD = 30;

function handleNavScroll() {
  if (window.scrollY > SCROLL_THRESHOLD) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}

window.addEventListener('scroll', handleNavScroll, { passive: true });
handleNavScroll(); // run on load


/* ============================================================
   HAMBURGER MENU
============================================================ */

const hamburger  = $('#hamburger');
const navLinks   = $('#navLinks');
const navOverlay = $('#navOverlay');

function openMenu() {
  hamburger.classList.add('active');
  navLinks.classList.add('open');
  navOverlay.classList.add('active');
  navOverlay.removeAttribute('aria-hidden');
  hamburger.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';

  // Focus first nav link for a11y
  const firstLink = $('a', navLinks);
  if (firstLink) firstLink.focus();
}

function closeMenu() {
  hamburger.classList.remove('active');
  navLinks.classList.remove('open');
  navOverlay.classList.remove('active');
  navOverlay.setAttribute('aria-hidden', 'true');
  hamburger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

hamburger.addEventListener('click', () => {
  const isOpen = hamburger.classList.contains('active');
  isOpen ? closeMenu() : openMenu();
});

navOverlay.addEventListener('click', closeMenu);

// Close on nav link click
$$('.nav-link', navLinks).forEach(link => {
  link.addEventListener('click', closeMenu);
});

// Close on Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && navLinks.classList.contains('open')) {
    closeMenu();
    hamburger.focus();
  }
});

// Close if resized to desktop
window.addEventListener('resize', () => {
  if (window.innerWidth > 768) closeMenu();
}, { passive: true });


/* ============================================================
   SMOOTH SCROLL — anchor links
============================================================ */

$$('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const id = anchor.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (!target) return;

    e.preventDefault();

    const navHeight   = navbar.offsetHeight;
    const targetTop   = target.getBoundingClientRect().top + window.scrollY - navHeight;

    if (prefersReducedMotion()) {
      window.scrollTo(0, targetTop);
    } else {
      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    }
  });
});


/* ============================================================
   SCROLL ANIMATIONS — Intersection Observer
============================================================ */

if (!prefersReducedMotion()) {
  const observerOpts = {
    threshold: 0.1,
    rootMargin: '0px 0px -60px 0px',
  };

  const animObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        animObserver.unobserve(entry.target); // trigger once
      }
    });
  }, observerOpts);

  $$('.fade-in, .slide-up, .slide-left, .slide-right').forEach(el => {
    animObserver.observe(el);
  });
} else {
  // Immediately show everything if motion is reduced
  $$('.fade-in, .slide-up, .slide-left, .slide-right').forEach(el => {
    el.classList.add('visible');
  });
}


/* ============================================================
   ACTIVE NAV LINK — highlight on scroll
============================================================ */

const sections  = $$('section[id], footer');
const navItems  = $$('.nav-link');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const id = entry.target.id;
    navItems.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
    });
  });
}, {
  threshold: 0,
  rootMargin: `-${navbar.offsetHeight + 10}px 0px -40% 0px`,
});

sections.forEach(sec => sectionObserver.observe(sec));


/* ============================================================
   FORM VALIDATION
============================================================ */

const form       = $('#contactForm');
const submitBtn  = $('#submitBtn');
const successMsg = $('#formSuccess');

if (form) {
  const fields = {
    firstname: { el: $('#firstname', form), err: $('#firstnameError', form), validate: v => v.trim().length >= 2 },
    lastname:  { el: $('#lastname',  form), err: $('#lastnameError',  form), validate: v => v.trim().length >= 2 },
    email:     { el: $('#email',     form), err: $('#emailError',     form), validate: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) },
    message:   { el: $('#message',   form), err: $('#messageError',   form), validate: v => v.trim().length >= 10 },
  };

  /** Show/hide error for a field */
  function setError(field, hasError) {
    field.el.classList.toggle('error', hasError);
    field.err.classList.toggle('visible', hasError);
    field.el.setAttribute('aria-invalid', String(hasError));
  }

  /** Validate all required fields; return true if all pass */
  function validateAll() {
    let valid = true;
    for (const key in fields) {
      const f = fields[key];
      const ok = f.validate(f.el.value);
      setError(f, !ok);
      if (!ok) valid = false;
    }
    return valid;
  }

  // Live validation on blur + input (after first blur)
  for (const key in fields) {
    const f = fields[key];

    f.el.addEventListener('blur', () => {
      f.el.dataset.touched = 'true';
      const ok = f.validate(f.el.value);
      setError(f, !ok);
    });

    f.el.addEventListener('input', () => {
      if (f.el.dataset.touched !== 'true') return;
      const ok = f.validate(f.el.value);
      setError(f, !ok);
    });
  }

  /** Simulate form submission (replace with real fetch/action) */
  async function submitForm() {
    const btnText    = $('.btn-text', submitBtn);
    const btnLoading = $('.btn-loading', submitBtn);

    // Show loading state
    submitBtn.disabled = true;
    btnText.hidden     = true;
    btnLoading.hidden  = false;

    try {
      // ── Replace this block with your real form submission ──
      // e.g.:
      // const data = new FormData(form);
      // await fetch('/api/contact', { method: 'POST', body: data });
      //
      // Simulated 1.5s network delay:
      await new Promise(resolve => setTimeout(resolve, 1500));
      // ─────────────────────────────────────────────────────

      // Show success
      form.reset();
      // Reset touched state
      for (const key in fields) fields[key].el.dataset.touched = '';
      successMsg.hidden = false;
      successMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    } catch (_err) {
      alert('Une erreur est survenue. Veuillez réessayer ou nous contacter directement sur Instagram.');
    } finally {
      submitBtn.disabled = false;
      btnText.hidden     = false;
      btnLoading.hidden  = true;
    }
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (validateAll()) {
      submitForm();
    } else {
      // Focus first error
      const firstError = $$('[aria-invalid="true"]', form)[0];
      if (firstError) firstError.focus();
    }
  });
}


/* ============================================================
   GALLERY — keyboard accessibility
============================================================ */

$$('.gallery-item').forEach(item => {
  item.setAttribute('tabindex', '0');
  item.setAttribute('role', 'button');

  item.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      // Reveal overlay on keyboard focus (toggle)
      const overlay = $('.gallery-overlay', item);
      if (overlay) {
        const visible = overlay.style.opacity === '1';
        overlay.style.opacity = visible ? '' : '1';
      }
    }
  });
});


/* ============================================================
   FOOTER — back to top smooth
============================================================ */

const footerLogo = $('.footer-logo');
if (footerLogo) {
  footerLogo.addEventListener('click', e => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  });
}
