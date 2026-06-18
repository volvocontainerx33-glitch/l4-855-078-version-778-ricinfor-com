(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupHeader() {
    var header = document.querySelector("[data-header]");
    if (!header) {
      return;
    }
    function sync() {
      if (window.scrollY > 20) {
        header.classList.add("is-scrolled");
      } else {
        header.classList.remove("is-scrolled");
      }
    }
    sync();
    window.addEventListener("scroll", sync, { passive: true });
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setupForms() {
    var forms = document.querySelectorAll("[data-search-form]");
    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q'], input[type='search']");
        var value = input ? input.value.trim() : "";
        var target = "./search.html";
        if (value) {
          target += "?q=" + encodeURIComponent(value);
        }
        window.location.href = target;
      });
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (!slides.length || !dots.length) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(next) {
      index = (next + slides.length) % slides.length;
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
      }, 5200);
    }
    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });
    var hero = document.querySelector("[data-hero]");
    if (hero) {
      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
    }
    show(0);
    start();
  }

  function setupLocalSearch() {
    var grid = document.querySelector("[data-card-list]");
    if (!grid) {
      return;
    }
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".js-search-card"));
    var input = document.querySelector("[data-local-search] input") || document.querySelector("[data-search-page-form] input");
    var empty = document.querySelector("[data-empty-state]");
    var chips = Array.prototype.slice.call(document.querySelectorAll("[data-filter-chip]"));
    var url = new URL(window.location.href);
    var activeChip = "";
    if (input && url.searchParams.get("q")) {
      input.value = url.searchParams.get("q");
    }
    function cardText(card) {
      return [
        card.getAttribute("data-title"),
        card.getAttribute("data-tags"),
        card.getAttribute("data-genre"),
        card.getAttribute("data-category"),
        card.textContent
      ].join(" ").toLowerCase();
    }
    function filter() {
      var query = input ? input.value.trim().toLowerCase() : "";
      var shown = 0;
      cards.forEach(function (card) {
        var text = cardText(card);
        var ok = (!query || text.indexOf(query) !== -1) && (!activeChip || text.indexOf(activeChip.toLowerCase()) !== -1);
        card.style.display = ok ? "" : "none";
        if (ok) {
          shown += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", shown === 0);
      }
    }
    if (input) {
      input.addEventListener("input", filter);
    }
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        activeChip = activeChip === chip.textContent.trim() ? "" : chip.textContent.trim();
        chips.forEach(function (item) {
          item.classList.toggle("is-active", item === chip && activeChip !== "");
        });
        filter();
      });
    });
    filter();
  }

  ready(function () {
    setupHeader();
    setupMenu();
    setupForms();
    setupHero();
    setupLocalSearch();
  });
})();
