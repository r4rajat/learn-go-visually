/* Interactive visuals for the Coding Interview Questions page. */

function initCodingTabs(root) {
  var buttons = root.querySelectorAll('.coding-tab-btn');
  var panels = root.querySelectorAll('.coding-category-panel');

  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var category = btn.getAttribute('data-category');

      buttons.forEach(function (b) {
        b.classList.remove('active');
      });
      btn.classList.add('active');

      panels.forEach(function (panel) {
        panel.hidden = panel.getAttribute('data-category-panel') !== category;
      });
    });
  });
}

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-viz="coding-qa"]').forEach(initCodingTabs);
});
