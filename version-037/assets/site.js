(() => {
  const qs = (selector, root = document) => root.querySelector(selector);
  const qsa = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const menuButton = qs('.menu-toggle');
  const mobilePanel = qs('.mobile-panel');
  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', () => {
      const expanded = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!expanded));
      mobilePanel.hidden = expanded;
    });
  }

  qsa('.site-search').forEach((form) => {
    form.addEventListener('submit', (event) => {
      const input = qs('input[name="q"]', form);
      if (!input || !input.value.trim()) {
        event.preventDefault();
        window.location.href = './search.html';
      }
    });
  });

  const slides = qsa('.hero-slide');
  const dots = qsa('.hero-dot');
  let currentSlide = 0;
  let slideTimer = null;

  function showSlide(index) {
    if (!slides.length) return;
    currentSlide = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle('active', i === currentSlide));
    dots.forEach((dot, i) => dot.classList.toggle('active', i === currentSlide));
  }

  function startHeroTimer() {
    if (!slides.length) return;
    window.clearInterval(slideTimer);
    slideTimer = window.setInterval(() => showSlide(currentSlide + 1), 5200);
  }

  if (slides.length) {
    qs('.hero-prev')?.addEventListener('click', () => {
      showSlide(currentSlide - 1);
      startHeroTimer();
    });
    qs('.hero-next')?.addEventListener('click', () => {
      showSlide(currentSlide + 1);
      startHeroTimer();
    });
    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        showSlide(Number(dot.dataset.slide || 0));
        startHeroTimer();
      });
    });
    startHeroTimer();
  }

  qsa('.local-filter').forEach((form) => {
    form.addEventListener('submit', (event) => event.preventDefault());
  });

  const searchInput = qs('.search-box input[name="q"]') || qs('.category-search input');
  const filterList = qs('.filter-list');
  const emptyState = qs('.empty-state');
  let activeFilter = 'all';

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function runFilter() {
    if (!filterList) return;
    const query = normalize(searchInput ? searchInput.value : '');
    let visible = 0;
    qsa('[data-search]', filterList).forEach((item) => {
      const haystack = normalize(item.dataset.search);
      const category = item.dataset.category || '';
      const matchText = !query || haystack.includes(query);
      const matchCategory = activeFilter === 'all' || category === activeFilter;
      const show = matchText && matchCategory;
      item.hidden = !show;
      if (show) visible += 1;
    });
    if (emptyState) emptyState.hidden = visible !== 0;
  }

  if (searchInput && filterList) {
    const params = new URLSearchParams(window.location.search);
    const urlQuery = params.get('q');
    if (urlQuery) searchInput.value = urlQuery;
    searchInput.addEventListener('input', runFilter);
    runFilter();
  }

  qsa('.filter-chip').forEach((button) => {
    button.addEventListener('click', () => {
      activeFilter = button.dataset.filter || 'all';
      qsa('.filter-chip').forEach((chip) => chip.classList.toggle('active', chip === button));
      runFilter();
    });
  });

  function prepareVideo(player) {
    const video = qs('video', player);
    const source = player.dataset.video;
    if (!video || !source || video.dataset.ready === 'yes') return video;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls({
        maxBufferLength: 30,
        enableWorker: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      video.hlsInstance = hls;
    } else {
      video.src = source;
    }

    video.dataset.ready = 'yes';
    video.controls = true;
    return video;
  }

  function startVideo(player) {
    const video = prepareVideo(player);
    const cover = qs('.play-cover', player);
    if (!video) return;
    if (cover) cover.classList.add('hidden');
    video.play().catch(() => {
      if (cover) cover.classList.remove('hidden');
    });
  }

  qsa('.player-shell').forEach((player) => {
    const cover = qs('.play-cover', player);
    const video = qs('video', player);
    if (cover) {
      cover.addEventListener('click', () => startVideo(player));
    }
    if (video) {
      video.addEventListener('click', () => {
        if (video.paused) {
          startVideo(player);
        }
      });
    }
  });

  qsa('[data-play-now]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      const player = qs('.player-shell');
      if (player) {
        player.scrollIntoView({ behavior: 'smooth', block: 'center' });
        startVideo(player);
      }
    });
  });

  const backTop = qs('.back-top');
  if (backTop) {
    backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    window.addEventListener('scroll', () => {
      backTop.classList.toggle('show', window.scrollY > 420);
    }, { passive: true });
  }
})();
