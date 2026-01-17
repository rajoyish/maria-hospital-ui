class MariaFooter extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
    this.updateYear();
  }

  updateYear() {
    const yearSpan = this.querySelector("#copyright-year");
    if (yearSpan) {
      yearSpan.textContent = new Date().getFullYear();
    }
  }

  render() {
    this.innerHTML = `
      <footer class="bg-dark-navy px-8 py-16 pb-30 md:p-28">
        <div class="mx-auto max-w-7xl">
          <div class="grid grid-cols-1 gap-12 lg:grid-cols-4 lg:gap-8">
            
            <div class="space-y-8 lg:col-span-2">
              <img class="h-24" src="/images/maria-hospital-logo-light.svg" alt="Maria Hospital" />
              <p class="max-w-sm text-gray-300 italic">International Quality You Can Trust</p>
              <div class="space-y-4">
                <div class="flex items-start gap-3">
                  <svg class="text-info size-6 shrink-0 font-bold" aria-hidden="true">
                    <use href="#icon-location" />
                  </svg>
                  <p class="text-gray-200">Gairidhara Road, Baluwatar, Kathmandu</p>
                </div>

                <div class="flex items-center gap-3">
                  <svg class="text-info size-6 shrink-0" aria-hidden="true">
                    <use href="#icon-phone" />
                  </svg>
                  <a class="text-soft-blue hover:text-white transition-colors" href="tel:+9779851433833"> +977-9851433833 </a>
                </div>
              </div>
            </div>

            <div>
              <h3 class="text-info mb-6 text-xl font-semibold">Quick Links</h3>
              <ul role="list" class="space-y-4">
                <li><a href="/urology-std-services-nepal.html" class="hover:text-info text-gray-200 transition-colors">Urology/STD</a></li>
                <li><a href="/" class="hover:text-info text-gray-200 transition-colors">ENT (Ear, Nose & Throat)</a></li>
                <li><a href="/" class="hover:text-info text-gray-200 transition-colors">Anorectal/Piles</a></li>
                <li><a href="/" class="hover:text-info text-gray-200 transition-colors">Acupuncture</a></li>
                <li><a href="/" class="hover:text-info text-gray-200 transition-colors">Gynecology</a></li>
                <li><a href="/" class="hover:text-info text-gray-200 transition-colors">General Medicine/Lab</a></li>
              </ul>
            </div>

            <div>
              <h3 class="mb-6 text-xl font-semibold text-transparent select-none">&nbsp;</h3>
              <ul role="list" class="space-y-4">
                <li><a href="/" class="hover:text-info text-gray-200 transition-colors">FAQs</a></li>
                <li><a href="/" class="hover:text-info text-gray-200 transition-colors">Testimonials</a></li>
                <li><a href="/contact-us.html" class="hover:text-info text-gray-200 transition-colors">Contact Us</a></li>
                <li><a href="/appointment.html" class="hover:text-info text-gray-200 transition-colors">Book an Appointment</a></li>
              </ul>
            </div>
          </div>

          <div class="mt-16 border-t border-gray-600 pt-8 sm:mt-20 lg:mt-24">
            <p class="text-center text-sm text-gray-300">
              &copy; <span id="copyright-year"></span> MARIA HOSPITAL | All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>
    `;
  }
}

customElements.define("maria-footer", MariaFooter);
