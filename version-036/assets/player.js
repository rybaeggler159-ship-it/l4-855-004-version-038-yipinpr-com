(function () {
  var video = document.getElementById('movie-player');
  var button = document.querySelector('[data-play-button]');
  var source = document.querySelector('[data-video-src]');

  if (!video || !button || !source) {
    return;
  }

  var src = source.textContent.trim();
  var started = false;

  function attachSource() {
    if (started) {
      return;
    }

    started = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ enableWorker: true });
      hls.loadSource(src);
      hls.attachMedia(video);
    } else {
      video.src = src;
    }
  }

  function playVideo() {
    attachSource();
    button.classList.add('is-hidden');
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  }

  button.addEventListener('click', playVideo);
  video.addEventListener('click', function () {
    if (!started || video.paused) {
      playVideo();
    }
  });
})();
