// Shared by every page. Each block only runs when its elements are on the page.

// Mobile menu
(function () {
  var btn = document.getElementById('menu-btn');
  var menu = document.getElementById('mobile-menu');
  if (!btn || !menu) return;
  var open = document.getElementById('icon-open');
  var close = document.getElementById('icon-close');
  function set(isOpen) {
    menu.classList.toggle('hidden', !isOpen);
    open.classList.toggle('hidden', isOpen);
    close.classList.toggle('hidden', !isOpen);
    btn.setAttribute('aria-expanded', String(isOpen));
    btn.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  }
  btn.addEventListener('click', function () { set(menu.classList.contains('hidden')); });
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { set(false); }); });
  window.addEventListener('resize', function () { if (window.innerWidth >= 768) set(false); });
})();

// Homepage: highlight the nav link for the section in view
(function () {
  var links = document.querySelectorAll('.nav-link[data-section]');
  if (!links.length || !('IntersectionObserver' in window)) return;
  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      links.forEach(function (l) {
        var on = l.getAttribute('data-section') === e.target.id;
        l.classList.toggle('text-mark', on);
        l.classList.toggle('text-dim', !on);
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  links.forEach(function (l) {
    var el = document.getElementById(l.getAttribute('data-section'));
    if (el) obs.observe(el);
  });
})();

// Homepage background slideshow
(function () {
  var box = document.getElementById('slides');
  if (!box) return;
  // [file, focus on phones, focus on wider screens] keeps the whole subject in frame when cropped
  var photos = [
    ['img/photo-01.jpg', '55% 50%', '50% 50%'],
    ['img/photo-02.jpg', '50% 50%', '50% 52%'],
    ['img/photo-03.jpg', '30% 60%', '50% 88%'],
    ['img/photo-04.jpg', '55% 50%', '50% 48%'],
    ['img/photo-05.jpg', '50% 40%', '50% 32%'],
    ['img/photo-06.jpg', '50% 40%', '50% 32%'],
    ['img/photo-07.jpg', '35% 50%', '50% 40%'],
    ['img/photo-08.jpg', '55% 40%', '50% 30%'],
    ['img/photo-09.jpg', '45% 50%', '50% 42%'],
    ['img/photo-10.jpg', '50% 60%', '50% 62%'],
    ['img/photo-11.jpg', '50% 45%', '50% 22%'],
    ['img/photo-12.jpg', '35% 40%', '50% 45%']
  ];
  var hero = document.getElementById('top');
  var counter = document.getElementById('counter');
  var pauseBtn = document.getElementById('pause');
  var icPause = document.getElementById('ic-pause');
  var icPlay = document.getElementById('ic-play');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var i = 0, timer = null, playing = !reduce, slides = [];

  photos.forEach(function (p, n) {
    var img = document.createElement('img');
    img.src = p[0]; img.alt = '';
    img.className = 'slide slide-fg absolute inset-0 h-full w-full ' + (n === 0 ? 'opacity-100' : 'opacity-0');
    img.style.setProperty('--fp-tall', p[1]);
    img.style.setProperty('--fp-wide', p[2]);
    if (n > 1) img.loading = 'lazy';
    box.appendChild(img); slides.push(img);
  });

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function go(n) {
    slides[i].classList.replace('opacity-100', 'opacity-0');
    i = (n + slides.length) % slides.length;
    slides[i].classList.replace('opacity-0', 'opacity-100');
    counter.textContent = pad(i + 1) + ' / ' + pad(slides.length);
  }
  function restart() {
    clearInterval(timer);
    if (playing) timer = setInterval(function () { go(i + 1); }, 6000);
  }
  function setPlaying(p) {
    playing = p;
    icPause.classList.toggle('hidden', !p);
    icPlay.classList.toggle('hidden', p);
    pauseBtn.setAttribute('aria-label', p ? 'Pause photos' : 'Play photos');
    restart();
  }
  document.getElementById('prev').addEventListener('click', function () { go(i - 1); restart(); });
  document.getElementById('next').addEventListener('click', function () { go(i + 1); restart(); });
  pauseBtn.addEventListener('click', function () { setPlaying(!playing); });

  var x0 = null;
  hero.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  hero.addEventListener('touchend', function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 50) { go(dx < 0 ? i + 1 : i - 1); restart(); }
    x0 = null;
  });
  setPlaying(playing);
})();

