import EmblaCarousel from "embla-carousel";
import "./testimonials-slider.css";

/**
 * Initialize Testimonials Slider
 * @param {Object} options - Configuration options
 */
export function initTestimonialsSlider({
  containerSelector = ".embla-testimonials",
  transitionDuration = 35,
  loop = true,
} = {}) {
  const emblaNode = document.querySelector(containerSelector);

  if (!emblaNode) {
    console.error(`Testimonials carousel "${containerSelector}" not found`);
    return null;
  }

  const root = emblaNode.closest("[data-testimonials-carousel]");
  const prevBtn = root?.querySelector(".embla-testimonials__prev");
  const nextBtn = root?.querySelector(".embla-testimonials__next");
  const dotsNode = root?.querySelector(".embla-testimonials__dots");

  if (!(prevBtn && nextBtn && dotsNode)) {
    console.error("Testimonials navigation elements not found");
    return null;
  }

  // Initialize Embla Carousel
  const emblaApi = EmblaCarousel(emblaNode, {
    loop,
    skipSnaps: false,
    duration: transitionDuration,
    dragFree: false,
    draggable: true,
    align: "start",
  });

  // Navigation button handlers
  const onPrev = () => emblaApi.scrollPrev();
  const onNext = () => emblaApi.scrollNext();

  prevBtn.addEventListener("click", onPrev);
  nextBtn.addEventListener("click", onNext);

  // Media query for large screens (2-column layout)
  const lgMq = window.matchMedia("(min-width: 1024px)");

  // Dots Navigation
  const addDotBtns = () => {
    const scrollSnaps = emblaApi.scrollSnapList();
    dotsNode.innerHTML = scrollSnaps
      .map(
        (_, index) => `
        <button 
          class="embla-testimonials__dot w-3 h-3 rounded-full bg-accent-navy/30 transition-all duration-300 hover:bg-accent-navy/50" 
          type="button" 
          aria-label="Go to testimonial ${index + 1}"
        ></button>
      `
      )
      .join("");
  };

  const updateDots = () => {
    const previous = emblaApi.previousScrollSnap();
    const selected = emblaApi.selectedScrollSnap();
    const dots = dotsNode.querySelectorAll(".embla-testimonials__dot");

    dots[previous]?.classList.remove("bg-accent-navy", "w-8");
    dots[previous]?.classList.add("bg-accent-navy/30", "w-3");

    dots[selected]?.classList.add("bg-accent-navy", "w-8");
    dots[selected]?.classList.remove("bg-accent-navy/30", "w-3");
  };

  const addDotClickListeners = () => {
    const dots = dotsNode.querySelectorAll(".embla-testimonials__dot");
    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => emblaApi.scrollTo(index));
    });
  };

  // Initialize dots
  addDotBtns();
  addDotClickListeners();
  updateDots();

  // Height Equalization
  const clearHeights = () => {
    emblaApi.slideNodes().forEach((slide) => {
      const card = slide.querySelector(".js-testimonial-card");
      if (card) card.style.height = "";
    });
  };

  const syncHeights = () => {
    // Only equalize heights on large screens (2-column layout)
    if (!lgMq.matches) {
      clearHeights();
      return;
    }

    const slideNodes = emblaApi.slideNodes();
    const inView = emblaApi.slidesInView();
    const indexes = inView.length ? inView : [emblaApi.selectedScrollSnap()];

    // Reset heights for visible slides
    indexes.forEach((i) => {
      const card = slideNodes[i]?.querySelector(".js-testimonial-card");
      if (card) card.style.height = "";
    });

    // Calculate max height among visible slides
    let maxHeight = 0;
    indexes.forEach((i) => {
      const card = slideNodes[i]?.querySelector(".js-testimonial-card");
      if (!card) return;
      maxHeight = Math.max(maxHeight, card.getBoundingClientRect().height);
    });

    // Apply max height to visible slides
    indexes.forEach((i) => {
      const card = slideNodes[i]?.querySelector(".js-testimonial-card");
      if (!card) return;
      card.style.height = `${Math.ceil(maxHeight)}px`;
    });
  };

  const syncHeightsRaf = () => requestAnimationFrame(syncHeights);

  // Event listeners
  emblaApi.on("select", () => {
    updateDots();
    syncHeightsRaf();
  });

  emblaApi.on("reInit", () => {
    addDotBtns();
    addDotClickListeners();
    updateDots();
    syncHeightsRaf();
  });

  emblaApi.on("resize", syncHeightsRaf);

  lgMq.addEventListener("change", syncHeightsRaf);

  // Initial setup
  syncHeightsRaf();

  // Cleanup function
  return {
    emblaApi,
    destroy: () => {
      lgMq.removeEventListener("change", syncHeightsRaf);
      prevBtn.removeEventListener("click", onPrev);
      nextBtn.removeEventListener("click", onNext);
      emblaApi.destroy();
    },
  };
}
