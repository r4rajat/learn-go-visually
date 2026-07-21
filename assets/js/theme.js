(function () {
  var KEY = "gv-theme";
  var root = document.documentElement;
  var saved = localStorage.getItem(KEY);
  if (saved) root.setAttribute("data-theme", saved);

  function current() {
    var attr = root.getAttribute("data-theme");
    if (attr) return attr;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function apply(theme) {
    root.setAttribute("data-theme", theme);
    localStorage.setItem(KEY, theme);
    document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
      btn.textContent = theme === "dark" ? "Light mode" : "Dark mode";
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
      btn.textContent = current() === "dark" ? "Light mode" : "Dark mode";
      btn.addEventListener("click", function () {
        apply(current() === "dark" ? "light" : "dark");
      });
    });
  });
})();
