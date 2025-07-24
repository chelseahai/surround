function startWindInteraction() {
  console.log('Starting WIND interaction...');

  const promptContainer = document.querySelector('.floating-prompt');
  const windOverlay = document.getElementById('wind-overlay');
  const windowContainer = document.querySelector('.window-container');

  // Ensure we are in reveal mode before activating WIND
  if (!windowContainer.classList.contains('reveal')) {
    console.warn('WIND interaction blocked: reveal mode not active yet.');
    return;
  }

  // Show overlay and update prompt
  windOverlay.style.opacity = 1;
  promptContainer.innerHTML = `
    <p class="instruction">Feel the wind’s motion—hover to sense the flow.</p>
    <p class="question">Is the breeze gentle or racing?</p>
    <p class="continue">(Click anywhere to continue)</p>
  `;

  let windValue = 0;

  // Hover over route → update overlay based on wind intensity
  map.on('mousemove', 'route-layer', (e) => {
    if (currentStage !== 'wind') return;

    const hoveredPoint = [e.lngLat.lng, e.lngLat.lat];

    // Find nearest route segment
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

    windValue = window.routeSegments[closestIndex].wind;

    // Update overlay appearance dynamically
    windOverlay.style.background = `rgba(200,230,255,${0.1 + windValue * 0.4})`;
    windOverlay.style.filter = `blur(${2 + windValue * 8}px) brightness(${1 + windValue * 0.3})`;

    // Update route highlight for WIND (optional)
    const windColor = `rgba(100, ${180 + windValue * 70}, 255, 1)`;
    map.setPaintProperty('route-highlight', 'line-color', windColor);
    map.setPaintProperty('route-highlight', 'line-opacity', 0.8);
  });

  // Remove highlight when leaving route
  map.on('mouseleave', 'route-layer', () => {
    if (currentStage !== 'wind') return;
    map.setPaintProperty('route-highlight', 'line-opacity', 0);
    windOverlay.style.background = 'rgba(200,230,255,0)';
  });

  // ✅ Global click to continue (anywhere on page)
  function handleWindComplete() {
    if (currentStage !== 'wind') return;

    console.log('WIND stage complete → SHADE stage next.');
    console.log('WIND value captured:', windValue.toFixed(2));

    // Fade out WIND overlay
    windOverlay.style.opacity = 0;

    // Update prompt for next stage
    promptContainer.innerHTML = `
      <p class="instruction">Next: Notice where shade lingers.</p>
      <p class="continue">(Click anywhere to continue)</p>
    `;

    // Move to next stage
    currentStage = 'shade';

    // Trigger SHADE stage (if implemented)
    if (typeof startShadeInteraction === 'function') {
      startShadeInteraction();
    }

    // Remove listener so it doesn't trigger multiple times
    document.body.removeEventListener('click', handleWindComplete);
  }

  document.body.addEventListener('click', handleWindComplete);
}

