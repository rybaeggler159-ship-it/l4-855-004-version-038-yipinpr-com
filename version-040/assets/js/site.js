(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(text) {
    return String(text || "").toLowerCase().trim();
  }

  document.addEventListener("DOMContentLoaded", function () {
    var menuButton = qs("[data-menu-toggle]");
    var mobilePanel = qs("[data-mobile-panel]");
    if (menuButton && mobilePanel) {
      menuButton.addEventListener("click", function () {
        mobilePanel.classList.toggle("is-open");
      });
    }

    var backtop = qs("[data-backtop]");
    if (backtop) {
      window.addEventListener("scroll", function () {
        if (window.scrollY > 360) {
          backtop.classList.add("is-visible");
        } else {
          backtop.classList.remove("is-visible");
        }
      });
      backtop.addEventListener("click", function () {
        window.scrollTo({
          top: 0,
          behavior: "smooth"
        });
      });
    }

    qsa("[data-carousel]").forEach(function (carousel) {
      var slides = qsa("[data-slide]", carousel);
      var dots = qsa("[data-dot]", carousel);
      var current = 0;
      var timer = null;

      function activate(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
        });
      }

      function schedule() {
        if (timer) {
          clearInterval(timer);
        }
        timer = setInterval(function () {
          activate(current + 1);
        }, 5200);
      }

      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          activate(index);
          schedule();
        });
      });

      activate(0);
      schedule();
    });

    qsa("[data-filter-input]").forEach(function (input) {
      var target = qs(input.getAttribute("data-filter-input"));
      var empty = qs(input.getAttribute("data-empty-target"));
      if (!target) {
        return;
      }
      var cards = qsa("[data-card]", target);
      input.addEventListener("input", function () {
        var value = normalize(input.value);
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-tags"),
            card.getAttribute("data-year")
          ].join(" "));
          var matched = !value || haystack.indexOf(value) !== -1;
          card.style.display = matched ? "" : "none";
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.style.display = visible ? "none" : "block";
        }
      });
    });

    var searchRoot = qs("[data-search-results]");
    if (searchRoot && typeof movieSearchIndex !== "undefined") {
      var form = qs("[data-search-form]");
      var input = qs("[data-search-query]");
      var params = new URLSearchParams(window.location.search);
      var initial = params.get("q") || "";
      if (input) {
        input.value = initial;
      }

      function card(item) {
        return [
          '<article class="movie-card" data-card>',
          '<a class="card-cover" href="' + item.url + '" aria-label="' + escapeHtml(item.title) + '">',
          '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
          '<span class="card-duration">' + escapeHtml(item.duration) + '</span>',
          '</a>',
          '<div class="card-body">',
          '<div class="card-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.year) + '</span></div>',
          '<h3><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h3>',
          '<p>' + escapeHtml(item.text) + '</p>',
          '<div class="tag-row">' + item.tags.slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
          }).join("") + '</div>',
          '</div>',
          '</article>'
        ].join("");
      }

      function render(value) {
        var keyword = normalize(value);
        var list = movieSearchIndex;
        if (keyword) {
          list = movieSearchIndex.filter(function (item) {
            return normalize([
              item.title,
              item.region,
              item.year,
              item.genre,
              item.tags.join(" "),
              item.text
            ].join(" ")).indexOf(keyword) !== -1;
          });
        }
        list = list.slice(0, 80);
        searchRoot.innerHTML = list.map(card).join("");
        var empty = qs("[data-search-empty]");
        if (empty) {
          empty.style.display = list.length ? "none" : "block";
        }
      }

      if (form && input) {
        form.addEventListener("submit", function (event) {
          event.preventDefault();
          var value = input.value.trim();
          var url = value ? "./search.html?q=" + encodeURIComponent(value) : "./search.html";
          window.history.replaceState(null, "", url);
          render(value);
        });
        input.addEventListener("input", function () {
          render(input.value);
        });
      }
      render(initial);
    }
  });

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  window.initMoviePlayer = function (videoId, overlayId, source) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    var loaded = false;
    var hls = null;

    if (!video) {
      return;
    }

    function load() {
      if (loaded) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new Hls();
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
      loaded = true;
    }

    function play() {
      load();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
      if (!loaded) {
        play();
      }
    });

    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });

    window.addEventListener("pagehide", function () {
      if (hls && hls.destroy) {
        hls.destroy();
      }
    });
  };
})();
