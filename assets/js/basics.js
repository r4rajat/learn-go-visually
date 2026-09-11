/* Interactive visuals for the Basics page.
   Inspired by DSA-30 steppers & pedagogical design. */

function initAnnotateViz(root) {
  var spans = root.querySelectorAll(".anno");
  var caption = root.querySelector('[data-role="caption"]');

  if (!root.querySelector(".viz-header")) {
    var header = document.createElement("div");
    header.className = "viz-header";
    header.innerHTML = '<div class="viz-title"><span class="viz-badge">Code Annotation</span><span>Anatomy of a Go Program</span></div><span class="viz-step-counter">Click any token</span>';
    root.insertBefore(header, root.firstChild);
  }

  spans.forEach(function (span) {
    span.addEventListener("click", function () {
      spans.forEach(function (s) { s.classList.remove("active"); });
      span.classList.add("active");
      caption.innerHTML = span.getAttribute("data-note");
    });
  });
}

function initTypeViz(root) {
  var boxes = root.querySelectorAll(".type-box");
  var btn = root.querySelector('[data-role="toggle"]');
  var caption = root.querySelector('[data-role="caption"]');
  var showingZero = false;

  if (!root.querySelector(".viz-header")) {
    var header = document.createElement("div");
    header.className = "viz-header";
    header.innerHTML = '<div class="viz-title"><span class="viz-badge">Type System</span><span>Go Default Zero Values</span></div><span class="viz-step-counter">Guaranteed initialization</span>';
    root.insertBefore(header, root.firstChild);
  }

  function render() {
    boxes.forEach(function (box) {
      var valueEl = box.querySelector(".type-box-value");
      valueEl.textContent = showingZero
        ? box.getAttribute("data-zero")
        : box.getAttribute("data-example");
      box.classList.toggle("active", showingZero);
    });
    btn.textContent = showingZero ? "Show example values" : "Show zero values";
    caption.textContent = showingZero
      ? 'This is what every type defaults to when you write "var x T" with no value — Go always initializes memory, never leaving garbage.'
      : "These are example assigned values you might provide yourself.";
  }

  btn.addEventListener("click", function () {
    showingZero = !showingZero;
    render();
  });
  render();
}

