(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  function mountPlayer(box) {
    var video = box.querySelector("video");
    var button = box.querySelector(".play-layer");
    var streamUrl = box.getAttribute("data-stream-url");
    var loaded = false;
    var hls = null;

    if (!video || !streamUrl) {
      return;
    }

    function playVideo() {
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {});
      }
    }

    function loadStream() {
      if (loaded) {
        playVideo();
        return;
      }

      loaded = true;
      box.classList.add("is-loading");

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        video.addEventListener("loadedmetadata", function () {
          box.classList.remove("is-loading");
          playVideo();
        }, { once: true });
        video.load();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls();
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        if (window.Hls.Events && window.Hls.Events.MANIFEST_PARSED) {
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            box.classList.remove("is-loading");
            playVideo();
          });
        } else {
          window.setTimeout(function () {
            box.classList.remove("is-loading");
            playVideo();
          }, 500);
        }
        return;
      }

      video.src = streamUrl;
      video.addEventListener("loadedmetadata", function () {
        box.classList.remove("is-loading");
        playVideo();
      }, { once: true });
      video.load();
    }

    function start(event) {
      if (event) {
        event.preventDefault();
      }
      box.classList.add("is-playing");
      loadStream();
    }

    if (button) {
      button.addEventListener("click", start);
    }

    video.addEventListener("play", function () {
      box.classList.add("is-playing");
    });

    video.addEventListener("error", function () {
      box.classList.remove("is-loading");
    });

    window.addEventListener("beforeunload", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  }

  ready(function () {
    Array.prototype.slice.call(document.querySelectorAll(".player-box")).forEach(mountPlayer);
  });
})();
