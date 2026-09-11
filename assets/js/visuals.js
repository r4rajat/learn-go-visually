/* Interactive concept visualizations for Concurrency.
   Inspired by DSA-30 stepper controls & modern Go runtime mechanics. */

/* Helper to ensure stepper header, progress bar, and navigation exist */
function createStepperChrome(root, title, badgeText, totalSteps, onStepChange) {
  // Add header if not present
  var header = root.querySelector(".viz-header");
  if (!header) {
    header = document.createElement("div");
    header.className = "viz-header";
    header.innerHTML = '<div class="viz-title"><span class="viz-badge">' + (badgeText || "Stepper") + '</span><span>' + title + '</span></div><span class="viz-step-counter">Step 1 of ' + totalSteps + '</span>';
    root.insertBefore(header, root.firstChild);
  }

  // Add progress bar if not present
  var track = root.querySelector(".viz-progress-track");
  if (!track) {
    track = document.createElement("div");
    track.className = "viz-progress-track";
    track.innerHTML = '<div class="viz-progress-bar"></div>';
    header.parentNode.insertBefore(track, header.nextSibling);
  }

  var bar = track.querySelector(".viz-progress-bar");
  var stepCounter = header.querySelector(".viz-step-counter");

  // Setup navigation controls in controls container
  var controls = root.querySelector(".viz-controls");
  if (controls && !controls.querySelector(".stepper-nav")) {
    var nav = document.createElement("div");
    nav.className = "stepper-nav";

    var prevBtn = document.createElement("button");
    prevBtn.className = "btn btn-sm btn-step-prev";
    prevBtn.type = "button";
    prevBtn.textContent = "◀ Prev";

    var playBtn = document.createElement("button");
    playBtn.className = "btn btn-sm btn-step-play";
    playBtn.type = "button";
    playBtn.textContent = "Auto ▶";

    var nextBtn = controls.querySelector('[data-role="step"]');
    if (!nextBtn) {
      nextBtn = document.createElement("button");
      nextBtn.className = "btn btn-sm btn-primary btn-step-next";
      nextBtn.type = "button";
      nextBtn.textContent = "Next ▶";
      controls.appendChild(nextBtn);
    } else {
      nextBtn.classList.add("btn-step-next");
    }

    var resetBtn = document.createElement("button");
    resetBtn.className = "btn btn-sm btn-step-reset";
    resetBtn.type = "button";
    resetBtn.textContent = "↺ Reset";

    var dotsWrap = document.createElement("div");
    dotsWrap.className = "step-dots";
    for (var d = 0; d < totalSteps; d++) {
      var dot = document.createElement("span");
      dot.className = "step-dot" + (d === 0 ? " active" : "");
      dot.dataset.step = d;
      (function(idx) {
        dot.addEventListener("click", function() {
          onStepChange(idx);
        });
      })(d);
      dotsWrap.appendChild(dot);
    }

    nav.appendChild(prevBtn);
    nav.appendChild(playBtn);
    nav.appendChild(nextBtn);
    nav.appendChild(dotsWrap);
    nav.appendChild(resetBtn);

    controls.insertBefore(nav, controls.firstChild);

    return {
      bar: bar,
      stepCounter: stepCounter,
      prevBtn: prevBtn,
      playBtn: playBtn,
      nextBtn: nextBtn,
      resetBtn: resetBtn,
      dots: dotsWrap.querySelectorAll(".step-dot")
    };
  }

  return {
    bar: bar,
    stepCounter: stepCounter,
    prevBtn: controls ? controls.querySelector(".btn-step-prev") : null,
    playBtn: controls ? controls.querySelector(".btn-step-play") : null,
    nextBtn: controls ? controls.querySelector('[data-role="step"]') : null,
    resetBtn: controls ? controls.querySelector(".btn-step-reset") : null,
    dots: controls ? controls.querySelectorAll(".step-dot") : []
  };
}

