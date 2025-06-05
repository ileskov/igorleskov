document.addEventListener('DOMContentLoaded', function() {
    var videos = document.querySelectorAll('.video');
    var musicItems = document.querySelectorAll(".music-item");
    var currentVideo = null;
    var currentAudioPlayer = null;

    videos.forEach(function(video) {
        video.addEventListener('loadeddata', function() {
            var videoKey = video.dataset.key; 
            var savedTime = localStorage.getItem(videoKey); 
            if (savedTime) {
                video.currentTime = parseFloat(savedTime);
            }
        });

        video.addEventListener('play', function(event) {
            currentVideo = event.target;

            videos.forEach(function(v) {
                if (v !== currentVideo) {
                    v.pause();
                }
            });

            if (currentAudioPlayer && !currentAudioPlayer.paused) {
                currentAudioPlayer.pause();
                var playButtonPrev = document.querySelector(".playing");
                if (playButtonPrev) {
                    playButtonPrev.innerHTML = "&#9658;";
                    playButtonPrev.classList.remove("playing");
                }
            }
        });

        video.addEventListener('pause', function() {
            var videoKey = video.dataset.key; 
            localStorage.setItem(videoKey, video.currentTime); 
        });

        video.addEventListener('ended', function() {
            var videoKey = video.dataset.key;
            localStorage.removeItem(videoKey);
        });
    });

    musicItems.forEach(function(item, index) {
        var playButton = item.querySelector(".play-button");
        var audioPlayer = item.querySelector("audio"); // Используем встроенный <audio>
        var seekBar = item.querySelector(".seek-bar");

        audioPlayer.addEventListener("loadedmetadata", function() {
            seekBar.max = audioPlayer.duration;
            var savedTime = localStorage.getItem(audioPlayer.src);
            if (savedTime) {
                audioPlayer.currentTime = parseFloat(savedTime);
                seekBar.value = parseFloat(savedTime);
            } else {
                seekBar.value = 0;
            }
            updateSeekBarBackground(seekBar.value, seekBar.max);
        });

        // Обновление заливки полосы прогресса
        function updateSeekBarBackground(value, max) {
            const percent = (value / max) * 100;
            seekBar.style.background = `linear-gradient(to right, #397fb8 0%, #397fb8 ${percent}%, #c7c7c7 ${percent}%, #c7c7c7 100%)`;
        }

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

                if (currentVideo && !currentVideo.paused) {
                    currentVideo.pause();
                }
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
            updateSeekBarBackground(0, seekBar.max);
            localStorage.removeItem(audioPlayer.src); 
            if (index < musicItems.length - 1) {
                var nextButton = musicItems[index + 1].querySelector(".play-button");
                nextButton.click();
            }
        });

        audioPlayer.addEventListener("timeupdate", function() {
            seekBar.value = audioPlayer.currentTime;
            updateSeekBarBackground(seekBar.value, seekBar.max);
        });

        // Обработчик перемещения ползунка в реальном времени
        seekBar.addEventListener("input", function() {
            updateSeekBarBackground(seekBar.value, seekBar.max);
        });

        // Применяем перемотку после отпускания ползунка
        seekBar.addEventListener("change", function() {
            audioPlayer.currentTime = seekBar.value;
            localStorage.setItem(audioPlayer.src, seekBar.value);
        });

        audioPlayer.addEventListener('play', function() {
            if (currentVideo && !currentVideo.paused) {
                currentVideo.pause();
            }
        });
    });

    musicItems.forEach(function(item) {
        var playButton = item.querySelector(".play-button");

        playButton.addEventListener("click", function() {
            if (currentVideo) {
                currentVideo.pause();
            }
        });
    });
});
