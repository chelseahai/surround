const ghost = document.getElementById("ghost-figure");
const aura = document.getElementById("aura-layer");
const core = document.getElementById("body-core");
const layer = document.getElementById("interaction-layer");
const prompt = document.getElementById("floating-prompt");
const sparkleContainer = document.getElementById("sparkle-container");

// State variables
let readinessLevel = 0.5;
let internalTemp = 0.5;
let mentalCharge = 0;
let visibilityIntent = 0;
let stage = "readiness";

// === READINESS (cursor Y) ===
layer.addEventListener("mousemove", (e) => {
  if (stage !== "readiness") return;

  const rect = layer.getBoundingClientRect();
  const y = e.clientY - rect.top;
  const ratio = 1 - y / rect.height;
  readinessLevel = Math.min(Math.max(ratio, 0), 1);
  core.style.transform = `scaleY(${0.8 + 0.4 * readinessLevel})`;

  prompt.innerHTML = `
    <div class="question">“How much of you has arrived?”</div>
    <div class="instruction">
      Move your cursor up or down—notice how your body responds.<br/>
      <em class="soft-action">Click to continue</em>
    </div>
  `;
});

// === CLICK → advance stages ===
layer.addEventListener("click", () => {
  if (stage === "readiness") {
    console.log("✅ Readiness Level:", readinessLevel.toFixed(3));
    stage = "temperature";

    prompt.innerHTML = `
      <div class="question">“Is there heat in your core, or stillness?”</div>
      <div class="instruction">
        Press and hold—stay with the warmth as it builds.<br/>
        <em class="soft-action">Click to continue</em>
      </div>
    `;
    aura.style.transform = "scale(1)";
    aura.style.opacity = "0.3";
    aura.style.filter = "blur(40px)";
    core.style.background = "linear-gradient(to bottom, #ccd4e7, #f8f9fb)";
  }

  else if (stage === "temperature") {
    console.log("✅ Internal Temp:", internalTemp.toFixed(3));
    stage = "charge";

    prompt.innerHTML = `
      <div class="question">“Is your energy slow and smooth, or crackling at the edge?”</div>
      <div class="instruction">
        Move around—your motion shapes the air around you.<br/>
        <em class="soft-action">Click to continue</em>
      </div>
    `;
  }

  else if (stage === "charge") {
    console.log("✅ Mental Charge:", mentalCharge.toFixed(3));
    stage = "visibility";

    prompt.innerHTML = `
      <div class="question">“Do you want to be seen today?”</div>
      <div class="instruction">
        Come closer or drift away—your presence will follow.<br/>
        <em class="soft-action">Click to finish</em>
      </div>
    `;
  }

  else if (stage === "visibility") {
    console.log("✅ Visibility Intent:", visibilityIntent.toFixed(3));
    stage = "complete";

    prompt.innerHTML = `
      <div class="question">You’ve completed your check-in.</div>
      <div class="instruction">Your data is now flowing forward.</div>
    `;
  }
});

// === TEMP HOLD (Press + Hold) ===
let holdStart = null;
let animationFrame = null;

function animateHeat() {
  const now = Date.now();
  const held = now - holdStart;
  internalTemp = Math.min(1, held / 4000); // 4s to max

  const auraScale = 1 + internalTemp * 1.5;
  const auraBlur = 40 + internalTemp * 60;
  const auraGlow = 0.3 + internalTemp * 0.5;
  aura.style.transform = `scale(${auraScale})`;
  aura.style.opacity = `${auraGlow}`;
  aura.style.filter = `blur(${auraBlur}px)`;

  const red = Math.round(220 + 30 * internalTemp);
  const blue = Math.round(230 - 180 * internalTemp);
  core.style.background = `linear-gradient(to bottom, rgb(${red},${blue},${blue}), #f8f9fb)`;

  animationFrame = requestAnimationFrame(animateHeat);
}

layer.addEventListener("mousedown", () => {
  if (stage !== "temperature") return;
  holdStart = Date.now();
  animationFrame = requestAnimationFrame(animateHeat);
});

layer.addEventListener("mouseup", () => {
  if (stage !== "temperature" || holdStart === null) return;
  cancelAnimationFrame(animationFrame);
  holdStart = null;
  console.log("✅ Internal Temp:", internalTemp.toFixed(3));
});

// === MENTAL CHARGE (Sparkles everywhere) ===
let lastX = null, lastY = null, lastTime = null;

function createSparkle(x, y, speed) {
  const sparkle = document.createElement("div");
  sparkle.className = "sparkle";
  sparkle.style.left = `${x}px`;
  sparkle.style.top = `${y}px`;
  sparkle.style.width = `${4 + speed * 8}px`;
  sparkle.style.height = `${4 + speed * 8}px`;
  sparkleContainer.appendChild(sparkle);
  setTimeout(() => sparkle.remove(), 800);
}

layer.addEventListener("mousemove", (e) => {
  if (stage !== "charge") return;

  const now = Date.now();
  const x = e.clientX;
  const y = e.clientY;

  if (lastX !== null && lastY !== null && lastTime !== null) {
    const dx = x - lastX;
    const dy = y - lastY;
    const dt = now - lastTime;
    const speed = Math.sqrt(dx * dx + dy * dy) / (dt || 1);

    mentalCharge = Math.min(1, speed / 0.5);

    const density = Math.floor(1 + mentalCharge * 6);
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;

    for (let i = 0; i < density; i++) {
      const randX = Math.random() * viewportW;
      const randY = Math.random() * viewportH;
      createSparkle(randX, randY, mentalCharge);
    }
  }

  lastX = x;
  lastY = y;
  lastTime = now;
});

// === VISIBILITY INTENT ===
layer.addEventListener("mousemove", (e) => {
  if (stage !== "visibility") return;

  const ghostRect = ghost.getBoundingClientRect();
  const centerX = ghostRect.left + ghostRect.width / 2;
  const centerY = ghostRect.top + ghostRect.height / 2;

  const dx = e.clientX - centerX;
  const dy = e.clientY - centerY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Make it less sensitive by increasing maxDist
  const maxDist = Math.min(window.innerWidth, window.innerHeight); // full viewport
  let rawValue = 1 - Math.min(distance / maxDist, 1);

  // Apply easing for smoother control
  visibilityIntent = Math.pow(rawValue, 1.5); // easing curve

  // Visual: opacity, blur, and size scaling
  const opacity = 0.4 + 0.6 * visibilityIntent;
  const blur = 10 - 8 * visibilityIntent;
  const scale = 1 + 0.2 * visibilityIntent; // grows up to 20%

  core.style.opacity = opacity.toFixed(2);
  core.style.filter = `blur(${blur}px)`;
  core.style.transform = `scale(${scale})`;
});




