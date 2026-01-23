const TEMPLATE = `
  <button
    id="scroll-btn"
    type="button"
    class="bg-accent-navy/90 hover:bg-info fixed right-4 bottom-28 z-40 cursor-pointer rounded-full p-3 text-white shadow-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl lg:right-8 lg:bottom-8 opacity-0 translate-y-8 pointer-events-none"
    aria-label="Scroll to top">
    <svg class="size-6" aria-hidden="true">
      <use href="#icon-arrow-up" />
    </svg>
  </button>
`;

export class ScrollToTop extends HTMLElement {
  constructor() {
    super();
    this.handleScroll = this.handleScroll.bind(this);
    this.scrollToTop = this.scrollToTop.bind(this);
  }

  connectedCallback() {
    if (!this.innerHTML) {
      this.innerHTML = TEMPLATE;
    }

    this.btn = this.querySelector("#scroll-btn");

    // Attach event listeners
    window.addEventListener("scroll", this.handleScroll, { passive: true });
    this.btn.addEventListener("click", this.scrollToTop);
  }

  disconnectedCallback() {
    // Clean up to prevent memory leaks
    window.removeEventListener("scroll", this.handleScroll);
    if (this.btn) {
      this.btn.removeEventListener("click", this.scrollToTop);
    }
  }

  handleScroll() {
    if (!this.btn) {
      return;
    }

    if (window.scrollY > 300) {
      // Show button
      this.btn.classList.remove(
        "opacity-0",
        "translate-y-8",
        "pointer-events-none"
      );
      this.btn.classList.add(
        "opacity-100",
        "translate-y-0",
        "pointer-events-auto"
      );
    } else {
      // Hide button
      this.btn.classList.add(
        "opacity-0",
        "translate-y-8",
        "pointer-events-none"
      );
      this.btn.classList.remove(
        "opacity-100",
        "translate-y-0",
        "pointer-events-auto"
      );
    }
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

customElements.define("scroll-to-top", ScrollToTop);
