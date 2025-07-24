function startSunInteraction() {
  console.log('Starting SUN interaction...');

  const promptContainer = document.querySelector('.floating-prompt');
  promptContainer.innerHTML = `
    <p class="instruction">Hover across the sky—feel the brightness shift.</p>
    <p class="question">Is today about brilliance or calm?</p>
    <p class="continue">(Click to continue)</p>
  `;

  const canvas = document.getElementById('sky-canvas');

  // Create glare effect layer
  const effectLayer = document.createElement('div');
  effectLayer.classList.add('window-effect-layer');
  document.getElementById('window-view').appendChild(effectLayer);

  let glareIntensity = 0;

  // Mouse move → adjust glare based on SUN value from route segment
  canvas.addEventListener('mousemove', (e) => {
    if (!window.routeSegments || window.routeSegments.length === 0) return;

    const progress = e.offsetX / canvas.width; // 0 → 1
    const index = Math.floor(progress * (window.routeSegments.length - 1));
    const segment = window.routeSegments[index];

    glareIntensity = segment.sun; // Simulated SUN attribute
    const opacity = 0.2 + glareIntensity * 0.6; // Base + scaled intensity
    effectLayer.style.background = `rgba(255, 230, 150, ${opacity})`;

    // Debug log
    console.log(`Progress: ${(progress * 100).toFixed(1)}%, Segment Index: ${index}, SUN: ${glareIntensity.toFixed(2)}`);
  });

  // On click → finalize value and fade out effect
  canvas.addEventListener('click', () => {
    console.log('SUN value captured:', glareIntensity.toFixed(2));

    // Fade out effect layer before removal
    effectLayer.style.transition = 'opacity 0.6s ease';
    effectLayer.style.opacity = 0;

    setTimeout(() => effectLayer.remove(), 600);

    // Update prompt
    promptContainer.innerHTML = `
      <p class="instruction">SUN complete. Next step coming soon.</p>
    `;
  });
}
