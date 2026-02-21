import EmblaCarousel from "embla-carousel";

const addTogglePrevNextBtnsActive = (emblaApi, prevBtn, nextBtn) => {
  const togglePrevNextBtnsState = () => {
    if (emblaApi.canScrollPrev()) {
      prevBtn.removeAttribute("disabled");
    } else {
      prevBtn.setAttribute("disabled", "disabled");
    }

    if (emblaApi.canScrollNext()) {
      nextBtn.removeAttribute("disabled");
    } else {
      nextBtn.setAttribute("disabled", "disabled");
    }
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
  const scrollPrev = () => {
    emblaApi.scrollPrev();
  };

  const scrollNext = () => {
    emblaApi.scrollNext();
  };

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

const shuffleSlides = (containerNode) => {
  if (!containerNode) {
    return;
  }

  const slides = Array.from(containerNode.children);

  for (let i = slides.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [slides[i], slides[j]] = [slides[j], slides[i]];
  }

  const fragment = document.createDocumentFragment();
  for (const slide of slides) {
    fragment.appendChild(slide);
  }

  containerNode.appendChild(fragment);
};

export const initTestimonialsSlider = () => {
  const emblaNode = document.querySelector(".embla-testimonials");

  if (!emblaNode) {
    return null;
  }

  const viewportNode = emblaNode.querySelector(".embla-testimonials__viewport");

  if (!viewportNode) {
    return null;
  }

  const containerNode = emblaNode.querySelector(
    ".embla-testimonials__container"
  );

  if (!containerNode) {
    return null;
  }

  shuffleSlides(containerNode);

  const prevBtnNode = emblaNode.querySelector(
    ".embla-testimonials__button--prev"
  );

  const nextBtnNode = emblaNode.querySelector(
    ".embla-testimonials__button--next"
  );

  const options = {
    slidesToScroll: 1,
    breakpoints: {
      "(min-width: 1024px)": { slidesToScroll: 2 },
    },
  };

  const emblaApi = EmblaCarousel(viewportNode, options);

  const hasButtons = prevBtnNode && nextBtnNode;

  if (hasButtons) {
    const removePrevNextBtnsClickHandlers = addPrevNextBtnsClickHandlers(
      emblaApi,
      prevBtnNode,
      nextBtnNode
    );
    emblaApi.on("destroy", removePrevNextBtnsClickHandlers);
  }

  return {
    emblaApi,
    destroy: () => {
      emblaApi.destroy();
    },
  };
};
