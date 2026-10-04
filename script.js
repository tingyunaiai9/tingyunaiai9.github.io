import { isValidPublications, matchesPublication } from "./publications.mjs";

const themeButton = document.querySelector(".theme-toggle");
function updateThemeButton() {
  themeButton.setAttribute("aria-label", `Switch to ${document.documentElement.dataset.theme === "dark" ? "light" : "dark"} theme`);
}
updateThemeButton();
themeButton.addEventListener("click", () => {
  const theme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]').content = theme === "dark" ? "#111827" : "#fefffe";
  try {
    localStorage.setItem("theme", theme);
  } catch {
    /* Optional persistence. */
  }
  updateThemeButton();
});

const menuButton = document.querySelector(".mobile-menu-btn");
const navigation = document.querySelector("#site-navigation");
function closeMenu() {
  navigation.classList.remove("is-open");
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Open navigation");
}
menuButton.addEventListener("click", () => {
  const open = navigation.classList.toggle("is-open");
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
});
navigation.addEventListener("click", (event) => {
  if (event.target.closest("a")) closeMenu();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && navigation.classList.contains("is-open")) {
    closeMenu();
    menuButton.focus();
  }
});
document.addEventListener("click", (event) => {
  if (!event.target.closest(".nav-inner")) closeMenu();
});
matchMedia("(min-width: 1024px)").addEventListener("change", closeMenu);

for (const image of document.querySelectorAll(".publication-media img")) {
  const thumbnail = image.getAttribute("src");
  const handleError = () => {
    if (image.getAttribute("src") !== thumbnail) image.src = thumbnail;
    else {
      image.closest(".publication-media").hidden = true;
      image.closest(".publication-card").classList.remove("has-media");
    }
  };
  image.addEventListener("error", handleError);
  if (image.dataset.demo && !matchMedia("(prefers-reduced-motion: reduce)").matches) image.src = image.dataset.demo;
  else if (image.complete && image.naturalWidth === 0) handleError();
}

const controls = document.querySelector(".publication-controls");
if (controls) {
  const cards = [...document.querySelectorAll("[data-publication-id]")];
  const status = controls.querySelector(".result-count");
  const search = controls.querySelector("input");
  const buttons = [...controls.querySelectorAll("[data-filter]")];
  let filter = "all";
  try {
    const response = await fetch("/data/publications.json");
    if (!response.ok) throw new Error("Publication data unavailable");
    const papers = await response.json();
    if (!isValidPublications(papers)) throw new Error("Invalid publication data");
    const byId = new Map(papers.map((paper) => [paper.id, paper]));
    if (cards.some((card) => !byId.has(card.dataset.publicationId))) throw new Error("Publication data incomplete");
    const applyFilters = () => {
      let count = 0;
      for (const card of cards) {
        card.hidden = !matchesPublication(byId.get(card.dataset.publicationId), filter, search.value);
        if (!card.hidden) count++;
      }
      status.textContent = `${count} of ${cards.length} publication${cards.length === 1 ? "" : "s"}`;
      document.querySelector("#no-results").hidden = count !== 0;
    };
    for (const button of buttons)
      button.addEventListener("click", () => {
        filter = button.dataset.filter;
        for (const item of buttons) item.setAttribute("aria-pressed", String(item === button));
        applyFilters();
      });
    search.addEventListener("input", applyFilters);
    controls.hidden = false;
    applyFilters();
  } catch {
    controls.hidden = false;
    search.disabled = true;
    buttons.forEach((button) => {
      button.disabled = true;
    });
    status.textContent = "Search is unavailable right now. All publications are shown below.";
  }
}
