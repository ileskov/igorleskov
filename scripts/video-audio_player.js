function updateSeekBarBackground(seekBar, value, max) {
  const percent = (value / max) * 100;
  seekBar.style.background = `linear-gradient(to right, #00336a 0%, #00336a ${percent}%, #c7c7c7 ${percent}%, #c7c7c7 100%)`;
}

document.addEventListener('DOMContentLoaded', function () {
  const audio = document.getElementById('audio');
  const seekBar = document.getElementById('seekBar');

  if (audio && seekBar) {
    audio.addEventListener('loadedmetadata', () => {
      seekBar.max = audio.duration;

      const saved = localStorage.getItem("audioPosition");
      const savedTime = saved && !isNaN(saved) ? parseFloat(saved) : 0;

      audio.currentTime = savedTime;
      seekBar.value = savedTime;

      setTimeout(() => {
        updateSeekBarBackground(seekBar, savedTime, audio.duration);
      }, 50);
    });

    audio.addEventListener("timeupdate", () => {
      seekBar.value = audio.currentTime;
      localStorage.setItem("audioPosition", audio.currentTime);
      updateSeekBarBackground(seekBar, parseFloat(seekBar.value), parseFloat(seekBar.max));
    });

    audio.addEventListener("pause", () => {
      localStorage.setItem("audioPosition", audio.currentTime);
    });

    window.addEventListener("beforeunload", () => {
      localStorage.setItem("audioPosition", audio.currentTime);
    });

    seekBar.addEventListener("input", () => {
      updateSeekBarBackground(seekBar, parseFloat(seekBar.value), parseFloat(seekBar.max));
    });

    seekBar.addEventListener("change", () => {
      const time = parseFloat(seekBar.value);
      audio.currentTime = time;
      localStorage.setItem("audioPosition", time);
    });
  }

  // Видео и музыка из списка
  const videos = document.querySelectorAll('.video');
  const musicItems = document.querySelectorAll(".music-item");
  let currentVideo = null;
  let currentAudioPlayer = null;

  videos.forEach(video => {
    video.addEventListener('loadeddata', () => {
      const savedTime = localStorage.getItem(video.dataset.key);
      if (savedTime) video.currentTime = parseFloat(savedTime);
    });

    video.addEventListener('play', e => {
      currentVideo = e.target;
      videos.forEach(v => v !== currentVideo && v.pause());

      if (currentAudioPlayer && !currentAudioPlayer.paused) {
        currentAudioPlayer.pause();
        const btn = document.querySelector(".playing");
        if (btn) {
          btn.innerHTML = "&#9658;";
          btn.classList.remove("playing");
        }
      }
    });

    video.addEventListener('pause', () => {
      localStorage.setItem(video.dataset.key, video.currentTime);
    });

    video.addEventListener('ended', () => {
      localStorage.removeItem(video.dataset.key);
    });
  });

  musicItems.forEach((item, index) => {
    const playButton = item.querySelector(".play-button");
    const audioPlayer = item.querySelector("audio");
    const seekBar = item.querySelector(".seek-bar");
    if (!audioPlayer || !seekBar || !playButton) return;

    const audioKey = audioPlayer.dataset.key || audioPlayer.src;

    audioPlayer.addEventListener("loadedmetadata", () => {
      seekBar.max = audioPlayer.duration;
      const savedTime = localStorage.getItem(audioKey);
      const time = savedTime ? parseFloat(savedTime) : 0;
      audioPlayer.currentTime = time;
      seekBar.value = time;

      requestAnimationFrame(() => {
        updateSeekBarBackground(seekBar, time, audioPlayer.duration);
      });
    });

    audioPlayer.addEventListener("timeupdate", () => {
      seekBar.value = audioPlayer.currentTime;
      localStorage.setItem(audioKey, audioPlayer.currentTime);
      updateSeekBarBackground(seekBar, audioPlayer.currentTime, audioPlayer.duration);
    });

    seekBar.addEventListener("input", () => {
      updateSeekBarBackground(seekBar, parseFloat(seekBar.value), parseFloat(seekBar.max));
    });

    seekBar.addEventListener("change", () => {
      const time = parseFloat(seekBar.value);
      audioPlayer.currentTime = time;
      localStorage.setItem(audioKey, time);
    });

    playButton.addEventListener("click", () => {
      if (currentAudioPlayer && currentAudioPlayer !== audioPlayer) {
        currentAudioPlayer.pause();
        const prev = document.querySelector(".playing");
        if (prev) {
          prev.innerHTML = "&#9658;";
          prev.classList.remove("playing");
        }
      }

      currentAudioPlayer = audioPlayer;
      if (audioPlayer.paused) {
        audioPlayer.play();
        playButton.innerHTML = "&#10074;&#10074;";
        playButton.classList.add("playing");
        if (currentVideo && !currentVideo.paused) currentVideo.pause();
      } else {
        audioPlayer.pause();
        playButton.innerHTML = "&#9658;";
        playButton.classList.remove("playing");
        localStorage.setItem(audioKey, audioPlayer.currentTime);
      }
    });

    audioPlayer.addEventListener("ended", () => {
      playButton.innerHTML = "&#9658;";
      seekBar.value = 0;
      updateSeekBarBackground(seekBar, 0, audioPlayer.duration);
      localStorage.removeItem(audioKey);

      if (index < musicItems.length - 1) {
        const nextBtn = musicItems[index + 1].querySelector(".play-button");
        if (nextBtn) nextBtn.click();
      }
    });

    audioPlayer.addEventListener('play', () => {
      if (currentVideo && !currentVideo.paused) {
        currentVideo.pause();
      }
    });
  });

  musicItems.forEach(item => {
    const playButton = item.querySelector(".play-button");
    playButton.addEventListener("click", () => {
      if (currentVideo) currentVideo.pause();
    });
  });
});
