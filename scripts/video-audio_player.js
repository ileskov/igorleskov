function updateSeekBarBackground(seekBar, value, max) {
  const percent = Math.min((value / max) * 100, 100); // максимум 100%
  seekBar.style.background = `linear-gradient(to right, #00336a 0%, #00336a ${percent}%, #c7c7c7 ${percent}%, #c7c7c7 100%)`;
}

document.addEventListener('DOMContentLoaded', function () {
  const audio = document.getElementById('audio');
  const seekBar = document.getElementById('seekBar');

  if (audio && seekBar) {
    const audioKey = audio.dataset.key || "audioPosition";

    audio.addEventListener('loadedmetadata', () => {
      seekBar.max = audio.duration;

      const saved = localStorage.getItem(audioKey);
      const savedTime = saved && !isNaN(saved) ? parseFloat(saved) : 0;

      audio.currentTime = savedTime;
      seekBar.value = savedTime;

      updateSeekBarBackground(seekBar, savedTime, audio.duration);
    });

    audio.addEventListener("timeupdate", () => {
      const current = audio.currentTime;
      seekBar.value = current;
      updateSeekBarBackground(seekBar, current, audio.duration);
      localStorage.setItem(audioKey, current);

      // Если почти конец — завершить
      if (audio.duration - current < 0.15) {
        audio.pause();
        audio.currentTime = audio.duration;
        seekBar.value = audio.duration;
        updateSeekBarBackground(seekBar, audio.duration, audio.duration);
      }
    });

    seekBar.addEventListener("input", () => {
      const val = parseFloat(seekBar.value);
      updateSeekBarBackground(seekBar, val, parseFloat(seekBar.max));
    });

    seekBar.addEventListener("change", () => {
      const time = parseFloat(seekBar.value);
      audio.currentTime = time;
      localStorage.setItem(audioKey, time);
    });

    audio.addEventListener("pause", () => {
      localStorage.setItem(audioKey, audio.currentTime);
    });

    window.addEventListener("beforeunload", () => {
      localStorage.setItem(audioKey, audio.currentTime);
    });
  }

  // Видео и список музыки
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
      updateSeekBarBackground(seekBar, time, audioPlayer.duration);
    });

    audioPlayer.addEventListener("timeupdate", () => {
      const current = audioPlayer.currentTime;
      seekBar.value = current;
      updateSeekBarBackground(seekBar, current, audioPlayer.duration);
      localStorage.setItem(audioKey, current);

      // Принудительное завершение, если в конце
      if (audioPlayer.duration - current < 0.15) {
        audioPlayer.pause();
        seekBar.value = audioPlayer.duration;
        updateSeekBarBackground(seekBar, audioPlayer.duration, audioPlayer.duration);
      }
    });

    seekBar.addEventListener("input", () => {
      const val = parseFloat(seekBar.value);
      updateSeekBarBackground(seekBar, val, parseFloat(seekBar.max));
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

      // Автовоспроизведение следующего
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
