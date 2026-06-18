(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function initMobileNav() {
    var toggle = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".mobile-nav");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dots button"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function initFilters() {
    var panel = document.querySelector("[data-filter-panel]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search-card]"));
    if (!panel || !cards.length) {
      return;
    }

    var search = panel.querySelector("[data-filter-search]");
    var region = panel.querySelector("[data-filter-region]");
    var type = panel.querySelector("[data-filter-type]");
    var year = panel.querySelector("[data-filter-year]");
    var reset = panel.querySelector("[data-filter-reset]");
    var count = panel.querySelector("[data-filter-count]");
    var empty = document.querySelector("[data-empty-state]");

    var params = new URLSearchParams(window.location.search);
    if (search && params.get("q")) {
      search.value = params.get("q");
    }

    function applyFilters() {
      var query = normalize(search && search.value);
      var regionValue = normalize(region && region.value);
      var typeValue = normalize(type && type.value);
      var yearValue = normalize(year && year.value);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute("data-title"));
        var cardRegion = normalize(card.getAttribute("data-region"));
        var cardType = normalize(card.getAttribute("data-type"));
        var cardYear = normalize(card.getAttribute("data-year"));
        var matched = true;

        if (query && haystack.indexOf(query) === -1) {
          matched = false;
        }
        if (regionValue && cardRegion !== regionValue) {
          matched = false;
        }
        if (typeValue && cardType !== typeValue) {
          matched = false;
        }
        if (yearValue && cardYear !== yearValue) {
          matched = false;
        }

        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = String(visible);
      }
      if (empty) {
        empty.classList.toggle("show", visible === 0);
      }
    }

    [search, region, type, year].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilters);
        control.addEventListener("change", applyFilters);
      }
    });

    if (reset) {
      reset.addEventListener("click", function () {
        if (search) search.value = "";
        if (region) region.value = "";
        if (type) type.value = "";
        if (year) year.value = "";
        applyFilters();
      });
    }

    applyFilters();
  }

  function initImageFallbacks() {
    Array.prototype.slice.call(document.querySelectorAll("img[data-fallback]")).forEach(function (img) {
      img.addEventListener("error", function () {
        var frame = img.closest(".poster-frame, .hero-slide, .rank-cover, .related-thumb");
        if (frame) {
          frame.classList.add("image-fallback");
        }
        img.style.display = "none";
      }, { once: true });
    });
  }

  function initPlayer() {
    var video = document.querySelector("video[data-hls-src]");
    if (!video) {
      return;
    }

    var src = video.getAttribute("data-hls-src");
    if (!src) {
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.ERROR, function (_event, data) {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          hls.destroy();
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
    }

    var playButton = document.querySelector("[data-play-button]");
    if (playButton) {
      playButton.addEventListener("click", function () {
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            video.controls = true;
          });
        }
      });
    }
  }

  ready(function () {
    initMobileNav();
    initHero();
    initFilters();
    initImageFallbacks();
    initPlayer();
  });
})();
