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

  btn.addEventListener("click", function () {
    btn.disabled = true;
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

document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll('[data-viz="recon-loop"]').forEach(initReconVisual);
  document.querySelectorAll('[data-viz="owner-tree"]').forEach(initOwnerTreeVisual);
});
