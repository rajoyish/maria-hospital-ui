export function searchResults() {
  return {
    query: "",
    results: [],
    paginatedResults: [],
    isLoading: true,
    hasError: false,
    errorMessage: "",
    skippedKeywords: ["maria", "kathmandu", "in nepal", "hospital"],
    cacheKey: "treatments_data_cache_v3",
    currentPage: 1,
    itemsPerPage: 5,

    get totalPages() {
      return Math.ceil(this.results.length / this.itemsPerPage);
    },

    get startIndex() {
      return (this.currentPage - 1) * this.itemsPerPage + 1;
    },

    get endIndex() {
      return Math.min(
        this.currentPage * this.itemsPerPage,
        this.results.length
      );
    },

    get totalResults() {
      return this.results.length;
    },

    async init() {
      const pathParts = window.location.pathname.split("/").filter(Boolean);
      const rawQuery = pathParts.length > 1 ? pathParts.at(-1) : "";
      this.query = rawQuery
        ? decodeURIComponent(rawQuery).replace(/-/g, " ")
        : "";

      const urlParams = new URLSearchParams(window.location.search);
      const pageParam = Number.parseInt(urlParams.get("page"), 10);
      if (pageParam && pageParam > 0) {
        this.currentPage = pageParam;
      }

      window.addEventListener("popstate", () => {
        const params = new URLSearchParams(window.location.search);
        this.currentPage = Number.parseInt(params.get("page"), 10) || 1;
        this.updatePagination();
      });

      this.updateSEO();

      if (this.query.length < 3) {
        this.showError("Please enter at least 3 characters to search.");
        return;
      }

      const lowerQuery = this.query.toLowerCase();
      const isSkipped = this.skippedKeywords.some((keyword) =>
        lowerQuery.includes(keyword)
      );

      if (isSkipped) {
        this.showError(
          `Your search for "${this.query}" is too broad. Please try a specific treatment or symptom.`
        );
        return;
      }

      await this.performSearch();
    },

    updateSEO() {
      const siteUrl = import.meta.env.VITE_SITE_URL || "";
      const q = this.query.trim() || "Treatments";
      const capitalizedQ = q.charAt(0).toUpperCase() + q.slice(1);
      const title = `Search Results for ${capitalizedQ} | Maria Hospital Kathmandu`;
      const description = `Explore search results and medical treatments for ${q} at Maria Hospital in Kathmandu, Nepal.`;
      const currentUrl = window.location.href;

      document.title = title;

      const setMeta = (selector, content) => {
        const el = document.querySelector(selector);
        if (el) {
          el.setAttribute("content", content);
        }
      };

      setMeta('meta[name="description"]', description);
      setMeta(
        'meta[name="keywords"]',
        `${q}, search results, treatments, Maria Hospital, Kathmandu, Nepal`
      );

      const canonicalEl = document.querySelector('link[rel="canonical"]');
      if (canonicalEl) {
        canonicalEl.setAttribute("href", currentUrl);
      }

      setMeta('meta[property="og:title"]', title);
      setMeta('meta[property="og:description"]', description);
      setMeta('meta[property="og:url"]', currentUrl);

      setMeta('meta[name="twitter:title"]', title);
      setMeta('meta[name="twitter:description"]', description);
      setMeta('meta[name="twitter:url"]', currentUrl);

      const ldJsonEl = document.querySelector(
        'script[type="application/ld+json"]'
      );
      if (ldJsonEl) {
        const schema = {
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "SearchResultsPage",
              "@id": `${currentUrl}#webpage`,
              name: title,
              description,
              url: currentUrl,
              provider: {
                "@type": "Hospital",
                name: "Maria Hospital",
                url: siteUrl,
                telephone: "+977-9851433833",
                address: {
                  "@type": "PostalAddress",
                  streetAddress: "Kathmandu",
                  addressLocality: "Kathmandu",
                  addressCountry: "NP",
                },
              },
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Home",
                  item: siteUrl,
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: `Search: ${capitalizedQ}`,
                  item: currentUrl,
                },
              ],
            },
          ],
        };
        ldJsonEl.textContent = JSON.stringify(schema);
      }
    },

    showError(msg) {
      this.errorMessage = msg;
      this.hasError = true;
      this.isLoading = false;
    },

    async fetchTreatments() {
      if (sessionStorage.getItem(this.cacheKey)) {
        return JSON.parse(sessionStorage.getItem(this.cacheKey));
      }

      try {
        const response = await fetch("/treatments-data.json");
        const data = await response.json();
        sessionStorage.setItem(this.cacheKey, JSON.stringify(data));
        return data;
      } catch {
        return [];
      }
    },

    escapeRegExp(string) {
      return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    },

    async performSearch() {
      const data = await this.fetchTreatments();

      if (!data || data.length === 0) {
        this.showError("Unable to load treatment data at this time.");
        return;
      }

      const escapedQuery = this.escapeRegExp(this.query);
      const regex = new RegExp(`\\b${escapedQuery}`, "i");

      this.results = data.filter((item) => {
        const matchTreatment = regex.test(item.treatment);
        const matchDescription = regex.test(item.description);
        const matchKeywords = item.keywords.some((kw) => regex.test(kw));
        return matchTreatment || matchDescription || matchKeywords;
      });

      if (this.results.length === 0) {
        this.showError(
          `Sorry, we couldn’t find any treatments matching "${this.query}".`
        );
        return;
      }

      if (this.currentPage > this.totalPages) {
        this.currentPage = this.totalPages > 0 ? this.totalPages : 1;
      }

      this.updatePagination();
      this.isLoading = false;
    },

    updatePagination() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      this.paginatedResults = this.results.slice(start, end);
    },

    goToPage(page) {
      if (page < 1 || page > this.totalPages || page === "...") {
        return;
      }
      this.currentPage = page;
      this.updatePagination();

      const url = new URL(window.location);
      if (page === 1) {
        url.searchParams.delete("page");
      } else {
        url.searchParams.set("page", page);
      }
      window.history.pushState({ page }, "", url);

      window.scrollTo({ top: 0, behavior: "smooth" });
    },

    getPaginationPages() {
      if (this.totalPages <= 1) {
        return [1];
      }

      const pages = new Set([
        1,
        this.totalPages,
        this.currentPage - 1,
        this.currentPage,
        this.currentPage + 1,
      ]);

      const sortedPages = [...pages]
        .filter((p) => p > 0 && p <= this.totalPages)
        .sort((a, b) => a - b);

      return sortedPages.reduce((acc, page, index, array) => {
        acc.push(page);
        const nextPage = array[index + 1];

        if (nextPage) {
          if (nextPage - page === 2) {
            acc.push(page + 1);
          } else if (nextPage - page > 2) {
            acc.push("...");
          }
        }

        return acc;
      }, []);
    },

    replaceEnv(str) {
      return str.replace(
        "%VITE_SITE_URL%",
        import.meta.env.VITE_SITE_URL || ""
      );
    },
  };
}
