function initMoviePlayer(videoId, buttonId, overlayId, sourceUrl) {
  var video = document.getElementById(videoId);
  var button = document.getElementById(buttonId);
  var overlay = document.getElementById(overlayId);
  var started = false;
  var instance = null;

  if (!video || !button || !overlay || !sourceUrl) {
    return;
  }

  function attachSource() {
    if (started) {
      return;
    }

    started = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = sourceUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      instance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      instance.loadSource(sourceUrl);
      instance.attachMedia(video);
    } else {
      video.src = sourceUrl;
    }
  }

  function playMovie() {
    attachSource();
    overlay.classList.add('hide');
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {});
    }
  }

  button.addEventListener('click', playMovie);
  overlay.addEventListener('click', playMovie);
  video.addEventListener('click', function () {
    if (video.paused) {
      playMovie();
    }
  });
  video.addEventListener('play', function () {
    overlay.classList.add('hide');
  });
  video.addEventListener('pause', function () {
    if (!video.ended) {
      overlay.classList.remove('hide');
    }
  });
  window.addEventListener('pagehide', function () {
    if (instance) {
      instance.destroy();
      instance = null;
    }
  });
}
