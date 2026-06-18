(function() {
  var header = document.querySelector("[data-site-header]");
  var menuButton = document.querySelector("[data-menu-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  function updateHeader() {
    if (!header) {
      return;
    }
    if (window.scrollY > 48) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  }

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function() {
      mobileNav.classList.toggle("is-open");
    });
  }

  var carousel = document.querySelector("[data-hero-carousel]");
  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    var next = carousel.querySelector("[data-hero-next]");
    var prev = carousel.querySelector("[data-hero-prev]");
    var active = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === active);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === active);
      });
    }

    function startTimer() {
      clearInterval(timer);
      timer = setInterval(function() {
        showSlide(active + 1);
      }, 5600);
    }

    if (next) {
      next.addEventListener("click", function() {
        showSlide(active + 1);
        startTimer();
      });
    }

    if (prev) {
      prev.addEventListener("click", function() {
        showSlide(active - 1);
        startTimer();
      });
    }

    dots.forEach(function(dot) {
      dot.addEventListener("click", function() {
        showSlide(Number(dot.getAttribute("data-hero-dot") || 0));
        startTimer();
      });
    });

    showSlide(0);
    startTimer();
  }

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll(".movie-search-input"));
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll(".filter-chip"));
  var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card], .category-overview-card"));
  var currentFilter = "";

  function normalizeText(value) {
    return String(value || "").toLowerCase().trim();
  }

  function cardHaystack(card) {
    return normalizeText([
      card.getAttribute("data-title"),
      card.getAttribute("data-year"),
      card.getAttribute("data-region"),
      card.getAttribute("data-genre"),
      card.getAttribute("data-tags"),
      card.textContent
    ].join(" "));
  }

  function applyFilters() {
    var query = normalizeText(searchInputs.map(function(input) {
      return input.value;
    }).join(" "));
    cards.forEach(function(card) {
      var text = cardHaystack(card);
      var matchesQuery = !query || text.indexOf(query) !== -1;
      var matchesChip = !currentFilter || text.indexOf(normalizeText(currentFilter)) !== -1;
      card.classList.toggle("is-filter-hidden", !(matchesQuery && matchesChip));
    });
  }

  searchInputs.forEach(function(input) {
    input.addEventListener("input", applyFilters);
  });

  filterButtons.forEach(function(button) {
    button.addEventListener("click", function() {
      filterButtons.forEach(function(item) {
        item.classList.remove("is-active");
      });
      button.classList.add("is-active");
      currentFilter = button.getAttribute("data-filter") || "";
      applyFilters();
    });
  });

  var forms = Array.prototype.slice.call(document.querySelectorAll("[data-search-form]"));
  forms.forEach(function(form) {
    form.addEventListener("submit", function(event) {
      event.preventDefault();
      applyFilters();
    });
  });

  var params = new URLSearchParams(window.location.search);
  var search = params.get("search");
  if (search && searchInputs.length) {
    searchInputs.forEach(function(input) {
      input.value = search;
    });
    applyFilters();
  }
})();

function startMoviePlayer(streamUrl) {
  var video = document.querySelector("[data-player-video]");
  var cover = document.querySelector("[data-player-cover]");
  var button = document.querySelector("[data-player-button]");
  var loaded = false;
  var hls = null;

  if (!video || !streamUrl) {
    return;
  }

  function hideCover() {
    if (cover) {
      cover.classList.add("is-hidden");
    }
  }

  function beginPlayback() {
    if (!loaded) {
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          maxBufferLength: 60,
          enableWorker: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    hideCover();
    video.controls = true;
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function() {});
    }
  }

  if (cover) {
    cover.addEventListener("click", beginPlayback);
  }

  if (button) {
    button.addEventListener("click", beginPlayback);
  }

  video.addEventListener("click", function() {
    if (!loaded) {
      beginPlayback();
    }
  });

  video.addEventListener("play", hideCover);
}
