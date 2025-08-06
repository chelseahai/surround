// Mirror Page Interactive Features
class MirrorPage {
  constructor() {
    this.container = document.getElementById('mirror-container');
    this.ghostFigure = document.getElementById('ghost-figure');
    this.auraLayer = document.getElementById('aura-layer');
    this.bodyCore = document.getElementById('body-core');
    this.sparkleContainer = document.getElementById('sparkle-container');
    this.floatingPrompt = document.getElementById('floating-prompt');
    this.interactionLayer = document.getElementById('interaction-layer');
    
    this.isActive = false;
    this.mouseX = 0;
    this.mouseY = 0;
    this.sparkleInterval = null;
    
    this.init();
  }
  
  init() {
    if (!this.container) return;
    
    this.setupEventListeners();
    this.startSparkleGeneration();
    this.updateFloatingPrompt();
  }
  
  setupEventListeners() {
    // Mouse tracking for ghost figure interaction
    this.interactionLayer.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
      this.updateGhostPosition();
    });
    
    // Click interaction
    this.interactionLayer.addEventListener('click', (e) => {
      this.createClickSparkles(e.clientX, e.clientY);
      this.ghostReaction();
    });
    
    // Hover effects
    this.ghostFigure.addEventListener('mouseenter', () => {
      this.enhanceAura();
    });
    
    this.ghostFigure.addEventListener('mouseleave', () => {
      this.normalizeAura();
    });
  }
  
  updateGhostPosition() {
    if (!this.ghostFigure) return;
    
    const rect = this.container.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const deltaX = (this.mouseX - centerX) / centerX;
    const deltaY = (this.mouseY - centerY) / centerY;
    
    // Subtle movement based on mouse position
    const moveX = deltaX * 15;
    const moveY = deltaY * 10;
    
    this.ghostFigure.style.transform = `translate(${moveX}px, ${moveY}px)`;
  }
  
  enhanceAura() {
    if (this.auraLayer) {
      this.auraLayer.style.filter = 'blur(30px) brightness(1.3)';
      this.auraLayer.style.transform = 'scale(1.2)';
    }
    
    if (this.bodyCore) {
      this.bodyCore.style.opacity = '0.95';
      this.bodyCore.style.transform = 'scale(1.02)';
    }
  }
  
  normalizeAura() {
    if (this.auraLayer) {
      this.auraLayer.style.filter = '';
      this.auraLayer.style.transform = '';
    }
    
    if (this.bodyCore) {
      this.bodyCore.style.opacity = '';
      this.bodyCore.style.transform = '';
    }
  }
  
  ghostReaction() {
    // Add a brief reaction animation
    this.ghostFigure.style.transform = 'scale(1.1)';
    setTimeout(() => {
      this.ghostFigure.style.transform = '';
    }, 200);
  }
  
  createClickSparkles(x, y) {
    const sparkleCount = 8;
    
    for (let i = 0; i < sparkleCount; i++) {
      setTimeout(() => {
        this.createSparkle(x, y);
      }, i * 50);
    }
  }
  
  createSparkle(x, y) {
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle';
    
    // Random position around click
    const offsetX = (Math.random() - 0.5) * 100;
    const offsetY = (Math.random() - 0.5) * 100;
    
    sparkle.style.left = `${x + offsetX}px`;
    sparkle.style.top = `${y + offsetY}px`;
    
    this.sparkleContainer.appendChild(sparkle);
    
    // Remove sparkle after animation
    setTimeout(() => {
      if (sparkle.parentNode) {
        sparkle.parentNode.removeChild(sparkle);
      }
    }, 8000);
  }
  
  startSparkleGeneration() {
    this.sparkleInterval = setInterval(() => {
      this.generateRandomSparkle();
    }, 2000);
    
    // Also start floating particles
    this.startFloatingParticles();
  }
  
  generateRandomSparkle() {
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight;
    this.createSparkle(x, y);
  }
  
  startFloatingParticles() {
    setInterval(() => {
      this.createFloatingParticle();
    }, 3000);
  }
  
  createFloatingParticle() {
    const particle = document.createElement('div');
    particle.className = 'floating-particle';
    
    // Random starting position at bottom
    const startX = Math.random() * window.innerWidth;
    particle.style.left = `${startX}px`;
    particle.style.bottom = '0px';
    
    this.container.appendChild(particle);
    
    // Remove particle after animation
    setTimeout(() => {
      if (particle.parentNode) {
        particle.parentNode.removeChild(particle);
      }
    }, 15000);
  }
  
  updateFloatingPrompt() {
    const prompts = [
      {
        question: "What journey calls to you today?",
        instruction: "Let your path unfold like morning mist.",
        action: "Scroll to discover your route"
      },
      {
        question: "Where does your heart want to wander?",
        instruction: "Every destination holds a story waiting to be told.",
        action: "Find your way forward"
      },
      {
        question: "What adventure awaits beyond the horizon?",
        instruction: "Your next chapter is just a step away.",
        action: "Begin your exploration"
      }
    ];
    
    const currentPrompt = prompts[Math.floor(Math.random() * prompts.length)];
    
    if (this.floatingPrompt) {
      this.floatingPrompt.innerHTML = `
        <div class="question">${currentPrompt.question}</div>
        <div class="instruction">${currentPrompt.instruction}</div>
        <div class="soft-action">${currentPrompt.action}</div>
      `;
    }
  }
  
  activate() {
    this.isActive = true;
    this.updateFloatingPrompt();
  }
  
  deactivate() {
    this.isActive = false;
    if (this.sparkleInterval) {
      clearInterval(this.sparkleInterval);
    }
  }
}

// Initialize mirror page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.mirrorPage = new MirrorPage();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MirrorPage;
} 