import "./style.css";

import focus from "@alpinejs/focus";
import Alpine from "alpinejs";
import { initHomeSlider } from "./home-slider";
import { initTestimonialsSlider } from "./testimonials-slider";
import { initScrollingTreatments } from "./ScrollingTreatments";

import "./components/header.js";
import "./components/app-footer.js";
import "./components/social-media-nav.js";
import "./components/icon-sprite.js";
import "./components/scroll-to-top.js";

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

  let scrollingTreatmentsControl = null;

  initScrollingTreatments().then((control) => {
    scrollingTreatmentsControl = control;
  });

  window.addEventListener("beforeunload", () => {
    homeSlider?.destroy();
    testimonialsSlider?.destroy();
    scrollingTreatmentsControl?.destroy();
  });
});
