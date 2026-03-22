document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const welcomeScreen = document.getElementById('welcomeScreen');
    const mainContent = document.getElementById('mainContent');
    const audio = document.getElementById('backgroundAudio');
    const songNameDisplay = document.getElementById('songName');
    const playPauseButton = document.getElementById('playPauseButton');
    const playIcon = playPauseButton.querySelector('.play-icon');
    const pauseIcon = playPauseButton.querySelector('.pause-icon');
    const nextButton = document.getElementById('nextButton');
    const prevButton = document.getElementById('prevButton');
    const volumeSlider = document.getElementById('volumeSlider');
    const progressSlider = document.getElementById('progressSlider');
    const currentTimeEl = document.getElementById('currentTime');
    const durationEl = document.getElementById('duration');
    const cursorGlow = document.getElementById('cursorGlow');
    const profileCard = document.getElementById('profileCard');
    const audioControls = document.getElementById('audioControls');
    const visualizerBars = document.querySelectorAll('.bar');

    // Playlist Configuration
    const playlist = [
        { src: "./audios/song1.mp3", name: "Scissor Sisters - It Can't Come Quickly Enough" },
        { src: "./audios/song2.mp3", name: "Old Gods of Asgard - Dark Ocean Summoning" },
        { src: "./audios/song3.mp3", name: "Adrienne Cowan - Cover: 'Forever' by Kamelot" },
        { src: "./audios/song4.mp3", name: "VIOLENT VIRA - Eat" },
        { src: "./audios/song5.mp3", name: "Rammstein - Ohne dich" }
    ];

    let currentSongIndex = 0;
    let isPlaying = false;

    // Create animated particles
    function createParticles() {
        const particlesContainer = document.getElementById('particles');
        const particleCount = 50;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 15 + 's';
            particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
            particlesContainer.appendChild(particle);
        }
    }

    // Mouse tracking for cursor glow
    let mouseX = 0;
    let mouseY = 0;
    let currentX = 0;
    let currentY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animateCursor() {
        const dx = mouseX - currentX;
        const dy = mouseY - currentY;
        
        currentX += dx * 0.1;
        currentY += dy * 0.1;
        
        cursorGlow.style.left = currentX + 'px';
        cursorGlow.style.top = currentY + 'px';
        
        requestAnimationFrame(animateCursor);
    }

    // Mouse tracking for floating cards with collision
    function updateCardPositions(e) {
        const cards = [profileCard, audioControls];
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        cards.forEach(card => {
            const rect = card.getBoundingClientRect();
            const cardCenterX = rect.left + rect.width / 2;
            const cardCenterY = rect.top + rect.height / 2;

            // Calculate distance from mouse to card center
            const deltaX = mouseX - cardCenterX;
            const deltaY = mouseY - cardCenterY;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            // Influence radius
            const influenceRadius = 250;

            if (distance < influenceRadius) {
                // Calculate movement (inverse of distance for repulsion)
                const force = (influenceRadius - distance) / influenceRadius;
                const moveX = -deltaX * force * 0.3;
                const moveY = -deltaY * force * 0.3;

                // Apply boundary constraints
                const maxMove = 40;
                const clampedX = Math.max(-maxMove, Math.min(maxMove, moveX));
                const clampedY = Math.max(-maxMove, Math.min(maxMove, moveY));

                card.style.transform = `translate(${clampedX}px, ${clampedY}px)`;
            } else {
                // Return to original position
                card.style.transform = 'translate(0, 0)';
            }
        });
    }

    // Visualizer animation based on audio
    function animateVisualizer() {
        if (isPlaying) {
            visualizerBars.forEach(bar => {
                bar.style.animationPlayState = 'running';
            });
        } else {
            visualizerBars.forEach(bar => {
                bar.style.animationPlayState = 'paused';
            });
        }
    }

    // Time formatting
    function formatTime(seconds) {
        if (!isFinite(seconds)) return "0:00";
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    }

    // Load song
    function loadSong(index) {
        currentSongIndex = index;
        const song = playlist[currentSongIndex];
        
        try {
            audio.src = song.src;
            songNameDisplay.textContent = song.name;
            audio.load();
            
            progressSlider.value = 0;
            currentTimeEl.textContent = "0:00";
            durationEl.textContent = "0:00";
        } catch (e) {
            console.error("Error loading audio source:", e);
            songNameDisplay.textContent = "ERROR: Song file missing!";
            playPauseButton.disabled = true;
            nextButton.disabled = true;
            prevButton.disabled = true;
            isPlaying = false;
        }
    }

    // Play song
    function playSong() {
        if (!audio.src || audio.src === window.location.href) {
            loadSong(0);
        }
        
        if (!audio.src || songNameDisplay.textContent.startsWith("ERROR")) {
            return;
        }

        audio.play()
            .then(() => {
                isPlaying = true;
                playIcon.style.display = 'none';
                pauseIcon.style.display = 'block';
                animateVisualizer();
            })
            .catch(error => {
                console.error("Autoplay blocked:", error);
                isPlaying = false;
                playIcon.style.display = 'block';
                pauseIcon.style.display = 'none';
            });
    }

    // Pause song
    function pauseSong() {
        audio.pause();
        isPlaying = false;
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
        animateVisualizer();
    }

    // Next song
    function nextSong() {
        currentSongIndex = (currentSongIndex + 1) % playlist.length;
        loadSong(currentSongIndex);
        playSong();
    }

    // Previous song
    function prevSong() {
        currentSongIndex = (currentSongIndex - 1 + playlist.length) % playlist.length;
        loadSong(currentSongIndex);
        playSong();
    }

    // Event Listeners
    playPauseButton.addEventListener('click', () => {
        if (playPauseButton.disabled) return;
        
        if (isPlaying) {
            pauseSong();
        } else {
            playSong();
        }
    });

    nextButton.addEventListener('click', nextSong);
    prevButton.addEventListener('click', prevSong);
    audio.addEventListener('ended', nextSong);

    audio.addEventListener('error', (e) => {
        console.error("Failed to load audio file:", e.target.error);
        songNameDisplay.textContent = "ERROR: Song file missing!";
        playPauseButton.disabled = true;
        nextButton.disabled = true;
        prevButton.disabled = true;
        isPlaying = false;
        animateVisualizer();
    });

    volumeSlider.addEventListener('input', (e) => {
        audio.volume = e.target.value;
    });

    audio.addEventListener('loadedmetadata', () => {
        progressSlider.max = audio.duration;
        durationEl.textContent = formatTime(audio.duration);
    });

    audio.addEventListener('timeupdate', () => {
        if (!progressSlider.isSeeking) {
            progressSlider.value = audio.currentTime;
            currentTimeEl.textContent = formatTime(audio.currentTime);
        }
    });

    progressSlider.addEventListener('input', () => {
        audio.currentTime = progressSlider.value;
    });

    // Welcome screen click
    welcomeScreen.addEventListener('click', () => {
        welcomeScreen.classList.add('hidden');
        mainContent.classList.add('unblurred');
        
        loadSong(currentSongIndex);
        if (!playPauseButton.disabled) {
            playSong();
        }
    });

    // Mouse move listener for floating cards
    document.addEventListener('mousemove', updateCardPositions);

    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        if (welcomeScreen.classList.contains('hidden')) {
            switch(e.key) {
                case ' ':
                    e.preventDefault();
                    if (isPlaying) {
                        pauseSong();
                    } else {
                        playSong();
                    }
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    nextSong();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    prevSong();
                    break;
            }
        }
    });

    // Initialize
    createParticles();
    animateCursor();
    audio.volume = volumeSlider.value;
    loadSong(currentSongIndex);
    animateVisualizer();
});
