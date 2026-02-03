const TEMPLATE = `
  <div class="fixed bottom-0 left-0 z-50 w-full lg:right-auto lg:bottom-0 lg:left-1/2 lg:max-w-2xl lg:-translate-x-1/2">
    <p class="mx-auto max-w-fit rounded-tl-full rounded-tr-full bg-emerald-100 px-10 py-1 pt-2 text-center text-sm leading-tight text-emerald-800 uppercase shadow-inner">
        Connect with us online
    </p>

    <div class="bg-accent-navy lg:rounded-tl-full lg:rounded-tr-full">
       <div class="mx-auto grid h-full max-w-lg grid-cols-4 font-medium lg:mx-0 lg:w-full lg:max-w-none">

          <a href="https://m.me/mariahospitalnepal"
             class="group inline-flex flex-col items-center justify-center pt-2 transition-colors duration-300 hover:bg-white lg:rounded-tl-full">
             <img class="group-hover:-translate-y-0.5 transition-transform duration-300"
                  src="/images/messanger-icon.svg" width="24" height="24"
                  alt="Messenger Icon" />
             <span class="text-sm text-white group-hover:text-accent-navy">Messenger</span>
          </a>

          <a href="https://wa.me/9779851433833"
             class="group inline-flex flex-col items-center justify-center pt-2 transition-colors duration-300 hover:bg-white">
             <img class="group-hover:-translate-y-0.5 transition-transform duration-300"
                  src="/images/whatsapp-icon.svg" width="24" height="24"
                  alt="WhatsApp Icon" />
             <span class="text-sm text-white group-hover:text-accent-navy">WhatsApp</span>
          </a>

          <a href="https://www.tiktok.com/@mariahospitalnepal"
             class="group inline-flex flex-col items-center justify-center pt-2 transition-colors duration-300 hover:bg-white">
             <img class="group-hover:-translate-y-0.5 transition-transform duration-300"
                  src="/images/tiktok-icon.svg" width="24" height="24"
                  alt="TikTok Icon" />
             <span class="text-sm text-white group-hover:text-accent-navy">TikTok</span>
          </a>

          <a href="https://www.instagram.com/mariahospitalnp/"
             class="group inline-flex flex-col items-center justify-center pt-2 transition-colors duration-300 hover:bg-white lg:rounded-tr-full">
             <img class="group-hover:-translate-y-0.5 transition-transform duration-300"
                  src="/images/instagram-icon.svg" width="24" height="24"
                  alt="Instagram Icon" />
             <span class="text-sm text-white group-hover:text-accent-navy">Instagram</span>
          </a>

       </div>
    </div>
  </div>
`;

export class SocialMediaNav extends HTMLElement {
  connectedCallback() {
    // Prevent re-rendering if the element is moved in the DOM
    if (!this.innerHTML) {
      this.innerHTML = TEMPLATE;
    }
  }
}

customElements.define("social-media-nav", SocialMediaNav);
