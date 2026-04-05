// biome-ignore assist/source/organizeImports: imports are organized as needed
import { gsap, Flip } from "gsap/all";

gsap.registerPlugin(Flip);

const TRAILING_SLASH_REGEX = /\/$/;

function extractNameFromSchema(schemaObj) {
  if (schemaObj["@type"] === "BreadcrumbList" && Array.isArray(schemaObj.itemListElement)) {
    const item = schemaObj.itemListElement.find((el) => el.position === 2);
    if (item?.name) {
      return item.name;
    }
  }
  return null;
}

function extractNameFromGraph(data) {
  if (data["@graph"] && Array.isArray(data["@graph"])) {
    for (const graphItem of data["@graph"]) {
      const name = extractNameFromSchema(graphItem);
      if (name) {
        return name;
      }
    }
  } else {
    const name = extractNameFromSchema(data);
    if (name) {
      return name;
    }
  }
  return null;
}

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const getTemplate = (prefix, highlight) => `
  <div x-data="relatedTreatments" x-show="treatments.length > 0" style="display: none;"
    class="bg-soft-blue px-8 py-16 pb-30 md:p-28 overflow-hidden" @mouseenter="isHovering = true; stopAutoplay()"
    @mouseleave="isHovering = false; startAutoplay()">

    <h2 class="text-accent-navy mb-16 text-4xl font-bold tracking-tight text-center">
      ${prefix} ${highlight ? `<span class="text-info">${highlight}</span>` : ''}
    </h2>

    <div class="relative max-w-7xl mx-auto">
      <ul role="list" class="relative grid gap-16 grid-cols-1 lg:grid-cols-3 overflow-hidden p-4" x-ref="list">
        <template x-for="(item, index) in treatments" :key="item.url">
          <li class="relative treatment-card w-full" :data-flip-id="item.url" x-show="index < visibleCount">
            <a :href="item.url"
              class="group relative flex w-full flex-col overflow-hidden rounded-2xl active:opacity-75 cursor-pointer">
              <div class="relative aspect-10/7 w-full overflow-hidden rounded-lg">
                <img :src="item.ogImage" :alt="item.title"
                  class="aspect-10/7 w-full object-cover outline -outline-offset-1 outline-black/5 transition duration-300 ease-out group-hover:scale-105" />
                <div class="absolute inset-0 bg-black/0 transition duration-300 ease-out group-hover:bg-black/5"></div>
              </div>
              <p class="mt-8 block text-2xl text-center font-medium text-accent-navy transition-colors group-hover:text-info"
                x-text="item.title"></p>
            </a>
          </li>
        </template>
      </ul>

      <div class="mt-16 flex items-center justify-center gap-8" x-show="treatments.length > visibleCount"
        style="display: none;">
        
        <button
          @click="prev()"
          :disabled="isAnimating"
          class="embla-testimonials__button embla-testimonials__button--prev border-accent-navy text-accent-navy hover:bg-accent-navy focus:ring-info pointer-events-auto cursor-pointer rounded-full border-2 bg-transparent p-2 transition-all duration-300 hover:scale-110 hover:text-white focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-40"
          type="button" aria-label="Previous testimonial">
          <svg class="size-6" aria-hidden="true">
            <use href="#icon-previous"></use>
          </svg>
        </button>

        <button
          @click="next()"
          :disabled="isAnimating"
          class="embla-testimonials__button embla-testimonials__button--next border-accent-navy text-accent-navy hover:bg-accent-navy focus:ring-info pointer-events-auto cursor-pointer rounded-full border-2 bg-transparent p-2 transition-all duration-300 hover:scale-110 hover:text-white focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-40"
          type="button" aria-label="Next testimonial">
          <svg class="size-6" aria-hidden="true">
            <use href="#icon-next"></use>
          </svg>
        </button>

      </div>
    </div>
  </div>
`;

export class RelatedTreatmentsElement extends HTMLElement {
  connectedCallback() {
    if (!this.innerHTML.trim()) {
      const prefix = this.getAttribute("data-prefix") || "Related";
      const highlight = this.getAttribute("data-highlight") || "Treatments";
      
      this.innerHTML = getTemplate(prefix, highlight);
    }
  }
}
customElements.define("related-treatments", RelatedTreatmentsElement);

