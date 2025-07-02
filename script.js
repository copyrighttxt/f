const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const PARTICLE_COUNT = 60;
const particles = [];

for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: 2 + Math.random() * 1.5,
        speed: 3 + Math.random() * 2,
        color: '#ffb3fa'
    });
}

function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of particles) {
        p.y += p.speed;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 2 * Math.PI);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
        // Wrap to top
        if (p.y > canvas.height) {
            p.y = -p.r;
            p.x = Math.random() * window.innerWidth;
        }
    }
    requestAnimationFrame(drawParticles);
}
drawParticles();

const spotifyStatusElem = document.getElementById('spotify-status');
const userId = '744379641707626556'; // uhh user id

function updateSpotifyStatus() {
  fetch(`https://api.lanyard.rest/v1/users/${userId}`)
    .then(res => res.json())
    .then(data => {
      if (data.success && data.data) {
        if (spotifyStatusElem) {
          if (data.data.listening_to_spotify && data.data.spotify) {
            const s = data.data.spotify;
            spotifyStatusElem.innerHTML = `
              <div class="spotify-card-modern">
                <img src="${s.album_art_url}" alt="Spotify Album Art" class="spotify-album-art">
                <div class="spotify-info">
                  <span class="spotify-listening">Listening on <span style='color:#1db954;font-weight:700;'>Spotify</span></span>
                  <span class="spotify-song">${s.song}</span>
                  <span class="spotify-artist">${s.artist}</span>
                  <span class="spotify-album">${s.album}</span>
                  <a href="https://open.spotify.com/track/${s.track_id}" target="_blank" class="spotify-link">Open in Spotify <i class='fa-brands fa-spotify'></i></a>
                </div>
              </div>
            `;
          } else {
            spotifyStatusElem.innerHTML = '<div class="spotify-card-modern"><span style="color:#aaa;">Not listening to Spotify</span></div>';
          }
        }
      }
    })
    .catch(() => {
      if (spotifyStatusElem) spotifyStatusElem.innerHTML = '<div class="spotify-card-modern"><span style="color:#aaa;">Not listening to Spotify</span></div>';
    });
}

updateSpotifyStatus(); // Initial call
setInterval(updateSpotifyStatus, 1000); // Update every sec