/* ---------- 1. Goroutines: sequential vs concurrent ---------- */
function initGoroutineViz(root) {
  var durations = [1200, 800, 400];
  var playBtn = root.querySelector('[data-role="play"]');
  var caption = root.querySelector('[data-role="caption"]');

  // Add header if not present
  if (!root.querySelector(".viz-header")) {
    var header = document.createElement("div");
    header.className = "viz-header";
    header.innerHTML = '<div class="viz-title"><span class="viz-badge">Runtime Visualizer</span><span>Goroutines vs Sequential Execution</span></div><span class="viz-step-counter">3 concurrent tasks</span>';
    root.insertBefore(header, root.firstChild);
  }

  function panelLanes(panel) {
    return {
      fills: panel.querySelectorAll(".lane-fill"),
      badges: panel.querySelectorAll(".lane-done-badge"),
    };
  }

  function resetPanel(panel) {
    var lanes = panelLanes(panel);
    lanes.fills.forEach(function (f) {
      f.style.transition = "none";
      f.style.width = "0%";
    });
    lanes.badges.forEach(function (b) {
      b.classList.remove("show");
      b.textContent = "done";
    });
  }

  function runPanel(panel, sequential, onAllDone) {
    var lanes = panelLanes(panel);
    var cumulative = 0;
    var remaining = durations.length;
    durations.forEach(function (d, i) {
      var start = sequential ? cumulative : 0;
      if (sequential) cumulative += d;
      setTimeout(function () {
        lanes.fills[i].style.transition = "width " + d + "ms cubic-bezier(0.2, 0, 0.4, 1)";
        void lanes.fills[i].offsetWidth;
        lanes.fills[i].style.width = "100%";
      }, start);
      setTimeout(function () {
        lanes.badges[i].textContent = "done (" + Math.round(d / 8) + "ms)";
        lanes.badges[i].classList.add("show");
        remaining--;
        if (remaining === 0) onAllDone();
      }, start + d);
    });
  }

  if (!playBtn) return;
  playBtn.addEventListener("click", function () {
    playBtn.disabled = true;
    var seqPanel = root.querySelector('[data-panel="sequential"]');
    var conPanel = root.querySelector('[data-panel="concurrent"]');
    resetPanel(seqPanel);
    resetPanel(conPanel);
    caption.innerHTML = "Benchmarking both execution models in real time...";

    var t0 = performance.now();
    var seqDone = false, conDone = false, seqTime = 0, conTime = 0;

    runPanel(seqPanel, true, function () {
      seqDone = true;
      seqTime = Math.round(performance.now() - t0);
      finish();
    });
    runPanel(conPanel, false, function () {
      conDone = true;
      conTime = Math.round(performance.now() - t0);
      finish();
    });

    function finish() {
      if (seqDone && conDone) {
        caption.innerHTML =
          "Sequential took <strong>~" + seqTime + "ms</strong> (each task blocks the thread until finished). " +
          "Concurrent took <strong>~" + conTime + "ms</strong> (all three run at once &mdash; " +
          "total time is bounded by the single slowest task, not their sum).";
        playBtn.disabled = false;
      }
    }
  });
}

