import EmblaCarousel from "embla-carousel";
import "./home-slider.css";

export function initHomeSlider({
  containerSelector = ".embla",
  autoplayDelay = 6000,
  transitionDuration = 35,
  loop = true,
} = {}) {
  const emblaNode = document.querySelector(containerSelector);

  if (!emblaNode) {
    return null;
  }

  const emblaApi = EmblaCarousel(emblaNode, {
    loop,
    skipSnaps: false,
    duration: transitionDuration,
    dragFree: false,
    draggable: true,
    align: "start",
  });

  const section = emblaNode.closest("section");

  if (!section) {
    return {
      emblaApi,
      destroy: () => {
        emblaApi.destroy();
      },
    };
  }

  const prevBtn = section.querySelector(".embla__prev");
  const nextBtn = section.querySelector(".embla__next");
  const dotsNode = section.querySelector(".embla__dots");

  const hasControls = prevBtn && nextBtn && dotsNode;

  if (!hasControls) {
    return {
      emblaApi,
      destroy: () => {
        emblaApi.destroy();
      },
    };
  }

  const handlePrev = () => {
    emblaApi.scrollPrev();
  };

  const handleNext = () => {
    emblaApi.scrollNext();
  };

  const handleDotClick = (event) => {
    const dot = event.target.closest(".embla__dot");
    if (dot) {
      emblaApi.scrollTo(Number(dot.dataset.index));
    }
  };

  const addDotBtns = () => {
    dotsNode.innerHTML = emblaApi
      .scrollSnapList()
      .map((_, i) => {
        return `<button class="embla__dot w-3 h-3 rounded-full bg-white/50 transition-all duration-300" type="button" aria-label="Go to slide ${i + 1}" data-index="${i}"></button>`;
      })
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

  const bindEvents = () => {
    prevBtn.addEventListener("click", handlePrev);
    nextBtn.addEventListener("click", handleNext);
    dotsNode.addEventListener("click", handleDotClick);
  };

  addDotBtns();
  bindEvents();
  updateDots();

  emblaApi.on("select", updateDots);
  emblaApi.on("reInit", () => {
    addDotBtns();
    updateDots();
  });

  let autoplayInterval;

  const startAutoplay = () => {
    clearInterval(autoplayInterval);
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

  return {
    emblaApi,
    destroy: () => {
      stopAutoplay();
      emblaNode.removeEventListener("mouseenter", stopAutoplay);
      emblaNode.removeEventListener("mouseleave", startAutoplay);
      prevBtn.removeEventListener("click", handlePrev);
      nextBtn.removeEventListener("click", handleNext);
      dotsNode.removeEventListener("click", handleDotClick);

      emblaApi.destroy();
    },
  };
}