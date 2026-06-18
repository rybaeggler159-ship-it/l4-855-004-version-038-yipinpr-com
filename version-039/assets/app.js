(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initNavigation() {
    var toggle = document.querySelector(".menu-toggle");
    var mobileNav = document.querySelector(".mobile-nav");
    if (!toggle || !mobileNav) {
      return;
    }
    toggle.addEventListener("click", function () {
      var isOpen = mobileNav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  function initHero() {
    var hero = document.querySelector(".hero-banner");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var prev = hero.querySelector(".hero-prev");
    var next = hero.querySelector(".hero-next");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initListFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll(".filter-panel"));
    panels.forEach(function (panel) {
      var grid = panel.parentElement ? panel.parentElement.querySelector(".filterable-grid") : null;
      if (!grid) {
        return;
      }
      var search = panel.querySelector(".list-search");
      var year = panel.querySelector(".list-year");
      var region = panel.querySelector(".list-region");
      var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));

      function fillSelect(select, key) {
        if (!select || select.options.length > 1) {
          return;
        }
        var values = cards.map(function (card) {
          return card.getAttribute(key) || "";
        }).filter(Boolean).filter(function (value, position, array) {
          return array.indexOf(value) === position;
        }).sort().reverse();
        values.forEach(function (value) {
          var option = document.createElement("option");
          option.value = value;
          option.textContent = value;
          select.appendChild(option);
        });
      }

      fillSelect(year, "data-year");
      fillSelect(region, "data-region");

      function update() {
        var keyword = search ? search.value.trim().toLowerCase() : "";
        var selectedYear = year ? year.value : "";
        var selectedRegion = region ? region.value : "";
        cards.forEach(function (card) {
          var text = [
            card.getAttribute("data-title"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-region"),
            card.getAttribute("data-year")
          ].join(" ").toLowerCase();
          var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
          var matchesYear = !selectedYear || card.getAttribute("data-year") === selectedYear;
          var matchesRegion = !selectedRegion || (card.getAttribute("data-region") || "").indexOf(selectedRegion) !== -1;
          card.classList.toggle("hidden-by-filter", !(matchesKeyword && matchesYear && matchesRegion));
        });
      }

      [search, year, region].forEach(function (control) {
        if (control) {
          control.addEventListener("input", update);
          control.addEventListener("change", update);
        }
      });
    });
  }

  function initSearchPage() {
    var results = document.getElementById("searchResults");
    var status = document.querySelector(".search-status");
    if (!results || !window.SEARCH_MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";
    var heroInput = document.getElementById("searchInput");
    var liveInput = document.querySelector(".search-live-input");
    var typeSelect = document.querySelector(".search-type");
    var yearSelect = document.querySelector(".search-year");

    if (heroInput) {
      heroInput.value = initialQuery;
    }
    if (liveInput) {
      liveInput.value = initialQuery;
    }
    if (yearSelect && yearSelect.options.length <= 1) {
      var years = window.SEARCH_MOVIES.map(function (movie) {
        return movie.year || "";
      }).filter(Boolean).filter(function (value, position, array) {
        return array.indexOf(value) === position;
      }).sort().reverse();
      years.forEach(function (year) {
        var option = document.createElement("option");
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
      });
    }

    function movieCard(movie) {
      return [
        '<article class="movie-card">',
        '  <a href="./' + movie.file + '" class="movie-card-link">',
        '    <div class="movie-poster">',
        '      <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '      <span class="play-hover">▶</span>',
        '      <span class="duration-badge">' + escapeHtml(movie.duration) + '</span>',
        '    </div>',
        '    <div class="movie-card-body">',
        '      <h3>' + escapeHtml(movie.title) + '</h3>',
        '      <p>' + escapeHtml(movie.oneLine) + '</p>',
        '      <div class="movie-meta"><span>' + escapeHtml(movie.category) + '</span><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.score) + '</span></div>',
        '    </div>',
        '  </a>',
        '</article>'
      ].join("");
    }

    function escapeHtml(value) {
      return String(value || "").replace(/[&<>"]/g, function (item) {
        return {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "\"": "&quot;"
        }[item];
      });
    }

    function update() {
      var keyword = liveInput ? liveInput.value.trim().toLowerCase() : initialQuery.toLowerCase();
      var selectedType = typeSelect ? typeSelect.value : "";
      var selectedYear = yearSelect ? yearSelect.value : "";
      var matched = window.SEARCH_MOVIES.filter(function (movie) {
        var haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine].join(" ").toLowerCase();
        var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchesType = !selectedType || movie.type === selectedType;
        var matchesYear = !selectedYear || movie.year === selectedYear;
        return matchesKeyword && matchesType && matchesYear;
      }).slice(0, 120);

      results.innerHTML = matched.map(movieCard).join("");
      if (status) {
        status.textContent = matched.length ? "匹配结果" : "暂无匹配内容";
      }
    }

    [liveInput, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", update);
        control.addEventListener("change", update);
      }
    });

    update();
  }

  function initBackToTop() {
    var button = document.querySelector(".back-to-top");
    if (!button) {
      return;
    }
    function update() {
      button.classList.toggle("show", window.scrollY > 420);
    }
    button.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    window.addEventListener("scroll", update);
    update();
  }

  ready(function () {
    initNavigation();
    initHero();
    initListFilters();
    initSearchPage();
    initBackToTop();
  });
})();

function setupMoviePlayer(source) {
  var video = document.querySelector(".movie-player-video");
  var shell = document.querySelector(".player-shell");
  var cover = document.querySelector(".player-cover");
  var hlsInstance = null;

  if (!video || !shell || !cover || !source) {
    return;
  }

  function loadSource() {
    if (video.getAttribute("data-ready") === "true") {
      return Promise.resolve();
    }
    video.setAttribute("data-ready", "true");
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      return Promise.resolve();
    }
    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new Hls({ enableWorker: true, lowLatencyMode: true });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      return new Promise(function (resolve) {
        hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
          resolve();
        });
      });
    }
    video.src = source;
    return Promise.resolve();
  }

  function play() {
    shell.classList.add("playing");
    loadSource().then(function () {
      var playTask = video.play();
      if (playTask && typeof playTask.catch === "function") {
        playTask.catch(function () {
          shell.classList.remove("playing");
        });
      }
    });
  }

  cover.addEventListener("click", play);
  video.addEventListener("click", function () {
    if (video.paused) {
      play();
    }
  });
  video.addEventListener("play", function () {
    shell.classList.add("playing");
  });
  video.addEventListener("ended", function () {
    shell.classList.remove("playing");
  });
  window.addEventListener("beforeunload", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
