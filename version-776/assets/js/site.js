(function () {
  var header = document.querySelector('[data-header]');
  var toggle = document.querySelector('[data-menu-toggle]');

  function updateHeader() {
    if (!header) {
      return;
    }
    if (window.scrollY > 24) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  if (toggle && header) {
    toggle.addEventListener('click', function () {
      header.classList.toggle('menu-open');
    });
  }

  document.querySelectorAll('.poster-wrap img, .detail-poster img').forEach(function (img) {
    img.addEventListener('error', function () {
      var parent = img.closest('.poster-wrap, .detail-poster');
      if (parent) {
        parent.classList.add('image-fallback');
      }
    });
  });

  document.querySelectorAll('.hero-image').forEach(function (img) {
    img.addEventListener('error', function () {
      img.classList.add('is-missing');
    });
  });

  document.querySelectorAll('.hero').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var index = Math.max(0, slides.findIndex(function (slide) {
      return slide.classList.contains('is-active');
    }));

    function show(next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
  });

  function textOf(value) {
    return String(value || '').toLowerCase().trim();
  }

  document.querySelectorAll('[data-filter-page]').forEach(function (panel) {
    var container = panel.parentElement || document;
    var grid = container.querySelector('[data-movie-grid]');
    if (!grid) {
      return;
    }

    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
    var input = panel.querySelector('#searchInput');
    var genre = panel.querySelector('#genreFilter');
    var year = panel.querySelector('#yearFilter');
    var region = panel.querySelector('#regionFilter');
    var type = panel.querySelector('#typeFilter');
    var sort = panel.querySelector('#sortFilter');
    var status = panel.querySelector('[data-filter-status]');
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');

    if (query && input) {
      input.value = query;
    }

    function apply() {
      var q = textOf(input && input.value);
      var g = textOf(genre && genre.value);
      var y = textOf(year && year.value);
      var r = textOf(region && region.value);
      var t = textOf(type && type.value);
      var visible = 0;
      var ordered = cards.slice();

      if (sort && sort.value === 'rating') {
        ordered.sort(function (a, b) {
          return Number(b.dataset.rating) - Number(a.dataset.rating);
        });
      } else if (sort && sort.value === 'views') {
        ordered.sort(function (a, b) {
          return Number(b.dataset.views) - Number(a.dataset.views);
        });
      } else if (sort && sort.value === 'date') {
        ordered.sort(function (a, b) {
          return String(b.dataset.date).localeCompare(String(a.dataset.date));
        });
      }

      ordered.forEach(function (card) {
        grid.appendChild(card);
        var haystack = textOf([
          card.dataset.title,
          card.dataset.genre,
          card.dataset.region,
          card.dataset.type,
          card.textContent
        ].join(' '));
        var ok = true;
        if (q && haystack.indexOf(q) === -1) {
          ok = false;
        }
        if (g && textOf(card.dataset.genre).indexOf(g) === -1) {
          ok = false;
        }
        if (y && textOf(card.dataset.year) !== y) {
          ok = false;
        }
        if (r && textOf(card.dataset.region) !== r) {
          ok = false;
        }
        if (t && textOf(card.dataset.type) !== t) {
          ok = false;
        }
        card.hidden = !ok;
        if (ok) {
          visible += 1;
        }
      });

      var empty = grid.querySelector('.empty-state');
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
      if (status) {
        status.textContent = (q || g || y || r || t) ? '已匹配 ' + visible + ' 部影片' : '全部影片';
      }
    }

    [input, genre, year, region, type, sort].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    apply();
  });
})();
