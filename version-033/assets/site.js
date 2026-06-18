(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function initMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function initFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
    panels.forEach(function (panel) {
      var input = panel.querySelector('[data-filter-keyword]');
      var region = panel.querySelector('[data-filter-region]');
      var type = panel.querySelector('[data-filter-type]');
      var year = panel.querySelector('[data-filter-year]');
      var reset = panel.querySelector('[data-filter-reset]');
      var scopeSelector = panel.getAttribute('data-filter-panel');
      var scope = scopeSelector ? document.querySelector(scopeSelector) : document;
      var cards = scope ? Array.prototype.slice.call(scope.querySelectorAll('.movie-card')) : [];
      var empty = document.querySelector('[data-empty-message]');

      function apply() {
        var kw = normalize(input && input.value);
        var r = normalize(region && region.value);
        var t = normalize(type && type.value);
        var y = normalize(year && year.value);
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.dataset.title,
            card.dataset.region,
            card.dataset.type,
            card.dataset.year,
            card.dataset.tags
          ].join(' '));
          var matched = true;
          if (kw && haystack.indexOf(kw) === -1) {
            matched = false;
          }
          if (r && normalize(card.dataset.region) !== r) {
            matched = false;
          }
          if (t && normalize(card.dataset.type) !== t) {
            matched = false;
          }
          if (y && normalize(card.dataset.year) !== y) {
            matched = false;
          }
          card.style.display = matched ? '' : 'none';
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.style.display = visible ? 'none' : 'block';
        }
      }

      [input, region, type, year].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });

      if (reset) {
        reset.addEventListener('click', function () {
          if (input) {
            input.value = '';
          }
          if (region) {
            region.value = '';
          }
          if (type) {
            type.value = '';
          }
          if (year) {
            year.value = '';
          }
          apply();
        });
      }

      var query = new URLSearchParams(window.location.search);
      if (input && query.get('q')) {
        input.value = query.get('q');
      }
      apply();
    });
  }

  function initPlayer() {
    var frame = document.querySelector('[data-player]');
    if (!frame) {
      return;
    }
    var video = frame.querySelector('video');
    var overlay = frame.querySelector('.player-overlay');
    var src = frame.getAttribute('data-src');
    var started = false;

    function bindAndPlay() {
      if (!video || !src) {
        return;
      }
      if (!started) {
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(src);
          hls.attachMedia(video);
          video._hls = hls;
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
        } else {
          video.src = src;
        }
        started = true;
      }
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          if (overlay) {
            overlay.classList.remove('is-hidden');
          }
        });
      }
    }

    if (overlay) {
      overlay.addEventListener('click', bindAndPlay);
    }
    video.addEventListener('click', function () {
      if (!started) {
        bindAndPlay();
      }
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initPlayer();
  });
})();