/* ---------- 2. Unbuffered channel: synchronous handshake ---------- */
function initUnbufferedViz(root) {
  var caption = root.querySelector('[data-role="caption"]');
  var senderDot = root.querySelector('[data-node="sender"] .hs-dot');
  var receiverDot = root.querySelector('[data-node="receiver"] .hs-dot');
  var packet = root.querySelector(".hs-packet");
  var step = 0;
  var playing = false;
  var timer = null;

  var messages = [
    'Start: Sender goroutine is ready to run <code>ch &lt;- "hello"</code>.',
    'Sender executes <code>ch &lt;- "hello"</code> &mdash; and <strong>blocks</strong>. An unbuffered channel has 0 capacity, so the sender cannot continue until a receiver is present.',
    'Receiver goroutine reaches <code>&lt;-ch</code>. Both sides are now rendezvoused at the channel.',
    '<strong>Handshake complete!</strong> Value transferred directly in memory without queuing. Both goroutines resume execution.',
  ];

  var totalSteps = messages.length;

  function goToStep(s) {
    step = Math.max(0, Math.min(totalSteps - 1, s));
    render();
  }

  var chrome = createStepperChrome(root, "Channel Rendezvous (Handshake)", "Concurrency Stepper", totalSteps, function(targetStep) {
    stopPlay();
    goToStep(targetStep);
  });

  function stopPlay() {
    playing = false;
    if (timer) clearTimeout(timer);
    if (chrome.playBtn) chrome.playBtn.textContent = "Auto ▶";
  }

  function togglePlay() {
    if (playing) {
      stopPlay();
    } else {
      playing = true;
      if (chrome.playBtn) chrome.playBtn.textContent = "Pause ❚❚";
      if (step >= totalSteps - 1) step = 0;
      render();
      advanceAuto();
    }
  }

  function advanceAuto() {
    if (!playing) return;
    timer = setTimeout(function() {
      if (!playing) return;
      if (step < totalSteps - 1) {
        step++;
        render();
        advanceAuto();
      } else {
        stopPlay();
      }
    }, 1200);
  }

  function render() {
    senderDot.classList.remove("waiting", "active");
    receiverDot.classList.remove("waiting", "active");
    packet.classList.remove("show");
    packet.style.transition = "none";
    packet.style.left = "6%";
    void packet.offsetWidth;
    packet.style.transition = "";

    if (step === 1) senderDot.classList.add("waiting");
    if (step === 2) {
      senderDot.classList.add("waiting");
      receiverDot.classList.add("active");
    }
    if (step === 3) {
      senderDot.classList.add("active");
      receiverDot.classList.add("active");
      requestAnimationFrame(function () {
        packet.classList.add("show");
        packet.style.left = "82%";
      });
    }

    caption.innerHTML = messages[step];

    // Update Stepper Chrome
    if (chrome.stepCounter) chrome.stepCounter.textContent = "Step " + (step + 1) + " of " + totalSteps;
    if (chrome.bar) chrome.bar.style.width = (((step + 1) / totalSteps) * 100) + "%";
    if (chrome.prevBtn) chrome.prevBtn.disabled = step === 0;
    if (chrome.nextBtn) chrome.nextBtn.textContent = step >= totalSteps - 1 ? "Restart ↺" : "Next ▶";
    if (chrome.dots) {
      chrome.dots.forEach(function(d, i) {
        d.classList.toggle("active", i === step);
      });
    }
  }

  if (chrome.prevBtn) {
    chrome.prevBtn.addEventListener("click", function() {
      stopPlay();
      goToStep(step - 1);
    });
  }

  if (chrome.nextBtn) {
    chrome.nextBtn.addEventListener("click", function() {
      stopPlay();
      goToStep(step >= totalSteps - 1 ? 0 : step + 1);
    });
  }

  if (chrome.playBtn) {
    chrome.playBtn.addEventListener("click", togglePlay);
  }

  if (chrome.resetBtn) {
    chrome.resetBtn.addEventListener("click", function() {
      stopPlay();
      goToStep(0);
    });
  }

  render();
}

/* ---------- 3. Buffered channel: queue with capacity ---------- */
function initBufferedViz(root) {
  var CAP = 3;
  var buffer = [];
  var nextVal = 1;
  var slots = root.querySelectorAll(".queue-slot");
  var meta = root.querySelector('[data-role="meta"]');
  var caption = root.querySelector('[data-role="caption"]');
  var senderDot = root.querySelector(".queue-sender .hs-dot");
  var sendBtn = root.querySelector('[data-role="send"]');
  var recvBtn = root.querySelector('[data-role="receive"]');

  if (!root.querySelector(".viz-header")) {
    var header = document.createElement("div");
    header.className = "viz-header";
    header.innerHTML = '<div class="viz-title"><span class="viz-badge">Queue Visualizer</span><span>Buffered Channel Queue (cap: 3)</span></div><span class="viz-step-counter queue-stat">0 / 3 filled</span>';
    root.insertBefore(header, root.firstChild);
  }

  var statBadge = root.querySelector(".queue-stat");

  if (!sendBtn || !recvBtn) return;

  function render() {
    slots.forEach(function (slot, i) {
      if (i < buffer.length) {
        slot.textContent = buffer[i];
        slot.classList.add("filled");
      } else {
        slot.textContent = "";
        slot.classList.remove("filled");
      }
    });
    var txt = "len(ch) = " + buffer.length + "   cap(ch) = " + CAP;
    if (meta) meta.textContent = txt;
    if (statBadge) statBadge.textContent = buffer.length + " / " + CAP + " filled";
  }

  function flashBlocked(msg) {
    if (senderDot) senderDot.classList.add("waiting");
    caption.innerHTML = msg;
    setTimeout(function () {
      if (senderDot) senderDot.classList.remove("waiting");
    }, 750);
  }

  sendBtn.addEventListener("click", function () {
    if (buffer.length >= CAP) {
      flashBlocked(
        "<code>ch &lt;- " + nextVal + "</code> would <strong>block</strong> &mdash; " +
        "the buffer is full (len == cap). The sender sleeps until a receiver frees a slot."
      );
      return;
    }
    buffer.push(nextVal);
    caption.innerHTML = "Sent <code>" + nextVal + "</code>. The buffer had free space, so the send " +
      "returns immediately &mdash; no receiver needed yet.";
    nextVal++;
    render();
  });

  recvBtn.addEventListener("click", function () {
    if (buffer.length === 0) {
      caption.innerHTML = "<code>&lt;-ch</code> would <strong>block</strong> &mdash; " +
        "the buffer is empty. The receiver sleeps until a sender pushes a value.";
      return;
    }
    var v = buffer.shift();
    caption.innerHTML = "Received <code>" + v + "</code>, freeing up slot 1.";
    render();
  });

  render();
  caption.innerHTML = "Try it: send values to fill the buffer, then try sending past capacity " + CAP + ".";
}

