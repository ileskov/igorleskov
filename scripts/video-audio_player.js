function updateSeekBarBackground(seekBar, value, max) {
  const percent = (value / max) * 100;
  seekBar.style.background = `linear-gradient(to right, #00336a 0%, #00336a ${percent}%, #c7c7c7 ${percent}%, #c7c7c7 100%)`;
}

document.addEventListener('DOMContentLoaded', function() {
  // Видео и музыка из списка
  const videos = document.querySelectorAll('.video');
  const musicItems = document.querySelectorAll(".music-item");
  let currentVideo = null;
  let currentAudio = null;
  let currentPlayButton = null;

  videos.forEach(video => {
    const videoKey = video.dataset.key;

    video.addEventListener('loadeddata', () => {
      const savedTime = localStorage.getItem(videoKey);
      if (savedTime) video.currentTime = parseFloat(savedTime);
    });

    video.addEventListener('play', () => {
      if (currentVideo && currentVideo !== video) currentVideo.pause();
      currentVideo = video;

      if (currentAudio && !currentAudio.paused) {
        currentAudio.pause();
        if (currentPlayButton) {
          currentPlayButton.innerHTML = "&#9658;";
          currentPlayButton.classList.remove("playing");
        }
      }
    });

    video.addEventListener('pause', () => {
      localStorage.setItem(videoKey, video.currentTime);
    });

    video.addEventListener('ended', () => {
      localStorage.removeItem(videoKey);
    });
  });

  musicItems.forEach((item, index) => {
    const playButton = item.querySelector(".play-button");
    const audioEl = item.querySelector("audio");
    const seek = item.querySelector(".seek-bar");

    if (!audioEl || !seek || !playButton) return;

    const key = `audio_${index}_${encodeURIComponent(audioEl.src)}`;

    audioEl.addEventListener("loadedmetadata", () => {
      seek.max = audioEl.duration;
      const savedTime = localStorage.getItem(key);
      if (savedTime && !isNaN(savedTime)) {
        audioEl.currentTime = parseFloat(savedTime);
        seek.value = savedTime;
      } else {
        seek.value = 0;
      }
      updateSeekBarBackground(seek, seek.value, seek.max);
    });

    playButton.addEventListener("click", () => {
      if (currentAudio && currentAudio !== audioEl) {
        currentAudio.pause();
        if (currentPlayButton) {
          currentPlayButton.innerHTML = "&#9658;";
          currentPlayButton.classList.remove("playing");
        }
      }

      if (audioEl.paused) {
        audioEl.play()
          .then(() => {
            playButton.innerHTML = "&#10074;&#10074;";
            playButton.classList.add("playing");
            currentAudio = audioEl;
            currentPlayButton = playButton;

            if (currentVideo && !currentVideo.paused) {
              currentVideo.pause();
            }
          })
          .catch(error => {
            console.error("Ошибка воспроизведения:", error);
          });
      } else {
        audioEl.pause();
        playButton.innerHTML = "&#9658;";
        playButton.classList.remove("playing");
        localStorage.setItem(key, audioEl.currentTime);
      }
    });

    audioEl.addEventListener("timeupdate", () => {
      seek.value = audioEl.currentTime;
      updateSeekBarBackground(seek, seek.value, seek.max);
      localStorage.setItem(key, audioEl.currentTime);
    });

    seek.addEventListener("input", () => {
      updateSeekBarBackground(seek, seek.value, seek.max);
    });

    seek.addEventListener("change", () => {
      audioEl.currentTime = parseFloat(seek.value);
      localStorage.setItem(key, seek.value);
    });

    audioEl.addEventListener("ended", () => {
      playButton.innerHTML = "&#9658;";
      playButton.classList.remove("playing");
      seek.value = 0;
      updateSeekBarBackground(seek, 0, seek.max);
      localStorage.removeItem(key);

      // Автопереход к следующему треку
      if (index < musicItems.length - 1) {
        const nextBtn = musicItems[index + 1].querySelector(".play-button");
        if (nextBtn) {
          setTimeout(() => nextBtn.click(), 500); // Небольшая задержка
        }
      }
    });

    audioEl.addEventListener("play", () => {
      if (currentVideo && !currentVideo.paused) currentVideo.pause();
    });
  });
});
