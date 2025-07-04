// idk
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// prtcle system
const PARTICLE_COUNT = 60;
const particles = [];

for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: 2 + Math.random() * 1.5, // small dots
        speed: 3 + Math.random() * 2, // fast falling
        color: '#ffb3fa' // light purple/pink
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
        if (p.y > canvas.height) {
            p.y = -p.r;
            p.x = Math.random() * window.innerWidth;
        }
    }
    requestAnimationFrame(drawParticles);
}
drawParticles();

const spotifyStatusElem = document.getElementById('spotify-status');
const userId = '744379641707626556';

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
setInterval(updateSpotifyStatus, 1000); // Update every 1000 ms

// --- Status Box Functionality ---
let ws = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

const API_BASE_URL = 'https://api.jsonbin.io/v3/b';
const BIN_ID = '68694f568a456b7966bbd95b';
const API_KEY = '$2a$10$dCTvDi167ZIn.6Xp8ZThG.MDJg7HYx.esd9gPUWj.qApinkojVFDi'; // Your JSONBin API key

function connectWebSocket() {
    // For GitHub Pages, we'll use polling instead of WebSocket
    // since WebSocket requires a persistent server connection
    console.log('Using polling for GitHub Pages compatibility');
    startPolling();
}

function updateStatusDisplay(data) {
    const statusText = document.getElementById('status-text');
    const statusImage = document.getElementById('status-image');
    
    if (statusText) {
        statusText.textContent = data.text || '✨ Status unavailable';
    }
    
    if (statusImage) {
        if (data.image) {
            statusImage.innerHTML = `<img src="${data.image}" alt="Status Image" onerror="this.style.display='none'">`;
        } else {
            statusImage.innerHTML = '';
        }
    }
}

function startPolling() {
    // Polling for GitHub Pages compatibility
    console.log('Using polling for status updates');
    
    function loadStatus() {
        const API_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;
        fetch(API_URL, {
            method: 'GET',
            headers: {
                'X-Master-Key': API_KEY,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            mode: 'cors'
        })
        .then(response => response.json())
        .then(data => {
            if (data.record && data.record.status) {
                updateStatusDisplay(data.record.status);
            } else {
                updateStatusDisplay({ text: '✨ No status set yet' });
            }
        })
        .catch(error => {
            console.error('Failed to load status:', error);
            const statusText = document.getElementById('status-text');
            if (statusText) {
                statusText.textContent = '✨ Status unavailable (check API configuration)';
            }
        });
    }
    
    loadStatus();
    setInterval(loadStatus, 1000);
}

// Initialize status loading
connectWebSocket();

