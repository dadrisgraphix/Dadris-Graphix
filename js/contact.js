
import { supabase } from "./supabase.js";

document.addEventListener("DOMContentLoaded", () => {
  // Mobile navigation
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("show");
      menuToggle.textContent = isOpen ? "✕" : "☰";
      menuToggle.setAttribute("aria-expanded", String(isOpen));
    });

    navLinks.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("show");
        menuToggle.textContent = "☰";
        menuToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Copyright year
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  // Enquiry form
  const form = document.getElementById("quoteForm");
  const submitButton = document.getElementById("submitBtn");

  if (!form || !submitButton) return;

  form.addEventListener("submit", async event => {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const service = document.getElementById("service").value;
    const message = document.getElementById("message").value.trim();

    if (!name || !phone || !service || !message) {
      alert("Please complete all required fields.");
      return;
    }

    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = "Saving your enquiry...";

    try {
      // Save enquiry to Supabase first
      const { error } = await supabase
        .from("enquiries")
        .insert({
          name,
          phone,
          service,
          message
        });

      if (error) throw error;

      // Prepare WhatsApp message
      const enquiry = `Hello Dadris Graphix!

I would like to request a quotation.

Name: ${name}
Phone: ${phone}
Service Required: ${service}

Project Details:
${message}

Thank you. I look forward to hearing from you.`;

      const whatsappURL =
        "https://wa.me/254745365756?text=" +
        encodeURIComponent(enquiry);

      form.reset();

      submitButton.textContent = "Enquiry Saved! Opening WhatsApp...";

      window.location.href = whatsappURL;

    } catch (error) {
      console.error("Enquiry submission error:", error);

      alert(
        "Your enquiry could not be saved. Please try again. Error: " +
        error.message
      );

      submitButton.disabled = false;
      submitButton.textContent = originalText;
    }
  });
});

