// WIND Interaction Logic
// Creates flowing streaks simulating wind intensity

let windCanvas, windCtx;
let streaks = [];
let animationFrame;
let windActive = false;
let windSpeedFactor = 0.5; // Base speed

function initWindCanvas() {
  windCanvas = document.getElementById('wind-canvas');
  windCtx = windCanvas.getContext('2d');
  resizeWindCanvas();
  window.addEventListener('resize', resizeWindCanvas);
  createStreaks();
}

function resizeWindCanvas() {
  windCanvas.width = windCanvas.offsetWidth;
  windCanvas.height = windCanvas.offsetHeight;
}

// Generate streaks
function createStreaks(count = 40) {
  streaks = [];
  for (let i = 0; i < count; i++) {
    streaks.push({
      x: Math.random() * windCanvas.width,
      y: Math.random() * windCanvas.height,
      length: 40 + Math.random() * 60,
      speed: 0.5 + Math.random() * 1,
      opacity: 0.2 + Math.random() * 0.4,
      color: `hsla(${190 + Math.random() * 20}, 60%, 85%, 0.6)`
    });
  }
}

function drawWind() {
  windCtx.clearRect(0, 0, windCanvas.width, windCanvas.height);
  for (let s of streaks) {
    windCtx.strokeStyle = s.color;
    windCtx.globalAlpha = s.opacity;
    windCtx.lineWidth = 2;
    windCtx.beginPath();
    windCtx.moveTo(s.x, s.y);
    windCtx.lineTo(s.x - s.length, s.y);
    windCtx.stroke();

    // Move streak based on wind intensity
    s.x += (s.speed + windSpeedFactor) * -1;
    if (s.x + s.length < 0) {
      s.x = windCanvas.width + Math.random() * 50;
      s.y = Math.random() * windCanvas.height;
    }
  }
  animationFrame = requestAnimationFrame(drawWind);
}

// Control wind intensity on hover
function updateWindEffect(windValue) {
  // Adjust speed factor based on wind value
  windSpeedFactor = 0.5 + windValue * 4; // Higher wind = faster streaks
}

// Start WIND stage
function startWindInteraction() {
  if (!windCanvas) initWindCanvas();
  windActive = true;
  cancelAnimationFrame(animationFrame);
  drawWind();

  document.querySelector('.floating-prompt').innerHTML = `
    <p class="instruction">Hover over the route—feel the wind's motion.</p>
    <p class="question">Is the air calm or rushing?</p>
    <p class="continue">(Click to continue)</p>
  `;

  // Bind hover logic for WIND
  map.on('mousemove', 'route-layer', (e) => {
    if (currentStage !== 'wind') return;

    const hoveredPoint = [e.lngLat.lng, e.lngLat.lat];
    let closestIndex = 0;
    let minDist = Infinity;

    window.routeSegments.forEach((seg, i) => {
      const dx = seg.coord[0] - hoveredPoint[0];
      const dy = seg.coord[1] - hoveredPoint[1];
      const dist = dx * dx + dy * dy;
      if (dist < minDist) {
        minDist = dist;
        closestIndex = i;
      }
    });

    const windValue = window.routeSegments[closestIndex].wind;
    updateWindEffect(windValue);
  });

  // Click to proceed to next stage
  map.on('click', 'route-layer', () => {
    if (currentStage !== 'wind') return;
    windActive = false;
    cancelAnimationFrame(animationFrame);
    windCtx.clearRect(0, 0, windCanvas.width, windCanvas.height);

    currentStage = 'shade';
    document.querySelector('.floating-prompt').innerHTML = `
      <p class="instruction">Next: Seek out the shaded paths.</p>
      <p class="continue">(Hover and click when ready)</p>
    `;
    console.log('WIND stage complete → SHADE stage next.');
  });
}

// Expose function globally
window.startWindInteraction = startWindInteraction;
