// src/components/tiktok-viewer.js

export function tiktokViewer() {
  return {
    videos: [],
    currentIndex: 0,
    touchStartY: 0,
    isLoading: true,
    lastActionTime: 0,

    async init() {
      try {
        // Updated path: matches public/videos.json
        const response = await fetch('/videos.json');
        if (!response.ok) throw new Error('Failed to load videos');
        
        this.videos = await response.json();
        this.isLoading = false;
        
        // Render the first video once data is loaded
        if (this.videos.length > 0) {
          this.renderVideo();
        }
        
        // Watch for index changes to re-render the video
        this.$watch('currentIndex', () => this.renderVideo());
      } catch (error) {
        console.error("Error loading TikTok data:", error);
        this.isLoading = false;
      }
    },

    // Inline throttle logic (600ms cooldown) to protect against rapid-fire requests
    next() {
      const now = Date.now();
      if (now - this.lastActionTime < 600) return;
      this.lastActionTime = now;

      if (this.currentIndex < this.videos.length - 1) this.currentIndex++;
    },

    prev() {
      const now = Date.now();
      if (now - this.lastActionTime < 600) return;
      this.lastActionTime = now;

      if (this.currentIndex > 0) this.currentIndex--;
    },

    handleKeydown(e) {
      if (e.key === 'ArrowDown') this.next();
      if (e.key === 'ArrowUp') this.prev();
    },

    handleTouchStart(e) {
      this.touchStartY = e.touches[0].clientY;
    },

    handleTouchEnd(e) {
      const touchEndY = e.changedTouches[0].clientY;
      const swipeDistance = this.touchStartY - touchEndY;
      
      if (swipeDistance > 50) this.next(); // Swiped up
      if (swipeDistance < -50) this.prev(); // Swiped down
    },

    renderVideo() {
      const container = document.getElementById('tiktok-container');
      if (!container || !this.videos[this.currentIndex]) return;
      
      const video = this.videos[this.currentIndex];
      
      // Clear previous iframe to free up memory entirely
      container.innerHTML = '';

      // Build the raw blockquote
      const blockquote = `
        <blockquote 
          class="tiktok-embed" 
          cite="https://www.tiktok.com/${video.author}/video/${video.id}" 
          data-video-id="${video.id}" 
          style="max-width: 605px; min-width: 325px; width: 100%; height: 100%; margin: 0 auto;"
        >
          <section></section>
        </blockquote>
      `;
      
      container.innerHTML = blockquote;

      // Use $nextTick to ensure the DOM has painted the blockquote before TikTok parses it
      this.$nextTick(() => {
        if (window.tiktokEmbed && typeof window.tiktokEmbed.render === 'function') {
           window.tiktokEmbed.render(document.querySelectorAll('.tiktok-embed'));
        } else {
           const script = document.createElement('script');
           script.src = "https://www.tiktok.com/embed.js";
           script.async = true;
           document.body.appendChild(script);
        }
      });
    }
  };
}