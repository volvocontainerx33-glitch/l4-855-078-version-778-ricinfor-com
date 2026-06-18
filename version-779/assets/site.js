(function () {
  var menuButton = document.querySelector("[data-menu-toggle]");
  var mobilePanel = document.querySelector("[data-mobile-panel]");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function () {
      mobilePanel.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var next = hero.querySelector("[data-hero-next]");
    var prev = hero.querySelector("[data-hero-prev]");
    var active = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }

      active = (index + slides.length) % slides.length;

      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === active);
      });

      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === active);
      });
    }

    function start() {
      stop();
      timer = setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    if (next) {
      next.addEventListener("click", function () {
        show(active + 1);
        start();
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(active - 1);
        start();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupFilters() {
    var input = document.querySelector("[data-filter-input]");
    var items = Array.prototype.slice.call(document.querySelectorAll("[data-search]"));
    var empty = document.querySelector("[data-empty-message]");
    var query = new URLSearchParams(location.search).get("q");

    function normalize(value) {
      return String(value || "").toLowerCase().trim();
    }

    function apply(value) {
      var keyword = normalize(value);
      var visible = 0;

      items.forEach(function (item) {
        var haystack = normalize(item.getAttribute("data-search"));
        var matched = !keyword || haystack.indexOf(keyword) !== -1;
        item.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    if (input) {
      if (query) {
        input.value = query;
      }

      input.addEventListener("input", function () {
        apply(input.value);
      });

      apply(input.value);
    }
  }

  function setupPlayer() {
    var shells = Array.prototype.slice.call(document.querySelectorAll(".player-shell[data-video]"));

    shells.forEach(function (shell) {
      var video = shell.querySelector("video");
      var mask = shell.querySelector(".player-mask");
      var button = shell.querySelector(".play-action");
      var url = shell.getAttribute("data-video");
      var hls = null;
      var ready = false;

      function load() {
        if (!video || !url || ready) {
          return;
        }

        ready = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = url;
        } else if (typeof Hls !== "undefined" && Hls.isSupported()) {
          hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(url);
          hls.attachMedia(video);
        } else {
          video.src = url;
        }
      }

      function play() {
        load();

        if (mask) {
          mask.classList.add("is-hidden");
        }

        if (video) {
          var promise = video.play();
          if (promise && typeof promise.catch === "function") {
            promise.catch(function () {});
          }
        }
      }

      if (mask) {
        mask.addEventListener("click", play);
      }

      if (button) {
        button.addEventListener("click", function (event) {
          event.preventDefault();
          play();
        });
      }

      if (video) {
        video.addEventListener("play", function () {
          if (mask) {
            mask.classList.add("is-hidden");
          }
        });
      }

      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupHero();
    setupFilters();
    setupPlayer();
  });
})();