/* Loop Stepper with Auto-play, Prev, Next, Reset, and Step Dots */
function initLoopViz(root) {
  var nodes = [...root.querySelectorAll(".loop-node")];
  var caption = root.querySelector('[data-role="caption"]');
  var step = 0;
  var totalSteps = 6; // 0 (start) + 5 iterations
  var playing = false;
  var timer = null;

  // Add header
  if (!root.querySelector(".viz-header")) {
    var header = document.createElement("div");
    header.className = "viz-header";
    header.innerHTML = '<div class="viz-title"><span class="viz-badge">Algorithm Stepper</span><span>for i := 1; i <= 5; i++</span></div><span class="viz-step-counter loop-step-counter">Step 0 of 5</span>';
    root.insertBefore(header, root.firstChild);
  }

  // Add progress bar
  if (!root.querySelector(".viz-progress-track")) {
    var track = document.createElement("div");
    track.className = "viz-progress-track";
    track.innerHTML = '<div class="viz-progress-bar"></div>';
    root.querySelector(".viz-header").insertAdjacentElement('afterend', track);
  }

  var bar = root.querySelector(".viz-progress-bar");
  var counter = root.querySelector(".loop-step-counter");
  var controls = root.querySelector(".viz-controls");

  // Setup navigation
  if (controls && !controls.querySelector(".stepper-nav")) {
    var nav = document.createElement("div");
    nav.className = "stepper-nav";

    var prevBtn = document.createElement("button");
    prevBtn.className = "btn btn-sm";
    prevBtn.type = "button";
    prevBtn.textContent = "◀ Prev";

    var playBtn = document.createElement("button");
    playBtn.className = "btn btn-sm";
    playBtn.type = "button";
    playBtn.textContent = "Auto ▶";

    var nextBtn = controls.querySelector('[data-role="step"]');
    if (nextBtn) nextBtn.classList.add("btn-primary");

    var resetBtn = document.createElement("button");
    resetBtn.className = "btn btn-sm";
    resetBtn.type = "button";
    resetBtn.textContent = "↺ Reset";

    var dotsWrap = document.createElement("div");
    dotsWrap.className = "step-dots";
    for (var d = 0; d < 6; d++) {
      var dot = document.createElement("span");
      dot.className = "step-dot" + (d === 0 ? " active" : "");
      (function(idx) {
        dot.addEventListener("click", function() {
          stopPlay();
          step = idx;
          render();
        });
      })(d);
      dotsWrap.appendChild(dot);
    }

    nav.appendChild(prevBtn);
    nav.appendChild(playBtn);
    if (nextBtn) nav.appendChild(nextBtn);
    nav.appendChild(dotsWrap);
    nav.appendChild(resetBtn);

    controls.appendChild(nav);

    function stopPlay() {
      playing = false;
      if (timer) clearTimeout(timer);
      playBtn.textContent = "Auto ▶";
    }

    function togglePlay() {
      if (playing) {
        stopPlay();
      } else {
        playing = true;
        playBtn.textContent = "Pause ❚❚";
        if (step >= 5) step = 0;
        render();
        advance();
      }
    }

    function advance() {
      if (!playing) return;
      timer = setTimeout(function() {
        if (!playing) return;
        if (step < 5) {
          step++;
          render();
          advance();
        } else {
          stopPlay();
        }
      }, 1000);
    }

    prevBtn.addEventListener("click", function() {
      stopPlay();
      step = Math.max(0, step - 1);
      render();
    });

    playBtn.addEventListener("click", togglePlay);

    if (nextBtn) {
      nextBtn.addEventListener("click", function() {
        stopPlay();
        step = step >= 5 ? 0 : step + 1;
        render();
      });
    }

    resetBtn.addEventListener("click", function() {
      stopPlay();
      step = 0;
      render();
    });
  }

  function render() {
    nodes.forEach(function (node, idx) {
      var i = idx + 1;
      var dot = node.querySelector(".loop-dot");
      var tag = node.querySelector(".loop-tag");
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
        ? 'Click "Step" or "Auto" to run the loop condition <code>i := 1; i &lt;= 5; i++</code>.'
        : "i = " + step + ", i % 2 == " + (step % 2) + " &rarr; <strong>" + (step % 2 === 0 ? "even" : "odd") + "</strong>";

    if (counter) counter.textContent = "Iteration " + step + " of 5";
    if (bar) bar.style.width = ((step / 5) * 100) + "%";

    var dots = root.querySelectorAll(".step-dot");
    dots.forEach(function(d, i) {
      d.classList.toggle("active", i === step);
    });

    var stepBtn = root.querySelector('[data-role="step"]');
    if (stepBtn) stepBtn.textContent = step >= 5 ? "Restart ↺" : "Step ▶";
  }

  render();
}

function initFlowViz(root) {
  var btn = root.querySelector('[data-role="call"]');
  var caption = root.querySelector('[data-role="caption"]');
  var inputs = root.querySelectorAll('.flow-box[data-role="input"]');
  var fn = root.querySelector(".flow-fn");
  var outputs = root.querySelectorAll('.flow-box[data-role="output"]');

  if (!root.querySelector(".viz-header")) {
    var header = document.createElement("div");
    header.className = "viz-header";
    header.innerHTML = '<div class="viz-title"><span class="viz-badge">Call Flow</span><span>Multiple Return Values</span></div><span class="viz-step-counter">divmod(17, 5)</span>';
    root.insertBefore(header, root.firstChild);
  }

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
      caption.textContent = "Inside divmod: computing quotient 17 / 5 and remainder 17 % 5...";
    }, 500);
    setTimeout(function () {
      outputs.forEach(function (b) { b.classList.add("active"); });
      caption.innerHTML =
        "Both values return <strong>simultaneously</strong>: quotient = 3, remainder = 2. " +
        "Multiple return values in Go are first-class &mdash; no wrapper tuple or heap allocation required.";
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

  if (!root.querySelector(".viz-header")) {
    var header = document.createElement("div");
    header.className = "viz-header";
    header.innerHTML = '<div class="viz-title"><span class="viz-badge">Scope Trap</span><span>Variable Shadowing (:= vs =)</span></div><span class="viz-step-counter">Lexical scope inspector</span>';
    root.insertBefore(header, root.firstChild);
  }

  function render() {
    if (shadowed) {
      outerX.textContent = 'x = 10';
      innerX.textContent = 'x = 20';
      outerX.className = 'scope-var-row ok';
      innerX.className = 'scope-var-row shadowed';
      outerNote.textContent = 'outer x: 10 (unchanged)';
      innerNote.textContent = 'inner x: 20 (new inner variable!)';
      btn.textContent = 'Show correct version (=)';
      caption.innerHTML =
        'The <code>:=</code> inside the inner block allocates a <strong>completely new</strong> variable <code>x</code> ' +
        'that masks the outer one. The outer <code>x</code> remains <code>10</code>. This is a common bug.';
    } else {
      outerX.textContent = 'x = 20';
      innerX.textContent = 'x = 20';
      outerX.className = 'scope-var-row ok';
      innerX.className = 'scope-var-row ok';
      outerNote.textContent = 'outer x: 20 (correctly reassigned)';
      innerNote.textContent = 'inner x: 20';
      btn.textContent = 'Show shadowing bug (:=)';
      caption.innerHTML =
        'Using <code>=</code> reassigns the existing outer <code>x</code> rather than shadowing it.';
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
    { label: 'string', code: 'for i, r := range "Go"', items: [['0', "'G' (71)"], ['1', "'o' (111)"]] },
  ];

  if (!root.querySelector(".viz-header")) {
    var header = document.createElement("div");
    header.className = "viz-header";
    header.innerHTML = '<div class="viz-title"><span class="viz-badge">Loop Mechanics</span><span>for ... range Dual Assignment</span></div><span class="viz-step-counter">Key vs Value</span>';
    root.insertBefore(header, root.firstChild);
  }

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
    btn.textContent = 'Switch to: ' + ['slice', 'map', 'string'][(mode + 1) % 3];
    caption.innerHTML =
      'Collection: <strong>' + m.label + '</strong>. ' +
      'Every <code>range</code> yields two values &mdash; notice the 1st register is the index/key, and the 2nd is a copy of the element.';
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
  var caption = root.querySelector('[data-role="caption"]');
  var step = 0;
  var playing = false;
  var timer = null;

  var messages = [
    'Start: Step forward to push deferred calls onto the stack during execution.',
    'Push 1: <code>defer fmt.Println("cleanup file")</code> onto the call stack.',
    'Push 2: <code>defer fmt.Println("release lock")</code> &mdash; pushed on top of the first.',
    'Push 3: <code>defer fmt.Println("close connection")</code> &mdash; pushed on the very top.',
    'Function returns: deferred calls now execute in reverse order &mdash; <strong>LIFO</strong>.',
    'Pop 1: <code>"close connection"</code> executes first (last in).',
    'Pop 2: <code>"release lock"</code> executes second.',
    'Pop 3: <code>"cleanup file"</code> executes last (first in). Stack is now completely empty.',
  ];

  var totalSteps = messages.length - 1;

  if (!root.querySelector(".viz-header")) {
    var header = document.createElement("div");
    header.className = "viz-header";
    header.innerHTML = '<div class="viz-title"><span class="viz-badge">Stack Stepper</span><span>Defer Execution Stack (LIFO)</span></div><span class="viz-step-counter defer-step-counter">Step 0 of 7</span>';
    root.insertBefore(header, root.firstChild);
  }

  if (!root.querySelector(".viz-progress-track")) {
    var track = document.createElement("div");
    track.className = "viz-progress-track";
    track.innerHTML = '<div class="viz-progress-bar"></div>';
    root.querySelector(".viz-header").insertAdjacentElement('afterend', track);
  }

  var bar = root.querySelector(".viz-progress-bar");
  var counter = root.querySelector(".defer-step-counter");
  var controls = root.querySelector(".viz-controls");

  if (controls && !controls.querySelector(".stepper-nav")) {
    var nav = document.createElement("div");
    nav.className = "stepper-nav";

    var prevBtn = document.createElement("button");
    prevBtn.className = "btn btn-sm";
    prevBtn.type = "button";
    prevBtn.textContent = "◀ Prev";

    var playBtn = document.createElement("button");
    playBtn.className = "btn btn-sm";
    playBtn.type = "button";
    playBtn.textContent = "Auto ▶";

    var nextBtn = controls.querySelector('[data-role="step"]');
    if (nextBtn) nextBtn.classList.add("btn-primary");

    var resetBtn = document.createElement("button");
    resetBtn.className = "btn btn-sm";
    resetBtn.type = "button";
    resetBtn.textContent = "↺ Reset";

    var dotsWrap = document.createElement("div");
    dotsWrap.className = "step-dots";
    for (var d = 0; d <= totalSteps; d++) {
      var dot = document.createElement("span");
      dot.className = "step-dot" + (d === 0 ? " active" : "");
      (function(idx) {
        dot.addEventListener("click", function() {
          stopPlay();
          step = idx;
          render();
        });
      })(d);
      dotsWrap.appendChild(dot);
    }

    nav.appendChild(prevBtn);
    nav.appendChild(playBtn);
    if (nextBtn) nav.appendChild(nextBtn);
    nav.appendChild(dotsWrap);
    nav.appendChild(resetBtn);

    controls.appendChild(nav);

    function stopPlay() {
      playing = false;
      if (timer) clearTimeout(timer);
      playBtn.textContent = "Auto ▶";
    }

    function togglePlay() {
      if (playing) {
        stopPlay();
      } else {
        playing = true;
        playBtn.textContent = "Pause ❚❚";
        if (step >= totalSteps) step = 0;
        render();
        advance();
      }
    }

    function advance() {
      if (!playing) return;
      timer = setTimeout(function() {
        if (!playing) return;
        if (step < totalSteps) {
          step++;
          render();
          advance();
        } else {
          stopPlay();
        }
      }, 1100);
    }

    prevBtn.addEventListener("click", function() {
      stopPlay();
      step = Math.max(0, step - 1);
      render();
    });

    playBtn.addEventListener("click", togglePlay);

    if (nextBtn) {
      nextBtn.addEventListener("click", function() {
        stopPlay();
        step = step >= totalSteps ? 0 : step + 1;
        render();
      });
    }

    resetBtn.addEventListener("click", function() {
      stopPlay();
      step = 0;
      render();
    });
  }

  function render() {
    for (var i = 0; i < frames.length; i++) {
      frames[i].className = 'defer-frame';
      if (step <= 3) {
        if (i < step) frames[i].classList.add('show');
      } else {
        var popIdx = 3 - (step - 3);
        frames[i].classList.add('show');
        if (i > popIdx) {
          frames[i].classList.add('done');
        } else if (i === popIdx) {
          frames[i].classList.add('executing');
        }
      }
    }
    if (label) {
      label.textContent = step <= 3
        ? 'pushing (' + step + '/3 pushed)'
        : 'popping (' + (step - 3) + '/3 popped)';
    }
    caption.innerHTML = messages[step];

    if (counter) counter.textContent = "Step " + step + " of " + totalSteps;
    if (bar) bar.style.width = ((step / totalSteps) * 100) + "%";

    var dots = root.querySelectorAll(".step-dot");
    dots.forEach(function(d, i) {
      d.classList.toggle("active", i === step);
    });

    var stepBtn = root.querySelector('[data-role="step"]');
    if (stepBtn) stepBtn.textContent = step >= totalSteps ? "Restart ↺" : "Next ▶";
  }

  render();
}

/* ---------- Closure capture ---------- */
function initClosureCapViz(root) {
  var envVar = root.querySelector('[data-role="env-var"]');
  var closureVar = root.querySelector('[data-role="closure-var"]');
  var btn = root.querySelector('[data-role="call"]');
  var caption = root.querySelector('[data-role="caption"]');
  var called = false;

  if (!root.querySelector(".viz-header")) {
    var header = document.createElement("div");
    header.className = "viz-header";
    header.innerHTML = '<div class="viz-title"><span class="viz-badge">Memory Reference</span><span>Closure Variable Capture</span></div><span class="viz-step-counter">Heap escape</span>';
    root.insertBefore(header, root.firstChild);
  }

  btn.addEventListener('click', function () {
    if (!called) {
      called = true;
      envVar.classList.add('captured');
      closureVar.classList.add('captured');
      closureVar.textContent = 'multiplier = 3 (captured by ref!)';
      btn.textContent = 'Invoke closure(7)';
      caption.innerHTML =
        'The closure <code>func(x int) int { return multiplier * x }</code> has <strong>captured</strong> ' +
        'the <code>multiplier</code> variable. Go compiler escape analysis moves <code>multiplier</code> to the heap so ' +
        'it outlives the outer function call.';
    } else {
      closureVar.textContent = 'result = 3 * 7 = 21';
      btn.disabled = true;
      caption.innerHTML =
        'Calling the closure with <code>7</code>: it dereferences the captured <code>multiplier</code> (value 3) ' +
        'and computes <code>3 * 7 = 21</code>. The closure holds a direct reference to its lexical environment.';
    }
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
  document.querySelectorAll('[data-viz="hello-anno"]').forEach(initAnnotateViz);
  document.querySelectorAll('[data-viz="type-zero"]').forEach(initTypeViz);
  document.querySelectorAll('[data-viz="loop-step"]').forEach(initLoopViz);
  document.querySelectorAll('[data-viz="fn-flow"]').forEach(initFlowViz);
  document.querySelectorAll('[data-viz="scope-shadow"]').forEach(initScopeShadowViz);
  document.querySelectorAll('[data-viz="range-decomp"]').forEach(initRangeDecompViz);
  document.querySelectorAll('[data-viz="defer-stack"]').forEach(initDeferStackViz);
  document.querySelectorAll('[data-viz="closure-cap"]').forEach(initClosureCapViz);
  document.querySelectorAll('[data-viz="interview-qa"]').forEach(initInterviewQA);
});
