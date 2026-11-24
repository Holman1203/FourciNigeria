/* FOURCi – site behaviour. No dependencies. */
(function () {
  'use strict';
  var doc = document;
  doc.documentElement.classList.remove('no-js');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ----- Header shadow + back to top ----- */
  var header = doc.querySelector('.header');
  var toTop = doc.querySelector('.to-top');
  function onScroll() {
    var y = window.scrollY || 0;
    if (header) header.classList.toggle('is-scrolled', y > 8);
    if (toTop) toTop.classList.toggle('show', y > 700);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (toTop) toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });

  /* ----- Mobile nav + dropdowns ----- */
  var btn = doc.querySelector('.menu-btn');
  var nav = doc.getElementById('site-nav');
  function setNav(open) {
    if (!nav || !btn) return;
    if (open && header) nav.style.top = Math.max(header.getBoundingClientRect().bottom, 0) + 'px';
    nav.classList.toggle('is-open', open);
    doc.body.classList.toggle('nav-open', open);
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  if (btn) btn.addEventListener('click', function () { setNav(!nav.classList.contains('is-open')); });
  doc.querySelectorAll('.has-dd > button').forEach(function (b) {
    b.addEventListener('click', function (e) {
      e.stopPropagation();
      var li = b.parentElement;
      var open = !li.classList.contains('is-open');
      doc.querySelectorAll('.has-dd.is-open').forEach(function (o) { o.classList.remove('is-open'); o.querySelector('button').setAttribute('aria-expanded', 'false'); });
      li.classList.toggle('is-open', open);
      b.setAttribute('aria-expanded', String(open));
    });
  });
  doc.addEventListener('click', function (e) {
    if (!e.target.closest('.has-dd')) doc.querySelectorAll('.has-dd.is-open').forEach(function (o) { o.classList.remove('is-open'); o.querySelector('button').setAttribute('aria-expanded', 'false'); });
  });
  doc.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      setNav(false);
      doc.querySelectorAll('.has-dd.is-open').forEach(function (o) { o.classList.remove('is-open'); o.querySelector('button').setAttribute('aria-expanded', 'false'); });
    }
  });
  if (nav) nav.addEventListener('click', function (e) { if (e.target.closest('a')) setNav(false); });
  window.addEventListener('resize', function () { if (window.innerWidth > 1020) setNav(false); });

  /* ----- Reveal on scroll ----- */
  var revealEls = doc.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ----- Count-up numbers ----- */
  function fmt(n) { return n.toLocaleString('en-US'); }
  var counters = doc.querySelectorAll('[data-count]');
  function run(el) {
    var to = parseInt(el.getAttribute('data-count'), 10);
    if (reduce) { el.textContent = fmt(to); return; }
    var dur = 1800, t0 = null;
    function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 4);
      el.textContent = fmt(Math.round(to * eased));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { run(en.target); co.unobserve(en.target); } });
    }, { threshold: 0.5 });
    counters.forEach(function (c) { co.observe(c); });
  } else { counters.forEach(function (c) { c.textContent = fmt(parseInt(c.getAttribute('data-count'), 10)); }); }

  /* ----- Gallery: filters + lightbox ----- */
  var gallery = doc.querySelector('.gallery');
  if (gallery) {
    var shots = Array.prototype.slice.call(gallery.querySelectorAll('.shot'));
    doc.querySelectorAll('.chip[data-filter]').forEach(function (chip) {
      chip.addEventListener('click', function () {
        var f = chip.getAttribute('data-filter');
        doc.querySelectorAll('.chip[data-filter]').forEach(function (c) { c.setAttribute('aria-pressed', String(c === chip)); });
        shots.forEach(function (s) { s.hidden = !(f === 'all' || (s.getAttribute('data-cat') || '').split(' ').indexOf(f) > -1); });
      });
    });
    var dlg = doc.getElementById('lightbox');
    var lbImg = dlg && dlg.querySelector('img');
    var lbCap = dlg && dlg.querySelector('figcaption');
    var idx = 0;
    var visible = function () { return shots.filter(function (s) { return !s.hidden; }); };
    function show(i) {
      var list = visible(); if (!list.length) return;
      idx = (i + list.length) % list.length;
      var s = list[idx];
      lbImg.src = s.getAttribute('data-full');
      lbImg.alt = s.querySelector('img').alt;
      lbCap.textContent = s.getAttribute('data-caption') || '';
    }
    shots.forEach(function (s) {
      s.addEventListener('click', function () { show(visible().indexOf(s)); if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', ''); });
    });
    if (dlg) {
      dlg.querySelector('.lb-prev').addEventListener('click', function () { show(idx - 1); });
      dlg.querySelector('.lb-next').addEventListener('click', function () { show(idx + 1); });
      dlg.querySelector('.lb-close').addEventListener('click', function () { dlg.close(); });
      dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
      dlg.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') show(idx - 1);
        if (e.key === 'ArrowRight') show(idx + 1);
      });
    }
  }

  /* ----- Contact form (opens the visitor's email app, addressed to FOURCi) ----- */
  var form = doc.getElementById('contact-form');
  if (form) {
    var params = new URLSearchParams(window.location.search);
    var pre = params.get('subject');
    var sel = form.querySelector('#subject');
    if (pre && sel) {
      var found = false;
      Array.prototype.forEach.call(sel.options, function (o) { if (o.value.toLowerCase() === pre.toLowerCase()) { sel.value = o.value; found = true; } });
      if (!found) {
        var o = doc.createElement('option'); o.value = pre.slice(0, 120); o.textContent = pre.slice(0, 120); sel.appendChild(o); sel.value = o.value;
      }
    }
    var msgPre = params.get('about');
    if (msgPre) form.querySelector('#message').value = 'I would like to know more about: ' + msgPre.slice(0, 200) + '\n\n';
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      form.querySelectorAll('.field').forEach(function (f) {
        var inp = f.querySelector('input,select,textarea');
        if (!inp || !inp.required) return;
        var good = inp.value.trim() !== '' && (inp.type !== 'email' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inp.value.trim()));
        f.classList.toggle('invalid', !good);
        inp.setAttribute('aria-invalid', String(!good));
        if (!good) ok = false;
      });
      if (form.querySelector('.hp input').value) return; // honeypot
      var status = doc.getElementById('form-status');
      if (!ok) { status.textContent = 'Please complete the highlighted fields.'; status.classList.add('show'); var first = form.querySelector('.invalid input,.invalid textarea,.invalid select'); if (first) first.focus(); return; }
      var v = function (id) { return form.querySelector('#' + id).value.trim(); };
      var body = 'Name: ' + v('name') + '\nEmail: ' + v('email') + '\nPhone: ' + (v('phone') || '—') + '\nTopic: ' + v('subject') + '\n\n' + v('message');
      var href = 'mailto:' + form.getAttribute('data-to') + '?subject=' + encodeURIComponent('[Website] ' + v('subject') + ' – ' + v('name')) + '&body=' + encodeURIComponent(body);
      status.textContent = 'Thank you, ' + v('name').split(' ')[0] + '. Your email app is opening with your message ready to send to FOURCi. If nothing opens, write to ' + form.getAttribute('data-to') + '.';
      status.classList.add('show');
      window.location.href = href;
    });
  }

  /* ----- Footer year ----- */
  doc.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();

