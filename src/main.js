import "./style.css";

import Alpine from "alpinejs";
import focus from "@alpinejs/focus";
import { initHomeSlider } from "./home-slider";

// Initialize Alpine.js
Alpine.plugin(focus);
window.Alpine = Alpine;
Alpine.start();

// Initialize home slider on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  const homeSlider = initHomeSlider({
    containerSelector: ".embla",
    autoplayDelay: 6000,
    transitionDuration: 35,
    loop: true,
  });

  // Cleanup on page unload
  if (homeSlider) {
    window.addEventListener("beforeunload", () => {
      homeSlider.destroy();
    });
  }
});
