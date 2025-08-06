// Door Page JavaScript
console.log('Door page loaded');

// Placeholder for future door functionality
class DoorPage {
  constructor() {
    this.init();
  }
  
  init() {
    console.log('Door page initialized');
    // Future door functionality will go here
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.doorPage = new DoorPage();
}); 