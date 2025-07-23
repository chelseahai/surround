// PANEL 3: THE WINDOW LOGIC
// Features:
// 1. Mapbox Map + Directions API routing
// 2. Autocomplete dropdown for Start & End inputs
// 3. Store coords for selected locations
// 4. Simulate environmental floats for Wardrobe panel
// 5. Keep UI functional (black fonts for now)

mapboxgl.accessToken = 'pk.eyJ1IjoiY2hlbHNlYWpoYWkiLCJhIjoiY21kZzUwMWdlMDJ3eDJscTN3ZHo4a3BnaiJ9.FPb-7G9NQu3oeHIg_ZZy0w'; // Replace with your Mapbox token

// -------------------------
// 1. Initialize Map
// -------------------------
const map = new mapboxgl.Map({
  container: 'map-container',
  style: 'mapbox://styles/mapbox/light-v11',
  center: [-73.985428, 40.748817], // Manhattan center
  zoom: 12,
  interactive: false
});

map.scrollZoom.disable();
map.dragPan.disable();
map.doubleClickZoom.disable();
map.touchZoomRotate.disable();

// -------------------------
// 2. Sky Canvas
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

  const nycBounds = "-74.25909,40.477399,-73.700272,40.917577"; // NYC bounding box
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
    input.parentNode.style.position = 'relative'; // Ensure relative for absolute dropdown
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

// Attach listeners for autocomplete
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
    console.log(`Start coords: ${startCoords}, End coords: ${endCoords}`);

    const coords = await getRoute(startCoords, endCoords);

    const routeGeoJSON = {
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: coords },
        properties: { env_weight: 0.5 }
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
    }

    const bounds = coords.reduce((b, coord) => b.extend(coord), new mapboxgl.LngLatBounds(coords[0], coords[0]));
    map.fitBounds(bounds, { padding: 50 });

    // Simulated environmental floats
    const timeOfDay = Math.random();
    window.windowFloats = {
      avgSun: Math.random(),
      avgWind: Math.random(),
      avgCrowd: Math.random(),
      avgShade: Math.random(),
      timeOfDay: timeOfDay
    };
    console.log('Simulated floats for Wardrobe:', window.windowFloats);

    drawSkyGradient(timeOfDay);

    document.querySelector('.window-inputs').classList.add('fade-out');

  } catch (error) {
    console.error('Route computation failed.', error);
  }
});