document.addEventListener("alpine:init", () => {
  window.Alpine.data("relatedTreatments", () => ({
    treatments: [],
    isAnimating: false,
    autoplayTimer: null,
    ctx: null,
    visibleCount: 1,
    isHovering: false,
    _resizeHandler: null,

    async init() {
      this.updateVisibleCount();

      this._resizeHandler = this.updateVisibleCount.bind(this);
      window.addEventListener("resize", this._resizeHandler);

      const serviceName = this.getCareServiceName();
      if (!serviceName) {
        return;
      }

      await this.fetchAndFilterData(serviceName);

      this.$nextTick(() => {
        if (this.treatments.length > 0) {
          this.animateInitialCards();
          this.startAutoplay();
        }
      });
    },

    updateVisibleCount() {
      this.visibleCount = window.matchMedia("(min-width: 1024px)").matches ? 3 : 1;
    },

    getCareServiceName() {
      const scripts = document.querySelectorAll('script[type="application/ld+json"]');

      for (const script of scripts) {
        try {
          const data = JSON.parse(script.textContent);
          const name = extractNameFromGraph(data);
          if (name) {
            return name;
          }
        } catch (err) {
          console.debug("Error parsing JSON-LD script", err);
        }
      }
      return null;
    },

    async fetchAndFilterData(serviceName) {
      await window.Alpine.store("treatmentsData").fetch();
      const allTreatments = window.Alpine.store("treatmentsData").items;

      if (!allTreatments || allTreatments.length === 0) {
        return;
      }

      const currentPath = window.location.pathname.replace(TRAILING_SLASH_REGEX, "");

      const filteredTreatments = allTreatments.filter((item) => {
        const itemPath = new URL(item.url, window.location.origin).pathname.replace(TRAILING_SLASH_REGEX, "");
        return item.type === "treatment" && item.care_services === serviceName && itemPath !== currentPath;
      });

      const randomizedTreatments = shuffleArray(filteredTreatments);

      this.treatments = randomizedTreatments.map((item) => ({
        ...item,
        ogImage: item.ogImage.replace("%VITE_SITE_URL%", import.meta.env.VITE_SITE_URL || ""),
      }));
    },

    animateInitialCards() {
      this.ctx = gsap.context(() => {
        const visibleCards = gsap.utils.toArray(".treatment-card", this.$refs.list).filter((el) => el.style.display !== "none");
        gsap.fromTo(
          visibleCards,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.15,
            ease: "power3.out",
            clearProps: "y,opacity",
          }
        );
      }, this.$refs.list);
    },

    next() {
      if (this.isAnimating || this.treatments.length <= this.visibleCount) {
        return;
      }
      this.stopAutoplay();
      this.updateCaterpillar(true);
    },

    prev() {
      if (this.isAnimating || this.treatments.length <= this.visibleCount) {
        return;
      }
      this.stopAutoplay();
      this.updateCaterpillar(false);
    },

    updateCaterpillar(forward) {
      this.isAnimating = true;

      const cards = gsap.utils.toArray(".treatment-card", this.$refs.list);
      const state = Flip.getState(cards);

      if (forward) {
        this.treatments.push(this.treatments.shift());
      } else {
        this.treatments.unshift(this.treatments.pop());
      }

      this.$nextTick(() => {
        const updatedCards = gsap.utils.toArray(".treatment-card", this.$refs.list);

        Flip.from(state, {
          targets: updatedCards,
          absoluteOnLeave: true,
          fade: true,
          duration: 0.5,
          ease: "power2.out",
          onEnter: (els) => {
            gsap.set(els, {
              opacity: 0,
              scale: 0,
              transformOrigin: forward ? "bottom right" : "bottom left",
            });
            return gsap.to(els, {
              opacity: 1,
              scale: 1,
              duration: 0.5,
              ease: "power2.out",
            });
          },
          onLeave: (els) => {
            return gsap.to(els, {
              opacity: 0,
              scale: 0,
              transformOrigin: forward ? "bottom left" : "bottom right",
              duration: 0.5,
              ease: "power2.out",
            });
          },
          onComplete: () => {
            gsap.set(updatedCards, { clearProps: "scale,opacity,transform,transformOrigin" });
            this.isAnimating = false;
            this.startAutoplay();
          },
        });
      });
    },

    startAutoplay() {
      this.stopAutoplay();
      if (this.treatments.length > this.visibleCount && !this.isHovering) {
        this.autoplayTimer = setTimeout(() => {
          const canAutoplay = !(document.hidden || this.isAnimating);
          if (canAutoplay) {
            this.updateCaterpillar(true);
          } else {
            this.startAutoplay();
          }
        }, 5000);
      }
    },

    stopAutoplay() {
      if (this.autoplayTimer) {
        clearTimeout(this.autoplayTimer);
        this.autoplayTimer = null;
      }
    },

    destroy() {
      if (this.ctx) {
        this.ctx.revert();
      }
      this.stopAutoplay();

      if (this._resizeHandler) {
        window.removeEventListener("resize", this._resizeHandler);
      }
    },
  }));
});