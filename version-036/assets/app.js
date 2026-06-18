(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dots button'));
  var activeSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === activeSlide);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === activeSlide);
    });
  }

  if (slides.length) {
    showSlide(0);
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });
    setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5200);
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.searchable-card'));
  var emptyState = document.querySelector('.empty-state');

  function applyFilter(value) {
    var keyword = (value || '').trim().toLowerCase();
    var shown = 0;

    cards.forEach(function (card) {
      var haystack = [
        card.getAttribute('data-title') || '',
        card.getAttribute('data-genre') || '',
        card.getAttribute('data-region') || '',
        card.getAttribute('data-year') || '',
        card.textContent || ''
      ].join(' ').toLowerCase();
      var matched = !keyword || haystack.indexOf(keyword) !== -1;
      card.style.display = matched ? '' : 'none';
      if (matched) {
        shown += 1;
      }
    });

    if (emptyState) {
      emptyState.style.display = shown ? 'none' : 'block';
    }
  }

  if (filterInput) {
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    filterInput.value = initial;
    applyFilter(initial);
    filterInput.addEventListener('input', function () {
      applyFilter(filterInput.value);
    });
  }

  var backTop = document.createElement('button');
  backTop.className = 'back-top';
  backTop.type = 'button';
  backTop.textContent = '↑';
  document.body.appendChild(backTop);
  backTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  window.addEventListener('scroll', function () {
    backTop.classList.toggle('show', window.scrollY > 360);
  });
})();
