(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) return;
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) return;
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    if (!slides.length) return;
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function play() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function restart() {
      if (timer) window.clearInterval(timer);
      play();
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        restart();
      });
    });

    play();
  }

  function initSearchForms() {
    Array.prototype.slice.call(document.querySelectorAll("[data-search-form]")).forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var query = input ? input.value.trim() : "";
        var action = form.getAttribute("action") || "search.html";
        window.location.href = action + (query ? "?q=" + encodeURIComponent(query) : "");
      });
    });
  }

  function initFilters() {
    var input = document.querySelector("[data-filter-input]");
    var typeSelect = document.querySelector("[data-filter-type]");
    var yearSelect = document.querySelector("[data-filter-year]");
    var items = Array.prototype.slice.call(document.querySelectorAll("[data-filter-item]"));
    if (!items.length || !input || !typeSelect || !yearSelect) return;

    var types = [];
    var years = [];
    items.forEach(function (item) {
      var type = item.getAttribute("data-type") || "";
      var year = item.getAttribute("data-year") || "";
      if (type && types.indexOf(type) === -1) types.push(type);
      if (year && years.indexOf(year) === -1) years.push(year);
    });
    types.sort();
    years.sort().reverse();

    types.forEach(function (type) {
      var option = document.createElement("option");
      option.value = type;
      option.textContent = type;
      typeSelect.appendChild(option);
    });

    years.forEach(function (year) {
      var option = document.createElement("option");
      option.value = year;
      option.textContent = year;
      yearSelect.appendChild(option);
    });

    function apply() {
      var q = input.value.trim().toLowerCase();
      var selectedType = typeSelect.value;
      var selectedYear = yearSelect.value;
      items.forEach(function (item) {
        var haystack = [
          item.getAttribute("data-title"),
          item.getAttribute("data-type"),
          item.getAttribute("data-region"),
          item.getAttribute("data-year"),
          item.getAttribute("data-genre")
        ].join(" ").toLowerCase();
        var ok = (!q || haystack.indexOf(q) !== -1) &&
          (!selectedType || item.getAttribute("data-type") === selectedType) &&
          (!selectedYear || item.getAttribute("data-year") === selectedYear);
        item.style.display = ok ? "" : "none";
      });
    }

    input.addEventListener("input", apply);
    typeSelect.addEventListener("change", apply);
    yearSelect.addEventListener("change", apply);
  }

  function cardHtml(item) {
    return [
      '<article class="movie-card">',
      '<a class="card-link" href="' + item.u + '">',
      '<div class="card-poster">',
      '<img class="media-img" src="' + item.c + '" alt="' + escapeHtml(item.t) + '" loading="lazy" onerror="this.classList.add(\'is-empty\')">',
      '<div class="poster-shade"></div>',
      '<span class="play-chip">▶</span>',
      '<div class="poster-tags"><span class="tag-pill">' + escapeHtml(item.y) + '</span><span class="tag-pill">' + escapeHtml(item.r) + '</span></div>',
      '</div>',
      '<div class="card-body">',
      '<h3>' + escapeHtml(item.t) + '</h3>',
      '<p>' + escapeHtml(item.o) + '</p>',
      '<div class="card-meta"><span>' + escapeHtml(item.y) + '</span><span>' + escapeHtml(item.r) + '</span></div>',
      '</div>',
      '</a>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function initSearchPage() {
    var result = document.querySelector("[data-search-results]");
    if (!result || !window.SITE_SEARCH_INDEX) return;
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    var input = document.querySelector("[data-search-page-input]");
    var title = document.querySelector("[data-search-title]");
    var subtitle = document.querySelector("[data-search-subtitle]");
    if (input) input.value = query;
    if (!query) return;
    var q = query.toLowerCase();
    var matches = window.SITE_SEARCH_INDEX.filter(function (item) {
      return [item.t, item.r, item.tp, item.g, item.y, item.o].join(" ").toLowerCase().indexOf(q) !== -1;
    }).slice(0, 120);
    result.innerHTML = matches.map(cardHtml).join("");
    if (title) title.textContent = "搜索结果";
    if (subtitle) subtitle.textContent = query;
  }

  ready(function () {
    initMenu();
    initHero();
    initSearchForms();
    initFilters();
    initSearchPage();
  });
})();
