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

function openWhatsAppUrl(url) {
  const popup = window.open(url, '_blank', 'noopener');
  if (!popup) {
    window.location.href = url;
  }
}

function toDateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function toTimeInputValue(date) {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

function buildLocalDate(dateString, timeString) {
  const [year, month, day] = dateString.split('-').map(Number);
  const [hours, minutes] = timeString.split(':').map(Number);
  return new Date(year, month - 1, day, hours, minutes, 0, 0);
}

function ceilToNextQuarter(date) {
  const next = new Date(date);
  next.setSeconds(0, 0);

  const minutes = next.getMinutes();
  const remainder = minutes % 15;
  if (remainder !== 0) {
    next.setMinutes(minutes + (15 - remainder));
  }

  return next;
}

function formatDateTimeLabel(date) {
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

function lockBodyScroll() {
  document.body.classList.add('modal-open');
}

function unlockBodyScroll() {
  document.body.classList.remove('modal-open');
}


/* ============================================================
   NAVBAR — sticky + scroll class
============================================================ */

const navbar  = $('#navbar');
const SCROLL_THRESHOLD = 30;

function handleNavScroll() {
  if (!navbar) return;

  if (window.scrollY > SCROLL_THRESHOLD) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}

if (navbar) {
  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll(); // run on load
}


/* ============================================================
   HAMBURGER MENU
============================================================ */

const hamburger  = $('#hamburger');
const navLinks   = $('#navLinks');
const navOverlay = $('#navOverlay');

function openMenu() {
  if (!hamburger || !navLinks || !navOverlay) return;

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
  if (!hamburger || !navLinks || !navOverlay) return;

  hamburger.classList.remove('active');
  navLinks.classList.remove('open');
  navOverlay.classList.remove('active');
  navOverlay.setAttribute('aria-hidden', 'true');
  hamburger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

if (hamburger && navLinks && navOverlay) {
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
}


/* ============================================================
   SMOOTH SCROLL — anchor links
============================================================ */

$$('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const id = anchor.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (!target) return;

    e.preventDefault();

    const navHeight   = navbar ? navbar.offsetHeight : 0;
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

if (navItems.length) {
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
    rootMargin: `-${(navbar ? navbar.offsetHeight : 0) + 10}px 0px -40% 0px`,
  });

  sections.forEach(sec => sectionObserver.observe(sec));
}


/* ============================================================
   FORM VALIDATION
============================================================ */

const form       = $('#contactForm');
const successMsg = $('#formSuccess');
const WHATSAPP_NUMBER = '33646446934';

if (form) {
  const fields = {
    firstname: { el: $('#firstname', form), err: $('#firstnameError', form), validate: v => v.trim().length >= 2 },
    lastname:  { el: $('#lastname',  form), err: $('#lastnameError',  form), validate: v => v.trim().length >= 2 },
    service:   { el: $('#service',   form), err: $('#serviceError',   form), validate: v => v.trim().length > 0 },
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
    const field = fields[key];

    field.el.addEventListener('blur', () => {
      field.el.dataset.touched = 'true';
      const ok = field.validate(field.el.value);
      setError(field, !ok);
    });

    field.el.addEventListener('input', () => {
      if (field.el.dataset.touched !== 'true') return;
      const ok = field.validate(field.el.value);
      setError(field, !ok);
    });

    field.el.addEventListener('change', () => {
      if (field.el.dataset.touched !== 'true') return;
      const ok = field.validate(field.el.value);
      setError(field, !ok);
    });
  }

  function buildWhatsAppUrl() {
    const text = [
      'Bonjour, j\'aimerais discuter d\'une prestation.',
      `Je m'appelle ${fields.firstname.el.value.trim()} ${fields.lastname.el.value.trim()}.`,
      `Prestation : ${fields.service.el.value}.`,
      'Mon besoin :',
      fields.message.el.value.trim(),
    ].join('\n');

    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  }

  function resetFormState() {
    form.reset();
    for (const key in fields) {
      fields[key].el.dataset.touched = '';
      setError(fields[key], false);
    }
  }

  function submitForm() {
    const url = buildWhatsAppUrl();

    successMsg.hidden = false;
    successMsg.scrollIntoView({
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      block: 'nearest'
    });

    resetFormState();
    openWhatsAppUrl(url);
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
   ORDER FORM — WhatsApp order flow
============================================================ */

const orderForm = $('#orderForm');
const orderSuccess = $('#orderSuccess');

if (orderForm) {
  const DELIVERY_LEAD_TIME_MS = 2 * 60 * 60 * 1000;

  const fulfillmentInputs = $$('input[name="fulfillment"]', orderForm);
  const deliveryAddressGroup = $('#deliveryAddressGroup', orderForm);
  const recipientFields = $('#recipientFields', orderForm);
  const giftToggle = $('#isGift', orderForm);

  const orderFields = {
    orderDetails: {
      el: $('#orderDetails', orderForm),
      err: $('#orderDetailsError', orderForm),
      validate: value => value.trim().length >= 8
    },
    orderFirstname: {
      el: $('#orderFirstname', orderForm),
      err: $('#orderFirstnameError', orderForm),
      validate: value => value.trim().length >= 2
    },
    orderLastname: {
      el: $('#orderLastname', orderForm),
      err: $('#orderLastnameError', orderForm),
      validate: value => value.trim().length >= 2
    },
    deliveryAddress: {
      el: $('#deliveryAddress', orderForm),
      err: $('#deliveryAddressError', orderForm),
      active: () => isDelivery(),
      validate: value => value.trim().length >= 10
    },
    orderDate: {
      el: $('#orderDate', orderForm),
      err: $('#orderDateError', orderForm),
      validate: value => value.trim().length > 0
    },
    orderTime: {
      el: $('#orderTime', orderForm),
      err: $('#orderTimeError', orderForm),
      validate: value => value.trim().length > 0
    },
    recipientFirstname: {
      el: $('#recipientFirstname', orderForm),
      err: $('#recipientFirstnameError', orderForm),
      active: () => isGift(),
      validate: value => value.trim().length >= 2
    },
    recipientLastname: {
      el: $('#recipientLastname', orderForm),
      err: $('#recipientLastnameError', orderForm),
      active: () => isGift(),
      validate: value => value.trim().length >= 2
    },
    recipientPhone: {
      el: $('#recipientPhone', orderForm),
      err: $('#recipientPhoneError', orderForm),
      active: () => isGift(),
      validate: value => value.replace(/\D/g, '').length >= 10
    }
  };

  Object.values(orderFields).forEach(field => {
    field.defaultMessage = field.err.textContent;
  });

  function currentFulfillment() {
    const selected = fulfillmentInputs.find(input => input.checked);
    return selected ? selected.value : 'collect';
  }

  function isDelivery() {
    return currentFulfillment() === 'delivery';
  }

  function isGift() {
    return giftToggle.checked;
  }

  function setOrderError(field, hasError, message = field.defaultMessage) {
    field.err.textContent = message;
    field.el.classList.toggle('error', hasError);
    field.err.classList.toggle('visible', hasError);
    field.el.setAttribute('aria-invalid', String(hasError));
  }

  function isFieldActive(field) {
    return typeof field.active !== 'function' || field.active();
  }

  function hideGroupErrors(group) {
    $$('input, textarea, select', group).forEach(el => {
      el.classList.remove('error');
      el.setAttribute('aria-invalid', 'false');
    });

    $$('.form-error', group).forEach(error => {
      error.classList.remove('visible');
    });
  }

  function toggleGroup(group, enabled) {
    group.hidden = !enabled;
    $$('input, textarea, select', group).forEach(el => {
      el.disabled = !enabled;
      if (!enabled) {
        el.dataset.touched = '';
      }
    });

    if (!enabled) {
      hideGroupErrors(group);
    }
  }

  function getMinimumDateTime() {
    const now = new Date();
    const leadTime = isDelivery() ? DELIVERY_LEAD_TIME_MS : 0;
    return ceilToNextQuarter(new Date(now.getTime() + leadTime));
  }

  function updateScheduleConstraints() {
    const minimumDateTime = getMinimumDateTime();
    const minimumDate = toDateInputValue(minimumDateTime);
    const minimumTime = toTimeInputValue(minimumDateTime);

    orderFields.orderDate.el.min = minimumDate;

    if (!orderFields.orderDate.el.value || orderFields.orderDate.el.value < minimumDate) {
      orderFields.orderDate.el.value = minimumDate;
    }

    if (orderFields.orderDate.el.value === minimumDate) {
      orderFields.orderTime.el.min = minimumTime;

      if (!orderFields.orderTime.el.value || orderFields.orderTime.el.value < minimumTime) {
        orderFields.orderTime.el.value = minimumTime;
      }
    } else {
      orderFields.orderTime.el.min = '';
    }
  }

  function validateSchedule(showError = false) {
    const dateValue = orderFields.orderDate.el.value;
    const timeValue = orderFields.orderTime.el.value;

    if (!dateValue || !timeValue) {
      return false;
    }

    const selectedDateTime = buildLocalDate(dateValue, timeValue);
    const minimumDateTime = getMinimumDateTime();
    const valid = selectedDateTime.getTime() >= minimumDateTime.getTime();

    if (!showError) {
      return valid;
    }

    if (!valid) {
      const message = isDelivery()
        ? `Pour une livraison, choisissez un créneau à partir du ${formatDateTimeLabel(minimumDateTime)}.`
        : `Choisissez un créneau à partir du ${formatDateTimeLabel(minimumDateTime)}.`;

      setOrderError(orderFields.orderTime, true, message);
    } else if (orderFields.orderTime.validate(timeValue)) {
      setOrderError(orderFields.orderTime, false);
    }

    return valid;
  }

  function updateConditionalState() {
    toggleGroup(deliveryAddressGroup, isDelivery());
    toggleGroup(recipientFields, isGift());
    updateScheduleConstraints();
  }

  function validateOrderForm() {
    let valid = true;

    for (const key in orderFields) {
      const field = orderFields[key];

      if (!isFieldActive(field)) {
        setOrderError(field, false);
        continue;
      }

      const fieldValid = field.validate(field.el.value);
      setOrderError(field, !fieldValid);
      if (!fieldValid) valid = false;
    }

    if (orderFields.orderDate.validate(orderFields.orderDate.el.value) && orderFields.orderTime.validate(orderFields.orderTime.el.value)) {
      if (!validateSchedule(true)) {
        valid = false;
      }
    }

    return valid;
  }

  function resetOrderForm() {
    orderForm.reset();

    Object.values(orderFields).forEach(field => {
      field.el.dataset.touched = '';
      setOrderError(field, false);
    });

    updateConditionalState();
  }

  function buildOrderWhatsAppUrl() {
    const modeLabel = isDelivery() ? 'Livraison' : 'Click and collect';
    const scheduledAt = buildLocalDate(orderFields.orderDate.el.value, orderFields.orderTime.el.value);
    const lines = [
      'Bonjour Margarida,',
      'Je souhaite passer une commande boutique.',
      `Mode : ${modeLabel}.`,
      `Commande : ${orderFields.orderDetails.el.value.trim()}.`,
      `Client : ${orderFields.orderFirstname.el.value.trim()} ${orderFields.orderLastname.el.value.trim()}.`,
      `Date et heure souhaitées : ${formatDateTimeLabel(scheduledAt)}.`
    ];

    if (isDelivery()) {
      lines.push(`Adresse de livraison : ${orderFields.deliveryAddress.el.value.trim()}.`);
    }

    if (isGift()) {
      lines.push('C\'est une commande à offrir.');
      lines.push(`Destinataire : ${orderFields.recipientFirstname.el.value.trim()} ${orderFields.recipientLastname.el.value.trim()}.`);
      lines.push(`Téléphone du destinataire : ${orderFields.recipientPhone.el.value.trim()}.`);
    }

    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`;
  }

  Object.values(orderFields).forEach(field => {
    field.el.addEventListener('blur', () => {
      field.el.dataset.touched = 'true';
      orderSuccess.hidden = true;

      if (!isFieldActive(field)) return;

      setOrderError(field, !field.validate(field.el.value));

      if (field === orderFields.orderDate || field === orderFields.orderTime) {
        validateSchedule(field.el.value.trim().length > 0);
      }
    });

    field.el.addEventListener('input', () => {
      orderSuccess.hidden = true;

      if (!isFieldActive(field) || field.el.dataset.touched !== 'true') return;

      setOrderError(field, !field.validate(field.el.value));

      if (field === orderFields.orderTime) {
        validateSchedule(true);
      }
    });

    field.el.addEventListener('change', () => {
      orderSuccess.hidden = true;

      if (field === orderFields.orderDate || field === orderFields.orderTime) {
        updateScheduleConstraints();
      }

      if (!isFieldActive(field) || field.el.dataset.touched !== 'true') return;

      setOrderError(field, !field.validate(field.el.value));

      if (field === orderFields.orderDate || field === orderFields.orderTime) {
        validateSchedule(true);
      }
    });
  });

  fulfillmentInputs.forEach(input => {
    input.addEventListener('change', () => {
      orderSuccess.hidden = true;
      updateConditionalState();
      validateSchedule(orderFields.orderDate.el.dataset.touched === 'true' || orderFields.orderTime.el.dataset.touched === 'true');
    });
  });

  giftToggle.addEventListener('change', () => {
    orderSuccess.hidden = true;
    updateConditionalState();
  });

  updateConditionalState();

  orderForm.addEventListener('submit', e => {
    e.preventDefault();

    if (!validateOrderForm()) {
      const firstError = $$('[aria-invalid="true"]', orderForm)[0];
      if (firstError) firstError.focus();
      return;
    }

    const url = buildOrderWhatsAppUrl();
    orderSuccess.hidden = false;
    orderSuccess.scrollIntoView({
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      block: 'nearest'
    });

    resetOrderForm();
    openWhatsAppUrl(url);
  });
}


/* ============================================================
   DELIVERY POPUP — pricing info
============================================================ */

const deliveryPopup = $('#deliveryPopup');

if (deliveryPopup) {
  const closeButtons = $$('[data-popup-close], #deliveryPopupClose, #deliveryPopupAction', deliveryPopup);
  const primaryCloseButton = $('#deliveryPopupClose', deliveryPopup);

  function closeDeliveryPopup() {
    deliveryPopup.hidden = true;
    unlockBodyScroll();
  }

  function openDeliveryPopup() {
    deliveryPopup.hidden = false;
    lockBodyScroll();
    if (primaryCloseButton) {
      primaryCloseButton.focus();
    }
  }

  closeButtons.forEach(button => {
    button.addEventListener('click', closeDeliveryPopup);
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !deliveryPopup.hidden) {
      closeDeliveryPopup();
    }
  });

  openDeliveryPopup();
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
