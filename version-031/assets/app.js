(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  document.querySelectorAll('[data-site-search]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input[name="q"]');
      var query = input ? input.value.trim() : '';
      if (query) {
        window.location.href = 'all-movies.html?q=' + encodeURIComponent(query);
      }
    });
  });

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var active = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === active);
      });
    }

    function startHero() {
      stopHero();
      timer = window.setInterval(function () {
        showSlide(active + 1);
      }, 5200);
    }

    function stopHero() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(active - 1);
        startHero();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(active + 1);
        startHero();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        startHero();
      });
    });

    hero.addEventListener('mouseenter', stopHero);
    hero.addEventListener('mouseleave', startHero);
    showSlide(0);
    startHero();
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var filterRegion = document.querySelector('[data-filter-region]');
  var filterYear = document.querySelector('[data-filter-year]');
  var filterCategory = document.querySelector('[data-filter-category]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.js-card'));
  var emptyMessage = document.querySelector('[data-empty-message]');

  if (filterInput && cards.length) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    if (query) {
      filterInput.value = query;
    }

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function filterCards() {
      var term = normalize(filterInput.value);
      var region = filterRegion ? normalize(filterRegion.value) : '';
      var year = filterYear ? normalize(filterYear.value) : '';
      var category = filterCategory ? normalize(filterCategory.value) : '';
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize(card.textContent);
        var cardRegion = normalize(card.getAttribute('data-region'));
        var cardYear = normalize(card.getAttribute('data-year'));
        var cardCategory = normalize(card.getAttribute('data-category'));
        var matchTerm = !term || text.indexOf(term) !== -1;
        var matchRegion = !region || cardRegion === region;
        var matchYear = !year || cardYear === year;
        var matchCategory = !category || cardCategory === category;
        var matched = matchTerm && matchRegion && matchYear && matchCategory;
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (emptyMessage) {
        emptyMessage.classList.toggle('show', visible === 0);
      }
    }

    [filterInput, filterRegion, filterYear, filterCategory].forEach(function (control) {
      if (control) {
        control.addEventListener('input', filterCards);
        control.addEventListener('change', filterCards);
      }
    });

    filterCards();
  }
})();
