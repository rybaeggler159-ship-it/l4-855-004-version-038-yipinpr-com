(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");

    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        panel.classList.toggle("is-open");
        document.body.classList.toggle("is-menu-open", panel.classList.contains("is-open"));
      });
    }

    document.querySelectorAll("[data-hero-slider]").forEach(function (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
      var current = 0;

      function show(index) {
        if (!slides.length) return;
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === current);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === current);
        });
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(parseInt(dot.getAttribute("data-hero-dot"), 10) || 0);
        });
      });

      if (slides.length > 1) {
        setInterval(function () {
          show(current + 1);
        }, 5200);
      }
    });

    document.querySelectorAll("[data-filter-form]").forEach(function (form) {
      var grid = form.parentElement.querySelector("[data-filter-grid]") || document.querySelector("[data-filter-grid]");
      if (!grid) return;
      var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
      var params = new URLSearchParams(window.location.search);
      var inputQ = form.querySelector("[name='q']");
      if (inputQ && params.get("q")) {
        inputQ.value = params.get("q");
      }

      function apply() {
        var q = normalize(form.querySelector("[name='q']") && form.querySelector("[name='q']").value);
        var year = normalize(form.querySelector("[name='year']") && form.querySelector("[name='year']").value);
        var region = normalize(form.querySelector("[name='region']") && form.querySelector("[name='region']").value);
        var category = normalize(form.querySelector("[name='category']") && form.querySelector("[name='category']").value);

        cards.forEach(function (card) {
          var text = normalize(card.getAttribute("data-search"));
          var cardYear = normalize(card.getAttribute("data-year"));
          var cardRegion = normalize(card.getAttribute("data-region"));
          var cardCategory = normalize(card.getAttribute("data-category"));
          var matched = (!q || text.indexOf(q) !== -1) &&
            (!year || cardYear.indexOf(year) !== -1) &&
            (!region || cardRegion.indexOf(region) !== -1) &&
            (!category || cardCategory === category);
          card.style.display = matched ? "" : "none";
        });
      }

      form.addEventListener("submit", function (event) {
        event.preventDefault();
        apply();
      });

      form.querySelectorAll("input, select").forEach(function (input) {
        input.addEventListener("input", apply);
        input.addEventListener("change", apply);
      });

      var reset = form.querySelector("[data-filter-reset]");
      if (reset) {
        reset.addEventListener("click", function () {
          form.reset();
          apply();
        });
      }

      apply();
    });
  });
})();

function initMoviePlayer(url, id) {
  var video = document.getElementById(id);
  if (!video || !url) return;
  var shell = video.closest(".video-shell");
  var button = shell ? shell.querySelector(".play-cover") : null;
  var prepared = false;
  var hls = null;

  function prepare() {
    if (prepared) return;
    prepared = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
      video.load();
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(url);
      hls.attachMedia(video);
      return;
    }

    video.src = url;
    video.load();
  }

  function play() {
    prepare();
    if (button) {
      button.classList.add("is-hidden");
    }
    var action = video.play();
    if (action && typeof action.catch === "function") {
      action.catch(function () {
        window.setTimeout(function () {
          video.play().catch(function () {});
        }, 400);
      });
    }
  }

  if (button) {
    button.addEventListener("click", play);
  }

  video.addEventListener("click", function () {
    if (video.paused) {
      play();
    }
  });

  video.addEventListener("play", function () {
    if (button) {
      button.classList.add("is-hidden");
    }
  });

  video.addEventListener("ended", function () {
    if (button) {
      button.classList.remove("is-hidden");
    }
  });

  window.addEventListener("pagehide", function () {
    if (hls && typeof hls.destroy === "function") {
      hls.destroy();
    }
  });
}
