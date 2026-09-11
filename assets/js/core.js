/* Interactive visuals for the Core page.
   Inspired by DSA-30 memory diagrams & Go memory models. */

function initStructViz(root) {
  var original = root.querySelector('[data-role="original"]');
  var ghost = root.querySelector('[data-role="ghost"]');
  var btnValue = root.querySelector('[data-role="call-value"]');
  var btnPointer = root.querySelector('[data-role="call-pointer"]');
  var caption = root.querySelector('[data-role="caption"]');
  var controls = root.querySelector(".viz-controls");
  var count = 0;

  // Add header if not present
  if (!root.querySelector(".viz-header")) {
    var header = document.createElement("div");
    header.className = "viz-header";
    header.innerHTML = '<div class="viz-title"><span class="viz-badge">Memory Layout</span><span>Value Receiver vs Pointer Receiver</span></div><span class="viz-step-counter">Stack vs In-Place Mutation</span>';
    root.insertBefore(header, root.firstChild);
  }

  // Add Reset button if not present
  if (controls && !controls.querySelector('[data-role="reset"]')) {
    var resetBtn = document.createElement("button");
    resetBtn.className = "btn btn-sm";
    resetBtn.setAttribute("data-role", "reset");
    resetBtn.textContent = "↺ Reset";
    resetBtn.addEventListener("click", function () {
      count = 0;
      original.textContent = "Counter{count: 0}";
      ghost.textContent = "Counter{count: 0}";
      original.classList.remove("changed");
      ghost.classList.remove("changed");
      caption.innerHTML = "Try both buttons and watch which box actually mutates.";
    });
    controls.appendChild(resetBtn);
  }

  if (btnValue) {
    btnValue.addEventListener("click", function () {
      var previewCount = count + 1;
      ghost.textContent = "Counter{count: " + previewCount + "}";
      ghost.classList.add("changed");
      setTimeout(function () {
        ghost.classList.remove("changed");
        ghost.textContent = "Counter{count: " + count + "}";
      }, 950);
      caption.innerHTML =
        "<code>IncByValue()</code> created a <strong>shallow copy</strong> of the struct on its local stack frame. " +
        "The copy changed, but when the method returned, that copy was destroyed. The original is untouched.";
    });
  }

  if (btnPointer) {
    btnPointer.addEventListener("click", function () {
      count++;
      original.textContent = "Counter{count: " + count + "}";
      original.classList.add("changed");
      setTimeout(function () { original.classList.remove("changed"); }, 950);
      caption.innerHTML =
        "<code>IncByPointer()</code> passed the <strong>memory address</strong> (pointer) of the original struct. " +
        "The method dereferenced the pointer and mutated the original memory directly. The change persists.";
    });
  }
}

function initSliceViz(root) {
  var cells = [...root.querySelectorAll(".array-cell")];
  var btn = root.querySelector('[data-role="mutate"]');
  var caption = root.querySelector('[data-role="caption"]');
  var controls = root.querySelector(".viz-controls");
  var mutated = false;

  // Add header if not present
  if (!root.querySelector(".viz-header")) {
    var header = document.createElement("div");
    header.className = "viz-header";
    header.innerHTML = '<div class="viz-title"><span class="viz-badge">Memory Diagram</span><span>SliceHeader & Backing Array</span></div><span class="viz-step-counter">Shared contiguous memory</span>';
    root.insertBefore(header, root.firstChild);
  }

  // Add Reset button if not present
  if (controls && !controls.querySelector('[data-role="reset-slice"]')) {
    var resetBtn = document.createElement("button");
    resetBtn.className = "btn btn-sm";
    resetBtn.setAttribute("data-role", "reset-slice");
    resetBtn.textContent = "↺ Reset to [1, 2, 3]";
    resetBtn.style.display = "none";
    resetBtn.addEventListener("click", function () {
      mutated = false;
      render();
    });
    controls.appendChild(resetBtn);
  }

  var resetBtnEl = controls ? controls.querySelector('[data-role="reset-slice"]') : null;

  function render() {
    cells[0].textContent = mutated ? "99" : "1";
    cells.forEach(function (c, i) {
      c.classList.toggle("touched", mutated && i === 0);
    });
    if (btn) btn.disabled = mutated;
    if (resetBtnEl) resetBtnEl.style.display = mutated ? "inline-flex" : "none";

    caption.innerHTML = mutated
      ? "<code>b[0] = 99</code> mutated the shared backing array in heap memory &mdash; so <code>a[0]</code> immediately reads <code>99</code> too, even though we only touched <code>b</code>."
      : "<code>a := []int{1, 2, 3}</code>, then <code>b := a[:2]</code>. Both slices hold pointers to the <em>same</em> contiguous backing array.";
  }

  if (btn) {
    btn.addEventListener("click", function () {
      mutated = true;
      render();
    });
  }
  render();
}

function initNilIfaceViz(root) {
  var typeBox = root.querySelector('[data-role="type-box"]');
  var valueBox = root.querySelector('[data-role="value-box"]');
  var result = root.querySelector('[data-role="result"]');
  var btn = root.querySelector('[data-role="run"]');
  var caption = root.querySelector('[data-role="caption"]');
  var controls = root.querySelector(".viz-controls");

  // Add header if not present
  if (!root.querySelector(".viz-header")) {
    var header = document.createElement("div");
    header.className = "viz-header";
    header.innerHTML = '<div class="viz-title"><span class="viz-badge">Runtime Representation</span><span>Two-Word Interface Structure</span></div><span class="viz-step-counter">(Type, Value) tuple</span>';
    root.insertBefore(header, root.firstChild);
  }

  // Add Reset button
  if (controls && !controls.querySelector('[data-role="reset-iface"]')) {
    var resetBtn = document.createElement("button");
    resetBtn.className = "btn btn-sm";
    resetBtn.setAttribute("data-role", "reset-iface");
    resetBtn.textContent = "↺ Reset";
    resetBtn.style.display = "none";
    resetBtn.addEventListener("click", function () {
      typeBox.classList.remove("set");
      typeBox.textContent = "nil";
      valueBox.textContent = "nil";
      result.textContent = "err == nil: (not run yet)";
      result.style.color = "";
      btn.disabled = false;
      resetBtn.style.display = "none";
      caption.innerHTML = "An interface is nil only when both its type and value are unset.";
    });
    controls.appendChild(resetBtn);
  }

  var resetBtnEl = controls ? controls.querySelector('[data-role="reset-iface"]') : null;

  if (btn) {
    btn.addEventListener("click", function () {
      typeBox.classList.add("set");
      typeBox.textContent = "*MyError";
      valueBox.textContent = "nil";
      result.innerHTML = '<span style="color:var(--danger); font-weight:750;">err == nil: FALSE</span> (panic trap!)';
      btn.disabled = true;
      if (resetBtnEl) resetBtnEl.style.display = "inline-flex";

      caption.innerHTML =
        "The interface has a non-nil concrete <strong>type</strong> (<code>*MyError</code>) even though its " +
        "<strong>value</strong> is nil. For <code>err == nil</code> to be true, <em>both</em> the type pointer " +
        "and the data pointer must be 0x0 &mdash; so the check evaluates to false.";
    });
  }
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
  document.querySelectorAll('[data-viz="struct-receiver"]').forEach(initStructViz);
  document.querySelectorAll('[data-viz="slice-header"]').forEach(initSliceViz);
  document.querySelectorAll('[data-viz="interface-nil"]').forEach(initNilIfaceViz);
  document.querySelectorAll('[data-viz="interview-qa"]').forEach(initInterviewQA);
});
