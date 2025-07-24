// PANEL 3: THE WINDOW LOGIC
// Features:
// 1. Mapbox Map + Directions API routing
// 2. Autocomplete dropdown for Start & End inputs
// 3. Store coords for selected locations
// 4. Simulate environmental floats for Wardrobe panel
// 5. Visualize SUN attribute dynamically with highlight + glare overlay + stage captions

mapboxgl.accessToken = 'pk.eyJ1IjoiY2hlbHNlYWpoYWkiLCJhIjoiY21kZzUwMWdlMDJ3eDJscTN3ZHo4a3BnaiJ9.FPb-7G9NQu3oeHIg_ZZy0w'; // Replace with your Mapbox token

let currentStage = 'sun'; // Track which attribute is active

// -------------------------
// 1. Initialize Map
// -------------------------
const map = new mapboxgl.Map({
  container: 'map-container',
  style: 'mapbox://styles/mapbox/light-v11',
  center: [-73.985428, 40.748817], // Manhattan center
  zoom: 12,
  interactive: true
});

map.scrollZoom.disable();
map.dragPan.disable();
map.doubleClickZoom.disable();
map.touchZoomRotate.disable();

// -------------------------
// 2. Sky Canvas (Background Gradient)
// -------------------------
const canvas = document.getElementById('sky-canvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function drawSkyGradient(timeOfDay) {
  const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
  const color1 = `hsl(${200 + timeOfDay * 80}, 80%, ${70 - timeOfDay * 30}%)`;
  const color2 = `hsl(${220 + timeOfDay * 80}, 60%, ${90 - timeOfDay * 30}%)`;
  gradient.addColorStop(0, color1);
  gradient.addColorStop(1, color2);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// -------------------------
// 3. Geocoding + Autocomplete
// -------------------------
async function fetchSuggestions(query, inputId) {
  if (!query.trim()) {
    hideDropdown(inputId);
    return;
  }

  const nycBounds = "-74.25909,40.477399,-73.700272,40.917577";
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
              `access_token=${mapboxgl.accessToken}&autocomplete=true&bbox=${nycBounds}&types=poi,address&limit=5`;

  const res = await fetch(url);
  const data = await res.json();

  if (!data.features) {
    hideDropdown(inputId);
    return;
  }

  const suggestions = data.features.map(f => ({
    name: f.place_name,
    coords: f.center
  }));

  showDropdown(suggestions, inputId);
}

function showDropdown(suggestions, inputId) {
  const input = document.getElementById(inputId);
  let dropdown = document.querySelector(`#${inputId}-dropdown`);

  if (!dropdown) {
    dropdown = document.createElement('div');
    dropdown.id = `${inputId}-dropdown`;
    dropdown.className = 'dropdown';
    input.parentNode.style.position = 'relative';
    input.parentNode.appendChild(dropdown);
  }

  dropdown.innerHTML = suggestions.map(s => `<div class="dropdown-item">${s.name}</div>`).join('');

  dropdown.querySelectorAll('.dropdown-item').forEach((item, index) => {
    item.addEventListener('click', () => {
      input.value = suggestions[index].name;
      input.dataset.coords = JSON.stringify(suggestions[index].coords);
      dropdown.innerHTML = '';
    });
  });
}

function hideDropdown(inputId) {
  const dropdown = document.querySelector(`#${inputId}-dropdown`);
  if (dropdown) dropdown.innerHTML = '';
}

['start-location', 'end-location'].forEach(id => {
  const input = document.getElementById(id);
  input.addEventListener('input', e => fetchSuggestions(e.target.value, id));
});

// -------------------------
// 4. Routing Logic
// -------------------------
async function getRoute(startCoords, endCoords) {
  const url = `https://api.mapbox.com/directions/v5/mapbox/walking/${startCoords[0]},${startCoords[1]};${endCoords[0]},${endCoords[1]}?geometries=geojson&access_token=${mapboxgl.accessToken}`;
  const res = await fetch(url);
  const data = await res.json();

  if (!data.routes || data.routes.length === 0) {
    alert('No route found. Please try different locations.');
    throw new Error('Directions API returned no routes.');
  }

  return data.routes[0].geometry.coordinates;
}

// -------------------------
// 5. Handle Button Click
// -------------------------
document.getElementById('route-btn').addEventListener('click', async () => {
  const startInput = document.getElementById('start-location');
  const endInput = document.getElementById('end-location');

  let startCoords = startInput.dataset.coords ? JSON.parse(startInput.dataset.coords) : null;
  let endCoords = endInput.dataset.coords ? JSON.parse(endInput.dataset.coords) : null;

  if (!startCoords || !endCoords) {
    alert('Please select from suggestions or enter valid locations.');
    return;
  }

  try {
    const coords = await getRoute(startCoords, endCoords);

    const routeGeoJSON = {
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: coords },
        properties: {}
      }]
    };

    if (map.getSource('route')) {
      map.getSource('route').setData(routeGeoJSON);
    } else {
      map.addSource('route', { type: 'geojson', data: routeGeoJSON });
      map.addLayer({
        id: 'route-layer',
        type: 'line',
        source: 'route',
        paint: {
          'line-width': 6,
          'line-color': '#007AFF',
          'line-opacity': 0.9
        }
      });

      // Highlight layer
      map.addLayer({
        id: 'route-highlight',
        type: 'line',
        source: 'route',
        paint: {
          'line-width': 10,
          'line-color': '#FFD700',
          'line-opacity': 0
        }
      });
    }

    const bounds = coords.reduce((b, coord) => b.extend(coord), new mapboxgl.LngLatBounds(coords[0], coords[0]));
    map.fitBounds(bounds, { padding: 50 });

    const timeOfDay = Math.random();
    drawSkyGradient(timeOfDay);

    document.querySelector('.window-inputs').classList.add('fade-out');

    // Update floating prompt for SUN stage
    document.querySelector('.floating-prompt').innerHTML = `
      <p class="instruction">Hover over the route—notice how the light shifts.</p>
      <p class="question">Is today about brightness or calm?</p>
      <p class="continue">(Click to continue)</p>
    `;

    // Generate simulated attributes
    window.routeSegments = coords.map((point) => ({
      coord: point,
      sun: Math.random(),
      wind: Math.random(),
      shade: Math.random(),
      crowd: Math.random()
    }));

    console.log('Route segments:', window.routeSegments);

    // Hover logic for SUN
    const glareOverlay = document.getElementById('glare-overlay');

    map.on('mousemove', 'route-layer', (e) => {
      if (currentStage !== 'sun') return;

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

      const sunValue = window.routeSegments[closestIndex].sun;

      // Update highlight layer color
      const routeColor = `rgba(255, ${200 + sunValue * 55}, 0, 1)`;
      map.setPaintProperty('route-highlight', 'line-color', routeColor);
      map.setPaintProperty('route-highlight', 'line-opacity', 0.9);

      // Sync glare color with route highlight, radial gradient effect
      glareOverlay.style.background = `
        radial-gradient(circle at ${e.point.x}px ${e.point.y}px,
          rgba(255, ${200 + sunValue * 55}, 0, ${0.1 + sunValue * 0.25}),
          rgba(255, ${200 + sunValue * 55}, 0, 0) 80%)
      `;

      // Glass distortion effect
      glareOverlay.style.backdropFilter = `blur(${4 + sunValue * 4}px) brightness(${1 + sunValue * 0.2})`;
      glareOverlay.style.webkitBackdropFilter = glareOverlay.style.backdropFilter;
    });

    map.on('mouseleave', 'route-layer', () => {
      if (currentStage !== 'sun') return;
      map.setPaintProperty('route-highlight', 'line-opacity', 0);
      glareOverlay.style.background = 'rgba(255,230,150,0)';
    });

    // Click to continue to next stage
    map.on('click', 'route-layer', () => {
      if (currentStage !== 'sun') return;

      // Clear SUN effects
      map.setPaintProperty('route-highlight', 'line-opacity', 0);
      glareOverlay.style.background = 'rgba(255,230,150,0)';

      // Move to next stage
      currentStage = 'wind';

      // Update floating prompt
      document.querySelector('.floating-prompt').innerHTML = `
        <p class="instruction">Next: Feel the wind’s motion.</p>
        <p class="continue">(Hover and click when ready)</p>
      `;

      console.log('SUN stage complete → WIND stage next.');

      // Trigger WIND stage
      if (typeof startWindInteraction === 'function') {
        startWindInteraction();
      }
    });

  } catch (error) {
    console.error('Route computation failed.', error);
  }
});

