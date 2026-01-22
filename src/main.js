import "./style.css";

import focus from "@alpinejs/focus";
import Alpine from "alpinejs";
import { initHomeSlider } from "./home-slider";
import { initTestimonialsSlider } from "./testimonials-slider";

import "./components/header.js";
import "./components/MariaFooter.js";
import "./components/social-media-nav.js";
import "./components/icon-sprite.js";

Alpine.plugin(focus);
window.Alpine = Alpine;
Alpine.start();

document.addEventListener("DOMContentLoaded", () => {
  const homeSlider = initHomeSlider({
    containerSelector: ".embla",
    autoplayDelay: 6000,
    transitionDuration: 35,
    loop: true,
  });

  const testimonialsSlider = initTestimonialsSlider({
    containerSelector: ".embla-testimonials",
    transitionDuration: 35,
    loop: true,
  });

  window.addEventListener("beforeunload", () => {
    homeSlider?.destroy();
    testimonialsSlider?.destroy();
  });
});