/* ---------- 4. select: multiplexing over ready channels ---------- */
function initSelectViz(root) {
  var fireBtn = root.querySelector('[data-role="fire"]');
  var box = root.querySelector(".mux-box");
  var caption = root.querySelector('[data-role="caption"]');
  var tally = { 1: 0, 2: 0 };
  var tallyEls = {
    1: root.querySelector('[data-role="tally-1"]'),
    2: root.querySelector('[data-role="tally-2"]'),
  };
  var barEls = {
    1: root.querySelector('[data-role="bar-1"]'),
    2: root.querySelector('[data-role="bar-2"]'),
  };
  var chDots = {
    1: root.querySelector('[data-ch="1"] .hs-dot'),
    2: root.querySelector('[data-ch="2"] .hs-dot'),
  };

  if (!root.querySelector(".viz-header")) {
    var header = document.createElement("div");
    header.className = "viz-header";
    header.innerHTML = '<div class="viz-title"><span class="viz-badge">Multiplexer</span><span>select Statement Non-Deterministic Choice</span></div><span class="viz-step-counter">Pseudo-random arbiter</span>';
    root.insertBefore(header, root.firstChild);
  }

  function updateTallyUI() {
    var total = tally[1] + tally[2];
    if (tallyEls[1]) tallyEls[1].textContent = "ch1: " + tally[1];
    if (tallyEls[2]) tallyEls[2].textContent = "ch2: " + tally[2];
    if (barEls[1]) barEls[1].style.width = (total ? (tally[1] / total) * 100 : 0) + "%";
    if (barEls[2]) barEls[2].style.width = (total ? (tally[2] / total) * 100 : 0) + "%";
  }

  if (fireBtn) {
    fireBtn.addEventListener("click", function () {
      fireBtn.disabled = true;
      box.classList.remove("picked");
      box.textContent = "🎲";
      chDots[1].classList.add("waiting");
      chDots[2].classList.add("waiting");
      caption.textContent = "Both channels have a value ready at the exact same moment...";

      setTimeout(function () {
        var pick = Math.random() < 0.5 ? 1 : 2;
        chDots[1].classList.remove("waiting");
        chDots[2].classList.remove("waiting");
        chDots[pick].classList.add("active");
        box.textContent = "ch" + pick;
        box.classList.add("picked");
        tally[pick]++;
        updateTallyUI();
        caption.innerHTML = "<code>select</code> picked <strong>ch" + pick + "</strong> this time. " +
          "Run it several times &mdash; when multiple cases are ready, Go picks one " +
          "<em>pseudo-randomly</em> to guarantee fairness across channels.";
        setTimeout(function () {
          chDots[pick].classList.remove("active");
          fireBtn.disabled = false;
        }, 500);
      }, 500);
    });
  }

  updateTallyUI();
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
  document.querySelectorAll('[data-viz="goroutines"]').forEach(initGoroutineViz);
  document.querySelectorAll('[data-viz="unbuffered"]').forEach(initUnbufferedViz);
  document.querySelectorAll('[data-viz="buffered"]').forEach(initBufferedViz);
  document.querySelectorAll('[data-viz="select"]').forEach(initSelectViz);
  document.querySelectorAll('[data-viz="interview-qa"]').forEach(initInterviewQA);
});
