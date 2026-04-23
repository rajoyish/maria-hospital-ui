const defaultLinks = {
  messenger: "https://m.me/mariahospitalnepal",
  whatsapp: "https://wa.me/9779851433833",
  tiktok: "https://www.tiktok.com/@mariahospitalnep",
  instagram: "https://www.instagram.com/mariahospitalnp/"
};

const gynecologyLinks = {
  messenger: "https://m.me/Maria.GYN.Care/",
  whatsapp: "https://wa.me/9779851428399",
  tiktok: "https://www.tiktok.com/@maria.hospital.gyn",
  instagram: "https://www.instagram.com/mariagynohospital"
};

const departmentMap = new Map([
  ["Urology & STD Care", {
    messenger: "https://m.me/Maria.Uro.STD/",
    whatsapp: "https://wa.me/9779851433833",
    tiktok: defaultLinks.tiktok,
    instagram: "https://www.instagram.com/maria.hospital_urology/"
  }],
  ["ENT (Ear, Nose & Throat) Care", {
    messenger: "https://m.me/Maria.ENT.Care/",
    whatsapp: "https://wa.me/977985-1435633",
    tiktok: "https://www.tiktok.com/@maria.hospital.ent",
    instagram: "https://www.instagram.com/maria.hospital_ent"
  }],
  ["Anorectal & Piles Care", {
    messenger: "https://m.me/Maria.AR.HEM.Care/",
    whatsapp: "https://wa.me/9779851422108",
    tiktok: defaultLinks.tiktok,
    instagram: "https://www.instagram.com/maria.hospital_piles"
  }],
  ["Acupuncture & Therapy", {
    messenger: "https://m.me/Maria.TCM.Ac/",
    whatsapp: "https://wa.me/9779851436099",
    tiktok: defaultLinks.tiktok,
    instagram: "https://www.instagram.com/mariaacuhospital"
  }],
  ["Gynecology Care", gynecologyLinks],
  ["Gynecological Cosmetic Care", gynecologyLinks]
]);

function getDepartmentFromJsonLd(scriptContent) {
  try {
    const jsonLd = JSON.parse(scriptContent);
    const graph = jsonLd["@graph"];
    
    let breadcrumbList = null;
    
    if (Array.isArray(graph)) {
      breadcrumbList = graph.find((item) => item["@type"] === "BreadcrumbList");
    } else if (jsonLd["@type"] === "BreadcrumbList") {
      breadcrumbList = jsonLd;
    }

    if (Array.isArray(breadcrumbList?.itemListElement)) {
      const levelTwoItem = breadcrumbList.itemListElement.find(
        (item) => item.position === 2
      );
      
      if (levelTwoItem?.name) {
        return levelTwoItem.name;
      }
    }
  } catch (_error) {
    return null;
  }
  return null;
}

function resolveActiveLinks() {
  const path = window.location.pathname;

  if (path.startsWith("/treatments/") || path.startsWith("/care-services/")) {
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    
    for (const script of scripts) {
      const department = getDepartmentFromJsonLd(script.textContent);
      
      if (department && departmentMap.has(department)) {
        return departmentMap.get(department);
      }
    }
  }

  return defaultLinks;
}

export class SocialMediaNav extends HTMLElement {
  getTemplate(links) {
    return `
<div class="fixed bottom-0 left-0 z-50 w-full lg:right-auto lg:bottom-0 lg:left-1/2 lg:max-w-2xl lg:-translate-x-1/2">
  <p class="mx-auto flex max-w-fit items-center justify-center gap-2 rounded-tl-full rounded-tr-full bg-emerald-100 px-10 py-1 pt-2 text-center text-sm leading-tight text-emerald-800 uppercase shadow-inner">
    Chat with us now
    <span class="-mt-0.5 relative flex size-4 items-center justify-center">
      <span class="absolute inline-flex size-full animate-[ping_2s_infinite] rounded-full bg-emerald-500 opacity-70"></span>
      <span class="relative inline-flex size-2 rounded-full bg-emerald-500"></span>
    </span>
  </p>
  <div class="bg-accent-navy lg:rounded-tl-full lg:rounded-tr-full">
     <div class="mx-auto grid h-full max-w-lg grid-cols-4 font-medium lg:mx-0 lg:w-full lg:max-w-none">
        <a href="${links.messenger}" class="group inline-flex flex-col items-center justify-center pt-2 transition-colors duration-300 hover:bg-white lg:rounded-tl-full">
           <img class="group-hover:-translate-y-0.5 transition-transform duration-300" src="/images/messanger-icon.svg" width="24" height="24" alt="Messenger Icon" />
           <span class="text-sm text-white group-hover:text-accent-navy">Messenger</span>
        </a>
        <a href="${links.whatsapp}" class="group inline-flex flex-col items-center justify-center pt-2 transition-colors duration-300 hover:bg-white">
           <img class="group-hover:-translate-y-0.5 transition-transform duration-300" src="/images/whatsapp-icon.svg" width="24" height="24" alt="WhatsApp Icon" />
           <span class="text-sm text-white group-hover:text-accent-navy">WhatsApp</span>
        </a>
        <a href="${links.tiktok}" class="group inline-flex flex-col items-center justify-center pt-2 transition-colors duration-300 hover:bg-white">
           <img class="group-hover:-translate-y-0.5 transition-transform duration-300" src="/images/tiktok-icon.svg" width="24" height="24" alt="TikTok Icon" />
           <span class="text-sm text-white group-hover:text-accent-navy">TikTok</span>
        </a>
        <a href="${links.instagram}" class="group inline-flex flex-col items-center justify-center pt-2 transition-colors duration-300 hover:bg-white lg:rounded-tr-full">
           <img class="group-hover:-translate-y-0.5 transition-transform duration-300" src="/images/instagram-icon.svg" width="24" height="24" alt="Instagram Icon" />
           <span class="text-sm text-white group-hover:text-accent-navy">Instagram</span>
        </a>
     </div>
  </div>
</div>`;
  }

  connectedCallback() {
    if (this.dataset.rendered) {
      return;
    }

    const activeLinks = resolveActiveLinks();
    this.innerHTML = this.getTemplate(activeLinks);
    this.dataset.rendered = "true";
  }
}

customElements.define("social-media-nav", SocialMediaNav);