import focus from "@alpinejs/focus";
import Alpine from "alpinejs";
import "./components/app-footer.js";
import "./components/header.js";
import "./components/icon-sprite.js";
import { initLightBox } from "./components/LightBox/LightBox.js";
import "./components/related-care-services.js";
import "./components/related-treatments.js";
import "./components/scroll-to-top.js";
import { searchResults } from "./components/search.js";
import "./components/social-media-nav.js";
import { tiktokViewer } from "./components/tiktok-viewer.js";
import setupTreatmentMarquee from "./components/treatment-marquee.js";
import { initHomeSlider } from "./home-slider";
import "./style.css";
import { initTestimonialsSlider } from "./testimonials-slider";

Alpine.plugin(focus);
Alpine.data("searchResults", searchResults);
Alpine.data("tiktokViewer", tiktokViewer);

Alpine.store("treatmentsData", {
  items: [],
  isLoaded: false,
  isLoading: false,

  async fetch() {
    if (this.isLoaded || this.isLoading) {
      return;
    }

    this.isLoading = true;
    try {
      const version =
        typeof __BUILD_TIMESTAMP__ !== "undefined"
          ? __BUILD_TIMESTAMP__
          : Date.now();
      const response = await fetch(`/treatments-data.json?v=${version}`);
      this.items = await response.json();
      this.isLoaded = true;
    } catch (error) {
      console.error("Failed to load global data:", error);
    } finally {
      this.isLoading = false;
    }
  },
});

setupTreatmentMarquee();

window.Alpine = Alpine;
Alpine.start();

document.addEventListener("DOMContentLoaded", () => {
  const lightbox = initLightBox();

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
    if (lightbox) {
      lightbox.destroy();
    }
    if (homeSlider) {
      homeSlider.destroy();
    }
    if (testimonialsSlider) {
      testimonialsSlider.destroy();
    }
  });
});