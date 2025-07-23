const container = document.getElementById('container');
const panels = document.querySelectorAll('.panel');

let currentIndex = 0;
let lastScrollTime = 0;

const bgColors = [
  "#f1f8ff", // Intro
  "#e7f4ec", // Bed
  "#fff5f7", // Window
  "#f7faff", // Wardrobe
  "#eef5f8"  // Door / Mirror
];

applyFade(currentIndex);

function scrollToPanel(index) {
  container.style.transform = `translateX(-${index * 100}vw)`;
  applyFade(index);
}

function applyFade(activeIndex) {
  document.body.style.backgroundColor = "white";

  panels.forEach(panel => {
    panel.classList.remove('fade-in', 'fade-out');
  });

  requestAnimationFrame(() => {
    panels.forEach((panel, i) => {
      if (i === activeIndex) {
        void panel.offsetWidth;
        panel.classList.add('fade-in');
      } else {
        panel.classList.add('fade-out');
      }
    });

    setTimeout(() => {
      document.body.style.backgroundColor = bgColors[activeIndex];
    }, 400);
  });
}

window.addEventListener('wheel', (e) => {
  const now = Date.now();
  if (now - lastScrollTime < 800) return;

  const SCROLL_THRESHOLD = 30;
  if (e.deltaY > SCROLL_THRESHOLD && currentIndex < panels.length - 1) {
    currentIndex++;
    scrollToPanel(currentIndex);
    lastScrollTime = now;
  } else if (e.deltaY < -SCROLL_THRESHOLD && currentIndex > 0) {
    currentIndex--;
    scrollToPanel(currentIndex);
    lastScrollTime = now;
  }
});









