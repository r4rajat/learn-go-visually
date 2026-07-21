/* Interactive visuals for the Basics page. */

function initAnnotateViz(root) {
  const spans = root.querySelectorAll(".anno");
  const caption = root.querySelector('[data-role="caption"]');
  spans.forEach(function (span) {
    span.addEventListener("click", function () {
      spans.forEach(function (s) { s.classList.remove("active"); });
      span.classList.add("active");
      caption.innerHTML = span.getAttribute("data-note");
    });
  });
}

function initTypeViz(root) {
  const boxes = root.querySelectorAll(".type-box");
  const btn = root.querySelector('[data-role="toggle"]');
  const caption = root.querySelector('[data-role="caption"]');
  let showingZero = false;

  function render() {
    boxes.forEach(function (box) {
      const valueEl = box.querySelector(".type-box-value");
      valueEl.textContent = showingZero
        ? box.getAttribute("data-zero")
        : box.getAttribute("data-example");
      box.classList.toggle("active", showingZero);
    });
    btn.textContent = showingZero ? "Show example values" : "Show zero values";
    caption.textContent = showingZero
      ? 'This is what every type defaults to when you write "var x T" with no value — Go always initializes, never leaves memory as garbage.'
      : "These are example values you might assign yourself.";
  }

  btn.addEventListener("click", function () {
    showingZero = !showingZero;
    render();
  });
  render();
}

function initLoopViz(root) {
  const nodes = [...root.querySelectorAll(".loop-node")];
  const btn = root.querySelector('[data-role="step"]');
  const caption = root.querySelector('[data-role="caption"]');
  let step = 0;

  function render() {
    nodes.forEach(function (node, idx) {
      const i = idx + 1;
      const dot = node.querySelector(".loop-dot");
      const tag = node.querySelector(".loop-tag");
      dot.classList.remove("current", "even", "odd");
      if (i <= step) {
        dot.classList.add(i % 2 === 0 ? "even" : "odd");
        tag.textContent = i % 2 === 0 ? "even" : "odd";
        if (i === step) dot.classList.add("current");
      } else {
        tag.textContent = "";
      }
    });
    caption.innerHTML =
      step === 0
        ? 'Click "Step" to run <code>i := 1</code>.'
        : "i = " + step + ", i % 2 == " + (step % 2) + " &rarr; <strong>" + (step % 2 === 0 ? "even" : "odd") + "</strong>";
    btn.textContent = step >= 5 ? "Restart" : "Step";
  }

  btn.addEventListener("click", function () {
    step = step >= 5 ? 0 : step + 1;
    render();
  });
  render();
}

function initFlowViz(root) {
  const btn = root.querySelector('[data-role="call"]');
  const caption = root.querySelector('[data-role="caption"]');
  const inputs = root.querySelectorAll('.flow-box[data-role="input"]');
  const fn = root.querySelector(".flow-fn");
  const outputs = root.querySelectorAll('.flow-box[data-role="output"]');

  function reset() {
    inputs.forEach(function (b) { b.classList.remove("active"); });
    fn.classList.remove("active");
    outputs.forEach(function (b) { b.classList.remove("active"); });
  }

  btn.addEventListener("click", function () {
    reset();
    btn.disabled = true;
    caption.textContent = "Calling divmod(17, 5)...";
    inputs.forEach(function (b) { b.classList.add("active"); });
    setTimeout(function () {
      fn.classList.add("active");
      caption.textContent = "Inside divmod: computing 17 / 5 and 17 % 5...";
    }, 500);
    setTimeout(function () {
      outputs.forEach(function (b) { b.classList.add("active"); });
      caption.innerHTML =
        "Both values return <strong>at once</strong>: quotient = 3, remainder = 2. " +
        "Multiple return values are a genuine language feature in Go — no wrapper object or out-parameter needed.";
      btn.disabled = false;
    }, 1100);
  });
}

document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll('[data-viz="hello-anno"]').forEach(initAnnotateViz);
  document.querySelectorAll('[data-viz="type-zero"]').forEach(initTypeViz);
  document.querySelectorAll('[data-viz="loop-step"]').forEach(initLoopViz);
  document.querySelectorAll('[data-viz="fn-flow"]').forEach(initFlowViz);
});
