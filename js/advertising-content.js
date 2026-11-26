
import { supabase } from "./supabase.js";

const escapeHTML = (value = "") =>
  String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);

function safeURL(value) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}

async function loadAdvertisingCampaigns() {
  const grid = document.querySelector(".project-grid");

  if (!grid) return;

  const { data, error } = await supabase
    .from("advertising_campaigns")
    .select("id,title,description,image_url,cta_text,cta_url,is_published,sort_order,created_at")
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Advertising campaigns loading error:", error.message);
    return;
  }

  // Keep the existing featured projects if no campaigns are published.
  if (!data || data.length === 0) return;

  grid.innerHTML = data.map(campaign => {
    const title = escapeHTML(campaign.title);
    const description = escapeHTML(campaign.description || "");
    const image = safeURL(campaign.image_url || "");
    const ctaURL = safeURL(campaign.cta_url || "");

    const imageMarkup = image
      ? `<img src="${escapeHTML(image)}" alt="${title}" loading="lazy">`
      : "";

    const buttonMarkup = ctaURL
      ? `<a class="btn btn-primary"
            href="${escapeHTML(ctaURL)}"
            target="_blank"
            rel="noopener noreferrer">
            ${escapeHTML(campaign.cta_text || "Learn More")}
         </a>`
      : "";

    return `
      <article class="project">
        ${imageMarkup}
        <div class="project-caption">
          <h3>${title}</h3>
          <p>${description}</p>
          ${buttonMarkup}
        </div>
      </article>
    `;
  }).join("");
}

loadAdvertisingCampaigns();
