(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function card(movie) {
    return [
      '<a class="movie-card movie-card-medium" href="' + escapeHtml(movie.url) + '">',
      '  <span class="poster-wrap">',
      '    <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="year-badge">' + escapeHtml(movie.year) + '</span>',
      '  </span>',
      '  <span class="movie-body">',
      '    <strong>' + escapeHtml(movie.title) + '</strong>',
      '    <span class="movie-desc">' + escapeHtml(movie.oneLine) + '</span>',
      '    <span class="movie-meta">',
      '      <em>' + escapeHtml(movie.region) + '</em>',
      '      <small>' + escapeHtml(movie.type) + '</small>',
      '      <small>' + escapeHtml(movie.genre) + '</small>',
      '    </span>',
      '  </span>',
      '</a>'
    ].join("");
  }

  function setupMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
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
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });
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
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupLocalFilter() {
    var input = document.querySelector("[data-card-filter]");
    if (!input) {
      return;
    }
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    input.addEventListener("input", function () {
      var q = input.value.trim().toLowerCase();
      cards.forEach(function (item) {
        var text = (item.getAttribute("data-search") || "").toLowerCase();
        item.classList.toggle("is-hidden-by-filter", q && text.indexOf(q) === -1);
      });
    });
  }

  function setupSearchPage() {
    var root = document.querySelector('[data-page="search"]');
    if (!root || !window.siteMovies) {
      return;
    }
    var input = document.getElementById("searchInput");
    var region = document.getElementById("regionFilter");
    var type = document.getElementById("typeFilter");
    var year = document.getElementById("yearFilter");
    var results = document.getElementById("searchResults");
    var title = document.getElementById("searchTitle");
    var count = document.getElementById("searchCount");
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";

    function fillSelect(select, values) {
      values.forEach(function (value) {
        var option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
      });
    }

    function unique(key) {
      var set = new Set(window.siteMovies.map(function (movie) {
        return movie[key];
      }).filter(Boolean));
      return Array.from(set).sort(function (a, b) {
        return String(b).localeCompare(String(a), "zh-CN");
      });
    }

    function render() {
      var q = input.value.trim().toLowerCase();
      var regionValue = region.value;
      var typeValue = type.value;
      var yearValue = year.value;
      var filtered = window.siteMovies.filter(function (movie) {
        var haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine].join(" ").toLowerCase();
        return (!q || haystack.indexOf(q) !== -1) &&
          (!regionValue || movie.region === regionValue) &&
          (!typeValue || movie.type === typeValue) &&
          (!yearValue || String(movie.year) === yearValue);
      }).slice(0, 240);
      title.textContent = q ? "搜索结果" : "精选结果";
      count.textContent = filtered.length ? "找到 " + filtered.length + " 部影片" : "暂无匹配内容";
      results.innerHTML = filtered.map(card).join("");
    }

    fillSelect(region, unique("region"));
    fillSelect(type, unique("type"));
    fillSelect(year, unique("year"));
    input.value = initial;
    [input, region, type, year].forEach(function (el) {
      el.addEventListener("input", render);
      el.addEventListener("change", render);
    });
    render();
  }

  function setupPlayShortcut() {
    var shortcut = document.querySelector("[data-play-shortcut]");
    if (!shortcut) {
      return;
    }
    shortcut.addEventListener("click", function (event) {
      event.preventDefault();
      var overlay = document.querySelector(".player-overlay");
      if (overlay) {
        overlay.click();
      }
      var player = document.querySelector(".player-card");
      if (player) {
        player.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  }

  window.initMoviePlayer = function (source) {
    var video = document.querySelector('[data-player="main"]');
    var overlay = document.querySelector(".player-overlay");
    var hlsInstance = null;
    var attached = false;

    if (!video) {
      return;
    }

    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          maxBufferLength: 30,
          backBufferLength: 30,
          enableWorker: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function play() {
      attach();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener("click", play);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });
    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  ready(function () {
    setupMenu();
    setupHero();
    setupLocalFilter();
    setupSearchPage();
    setupPlayShortcut();
  });
})();
