// The Budget Builders — site interactions

// --- Sticky header state ---
const header = document.querySelector(".site-header");
const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 40);
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

// --- Mobile nav ---
const toggle = document.querySelector(".nav-toggle");
const menu = document.getElementById("nav-menu");
toggle.addEventListener("click", () => {
  const open = menu.classList.toggle("open");
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
});
menu.addEventListener("click", (e) => {
  if (e.target.closest("a")) {
    menu.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  }
});

// --- Scroll reveal ---
const revealEls = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          entry.target.style.transitionDelay = `${Math.min(i * 60, 240)}ms`;
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  revealEls.forEach((el) => io.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add("in"));
}

// --- Quote form → email (FormSubmit.co) ---
// No account/API key needed: posts straight to the target inbox. The very first
// submission ever sent triggers a one-time "Activate Form" confirmation email to
// that inbox — until it's clicked, submissions aren't delivered. After that it
// just works. https://formsubmit.co/thebudgetbuilders0@gmail.com
const FORM_ENDPOINT = "https://formsubmit.co/ajax/thebudgetbuilders0@gmail.com";
const form = document.getElementById("quote-form");
const submitBtn = form.querySelector("button[type=submit]");
const submitLabel = submitBtn.querySelector(".btn-label");
const successMsg = form.querySelector(".form-success");
const errorMsg = form.querySelector(".form-error");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  successMsg.hidden = true;
  errorMsg.hidden = true;

  let valid = true;
  form.querySelectorAll(".form-field").forEach((field) => {
    const input = field.querySelector("input, textarea");
    const error = field.querySelector(".field-error");
    if (!input || !error) return;
    const bad = input.required && !input.value.trim();
    field.classList.toggle("invalid", bad);
    error.hidden = !bad;
    if (bad && valid) {
      input.focus();
      valid = false;
    }
  });
  if (!valid) return;

  // Honeypot: real visitors never fill this hidden field. If it's filled, quietly
  // pretend to succeed rather than tipping off the bot.
  if (form.querySelector("[name=_honeypot]").value) {
    form.reset();
    successMsg.hidden = false;
    return;
  }

  submitBtn.disabled = true;
  submitLabel.textContent = "Sending…";

  try {
    const res = await fetch(FORM_ENDPOINT, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: new FormData(form),
    });
    const result = await res.json();
    if (!res.ok || result.success === false) throw new Error(result.message || "Send failed");
    form.reset();
    successMsg.hidden = false;
  } catch (err) {
    errorMsg.hidden = false;
  } finally {
    submitBtn.disabled = false;
    submitLabel.textContent = "Send Quote Request";
  }
});

// Clear error state as the user types
form.querySelectorAll("input, textarea").forEach((input) => {
  input.addEventListener("input", () => {
    const field = input.closest(".form-field");
    field.classList.remove("invalid");
    const error = field.querySelector(".field-error");
    if (error) error.hidden = true;
  });
});

// --- Gallery lightbox ---
const galleryLinks = [...document.querySelectorAll(".gallery-link")];
const lightbox = document.getElementById("lightbox");
const lbImg = lightbox.querySelector(".lb-img");
const lbCaption = lightbox.querySelector(".lb-caption");
const lbCounter = lightbox.querySelector(".lb-counter");
let lbIndex = 0;
let lbLastFocus = null;

function lbShow(i) {
  lbIndex = (i + galleryLinks.length) % galleryLinks.length;
  const link = galleryLinks[lbIndex];
  lbImg.src = link.href;
  lbImg.alt = link.querySelector("img").alt;
  lbCaption.textContent = link.dataset.caption;
  lbCounter.textContent = `${lbIndex + 1} / ${galleryLinks.length}`;
}

function lbOpen(i) {
  lbLastFocus = document.activeElement;
  lbShow(i);
  lightbox.hidden = false;
  document.body.style.overflow = "hidden";
  lightbox.querySelector(".lb-close").focus();
}

function lbClose() {
  lightbox.hidden = true;
  document.body.style.overflow = "";
  lbImg.src = "";
  if (lbLastFocus) lbLastFocus.focus();
}

galleryLinks.forEach((link, i) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    lbOpen(i);
  });
});

lightbox.querySelector(".lb-close").addEventListener("click", lbClose);
lightbox.querySelector(".lb-prev").addEventListener("click", () => lbShow(lbIndex - 1));
lightbox.querySelector(".lb-next").addEventListener("click", () => lbShow(lbIndex + 1));
lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) lbClose();
});
document.addEventListener("keydown", (e) => {
  if (lightbox.hidden) return;
  if (e.key === "Escape") lbClose();
  if (e.key === "ArrowLeft") lbShow(lbIndex - 1);
  if (e.key === "ArrowRight") lbShow(lbIndex + 1);
});

// --- Footer year ---
document.getElementById("year").textContent = new Date().getFullYear();
