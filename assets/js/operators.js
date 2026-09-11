/* Interactive visuals for the Kubernetes Operators page. */

function initReconVisual(root) {
  const actualEl = root.querySelector('[data-role="actual-replicas"]');
  const loopIcon = root.querySelector(".recon-loop-icon");
  const driftBtn = root.querySelector('[data-role="drift"]');
  const reconcileBtn = root.querySelector('[data-role="reconcile"]');
  const caption = root.querySelector('[data-role="caption"]');

  let actual = 2;

  function render() {
    actualEl.textContent = actual;
    const matches = actual === 2;
    actualEl.classList.toggle("drift", !matches);
    actualEl.classList.toggle("match", matches);
    reconcileBtn.disabled = matches;
    driftBtn.disabled = !matches;
  }

  driftBtn.addEventListener("click", function () {
    actual = 0;
    render();
    caption.innerHTML =
      "Someone ran <code>kubectl scale --replicas=0</code> directly, bypassing the Website spec entirely. " +
      "The cluster now actually has <strong>0</strong> replicas running, but the CR still says <strong>2</strong>.";
  });

  reconcileBtn.addEventListener("click", function () {
    loopIcon.classList.remove("spin");
    void loopIcon.offsetWidth;
    loopIcon.classList.add("spin");
    caption.textContent = "Reconciling...";
    setTimeout(function () {
      actual = 2;
      render();
      caption.innerHTML =
        "The next reconcile doesn't know or care <em>why</em> actual drifted from desired &mdash; it just closes " +
        "the gap again. This is what &ldquo;level-based&rdquo; means: it re-derives the fix from current state " +
        "every time, not from a diff of what changed.";
    }, 500);
  });

  render();
  caption.textContent = 'Try "Simulate manual change" to introduce drift, then "Reconcile" to watch the operator correct it.';
}

function initOwnerTreeVisual(root) {
  const parent = root.querySelector('[data-role="parent"]');
  const children = root.querySelectorAll('[data-role="child"]');
  const btn = root.querySelector('[data-role="delete"]');
  const caption = root.querySelector('[data-role="caption"]');
  const controls = root.querySelector(".viz-controls");

  if (!root.querySelector(".viz-header")) {
    const header = document.createElement("div");
    header.className = "viz-header";
    header.innerHTML = '<div class="viz-title"><span class="viz-badge">Garbage Collector</span><span>OwnerReference Cascading Deletion</span></div><span class="viz-step-counter">k8s GC Tree</span>';
    root.insertBefore(header, root.firstChild);
  }

  let resetBtn = controls ? controls.querySelector('[data-role="reset"]') : null;
  if (controls && !resetBtn) {
    resetBtn = document.createElement("button");
    resetBtn.className = "btn btn-sm";
    resetBtn.setAttribute("data-role", "reset");
    resetBtn.textContent = "↺ Reset Tree";
    resetBtn.style.display = "none";
    resetBtn.addEventListener("click", function () {
      parent.classList.remove("gc-deleted");
      children.forEach(function (child) { child.classList.remove("gc-deleted"); });
      btn.disabled = false;
      resetBtn.style.display = "none";
      caption.innerHTML = "Click &ldquo;Delete Website (owner)&rdquo; to see what the cluster garbage collector does next.";
    });
    controls.appendChild(resetBtn);
  }

  btn.addEventListener("click", function () {
    btn.disabled = true;
    if (resetBtn) resetBtn.style.display = "inline-flex";
    parent.classList.add("gc-deleted");
    caption.textContent = "Website deleted. Kubernetes' garbage collector notices the owner is gone...";
    children.forEach(function (child, i) {
      setTimeout(function () {
        child.classList.add("gc-deleted");
        if (i === children.length - 1) {
          caption.innerHTML =
            "Both owned objects are cascade-deleted automatically &mdash; no code in this operator ever deletes " +
            "the ConfigMap or Deployment directly. This is the exact behavior verified live on a real cluster below.";
        }
      }, 300 + i * 300);
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
  document.querySelectorAll('[data-viz="recon-loop"]').forEach(initReconVisual);
  document.querySelectorAll('[data-viz="owner-tree"]').forEach(initOwnerTreeVisual);
  document.querySelectorAll('[data-viz="interview-qa"]').forEach(initInterviewQA);
});
