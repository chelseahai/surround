// --- ELEMENT HOOKS ---
const ghost = document.getElementById("ghost-figure");
const aura = document.getElementById("aura-layer");
const core = document.getElementById("body-core");
const layer = document.getElementById("interaction-layer");

// --- VALUE STORAGE ---
let readinessLevel = 0.5;
let internalTemp = 0.0;
let mentalCharge = 0.0;
let visibilityIntent = 0.5;

let currentStage = "temp"; // we're now on internal temperature

// --- AURA GROWTH LOGIC ---
let holdStart = null;
let holdTimer = null;

layer.addEventListener("mousedown", (e) => {
  if (currentStage !== "temp") return;

  holdStart = Date.now();

  holdTimer = setInterval(() => {
    const duration = (Date.now() - holdStart) / 2000; // 2 sec to max
    internalTemp = Math.min(duration, 1.0);

    // Update aura visuals
    const auraSize = 100 + internalTemp * 150;
    const blurSize = 40 + internalTemp * 40;
    const glow = 0.3 + internalTemp * 0.4;

    aura.style.width = `${auraSize}px`;
    aura.style.height = `${auraSize}px`;
    aura.style.filter = `blur(${blurSize}px)`;
    aura.style.background = `radial-gradient(circle, rgba(150,200,255,${glow}), transparent 70%)`;
  }, 16);
});

layer.addEventListener("mouseup", (e) => {
  if (currentStage !== "temp") return;

  clearInterval(holdTimer);

  // Lock in value
  console.log("Internal Temperature:", internalTemp.toFixed(2));

  // Transition to next stage (mental charge)
  currentStage = "mental";
  document.getElementById("instruction-temp").classList.add("fade-out");
  document.getElementById("instruction-mental").classList.remove("hidden");
  setTimeout(() => {
    document.getElementById("instruction-mental").classList.add("fade-in");
  }, 10);
});

// For touch devices
layer.addEventListener("touchstart", (e) => {
  e.preventDefault();
  holdStart = Date.now();

  holdTimer = setInterval(() => {
    const duration = (Date.now() - holdStart) / 2000;
    internalTemp = Math.min(duration, 1.0);

    const auraSize = 100 + internalTemp * 150;
    const blurSize = 40 + internalTemp * 40;
    const glow = 0.3 + internalTemp * 0.4;

    aura.style.width = `${auraSize}px`;
    aura.style.height = `${auraSize}px`;
    aura.style.filter = `blur(${blurSize}px)`;
    aura.style.background = `radial-gradient(circle, rgba(150,200,255,${glow}), transparent 70%)`;
  }, 16);
}, { passive: false });

layer.addEventListener("touchend", (e) => {
  clearInterval(holdTimer);

  console.log("Internal Temperature:", internalTemp.toFixed(2));
  currentStage = "mental";
  document.getElementById("instruction-temp").classList.add("fade-out");
  document.getElementById("instruction-mental").classList.remove("hidden");
  setTimeout(() => {
    document.getElementById("instruction-mental").classList.add("fade-in");
  }, 10);
});







