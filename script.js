// guns.lol style animated light purple dots (particles) falling fast, no cursor following
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Particle system
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
        // Fall down fast, no horizontal movement
        p.y += p.speed;
        // Draw
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

// --- Spotify status only via Lanyard ---
const spotifyStatusElem = document.getElementById('spotify-status');
const userId = '744379641707626556'; // <-- Your Discord User ID

function updateSpotifyStatus() {
  fetch(`https://api.lanyard.rest/v1/users/${userId}`)
    .then(res => res.json())
    .then(data => {
      if (data.success && data.data) {
        // Spotify status (with link to song)
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

function connectWebSocket() {
    // Replace this URL with your local server address
    const WS_URL = 'ws://localhost:3000';
    
    try {
        ws = new WebSocket(WS_URL);
        
        ws.onopen = function() {
            console.log('WebSocket connected');
            reconnectAttempts = 0;
        };
        
        ws.onmessage = function(event) {
            try {
                const message = JSON.parse(event.data);
                if (message.type === 'status_update') {
                    updateStatusDisplay(message.data);
                }
            } catch (error) {
                console.error('Failed to parse WebSocket message:', error);
            }
        };
        
        ws.onclose = function() {
            console.log('WebSocket disconnected');
            // Try to reconnect
            if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
                reconnectAttempts++;
                console.log(`Attempting to reconnect... (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
                setTimeout(connectWebSocket, 2000);
            } else {
                console.log('Max reconnection attempts reached, falling back to polling');
                startPolling();
            }
        };
        
        ws.onerror = function(error) {
            console.error('WebSocket error:', error);
        };
        
    } catch (error) {
        console.error('Failed to connect WebSocket:', error);
        startPolling();
    }
}

function updateStatusDisplay(data) {
    const statusText = document.getElementById('status-text');
    const statusImage = document.getElementById('status-image');
    
    if (statusText) {
        statusText.textContent = data.text;
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
    // Fallback to polling if WebSocket fails
    console.log('Using polling fallback');
    
    function loadStatus() {
        // Replace this URL with your local server address
        const API_URL = 'http://localhost:3000/api/status';
        
        fetch(API_URL)
            .then(response => response.json())
            .then(data => {
                updateStatusDisplay(data);
            })
            .catch(error => {
                console.error('Failed to load status:', error);
                const statusText = document.getElementById('status-text');
                if (statusText) {
                    statusText.textContent = '✨ Status unavailable (server offline)';
                }
            });
    }
    
    // Load status immediately
    loadStatus();
    
    // Update status every 30 seconds as fallback
    setInterval(loadStatus, 30000);
}

// Initialize WebSocket connection
connectWebSocket();

