import EmblaCarousel from "embla-carousel";
import "./home-slider.css";

export function initHomeSlider({
  containerSelector = ".embla",
  autoplayDelay = 6000,
  transitionDuration = 35,
  loop = true,
} = {}) {
  const emblaNode = document.querySelector(containerSelector);

  // Silent exit if slider not found (prevents errors on other pages)
  if (!emblaNode) return null;

  // Init Embla
  const emblaApi = EmblaCarousel(emblaNode, {
    loop,
    skipSnaps: false,
    duration: transitionDuration,
    dragFree: false,
    draggable: true,
    align: "start",
  });

  // Navigation elements
  const section = emblaNode.closest("section");
  const prevBtn = section?.querySelector(".embla__prev");
  const nextBtn = section?.querySelector(".embla__next");
  const dotsNode = section?.querySelector(".embla__dots");

  if (!(prevBtn && nextBtn && dotsNode)) {
    return { emblaApi, destroy: () => emblaApi.destroy() }; // Return API even if nav is missing
  }

  // Event Handlers
  prevBtn.addEventListener("click", () => emblaApi.scrollPrev());
  nextBtn.addEventListener("click", () => emblaApi.scrollNext());

  // Dots Logic
  const addDotBtns = () => {
    dotsNode.innerHTML = emblaApi
      .scrollSnapList()
      .map(
        (_, i) =>
          `<button class="embla__dot w-3 h-3 rounded-full bg-white/50 transition-all duration-300" type="button" aria-label="Go to slide ${i + 1}"></button>`
      )
      .join("");
  };

  const updateDots = () => {
    const previous = emblaApi.previousScrollSnap();
    const selected = emblaApi.selectedScrollSnap();
    const dots = dotsNode.querySelectorAll(".embla__dot");

    if (dots[previous]) {
      dots[previous].classList.remove("bg-white", "w-8");
      dots[previous].classList.add("bg-white/50", "w-3");
    }

    if (dots[selected]) {
      dots[selected].classList.add("bg-white", "w-8");
      dots[selected].classList.remove("bg-white/50", "w-3");
    }
  };

  const addDotClickListeners = () => {
    dotsNode.querySelectorAll(".embla__dot").forEach((dot, i) => {
      dot.addEventListener("click", () => emblaApi.scrollTo(i), false);
    });
  };

  // Init UI
  addDotBtns();
  addDotClickListeners();
  updateDots();

  emblaApi.on("select", updateDots);
  emblaApi.on("reInit", () => {
    addDotBtns();
    addDotClickListeners();
    updateDots();
  });

  // Autoplay Logic
  let autoplayInterval;
  const startAutoplay = () => {
    autoplayInterval = setInterval(() => emblaApi.scrollNext(), autoplayDelay);
  };
  const stopAutoplay = () => clearInterval(autoplayInterval);

  startAutoplay();
  emblaNode.addEventListener("mouseenter", stopAutoplay);
  emblaNode.addEventListener("mouseleave", startAutoplay);

  // Return Public API
  return {
    emblaApi,
    destroy: () => {
      stopAutoplay();
      emblaApi.destroy();
    },
  };
}
