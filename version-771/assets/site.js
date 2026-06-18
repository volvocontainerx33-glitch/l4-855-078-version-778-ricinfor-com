(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  function escapeHTML(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setupHeader() {
    var header = document.querySelector("[data-header]");
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");

    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        toggle.classList.toggle("is-open");
        panel.classList.toggle("is-open");
      });
    }

    if (header) {
      var onScroll = function () {
        header.classList.toggle("is-scrolled", window.scrollY > 20);
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
    }
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function activate(nextIndex) {
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

    function schedule() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        activate(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        activate(Number(dot.getAttribute("data-hero-dot")) || 0);
        schedule();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        activate(index - 1);
        schedule();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        activate(index + 1);
        schedule();
      });
    }

    activate(0);
    schedule();
  }

  function filterGrid(targetSelector, query, year) {
    var grid = document.querySelector(targetSelector);
    if (!grid) {
      return;
    }

    var cards = Array.prototype.slice.call(grid.querySelectorAll(".searchable-card"));
    var term = String(query || "").trim().toLowerCase();
    var yearValue = String(year || "").trim();

    cards.forEach(function (card) {
      var haystack = [
        card.getAttribute("data-title"),
        card.getAttribute("data-genre"),
        card.getAttribute("data-region"),
        card.getAttribute("data-year")
      ].join(" ").toLowerCase();
      var yearMatches = !yearValue || card.getAttribute("data-year") === yearValue;
      var textMatches = !term || haystack.indexOf(term) !== -1;
      card.hidden = !(yearMatches && textMatches);
    });
  }

  function setupLocalFilters() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-local-search]"));
    var selects = Array.prototype.slice.call(document.querySelectorAll("[data-filter-select]"));

    inputs.forEach(function (input) {
      var selector = input.getAttribute("data-local-search");
      input.addEventListener("input", function () {
        var select = document.querySelector('[data-filter-select="' + selector + '"]');
        filterGrid(selector, input.value, select ? select.value : "");
      });
    });

    selects.forEach(function (select) {
      var selector = select.getAttribute("data-filter-select");
      select.addEventListener("change", function () {
        var input = document.querySelector('[data-local-search="' + selector + '"]');
        filterGrid(selector, input ? input.value : "", select.value);
      });
    });
  }

  function ensureSearchLayer() {
    var layer = document.querySelector("[data-search-layer]");
    if (layer) {
      return layer;
    }

    layer = document.createElement("div");
    layer.className = "search-layer";
    layer.setAttribute("data-search-layer", "");
    layer.innerHTML = '<div class="search-backdrop" data-search-close></div><section class="search-panel" role="dialog" aria-modal="true" aria-label="搜索结果"><button class="search-close" type="button" data-search-close>×</button><h2>搜索结果</h2><div class="search-result-grid" data-search-results></div></section>';
    document.body.appendChild(layer);

    Array.prototype.slice.call(layer.querySelectorAll("[data-search-close]")).forEach(function (button) {
      button.addEventListener("click", function () {
        layer.classList.remove("is-open");
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        layer.classList.remove("is-open");
      }
    });

    return layer;
  }

  function runGlobalSearch(query) {
    var term = String(query || "").trim().toLowerCase();
    var layer = ensureSearchLayer();
    var results = layer.querySelector("[data-search-results]");
    var data = Array.isArray(window.MovieSearchData) ? window.MovieSearchData : [];
    var matches = data.filter(function (item) {
      var haystack = [item.title, item.year, item.region, item.genre, item.category].join(" ").toLowerCase();
      return term && haystack.indexOf(term) !== -1;
    }).slice(0, 24);

    if (!term) {
      results.innerHTML = '<p class="empty-result">请输入影片名称、地区、年份或类型。</p>';
    } else if (!matches.length) {
      results.innerHTML = '<p class="empty-result">没有找到匹配影片。</p>';
    } else {
      results.innerHTML = matches.map(function (item) {
        return '<a class="search-result-card" href="' + escapeHTML(item.url) + '"><img src="' + escapeHTML(item.cover) + '" alt="' + escapeHTML(item.title) + '海报"><span><strong>' + escapeHTML(item.title) + '</strong><em>' + escapeHTML(item.year) + ' · ' + escapeHTML(item.region) + ' · ' + escapeHTML(item.genre) + '</em><small>' + escapeHTML(item.description) + '</small></span></a>';
      }).join("");
    }

    layer.classList.add("is-open");
  }

  function setupGlobalSearch() {
    Array.prototype.slice.call(document.querySelectorAll("[data-global-search]")).forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector('input[type="search"]');
        runGlobalSearch(input ? input.value : "");
      });
    });
  }

  ready(function () {
    setupHeader();
    setupHero();
    setupLocalFilters();
    setupGlobalSearch();
  });
})();
