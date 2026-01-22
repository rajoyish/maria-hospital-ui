const HEADER_TEMPLATE = `
  <header class="bg-white py-4 shadow-xl xl:px-28">
    <div class="mx-auto px-4 py-4" x-data="{
      mobileOpen: false,
      servicesOpen: false,
      searchOpen: false,
      lastFocusEl: null,

      openSearch() {
        this.lastFocusEl = document.activeElement
        this.searchOpen = true
        this.$nextTick(() => this.$refs.searchInput?.focus())
      },
      closeSearch() {
        this.searchOpen = false
        this.$nextTick(() => this.lastFocusEl?.focus?.())
      }
    }" @keydown.escape.window="
      if (searchOpen) { closeSearch(); return }
      mobileOpen = false; servicesOpen = false
    ">
      <div class="flex items-center justify-between gap-4">
        <a href="/" class="focus-visible:ring-info flex items-center gap-3 rounded focus-visible:ring-2 focus-visible:outline-none">
          <img src="/images/maria-hospital-logo.svg" alt="Maria Hospital" class="min-w-52" />
        </a>

        <div class="flex gap-28">
          <nav class="hidden lg:flex" aria-label="Primary">
            <ul class="flex items-center gap-6">
              <li class="border-info border-b-4">
                <a href="/" class="text-dark-navy hover:text-accent-navy focus-visible:ring-info rounded px-1 py-1 font-bold focus-visible:ring-2 focus-visible:outline-none">
                  Home </a>
              </li>

              <li class="relative">
                <button type="button"
                  class="text-dark-navy hover:text-accent-navy focus-visible:ring-info inline-flex cursor-pointer items-center gap-2 rounded px-1 py-1 focus-visible:ring-2 focus-visible:outline-none"
                  @click.stop="servicesOpen = !servicesOpen" :aria-expanded="servicesOpen" aria-haspopup="menu"
                  aria-controls="services-menu">
                  Care Services
                  <svg class="size-5" aria-hidden="true"><use href="#icon-chevron" /></svg>
                </button>

                <ul id="services-menu" role="menu" x-cloak x-show="servicesOpen" x-transition
                  @click.outside="servicesOpen = false"
                  class="absolute top-full left-0 z-20 mt-2 w-64 rounded-lg bg-white p-2 shadow-2xl">
                  <li role="none">
                    <a role="menuitem" href="/urology-std-services-nepal.html" class="text-dark-navy hover:bg-soft-blue focus-visible:ring-info block rounded-md px-3 py-2 focus-visible:ring-2 focus-visible:outline-none">Urology<span class="text-info">/</span>STD</a>
                  </li>
                  <li role="none">
                    <a role="menuitem" href="#" class="text-dark-navy hover:bg-soft-blue focus-visible:ring-info block rounded-md px-3 py-2 focus-visible:ring-2 focus-visible:outline-none">ENT (Ear, Nose & Throat)</a>
                  </li>
                  <li role="none">
                    <a role="menuitem" href="#" class="text-dark-navy hover:bg-soft-blue focus-visible:ring-info block rounded-md px-3 py-2 focus-visible:ring-2 focus-visible:outline-none">Anorectal<span class="text-info">/</span>Piles</a>
                  </li>
                  <li role="none">
                    <a role="menuitem" href="#" class="text-dark-navy hover:bg-soft-blue focus-visible:ring-info block rounded-md px-3 py-2 focus-visible:ring-2 focus-visible:outline-none">Acupuncture</a>
                  </li>
                  <li role="none">
                    <a role="menuitem" href="#" class="text-dark-navy hover:bg-soft-blue focus-visible:ring-info block rounded-md px-3 py-2 focus-visible:ring-2 focus-visible:outline-none">Gynecology</a>
                  </li>
                  <li role="none">
                    <a role="menuitem" href="#" class="text-dark-navy hover:bg-soft-blue focus-visible:ring-info block rounded-md px-3 py-2 focus-visible:ring-2 focus-visible:outline-none">General Medicine<span class="text-info">/</span>Lab</a>
                  </li>
                </ul>
              </li>

              <li>
                <a href="/" class="text-dark-navy hover:text-accent-navy focus-visible:ring-info rounded px-1 py-1 focus-visible:ring-2 focus-visible:outline-none">
                  FAQs </a>
              </li>

              <li>
                <a href="/" class="text-dark-navy hover:text-accent-navy focus-visible:ring-info rounded px-1 py-1 focus-visible:ring-2 focus-visible:outline-none">
                  Care Journeys </a>
              </li>

              <li>
                <a href="/contact-us.html" class="text-dark-navy hover:text-accent-navy focus-visible:ring-info rounded px-1 py-1 focus-visible:ring-2 focus-visible:outline-none">
                  Contact Us </a>
              </li>
            </ul>
          </nav>

          <div class="hidden items-center gap-3 lg:flex">
            <button type="button" @click="openSearch()" :aria-expanded="searchOpen" aria-controls="search-overlay"
              aria-label="Open search"
              class="text-dark-navy hover:bg-soft-blue focus-visible:ring-info inline-flex size-11 cursor-pointer items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200 focus-visible:ring-2 focus-visible:outline-none">
              <svg class="size-6" aria-hidden="true"><use href="#icon-search" /></svg>
            </button>

            <a href="/appointment.html"
              class="bg-dark-navy hover:bg-accent-navy focus-visible:ring-info inline-flex items-center justify-center rounded-full px-6 py-2.5 text-white focus-visible:ring-2 focus-visible:outline-none">
              Book an Appointment </a>
          </div>
        </div>

        <button type="button"
          class="text-dark-navy hover:bg-soft-blue focus-visible:ring-info inline-flex items-center justify-center rounded-md border border-slate-300 bg-white p-2 focus-visible:ring-2 focus-visible:outline-none lg:hidden"
          @click="mobileOpen = !mobileOpen" :aria-expanded="mobileOpen" aria-controls="mobile-menu">
          <span class="sr-only" x-text="mobileOpen ? 'Close menu' : 'Open menu'"> Open menu </span>
          <svg x-show="!mobileOpen" class="size-6" aria-hidden="true"><use href="#icon-menu" /></svg>
          <svg x-show="mobileOpen" class="size-6" aria-hidden="true"><use href="#icon-close" /></svg>
        </button>
      </div>

      <div id="mobile-menu" class="lg:hidden" x-cloak x-show="mobileOpen" x-transition
        @click.outside="mobileOpen = false">
        <nav class="mt-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm" aria-label="Mobile primary">
          <ul class="grid gap-2">
            <li>
              <a href="/" class="text-dark-navy hover:bg-soft-blue focus-visible:ring-info block rounded-md px-3 py-2 focus-visible:ring-2 focus-visible:outline-none">
                Home </a>
            </li>

            <li>
              <button type="button"
                class="text-dark-navy hover:bg-soft-blue focus-visible:ring-info flex w-full cursor-pointer items-center justify-between rounded-md px-3 py-2 text-left focus-visible:ring-2 focus-visible:outline-none"
                @click.stop="servicesOpen = !servicesOpen" :aria-expanded="servicesOpen"
                aria-controls="mobile-services">
                Care Services
                <svg class="size-5" aria-hidden="true"><use href="#icon-chevron" /></svg>
              </button>

              <ul id="mobile-services" role="menu" x-cloak x-show="servicesOpen" x-transition
                class="mt-1 grid gap-1 pl-2">
                <li role="none"><a role="menuitem" href="/urology-std-services-nepal.html" class="text-dark-navy hover:bg-soft-blue focus-visible:ring-info block rounded-md px-3 py-2 focus-visible:ring-2 focus-visible:outline-none">Urology<span class="text-info">/</span>STD</a></li>
                <li role="none"><a role="menuitem" href="#" class="text-dark-navy hover:bg-soft-blue focus-visible:ring-info block rounded-md px-3 py-2 focus-visible:ring-2 focus-visible:outline-none">ENT (Ear, Nose & Throat)</a></li>
                <li role="none"><a role="menuitem" href="#" class="text-dark-navy hover:bg-soft-blue focus-visible:ring-info block rounded-md px-3 py-2 focus-visible:ring-2 focus-visible:outline-none">Anorectal<span class="text-info">/</span>Piles</a></li>
                <li role="none"><a role="menuitem" href="#" class="text-dark-navy hover:bg-soft-blue focus-visible:ring-info block rounded-md px-3 py-2 focus-visible:ring-2 focus-visible:outline-none">Acupuncture</a></li>
                <li role="none"><a role="menuitem" href="#" class="text-dark-navy hover:bg-soft-blue focus-visible:ring-info block rounded-md px-3 py-2 focus-visible:ring-2 focus-visible:outline-none">Gynecology</a></li>
                <li role="none"><a role="menuitem" href="#" class="text-dark-navy hover:bg-soft-blue focus-visible:ring-info block rounded-md px-3 py-2 focus-visible:ring-2 focus-visible:outline-none">General Medicine<span class="text-info">/</span>Lab</a></li>
              </ul>
            </li>

            <li><a href="/" class="text-dark-navy hover:bg-soft-blue focus-visible:ring-info block rounded-md px-3 py-2 focus-visible:ring-2 focus-visible:outline-none">FAQs</a></li>
            <li><a href="/" class="text-dark-navy hover:bg-soft-blue focus-visible:ring-info block rounded-md px-3 py-2 focus-visible:ring-2 focus-visible:outline-none">Care Journeys</a></li>
            <li><a href="/contact-us.html" class="text-dark-navy hover:bg-soft-blue focus-visible:ring-info block rounded-md px-3 py-2 focus-visible:ring-2 focus-visible:outline-none">Contact Us</a></li>
          </ul>

          <div class="mt-4 flex w-full items-center gap-3">
            <button type="button" @click="openSearch(); mobileOpen = false" :aria-expanded="searchOpen"
              aria-controls="search-overlay" aria-label="Open search"
              class="text-dark-navy hover:bg-soft-blue focus-visible:ring-info inline-flex size-11 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200 focus-visible:ring-2 focus-visible:outline-none">
              <svg class="size-6" aria-hidden="true"><use href="#icon-search" /></svg>
            </button>

            <a href="/appointment.html"
              class="bg-dark-navy hover:bg-accent-navy focus-visible:ring-info inline-flex flex-1 items-center justify-center rounded-full px-6 py-2.5 text-white focus-visible:ring-2 focus-visible:outline-none">
              Book an Appointment </a>
          </div>
        </nav>
      </div>

      <div id="search-overlay" x-cloak x-show="searchOpen" x-transition.opacity class="fixed inset-0 z-60" role="dialog"
        aria-modal="true" aria-label="Site search">
        <div class="bg-dark-navy/90 absolute inset-0 backdrop-blur-md" @click="closeSearch()"></div>

        <div class="pointer-events-none relative flex min-h-dvh flex-col items-center justify-center p-4">
          <div x-trap.noscroll="searchOpen" class="pointer-events-auto w-full max-w-2xl rounded-xl bg-white shadow-xl">
            <div class="p-4">
              <form action="#" method="get" class="mx-auto w-full">
                <label for="site-search" class="sr-only">Search</label>
                <div class="flex w-full items-center gap-2">
                  <input id="site-search" x-ref="searchInput" name="q" type="search" placeholder="Search…"
                    class="text-maria-black focus:ring-accent-navy w-full rounded-md border border-slate-300 bg-white px-3 py-3 placeholder:text-slate-400 focus:ring-2 focus:outline-none" />
                  <button type="submit"
                    class="bg-dark-navy hover:bg-accent-navy focus-visible:ring-info shrink-0 cursor-pointer rounded-md px-4 py-3 text-white focus-visible:ring-2 focus-visible:outline-none">Search</button>
                </div>
              </form>
            </div>
          </div>
          <button
            class="bg-dark-navy hover:bg-accent-navy pointer-events-auto flex cursor-pointer gap-2 rounded-b-lg px-4 py-1 text-white focus-visible:ring-2 focus-visible:outline-none"
            @click="closeSearch()" aria-label="Close search">
            <span>Close</span>
            <span>
              <svg class="size-6" aria-hidden="true"><use href="#icon-close" /></svg>
            </span>
          </button>
        </div>
      </div>
    </div>
  </header>
`;

export class AppHeader extends HTMLElement {
  connectedCallback() {
    if (!this.innerHTML) {
      this.innerHTML = HEADER_TEMPLATE;
    }
  }
}

customElements.define("app-header", AppHeader);
