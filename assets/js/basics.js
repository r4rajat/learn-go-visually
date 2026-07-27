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

/* ---------- Variable shadowing ---------- */
function initScopeShadowViz(root) {
  var outerX = root.querySelector('[data-role="outer-x"]');
  var innerX = root.querySelector('[data-role="inner-x"]');
  var outerNote = root.querySelector('[data-role="outer-note"]');
  var innerNote = root.querySelector('[data-role="inner-note"]');
  var btn = root.querySelector('[data-role="toggle"]');
  var caption = root.querySelector('[data-role="caption"]');
  var shadowed = false;

  function render() {
    if (shadowed) {
      outerX.textContent = 'x = 10';
      innerX.textContent = 'x = 20';
      outerX.className = 'scope-var-row ok';
      innerX.className = 'scope-var-row shadowed';
      outerNote.textContent = 'outer x: 10 (unchanged)';
      innerNote.textContent = 'inner x: 20 (new var!)';
      btn.textContent = 'Show correct version';
      caption.innerHTML =
        'The <code>:=</code> in the inner scope creates a <strong>new</strong> variable <code>x</code> ' +
        'instead of reassigning the outer one. The outer <code>x</code> keeps its original value.';
    } else {
      outerX.textContent = 'x = 10';
      innerX.textContent = 'x = 20';
      outerX.className = 'scope-var-row ok';
      innerX.className = 'scope-var-row ok';
      outerNote.textContent = 'x = 20 (correctly reassigned)';
      innerNote.textContent = 'x = 20';
      btn.textContent = 'Show shadowing bug';
      caption.innerHTML =
        'With <code>=</code> instead of <code>:=</code>, the inner scope correctly reassigns the outer <code>x</code>.';
    }
  }

  btn.addEventListener('click', function () {
    shadowed = !shadowed;
    render();
  });
  render();
}

/* ---------- for-range decomposition ---------- */
function initRangeDecompViz(root) {
  var modeEl = root.querySelector('[data-role="mode"]');
  var items = root.querySelectorAll('[data-role="item"]');
  var btn = root.querySelector('[data-role="toggle"]');
  var caption = root.querySelector('[data-role="caption"]');
  var mode = 0;
  var modes = [
    { label: 'slice', code: 'for i, v := range []int{10, 20}', items: [['0', '10'], ['1', '20'], ['2', '30']] },
    { label: 'map', code: 'for k, v := range map[string]int{"a": 1}', items: [['"a"', '1'], ['"b"', '2'], ['"c"', '3']] },
    { label: 'string', code: 'for i, r := range "Go"', items: [['0', '\'G\' (71)'], ['1', '\'o\' (111)']] },
  ];

  function render() {
    var m = modes[mode];
    modeEl.textContent = m.code;
    for (var i = 0; i < items.length; i++) {
      if (i < m.items.length) {
        items[i].style.display = '';
        items[i].querySelector('[data-part="key"]').textContent = m.items[i][0];
        items[i].querySelector('[data-part="val"]').textContent = m.items[i][1];
        items[i].className = 'range-decomp-item';
      } else {
        items[i].style.display = 'none';
      }
    }
    btn.textContent = 'Show: ' + ['slice', 'map', 'string'][(mode + 1) % 3];
    caption.innerHTML =
      'Type: <strong>' + m.label + '</strong>. ' +
      'Each <code>range</code> yields two values &mdash; check what changes per type.';
  }

  btn.addEventListener('click', function () {
    mode = (mode + 1) % modes.length;
    render();
  });
  render();
}

/* ---------- Defer LIFO stack ---------- */
function initDeferStackViz(root) {
  var frames = root.querySelectorAll('.defer-frame');
  var label = root.querySelector('[data-role="label"]');
  var btn = root.querySelector('[data-role="step"]');
  var caption = root.querySelector('[data-role="caption"]');
  var step = 0;

  var messages = [
    '"Step" to push the first <code>defer fmt.Println("cleanup file")</code> onto the stack.',
    'Push <code>defer fmt.Println("release lock")</code> &mdash; second in, goes above the first.',
    'Push <code>defer fmt.Println("close connection")</code> &mdash; third in, on top.',
    'Function is about to return. Deferred calls execute in reverse order &mdash; <strong>LIFO</strong>.',
    'Pop: <code>"close connection"</code> executes first (last in).',
    'Pop: <code>"release lock"</code> executes second.',
    'Pop: <code>"cleanup file"</code> executes last (first in). All defers done.',
  ];

  var totalSteps = messages.length - 1;

  function render() {
    for (var i = 0; i < frames.length; i++) {
      frames[i].className = 'defer-frame';
      if (i < step - 3) {
        frames[i].classList.add('show', 'done');
      } else if (i === step - 4 && step > 3) {
        frames[i].classList.add('show', 'executing');
      } else if (i < 3 && step === i + 1) {
        frames[i].classList.add('show');
      } else if (i < 3 && step > i + 1 && step <= 3) {
        frames[i].classList.add('show');
      }
    }
    label.textContent = step <= 3
      ? 'pushing (' + step + '/3 pushed)'
      : 'popping (' + (step - 3) + '/3 popped)';
    caption.innerHTML = messages[step];
    btn.textContent = step >= totalSteps ? 'Restart' : 'Step';
  }

  btn.addEventListener('click', function () {
    step = step >= totalSteps ? 0 : step + 1;
    render();
  });
  render();
}

/* ---------- Closure capture ---------- */
function initClosureCapViz(root) {
  var envVar = root.querySelector('[data-role="env-var"]');
  var closureVar = root.querySelector('[data-role="closure-var"]');
  var btn = root.querySelector('[data-role="call"]');
  var caption = root.querySelector('[data-role="caption"]');
  var called = false;

  btn.addEventListener('click', function () {
    if (!called) {
      called = true;
      envVar.classList.add('captured');
      closureVar.classList.add('captured');
      closureVar.textContent = 'multiplier = 3 (captured!)';
      btn.textContent = 'Call again';
      caption.innerHTML =
        'The closure <code>func(x int) int { return multiplier * x }</code> has <strong>captured</strong> ' +
        'the <code>multiplier</code> variable from its enclosing scope. Even after the outer function returns, ' +
        'the closure still holds a reference to that variable.';
    } else {
      closureVar.textContent = 'result = 3 * 7 = 21';
      btn.disabled = true;
      caption.innerHTML =
        'Calling the closure with <code>7</code>: it reads the captured <code>multiplier</code> (still 3) ' +
        'and computes <code>3 * 7 = 21</code>. The closure "remembers" its environment.';
    }
  });
}

document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll('[data-viz="hello-anno"]').forEach(initAnnotateViz);
  document.querySelectorAll('[data-viz="type-zero"]').forEach(initTypeViz);
  document.querySelectorAll('[data-viz="loop-step"]').forEach(initLoopViz);
  document.querySelectorAll('[data-viz="fn-flow"]').forEach(initFlowViz);
  document.querySelectorAll('[data-viz="scope-shadow"]').forEach(initScopeShadowViz);
  document.querySelectorAll('[data-viz="range-decomp"]').forEach(initRangeDecompViz);
  document.querySelectorAll('[data-viz="defer-stack"]').forEach(initDeferStackViz);
  document.querySelectorAll('[data-viz="closure-cap"]').forEach(initClosureCapViz);
});
