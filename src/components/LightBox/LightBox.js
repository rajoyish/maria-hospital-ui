import GLightbox from "glightbox";
import "./LightBox.css";

export function initLightBox() {
  const figures = document.querySelectorAll("figure");

  for (const figure of figures) {
    const img = figure.querySelector("img");

    if (img && !img.closest("a.glightbox")) {
      const a = document.createElement("a");
      a.href = img.src;
      a.className = "glightbox";

      img.parentNode.insertBefore(a, img);
      a.appendChild(img);
    }
  }

  const lightboxInstance = GLightbox({
    selector: ".glightbox",
  });

  return lightboxInstance;
}