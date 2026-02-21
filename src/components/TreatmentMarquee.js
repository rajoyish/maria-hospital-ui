import Alpine from "alpinejs";
import { killMarquee, startMarquee } from "../utils/marqueeAnimation";

export default function setupTreatmentMarquee() {
  Alpine.data("treatmentMarquee", () => {
    return {
      items: [],

      async init() {
        try {
          const isDev = import.meta.env.DEV;
          const url = isDev
            ? `/treatments-data.json?t=${Date.now()}`
            : "/treatments-data.json";

          const response = await fetch(url);
          if (!response.ok) {
            throw new Error("Failed to load data");
          }

          const freshData = await response.json();
          const fingerprint = `${freshData.length}_${freshData[0]?.url}`;

          this.items = this.getSortedData(freshData, fingerprint, isDev);

          this.$nextTick(() => {
            if (document.fonts) {
              document.fonts.ready
                .then(() => {
                  requestAnimationFrame(() => {
                    startMarquee();
                  });
                })
                .catch(() => {
                  requestAnimationFrame(() => {
                    startMarquee();
                  });
                });
            } else {
              requestAnimationFrame(() => {
                startMarquee();
              });
            }
          });
        } catch (error) {
          console.error("Marquee Error:", error);
        }
      },

      destroy() {
        killMarquee();
      },

      getSortedData(data, currentFingerprint, isDev) {
        const STORAGE_KEY = "treatments_order";
        const HASH_KEY = "treatments_hash";

        if (isDev) {
          const shuffled = this.shuffle([...data]);
          return [...shuffled, ...shuffled];
        }

        const cachedOrder = sessionStorage.getItem(STORAGE_KEY);
        const cachedHash = sessionStorage.getItem(HASH_KEY);

        if (cachedOrder && cachedHash === currentFingerprint) {
          try {
            const orderMap = JSON.parse(cachedOrder);
            const sortedData = orderMap
              .map((url) => {
                return data.find((item) => {
                  return item.url === url;
                });
              })
              .filter((item) => {
                return item !== undefined;
              });

            return [...sortedData, ...sortedData];
          } catch (_error) {
            const shuffled = this.shuffle([...data]);
            const newOrder = shuffled.map((item) => {
              return item.url;
            });
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(newOrder));
            sessionStorage.setItem(HASH_KEY, currentFingerprint);
            return [...shuffled, ...shuffled];
          }
        }

        const shuffled = this.shuffle([...data]);
        const newOrder = shuffled.map((item) => {
          return item.url;
        });

        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(newOrder));
        sessionStorage.setItem(HASH_KEY, currentFingerprint);

        return [...shuffled, ...shuffled];
      },

      shuffle(array) {
        let currentIndex = array.length;
        let randomIndex;

        while (currentIndex !== 0) {
          randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex -= 1;
          [array[currentIndex], array[randomIndex]] = [
            array[randomIndex],
            array[currentIndex],
          ];
        }
        return array;
      },
    };
  });
}
