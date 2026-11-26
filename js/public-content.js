
import { supabase } from "./supabase.js";

/* =========================================
   DADRIS GRAPHIX — PUBLIC CONTENT
   Connects published services and portfolio
========================================= */

const escapeHTML = (value = "") =>
  String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[character]);

const categorySlug = value =>
  String(value || "other")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const imageHTML = (url, alt) => {
  if (!url) return "";
  return `<img src="${escapeHTML(url)}" alt="${escapeHTML(alt)}" loading="lazy">`;
};

/* =========================================
   PORTFOLIO
========================================= */

async function loadPortfolio() {
  const grid = document.getElementById("portfolioGrid");

  if (!grid) return;

  const { data, error } = await supabase
    .from("portfolio_items")
    .select("id,title,category,description,image_url,is_published,sort_order")
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Portfolio loading error:", error.message);
    return;
  }

  // Keep the existing website portfolio as a fallback.
  if (!data || data.length === 0) return;

  grid.innerHTML = data.map(item => {
    const title = escapeHTML(item.title);
    const description = escapeHTML(item.description || "");
    const category = escapeHTML(item.category || "Other");
    const slug = escapeHTML(categorySlug(item.category));
    const image = escapeHTML(item.image_url || "");

    return `
      <article class="project-card" data-category="${slug}">
        <button
          class="project-image"
          type="button"
          data-full="${image}"
          data-caption="${title}"
          aria-label="View ${title}"
        >
          ${imageHTML(image, title)}
        </button>

        <div class="project-info">
          <div class="project-category">${category}</div>
          <h3>${title}</h3>
          <p>${description}</p>
        </div>
      </article>
    `;
  }).join("");

  updatePortfolioFilters();
}

/* =========================================
   PORTFOLIO FILTERS
========================================= */

function updatePortfolioFilters() {
  const grid = document.getElementById("portfolioGrid");
  const filterContainer = document.querySelector(".filters");
  const count = document.getElementById("portfolioCount");

  if (!grid || !filterContainer) return;

  const categories = [
    ...new Set(
      [...grid.querySelectorAll(".project-card")]
        .map(card => card.dataset.category)
        .filter(Boolean)
    )
  ];

  filterContainer.innerHTML = `
    <button class="filter-btn active"
      data-filter="all" aria-pressed="true">
      All Projects
    </button>

    ${categories.map(category => `
      <button class="filter-btn"
        data-filter="${escapeHTML(category)}"
        aria-pressed="false">
        ${escapeHTML(
          category.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())
        )}
      </button>
    `).join("")}
  `;

  function filterProjects(selected) {
    let visible = 0;

    grid.querySelectorAll(".project-card").forEach(card => {
      const matches =
        selected === "all" || card.dataset.category === selected;

      card.hidden = !matches;
      if (matches) visible++;
    });

    if (count) {
      count.textContent = selected === "all"
        ? `Showing all ${visible} projects`
        : `Showing ${visible} projects in this category`;
    }
  }

  filterContainer.addEventListener("click", event => {
    const button = event.target.closest(".filter-btn");
    if (!button) return;

    filterContainer.querySelectorAll(".filter-btn").forEach(item => {
      item.classList.remove("active");
      item.setAttribute("aria-pressed", "false");
    });

    button.classList.add("active");
    button.setAttribute("aria-pressed", "true");

    filterProjects(button.dataset.filter);
  });

  filterProjects("all");
}

/* =========================================
   PORTFOLIO IMAGE LIGHTBOX
========================================= */

function setupPortfolioLightbox() {
  const grid = document.getElementById("portfolioGrid");
  const lightbox = document.getElementById("lightbox");
  const image = document.getElementById("lightboxImage");
  const caption = document.getElementById("lightboxCaption");
  const close = document.getElementById("lightboxClose");

  if (!grid || !lightbox || !image || !caption || !close) return;

  let previousFocus = null;

  grid.addEventListener("click", event => {
    const button = event.target.closest(".project-image");

    if (!button) return;

    previousFocus = button;
    image.src = button.dataset.full;
    image.alt = button.dataset.caption || "Portfolio project";
    caption.textContent = button.dataset.caption || "";

    lightbox.classList.add("open");
    close.focus();
  });

  function closeLightbox() {
    lightbox.classList.remove("open");
    image.src = "";

    if (previousFocus) previousFocus.focus();
  }

  close.addEventListener("click", closeLightbox);

  lightbox.addEventListener("click", event => {
    if (event.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && lightbox.classList.contains("open")) {
      closeLightbox();
    }
  });
}

/* =========================================
   SERVICES
========================================= */

async function loadServices() {
  const grid = document.querySelector("#services .services-grid");

  if (!grid) return;

  const { data, error } = await supabase
    .from("services")
    .select("id,title,slug,category,description,image_url,price_text,is_published,sort_order")
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Services loading error:", error.message);
    return;
  }

  // Retain existing services if the database has no published records.
  if (!data || data.length === 0) return;

  grid.innerHTML = data.map(service => {
    const title = escapeHTML(service.title);
    const description = escapeHTML(service.description || "");
    const image = escapeHTML(service.image_url || "");

    const message = encodeURIComponent(
      `Hello Dadris Graphix, I am interested in ${service.title}.`
    );

    const price = service.price_text
      ? `<p class="service-price">${escapeHTML(service.price_text)}</p>`
      : "";

    return `
      <article class="service-card">
        <div class="service-image">
          ${imageHTML(image, title)}
        </div>

        <div class="service-content">
          <h3>${title}</h3>
          <p>${description}</p>
          ${price}
          <a
            class="service-link"
            href="https://wa.me/254745365756?text=${message}"
            target="_blank"
            rel="noopener"
          >
            Enquire Now →
          </a>
        </div>
      </article>
    `;
  }).join("");
}

/* =========================================
   INITIALISE
========================================= */

async function initialisePublicContent() {
  try {
    await Promise.all([
      loadPortfolio(),
      loadServices()
    ]);

    setupPortfolioLightbox();
  } catch (error) {
    console.error("Public content initialisation error:", error);
  }
}

initialisePublicContent();