// Project photo carousels: swipe or use the arrows; the caption and counter follow the photo in view
(function () {
  document.querySelectorAll('[data-carousel]').forEach(function (root) {
    var track = root.querySelector('.carousel-track');
    var slides = track.querySelectorAll('.carousel-slide');
    var counter = root.querySelector('[data-count]');
    var caption = root.querySelector('[data-caption-text]');
    var prev = root.querySelector('[data-prev]');
    var next = root.querySelector('[data-next]');
    var i = 0;
    function pad(n) { return (n < 10 ? '0' : '') + n; }
    function show(n) {
      i = n;
      if (counter) counter.textContent = pad(i + 1) + ' / ' + pad(slides.length);
      if (caption) caption.textContent = slides[i].getAttribute('data-caption') || '';
      // Stop any video that has scrolled out of view
      track.querySelectorAll('video').forEach(function (v) { if (!slides[i].contains(v)) v.pause(); });
    }
    function go(n) {
      n = (n + slides.length) % slides.length;
      track.scrollTo({ left: slides[n].offsetLeft - track.offsetLeft, behavior: 'smooth' });
      show(n);
    }
    if (prev) prev.addEventListener('click', function () { go(i - 1); });
    if (next) next.addEventListener('click', function () { go(i + 1); });
    var t = null;
    track.addEventListener('scroll', function () {
      clearTimeout(t);
      t = setTimeout(function () {
        var n = Math.round(track.scrollLeft / track.clientWidth);
        if (n !== i && slides[n]) show(n);
      }, 80);
    }, { passive: true });
    track.addEventListener('keydown', function (e) {
      if (e.target.tagName === 'VIDEO') return;
      if (e.key === 'ArrowRight') { e.preventDefault(); go(i + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(i - 1); }
    });
    show(0);
  });
})();

// Copy email
(function () {
  var btn = document.getElementById('copy-email');
  var email = document.getElementById('email');
  if (!btn || !email) return;
  btn.addEventListener('click', function () {
    function selectIt() {
      var r = document.createRange(); r.selectNodeContents(email);
      var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
      btn.textContent = 'Selected, press Ctrl+C';
    }
    try {
      navigator.clipboard.writeText(email.textContent.trim()).then(function () {
        btn.textContent = 'Copied';
        setTimeout(function () { btn.textContent = 'Copy email'; }, 1800);
      }, selectIt);
    } catch (e) { selectIt(); }
  });
})();

// Contact form, sent through Web3Forms to my Gmail.
// It stays switched off until the access key is filled in on the form (data-access-key in contact.html).
(function () {
  var form = document.getElementById('contact-form');
  if (!form) return;
  var key = (form.getAttribute('data-access-key') || '').trim();
  var status = document.getElementById('form-status');
  var submit = form.querySelector('button[type="submit"]');
  var fields = form.querySelectorAll('input, textarea, button');

  if (!key) {
    fields.forEach(function (f) { f.disabled = true; });
    form.classList.add('opacity-60');
    status.textContent = 'The message form is not switched on yet. Please email me directly for now.';
    return;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.reportValidity()) return;
    var name = form.elements.name.value.trim();
    var data = {
      access_key: key,
      subject: '[masonheadley.github.io] New message from ' + name,
      from_name: 'masonheadley.github.io contact form',
      name: name,
      email: form.elements.email.value.trim(),
      message: form.elements.message.value.trim(),
      botcheck: form.elements.botcheck.checked
    };
    submit.disabled = true;
    submit.textContent = 'Sending…';
    status.textContent = '';
    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(data)
    }).then(function (r) { return r.json(); }).then(function (res) {
      if (!res.success) throw new Error(res.message || 'failed');
      form.reset();
      status.textContent = 'Thanks, your message was sent. I’ll get back to you soon.';
      status.className = 'text-sm text-mark';
    }).catch(function () {
      status.textContent = 'Sorry, the message didn’t go through. Please email me directly.';
      status.className = 'text-sm text-ink';
    }).then(function () {
      submit.disabled = false;
      submit.textContent = 'Send message';
    });
  });
})();
