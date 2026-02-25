import "./style.css";

import focus from "@alpinejs/focus";
import Alpine from "alpinejs";
import { searchResults } from "./components/search.js";
import { initHomeSlider } from "./home-slider";
import { initTestimonialsSlider } from "./testimonials-slider";

import "./components/header.js";
import "./components/app-footer.js";
import "./components/social-media-nav.js";
import "./components/icon-sprite.js";
import "./components/scroll-to-top.js";
import "./components/related-treatments.js";
import setupTreatmentMarquee from "./components/treatment-marquee.js";

Alpine.plugin(focus);
Alpine.data("searchResults", searchResults);

setupTreatmentMarquee();

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
    if (homeSlider) {
      homeSlider.destroy();
    }
    if (testimonialsSlider) {
      testimonialsSlider.destroy();
    }
  });
});