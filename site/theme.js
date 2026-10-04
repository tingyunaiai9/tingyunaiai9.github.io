(() => {
  document.documentElement.classList.add("js");
  let theme;
  try {
    theme = localStorage.getItem("theme");
  } catch {
    // Theme selection still works when browser storage is unavailable.
  }
  document.documentElement.dataset.theme =
    theme === "light" || theme === "dark" ? theme : matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  document.querySelector('meta[name="theme-color"]').content = document.documentElement.dataset.theme === "dark" ? "#111827" : "#fefffe";
})();
