const themeButton = document.querySelector(".theme-toggle");
// Keep bookmarks to sections moved off the homepage usable.
function redirectMovedSection() {
  if (location.pathname !== "/") return;
  const destinations = {
    "#experience": "/background/#experience",
    "#education": "/background/#education",
    "#leadership": "/background/#leadership",
    "#honors": "/honors/",
    "#projects": "/projects/",
  };
  if (destinations[location.hash]) location.replace(destinations[location.hash]);
}
redirectMovedSection();
window.addEventListener("hashchange", redirectMovedSection);
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
