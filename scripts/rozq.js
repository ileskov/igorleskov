// Функция обновления заливки прогресс-бара
function updateSeekBarBackground(seekBar, value, max) {
  const percent = (value / max) * 100;
  seekBar.style.background = `linear-gradient(to right, #397fb8 0%, #397fb8 ${percent}%, #c7c7c7 ${percent}%, #c7c7c7 100%)`;
}

document.addEventListener('DOMContentLoaded', function() {
  const audio = document.getElementById('audio1');
  const seekBar = document.getElementById('seekBar1');

  if (audio && seekBar) {
    audio.addEventListener('loadedmetadata', () => {
      seekBar.max = audio.duration;
      const saved = localStorage.getItem("audioPosition");
      if (saved && !isNaN(saved)) {
        audio.currentTime = parseFloat(saved);
        seekBar.value = saved;
      } else {
        seekBar.value = 0;
      }
      updateSeekBarBackground(seekBar, seekBar.value, seekBar.max);
    });

    audio.addEventListener("timeupdate", () => {
      seekBar.value = audio.currentTime;
      localStorage.setItem("audioPosition", audio.currentTime);
      updateSeekBarBackground(seekBar, seekBar.value, seekBar.max);
    });

    seekBar.addEventListener("input", () => {
      updateSeekBarBackground(seekBar, seekBar.value, seekBar.max);
    });

    seekBar.addEventListener("change", () => {
      audio.currentTime = parseFloat(seekBar.value);
    });
  }

  // Обработка музыкальных элементов
  var musicItems = document.querySelectorAll(".music-item");
  var currentAudioPlayer = null;

  musicItems.forEach(function(item, index) {
    var playButton = item.querySelector(".play-button");
    var audioPlayer = item.querySelector("audio1");
    var seekBar = item.querySelector(".seek-bar1");

    if (!audioPlayer || !seekBar || !playButton) return;

    audioPlayer.addEventListener("loadedmetadata", function() {
      seekBar.max = audioPlayer.duration;
      var savedTime = localStorage.getItem(audioPlayer.src);
      if (savedTime) {
        audioPlayer.currentTime = parseFloat(savedTime);
        seekBar.value = parseFloat(savedTime);
      } else {
        seekBar.value = 0;
      }
      updateSeekBarBackground(seekBar, seekBar.value, seekBar.max);
    });

    playButton.addEventListener("click", function() {
      if (currentAudioPlayer && currentAudioPlayer !== audioPlayer) {
        currentAudioPlayer.pause();
        var playButtonPrev = document.querySelector(".playing");
        if (playButtonPrev) {
          playButtonPrev.innerHTML = "&#9658;";
          playButtonPrev.classList.remove("playing");
        }
      }

      currentAudioPlayer = audioPlayer;
      if (audioPlayer.paused) {
        audioPlayer.play();
        playButton.innerHTML = "&#10074;&#10074;";
        playButton.classList.add("playing");
      } else {
        audioPlayer.pause();
        localStorage.setItem(audioPlayer.src, audioPlayer.currentTime);
        playButton.innerHTML = "&#9658;";
        playButton.classList.remove("playing");
      }
    });

    audioPlayer.addEventListener("ended", function() {
      playButton.innerHTML = "&#9658;";
      seekBar.value = 0;
      updateSeekBarBackground(seekBar, 0, seekBar.max);
      localStorage.removeItem(audioPlayer.src);
      if (index < musicItems.length - 1) {
        var nextButton = musicItems[index + 1].querySelector(".play-button");
        if (nextButton) nextButton.click();
      }
    });

    audioPlayer.addEventListener("timeupdate", function() {
      seekBar.value = audioPlayer.currentTime;
      updateSeekBarBackground(seekBar, seekBar.value, seekBar.max);
    });

    seekBar.addEventListener("input", function() {
      updateSeekBarBackground(seekBar, seekBar.value, seekBar.max);
    });

    seekBar.addEventListener("change", function() {
      audioPlayer.currentTime = seekBar.value;
      localStorage.setItem(audioPlayer.src, seekBar.value);
    });
  });
});

