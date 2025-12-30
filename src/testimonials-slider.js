import EmblaCarousel from "embla-carousel";

const addTogglePrevNextBtnsActive = (emblaApi, prevBtn, nextBtn) => {
  const togglePrevNextBtnsState = () => {
    if (emblaApi.canScrollPrev()) prevBtn.removeAttribute("disabled");
    else prevBtn.setAttribute("disabled", "disabled");

    if (emblaApi.canScrollNext()) nextBtn.removeAttribute("disabled");
    else nextBtn.setAttribute("disabled", "disabled");
  };

  emblaApi
    .on("select", togglePrevNextBtnsState)
    .on("init", togglePrevNextBtnsState)
    .on("reInit", togglePrevNextBtnsState);

  return () => {
    prevBtn.removeAttribute("disabled");
    nextBtn.removeAttribute("disabled");
  };
};

const addPrevNextBtnsClickHandlers = (emblaApi, prevBtn, nextBtn) => {
  const scrollPrev = () => emblaApi.scrollPrev();
  const scrollNext = () => emblaApi.scrollNext();

  prevBtn.addEventListener("click", scrollPrev, false);
  nextBtn.addEventListener("click", scrollNext, false);

  const removeTogglePrevNextBtnsActive = addTogglePrevNextBtnsActive(
    emblaApi,
    prevBtn,
    nextBtn
  );

  return () => {
    removeTogglePrevNextBtnsActive();
    prevBtn.removeEventListener("click", scrollPrev, false);
    nextBtn.removeEventListener("click", scrollNext, false);
  };
};

const addDotBtnsAndClickHandlers = (emblaApi, dotsNode) => {
  let dotNodes = [];

  const addDotBtnsWithClickHandlers = () => {
    dotsNode.innerHTML = emblaApi
      .scrollSnapList()
      .map(
        () =>
          '<button class="w-3 h-3 rounded-full border-2 border-gray-300 hover:border-info transition-colors embla-testimonials__dot" type="button" aria-label="Go to slide"></button>'
      )
      .join("");

    const scrollTo = (index) => emblaApi.scrollTo(index);

    dotNodes = Array.from(
      dotsNode.querySelectorAll(".embla-testimonials__dot")
    );
    dotNodes.forEach((dotNode, index) => {
      dotNode.addEventListener("click", () => scrollTo(index), false);
    });
  };

  const toggleDotBtnsActive = () => {
    const previous = emblaApi.previousScrollSnap();
    const selected = emblaApi.selectedScrollSnap();
    dotNodes[previous]?.classList.remove("!bg-info", "!border-info");
    dotNodes[selected]?.classList.add("!bg-info", "!border-info");
  };

  emblaApi
    .on("init", addDotBtnsWithClickHandlers)
    .on("reInit", addDotBtnsWithClickHandlers)
    .on("init", toggleDotBtnsActive)
    .on("reInit", toggleDotBtnsActive)
    .on("select", toggleDotBtnsActive);

  return () => {
    dotsNode.innerHTML = "";
  };
};

export const initTestimonialsSlider = () => {
  const emblaNode = document.querySelector(".embla-testimonials");
  if (!emblaNode) return;

  const viewportNode = emblaNode.querySelector(".embla-testimonials__viewport");
  const prevBtnNode = emblaNode.querySelector(
    ".embla-testimonials__button--prev"
  );
  const nextBtnNode = emblaNode.querySelector(
    ".embla-testimonials__button--next"
  );
  const dotsNode = emblaNode.querySelector(".embla-testimonials__dots");

  const options = {
    slidesToScroll: 1,
    breakpoints: {
      "(min-width: 1024px)": { slidesToScroll: 2 },
    },
  };

  const emblaApi = EmblaCarousel(viewportNode, options);

  const removePrevNextBtnsClickHandlers = addPrevNextBtnsClickHandlers(
    emblaApi,
    prevBtnNode,
    nextBtnNode
  );

  const removeDotBtnsAndClickHandlers = addDotBtnsAndClickHandlers(
    emblaApi,
    dotsNode
  );

  emblaApi.on("destroy", removePrevNextBtnsClickHandlers);
  emblaApi.on("destroy", removeDotBtnsAndClickHandlers);

  return emblaApi;
};
