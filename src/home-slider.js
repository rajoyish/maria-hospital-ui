import EmblaCarousel from "embla-carousel";
import "./home-slider.css";

/**
 * Initialize Home Slider with navigation and autoplay
 * @param {Object} options - Configuration options
 * @param {string} options.containerSelector - Slider container selector
 * @param {number} options.autoplayDelay - Autoplay delay in ms (default: 6000)
 * @param {number} options.transitionDuration - Transition duration (default: 35)
 * @param {boolean} options.loop - Enable loop (default: true)
 */
export function initHomeSlider({
  containerSelector = ".embla",
  autoplayDelay = 6000,
  transitionDuration = 35,
  loop = true,
} = {}) {
  const emblaNode = document.querySelector(containerSelector);

  if (!emblaNode) {
    console.error(`Slider element "${containerSelector}" not found`);
    return null;
  }

  // Initialize Embla
  const emblaApi = EmblaCarousel(emblaNode, {
    loop,
    skipSnaps: false,
    duration: transitionDuration,
    dragFree: false,
    draggable: true,
    align: "start",
  });

  // Get navigation elements
  const prevBtn = emblaNode.closest("section")?.querySelector(".embla__prev");
  const nextBtn = emblaNode.closest("section")?.querySelector(".embla__next");
  const dotsNode = emblaNode.closest("section")?.querySelector(".embla__dots");

  if (!(prevBtn && nextBtn && dotsNode)) {
    console.error("Navigation elements not found");
    return null;
  }

  // Navigation handlers
  prevBtn.addEventListener("click", () => emblaApi.scrollPrev());
  nextBtn.addEventListener("click", () => emblaApi.scrollNext());

  // Dots functionality
  const addDotBtns = () => {
    dotsNode.innerHTML = emblaApi
      .scrollSnapList()
      .map(
        (_, index) =>
          `<button class="embla__dot w-3 h-3 rounded-full bg-white/50 transition-all duration-300" type="button" aria-label="Go to slide ${
            index + 1
          }"></button>`
      )
      .join("");
  };

  const updateDots = () => {
    const previous = emblaApi.previousScrollSnap();
    const selected = emblaApi.selectedScrollSnap();
    const dots = dotsNode.querySelectorAll(".embla__dot");

    dots[previous]?.classList.remove("bg-white", "w-8");
    dots[previous]?.classList.add("bg-white/50", "w-3");

    dots[selected]?.classList.add("bg-white", "w-8");
    dots[selected]?.classList.remove("bg-white/50", "w-3");
  };

  const addDotClickListeners = () => {
    const dots = dotsNode.querySelectorAll(".embla__dot");
    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => emblaApi.scrollTo(index), false);
    });
  };

  // Initialize dots
  addDotBtns();
  addDotClickListeners();
  updateDots();

  // Update on slide change
  emblaApi.on("select", updateDots);
  emblaApi.on("reInit", () => {
    addDotBtns();
    addDotClickListeners();
    updateDots();
  });

  // Autoplay
  let autoplayInterval;

  const startAutoplay = () => {
    autoplayInterval = setInterval(() => {
      emblaApi.scrollNext();
    }, autoplayDelay);
  };

  const stopAutoplay = () => {
    clearInterval(autoplayInterval);
  };

  startAutoplay();
  emblaNode.addEventListener("mouseenter", stopAutoplay);
  emblaNode.addEventListener("mouseleave", startAutoplay);

  // Return API for external control
  return {
    emblaApi,
    destroy: () => {
      stopAutoplay();
      emblaApi.destroy();
    },
  };
}
