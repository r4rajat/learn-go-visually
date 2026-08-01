/* Interactive visuals for the Advanced page. */

function initGenericsViz(root) {
  const badge = root.querySelector('[data-role="type-badge"]');
  const call = root.querySelector('[data-role="call"]');
  const result = root.querySelector('[data-role="result"]');
  const btnInt = root.querySelector('[data-role="use-int"]');
  const btnFloat = root.querySelector('[data-role="use-float"]');
  const caption = root.querySelector('[data-role="caption"]');

  btnInt.addEventListener("click", function () {
    badge.textContent = "T = int";
    call.textContent = "Max(3, 7)";
    result.textContent = "7";
    caption.textContent = "Same function, instantiated with int.";
  });
  btnFloat.addEventListener("click", function () {
    badge.textContent = "T = float64";
    call.textContent = "Max(2.5, 1.1)";
    result.textContent = "2.5";
    caption.textContent = "Same function, instantiated with float64 — no separate MaxInt/MaxFloat64 needed.";
  });
}

function initCtxViz(root) {
  const parent = root.querySelector('[data-role="parent"]');
  const children = root.querySelectorAll('[data-role="child"]');
  const btn = root.querySelector('[data-role="cancel"]');
  const caption = root.querySelector('[data-role="caption"]');

  btn.addEventListener("click", function () {
    btn.disabled = true;
    parent.classList.add("cancelled");
    caption.textContent = "Cancelling the parent immediately begins cancelling everything derived from it...";
    children.forEach(function (child, i) {
      setTimeout(function () {
        child.classList.add("cancelled");
        if (i === children.length - 1) {
          caption.innerHTML =
            "All derived contexts are now cancelled. Each one's <code>Done()</code> channel is closed " +
            "and <code>Err()</code> returns <code>context.Canceled</code>.";
        }
      }, 300 + i * 250);
    });
  });
}

/* ---------- Interview questions (level tabs) ---------- */
function initInterviewQA(root) {
  var buttons = root.querySelectorAll('.interview-tab-btn');
  var panels = root.querySelectorAll('.interview-qa-panel');

  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var level = btn.getAttribute('data-level');

      buttons.forEach(function (b) {
        b.classList.remove('active');
      });
      btn.classList.add('active');

      panels.forEach(function (panel) {
        panel.hidden = panel.getAttribute('data-level-panel') !== level;
      });
    });
  });
}

document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll('[data-viz="generics-sub"]').forEach(initGenericsViz);
  document.querySelectorAll('[data-viz="ctx-tree"]').forEach(initCtxViz);
  document.querySelectorAll('[data-viz="interview-qa"]').forEach(initInterviewQA);
});
