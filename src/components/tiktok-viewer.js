export function tiktokViewer() {
  const THROTTLE_MS = 600;
  const SWIPE_THRESHOLD = 50;

  return {
    videos: [],
    currentIndex: 0,
    touchStartY: 0,
    isLoading: true,
    videoLoading: false,
    lastActionTime: 0,
    observer: null,

    async init() {
      try {
        const version =
          typeof __BUILD_TIMESTAMP__ !== "undefined"
            ? __BUILD_TIMESTAMP__
            : Date.now();
        const response = await fetch(`/videos.json?v=${version}`);
        
        if (!response.ok) {
          throw new Error("Failed to load videos");
        }
        
        let data = await response.json();

        for (let i = data.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [data[i], data[j]] = [data[j], data[i]];
        }

        this.videos = data;
        this.isLoading = false;

        if (this.videos.length > 0) {
          this.renderVideo();
        }

        this.$watch("currentIndex", () => this.renderVideo());
      } catch (error) {
        this.isLoading = false;
      }
    },

    throttled(fn) {
      const now = Date.now();
      if (now - this.lastActionTime < THROTTLE_MS) {
        return;
      }
      this.lastActionTime = now;
      fn();
    },

    next() {
      this.throttled(() => {
        if (this.currentIndex < this.videos.length - 1) {
          this.currentIndex++;
        }
      });
    },

    prev() {
      this.throttled(() => {
        if (this.currentIndex > 0) {
          this.currentIndex--;
        }
      });
    },

    handleKeydown(e) {
      if (e.key === "ArrowDown") {
        this.next();
      }
      if (e.key === "ArrowUp") {
        this.prev();
      }
    },

    handleTouchStart(e) {
      this.touchStartY = e.touches[0].clientY;
    },

    handleTouchEnd(e) {
      const swipeDistance = this.touchStartY - e.changedTouches[0].clientY;
      if (swipeDistance > SWIPE_THRESHOLD) {
        this.next();
      }
      if (swipeDistance < -SWIPE_THRESHOLD) {
        this.prev();
      }
    },

    patchIframeSrc(node) {
      try {
        const url = new URL(node.src);
        url.searchParams.set("autoplay", "1");
        node.src = url.toString();
      } catch {}
    },

    patchAutoplay(container) {
      if (this.observer) {
        this.observer.disconnect();
      }

      this.observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          for (const node of mutation.addedNodes) {
            if (node.nodeName === "IFRAME") {
              this.patchIframeSrc(node);
              node.addEventListener("load", () => {
                this.videoLoading = false;
              }, { once: true });
              this.observer.disconnect();
              return;
            }
          }
        }
      });
      
      this.observer.observe(container, { childList: true, subtree: true });
    },

    renderVideo() {
      const container = document.getElementById("tiktok-container");
      const video = this.videos[this.currentIndex];
      
      if (!(container && video)) {
        return;
      }

      if (this.observer) {
        this.observer.disconnect();
      }

      this.videoLoading = true;
      container.innerHTML = "";
      this.patchAutoplay(container);

      container.innerHTML = `
        <blockquote
          class="tiktok-embed"
          cite="https://www.tiktok.com/${video.author}/video/${video.id}"
          data-video-id="${video.id}"
          style="max-width: 605px; min-width: 325px; width: 100%; margin: 0 auto;"
        >
          <section></section>
        </blockquote>
      `;

      this.$nextTick(() => {
        if (
          window.tiktokEmbed &&
          typeof window.tiktokEmbed.render === "function"
        ) {
          window.tiktokEmbed.render(
            document.querySelectorAll(".tiktok-embed")
          );
        } else {
          const script = document.createElement("script");
          script.src = "https://www.tiktok.com/embed.js";
          script.async = true;
          document.body.appendChild(script);
        }
      });
    },

    destroy() {
      if (this.observer) {
        this.observer.disconnect();
      }
    }
  };
}