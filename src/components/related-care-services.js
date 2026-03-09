import { Flip, gsap } from "gsap/all";

gsap.registerPlugin(Flip);

const TRAILING_SLASH_REGEX = /\/$/;

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const TEMPLATE = `
  <div x-data="relatedCareServices" x-show="services.length > 0" style="display: none;"
    class="bg-info/5 px-8 py-16 pb-30 md:p-28 overflow-hidden" @mouseenter="isHovering = true; stopAutoplay()"
    @mouseleave="isHovering = false; startAutoplay()">

    <h2 class="text-accent-navy mb-16 text-4xl font-bold tracking-tight text-center">
      Explore <span class="text-info">Care Services</span>
    </h2>

    <div class="relative max-w-7xl mx-auto">
      <ul role="list" class="relative grid gap-16 grid-cols-1 lg:grid-cols-3 overflow-hidden p-4" x-ref="list">
        <template x-for="(item, index) in services" :key="item.url">
          <li class="relative service-card w-full" :data-flip-id="item.url" x-show="index < visibleCount">
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

      <div class="mt-16 flex items-center justify-center gap-8" x-show="services.length > visibleCount"
        style="display: none;">
        
        <button
          @click="prev()"
          :disabled="isAnimating"
          class="embla-testimonials__button border-accent-navy text-accent-navy hover:bg-accent-navy focus:ring-info pointer-events-auto cursor-pointer rounded-full border-2 bg-transparent p-2 transition-all duration-300 hover:scale-110 hover:text-white focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-40"
          type="button" aria-label="Previous service">
          <svg class="size-6" aria-hidden="true"><use href="#icon-previous"></use></svg>
        </button>

        <button
          @click="next()"
          :disabled="isAnimating"
          class="embla-testimonials__button border-accent-navy text-accent-navy hover:bg-accent-navy focus:ring-info pointer-events-auto cursor-pointer rounded-full border-2 bg-transparent p-2 transition-all duration-300 hover:scale-110 hover:text-white focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-40"
          type="button" aria-label="Next service">
          <svg class="size-6" aria-hidden="true"><use href="#icon-next"></use></svg>
        </button>

      </div>
    </div>
  </div>
`;

export class RelatedCareServicesElement extends HTMLElement {
  connectedCallback() {
    if (!this.innerHTML.trim()) {
      this.innerHTML = TEMPLATE;
    }
  }
}
customElements.define("related-care-services", RelatedCareServicesElement);

document.addEventListener("alpine:init", () => {
  window.Alpine.data("relatedCareServices", () => ({
    services: [],
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

      await this.fetchAndFilterData();

      this.$nextTick(() => {
        if (this.services.length > 0) {
          this.animateInitialCards();
          this.startAutoplay();
        }
      });
    },

    updateVisibleCount() {
      this.visibleCount = window.matchMedia("(min-width: 1024px)").matches ? 3 : 1;
    },

    async fetchAndFilterData() {
      await window.Alpine.store("treatmentsData").fetch();
      const allData = window.Alpine.store("treatmentsData").items;

      if (!allData || allData.length === 0) {
        return;
      }

      const currentPath = window.location.pathname.replace(TRAILING_SLASH_REGEX, "");

      const filteredServices = allData.filter((item) => {
        const itemPath = new URL(item.url, window.location.origin).pathname.replace(TRAILING_SLASH_REGEX, "");
        return item.type === "care-service" && itemPath !== currentPath;
      });

      const randomizedServices = shuffleArray(filteredServices);

      this.services = randomizedServices.map((item) => {
        let treatmentTitle = item.title;

        if (item.type === "care-service") {
          const cleanedName = treatmentTitle
            .replace(/\s*Services in Nepal/gi, "")
            .replace(/\s*in Nepal/gi, "")
            .replace(/\s+(Services in|in)$/gi, "")
            .trim();
          
          if (cleanedName) {
            treatmentTitle = cleanedName;
          }
        }

        return {
          ...item,
          title: treatmentTitle,
          ogImage: item.ogImage.replace("%VITE_SITE_URL%", import.meta.env.VITE_SITE_URL || ""),
        };
      });
    },

    animateInitialCards() {
      this.ctx = gsap.context(() => {
        const visibleCards = gsap.utils.toArray(".service-card", this.$refs.list).filter((el) => el.style.display !== "none");
        gsap.fromTo(visibleCards, 
          { y: 30, opacity: 0 }, 
          { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: "power3.out", clearProps: "y,opacity" }
        );
      }, this.$refs.list);
    },

    next() {
      if (this.isAnimating || this.services.length <= this.visibleCount) {
        return;
      }
      this.stopAutoplay();
      this.updateCaterpillar(true);
    },

    prev() {
      if (this.isAnimating || this.services.length <= this.visibleCount) {
        return;
      }
      this.stopAutoplay();
      this.updateCaterpillar(false);
    },

    updateCaterpillar(forward) {
      this.isAnimating = true;
      const cards = gsap.utils.toArray(".service-card", this.$refs.list);
      const state = Flip.getState(cards);

      if (forward) {
        this.services.push(this.services.shift());
      } else {
        this.services.unshift(this.services.pop());
      }

      this.$nextTick(() => {
        const updatedCards = gsap.utils.toArray(".service-card", this.$refs.list);
        Flip.from(state, {
          targets: updatedCards,
          absoluteOnLeave: true,
          fade: true,
          duration: 0.5,
          ease: "power2.out",
          onEnter: (els) => {
            gsap.set(els, { opacity: 0, scale: 0, transformOrigin: forward ? "bottom right" : "bottom left" });
            return gsap.to(els, { opacity: 1, scale: 1, duration: 0.5, ease: "power2.out" });
          },
          onLeave: (els) => {
            return gsap.to(els, { opacity: 0, scale: 0, transformOrigin: forward ? "bottom left" : "bottom right", duration: 0.5, ease: "power2.out" });
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
      if (this.services.length > this.visibleCount && !this.isHovering) {
        this.autoplayTimer = setTimeout(() => {
          if (document.hidden || this.isAnimating) {
            this.startAutoplay();
          } else {
            this.updateCaterpillar(true);
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