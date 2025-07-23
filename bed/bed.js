const ghost = document.getElementById("ghost-figure");
const aura = document.getElementById("aura-layer");
const core = document.getElementById("body-core");
const layer = document.getElementById("interaction-layer");
const prompt = document.getElementById("floating-prompt");

let readinessLevel = 0.5;
let internalTemp = 0.5;
let stage = "readiness";

// === READINESS: Cursor controls posture ===
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

// === CLICK to advance to next stage ===
layer.addEventListener("click", () => {
  if (stage === "readiness") {
    console.log("Readiness Level:", readinessLevel.toFixed(3));
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

  else if (stage === "temperature" && internalTemp !== null) {
    console.log("Internal Temp:", internalTemp.toFixed(3));
    stage = "complete";

    prompt.innerHTML = `
      <div class="question">Next module coming soon...</div>
    `;
  }
});

// === INTERNAL TEMP: Press & hold with real-time animation ===
let holdStart = null;
let animationFrame = null;

function animateHeat() {
  const now = Date.now();
  const held = now - holdStart;
  internalTemp = Math.min(1, held / 6000); // max at 2 sec

  // Live aura effect
  const auraScale = 1 + internalTemp * 1.5;
  const auraBlur = 40 + internalTemp * 60;
  const auraGlow = 0.3 + internalTemp * 0.5;
  aura.style.transform = `scale(${auraScale})`;
  aura.style.opacity = `${auraGlow}`;
  aura.style.filter = `blur(${auraBlur}px)`;

  // Live ghost color shift
  const red = Math.round(220 + 30 * internalTemp);
  const blue = Math.round(230 - 180 * internalTemp);
  const gradient = `linear-gradient(to bottom, rgb(${red},${blue},${blue}), #f8f9fb)`;
  core.style.background = gradient;

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

  console.log("Internal Temp:", internalTemp.toFixed(3));
});
















