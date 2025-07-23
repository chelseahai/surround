// PANEL 3: WINDOW LOGIC
const canvas = document.getElementById('sky-canvas');
const ctx = canvas.getContext('2d');

// Ensure canvas resizes with container
function resizeCanvas() {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

document.getElementById('route-btn').addEventListener('click', () => {
  const start = document.getElementById('start-location').value.trim();
  const end = document.getElementById('end-location').value.trim();
  if (!start || !end) return;

  // Simulate route + weather
  const timeOfDay = Math.random(); // 0–1 (morning to night)
  const temperature = (Math.random() * 20 + 10).toFixed(1); // 10–30°C
  const weatherCondition = Math.random(); // 0 clear → 1 storm

  // Store floats globally
  window.windowFloats = { timeOfDay, temperature, weatherCondition };

  // Update Sky Gradient
  drawSkyGradient(timeOfDay);

  // Simulate Route Polyline
  const mapOverlay = document.getElementById('map-overlay');
  mapOverlay.innerHTML = `
    <svg width="100%" height="100%">
      <polyline points="20,180 120,120 240,160 360,100"
        style="fill:none;stroke:#fff;stroke-width:4;stroke-linecap:round;opacity:0.8"/>
    </svg>`;
});

function drawSkyGradient(timeOfDay) {
  const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
  const color1 = `hsl(${200 + timeOfDay * 80}, 80%, ${70 - timeOfDay * 30}%)`;
  const color2 = `hsl(${220 + timeOfDay * 80}, 60%, ${90 - timeOfDay * 30}%)`;
  gradient.addColorStop(0, color1);
  gradient.addColorStop(1, color2);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}


