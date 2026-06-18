(function () {
  const navToggle = document.querySelector('[data-nav-toggle]');
  const navMenu = document.querySelector('[data-nav-menu]');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      navMenu.classList.toggle('open');
    });
  }

  const slider = document.querySelector('[data-hero-slider]');

  if (slider) {
    const slides = Array.from(slider.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(slider.querySelectorAll('[data-hero-dot]'));
    const prev = slider.querySelector('[data-hero-prev]');
    const next = slider.querySelector('[data-hero-next]');
    let index = 0;

    const show = function (nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    };

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
      });
    });

    window.setInterval(function () {
      show(index + 1);
    }, 5000);
  }

  const searchInput = document.querySelector('.js-card-search');
  const searchableList = document.querySelector('.searchable-list');

  if (searchInput && searchableList) {
    const cards = Array.from(searchableList.querySelectorAll('.movie-card'));
    const noResult = document.querySelector('[data-no-result]');
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q') || '';

    const apply = function () {
      const value = searchInput.value.trim().toLowerCase();
      let visible = 0;

      cards.forEach(function (card) {
        const text = (card.getAttribute('data-search') || '').toLowerCase();
        const matched = !value || text.includes(value);
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (noResult) {
        noResult.classList.toggle('visible', visible === 0);
      }
    };

    if (query) {
      searchInput.value = query;
    }

    searchInput.addEventListener('input', apply);
    apply();
  }
})();

window.initMoviePlayer = function (url) {
  const video = document.getElementById('movie-video');
  const overlay = document.querySelector('[data-play-button]');
  let hlsInstance = null;
  let loaded = false;

  if (!video || !url) {
    return;
  }

  const attach = function () {
    if (loaded) {
      return Promise.resolve();
    }

    loaded = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      return Promise.resolve();
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(url);
      hlsInstance.attachMedia(video);
      return Promise.resolve();
    }

    video.src = url;
    return Promise.resolve();
  };

  const start = function () {
    attach().then(function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    });
  };

  if (overlay) {
    overlay.addEventListener('click', start);
  }

  video.addEventListener('click', function () {
    if (!loaded || video.paused) {
      start();
    } else {
      video.pause();
    }
  });

  video.addEventListener('play', function () {
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
  });

  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
};
