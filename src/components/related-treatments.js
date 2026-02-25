import gsap from "gsap";
import { Flip } from "gsap/Flip";

gsap.registerPlugin(Flip);

document.addEventListener('alpine:init', () => {
  Alpine.store('treatmentsData', {
    items: [],
    isLoaded: false,
    isLoading: false,

    async fetch() {
      if (this.isLoaded || this.isLoading) return;
      
      this.isLoading = true;
      try {
        // biome-ignore lint/correctness/noUndeclaredVariables: Injected globally by Vite
        const version = typeof __BUILD_TIMESTAMP__ !== "undefined" ? __BUILD_TIMESTAMP__ : Date.now();
        const response = await fetch(`/treatments-data.json?v=${version}`);
        this.items = await response.json();
        this.isLoaded = true;
      } catch (error) {
        console.error("Failed to load treatments:", error);
      } finally {
        this.isLoading = false;
      }
    }
  });
});

export function relatedTreatments() {
  return {
    treatments: [],
    isAnimating: false,
    autoplayTimer: null,
    ctx: null,
    visibleCount: 1,
    isHovering: false,

    async init() {
      this.updateVisibleCount();
      window.addEventListener('resize', () => this.updateVisibleCount());

      const serviceName = this.getCareServiceName();
      if (!serviceName) return;

      await this.fetchAndFilterData(serviceName);

      this.$nextTick(() => {
        if (this.treatments.length > 0) {
          this.animateInitialCards();
          this.startAutoplay();
        }
      });
    },

    updateVisibleCount() {
      this.visibleCount = window.matchMedia('(min-width: 1024px)').matches ? 3 : 1;
    },

    getCareServiceName() {
      const scripts = document.querySelectorAll('script[type="application/ld+json"]');
      
      for (const script of scripts) {
        try {
          const data = JSON.parse(script.textContent);

          const extractName = (schemaObj) => {
            if (schemaObj['@type'] === 'BreadcrumbList' && Array.isArray(schemaObj.itemListElement)) {
              const item = schemaObj.itemListElement.find(el => el.position === 2);
              if (item && item.name) return item.name;
            }
            return null;
          };

          if (data['@graph'] && Array.isArray(data['@graph'])) {
            for (const graphItem of data['@graph']) {
              const name = extractName(graphItem);
              if (name) return name;
            }
          } else {
            const name = extractName(data);
            if (name) return name;
          }
        } catch (err) {}
      }
      return null;
    },

    async fetchAndFilterData(serviceName) {
      await Alpine.store('treatmentsData').fetch();
      const allTreatments = Alpine.store('treatmentsData').items;

      if (!allTreatments || allTreatments.length === 0) return;

      const currentPath = window.location.pathname.replace(/\/$/, "");

      const filteredTreatments = allTreatments.filter(item => {
        const itemPath = new URL(item.url, window.location.origin).pathname.replace(/\/$/, "");
        return item.care_services === serviceName && itemPath !== currentPath;
      });

      this.treatments = filteredTreatments.map(item => ({
        ...item,
        ogImage: item.ogImage.replace('%VITE_SITE_URL%', import.meta.env.VITE_SITE_URL || '')
      }));
    },

    animateInitialCards() {
      this.ctx = gsap.context(() => {
        const visibleCards = gsap.utils.toArray('.treatment-card', this.$refs.list).filter(el => el.style.display !== 'none');
        gsap.fromTo(visibleCards,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.15,
            ease: 'power3.out',
            clearProps: 'y,opacity' 
          }
        );
      }, this.$refs.list);
    },

    next() {
      if (this.isAnimating || this.treatments.length <= this.visibleCount) return;
      this.stopAutoplay();
      this.updateCaterpillar(true);
    },

    prev() {
      if (this.isAnimating || this.treatments.length <= this.visibleCount) return;
      this.stopAutoplay();
      this.updateCaterpillar(false);
    },

    updateCaterpillar(forward) {
      this.isAnimating = true;

      const cards = gsap.utils.toArray('.treatment-card', this.$refs.list);
      const state = Flip.getState(cards);

      if (forward) {
        this.treatments.push(this.treatments.shift());
      } else {
        this.treatments.unshift(this.treatments.pop());
      }

      this.$nextTick(() => {
        const updatedCards = gsap.utils.toArray('.treatment-card', this.$refs.list);

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
              transformOrigin: forward ? "bottom right" : "bottom left" 
            });
            return gsap.to(els, {
              opacity: 1,
              scale: 1,
              duration: 0.5,
              ease: "power2.out"
            });
          },
          onLeave: (els) => {
            return gsap.to(els, {
              opacity: 0,
              scale: 0,
              transformOrigin: forward ? "bottom left" : "bottom right",
              duration: 0.5,
              ease: "power2.out"
            });
          },
          onComplete: () => {
            gsap.set(updatedCards, { clearProps: "scale,opacity,transform,transformOrigin" });
            this.isAnimating = false;
            this.startAutoplay();
          }
        });
      });
    },

    startAutoplay() {
      this.stopAutoplay();
      if (this.treatments.length > this.visibleCount && !this.isHovering) {
        this.autoplayTimer = setTimeout(() => {
          if (!document.hidden && !this.isAnimating) {
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
      if (this.ctx) this.ctx.revert();
      this.stopAutoplay();
      window.removeEventListener('resize', () => this.updateVisibleCount());
    }
  };
}