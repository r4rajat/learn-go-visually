/* Interactive concept visualizations for Concurrency.
   Inspired by DSA-30 stepper controls & modern Go runtime mechanics. */

/* Helper to ensure stepper header, progress bar, and navigation exist */
function createStepperChrome(root, title, badgeText, totalSteps, onStepChange) {
  var header = root.querySelector(".viz-header");
  if (!header) {
    header = document.createElement("div");
    header.className = "viz-header";
    header.innerHTML = '<div class="viz-title"><span class="viz-badge">' + (badgeText || "Stepper") + '</span><span>' + title + '</span></div><span class="viz-step-counter">Step 1 of ' + totalSteps + '</span>';
    root.insertBefore(header, root.firstChild);
  }

  var track = root.querySelector(".viz-progress-track");
  if (!track) {
    track = document.createElement("div");
    track.className = "viz-progress-track";
    track.innerHTML = '<div class="viz-progress-bar"></div>';
    header.parentNode.insertBefore(track, header.nextSibling);
  }

  var bar = track.querySelector(".viz-progress-bar");
  var stepCounter = header.querySelector(".viz-step-counter");

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
      void f.offsetWidth; // Force synchronous reflow so 0% is registered!
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
    var initialDelay = 40; // Allow 0% to render before sliding

    durations.forEach(function (d, i) {
      var start = initialDelay + (sequential ? cumulative : 0);
      if (sequential) cumulative += d;

      setTimeout(function () {
        lanes.fills[i].style.transition = "width " + d + "ms cubic-bezier(0.2, 0, 0.4, 1)";
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

    // Small delay ensures resetPanel layout is flushed
    setTimeout(function() {
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
    }, 20);

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
    'Start: Sender goroutine is holding <code>"hello"</code> and ready to send via <code>ch &lt;- "hello"</code>.',
    'Sender executes <code>ch &lt;- "hello"</code> &mdash; and <strong>blocks</strong>. An unbuffered channel has 0 capacity, so the sender pauses until a receiver shows up.',
    'Receiver goroutine reaches <code>&lt;-ch</code>. Both sides have now rendezvoused at the channel.',
    '<strong>Handshake complete!</strong> Value transferred directly in memory without queuing. Both goroutines are unblocked and resume execution.',
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
    }, 1300);
  }

  function render() {
    senderDot.classList.remove("waiting", "active");
    receiverDot.classList.remove("waiting", "active");

    if (step === 0) {
      packet.style.transition = "none";
      packet.style.left = "6%";
      packet.style.opacity = "1";
      void packet.offsetWidth;
      packet.style.transition = "left 0.65s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.25s ease";
    } else if (step === 1) {
      senderDot.classList.add("waiting");
      packet.style.transition = "none";
      packet.style.left = "6%";
      packet.style.opacity = "1";
      void packet.offsetWidth;
      packet.style.transition = "left 0.65s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.25s ease";
    } else if (step === 2) {
      senderDot.classList.add("waiting");
      receiverDot.classList.add("active");
      packet.style.left = "6%";
      packet.style.opacity = "1";
    } else if (step === 3) {
      senderDot.classList.add("active");
      receiverDot.classList.add("active");
      packet.style.left = "82%";
      packet.style.opacity = "1";
    }

    caption.innerHTML = messages[step];

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
    caption.innerHTML = "Received <code>" + v + "</code>, freeing up a buffer slot.";
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

/* ---------- Hero Slice Mutation Inspector ---------- */
function initHeroSliceInspector() {
  var root = document.querySelector('[data-viz="hero-slice"]');
  if (!root) return;

  var mutateBtn = root.querySelector('[data-role="hero-mutate"]');
  var resetBtn = root.querySelector('[data-role="hero-reset"]');
  var shareBtn = root.querySelector('[data-role="hero-share"]');
  var line3 = root.querySelector('[data-line="3"]');
  var line4Content = root.querySelector('[data-line="4"] .code-line-content');
  var cell0 = root.querySelector('[data-cell="0"]');
  var cell0Val = cell0 ? cell0.querySelector('.backing-cell-val') : null;
  var sliceA = root.querySelector('[data-slice="a"]');
  var sliceB = root.querySelector('[data-slice="b"]');

  if (mutateBtn) {
    mutateBtn.addEventListener('click', function () {
      if (cell0Val) cell0Val.textContent = "99";
      if (cell0) cell0.classList.add('mutated');
      if (line3) line3.classList.add('active-mutation');
      if (sliceA) sliceA.classList.add('active-target');
      if (sliceB) sliceB.classList.add('active-target');
      if (line4Content) {
        line4Content.innerHTML = '<span class="tok-fn">fmt</span>.<span class="tok-fn">Println</span>(a[0]) <span class="tok-com">// Prints: 99 (MUTATED!)</span>';
      }
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      if (cell0Val) cell0Val.textContent = "1";
      if (cell0) cell0.classList.remove('mutated');
      if (line3) line3.classList.remove('active-mutation');
      if (sliceA) sliceA.classList.remove('active-target');
      if (sliceB) sliceB.classList.remove('active-target');
      if (line4Content) {
        line4Content.innerHTML = '<span class="tok-fn">fmt</span>.<span class="tok-fn">Println</span>(a[0]) <span class="tok-com">// Prints: 1</span>';
      }
    });
  }

  if (shareBtn) {
    shareBtn.addEventListener('click', function () {
      var url = "https://go.dev/play/p/ab2JLeWaDyY";
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(function() {
          var orig = shareBtn.innerHTML;
          shareBtn.innerHTML = '<span>Copied Gotcha!</span>';
          setTimeout(function() { shareBtn.innerHTML = orig; }, 2000);
        });
      }
    });
  }
}

/* ---------- Curriculum Dual-Track Filter ---------- */
function initTrackFilters() {
  var filterButtons = document.querySelectorAll('.track-tab-btn');
  var cards = document.querySelectorAll('.roadmap-card[data-track]');
  if (!filterButtons.length || !cards.length) return;

  filterButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var track = btn.getAttribute('data-track');
      filterButtons.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');

      cards.forEach(function (card) {
        var cardTrack = card.getAttribute('data-track');
        if (track === 'all' || cardTrack === track || (cardTrack && cardTrack.indexOf(track) !== -1)) {
          card.classList.remove('track-hidden');
        } else {
          card.classList.add('track-hidden');
        }
      });
    });
  });
}

/* ---------- Step-by-Step M:N Scheduler Scrubber ---------- */
function initSchedulerScrubber() {
  var root = document.querySelector('[data-viz="scheduler-scrubber"]');
  if (!root) return;

  var prevBtn = root.querySelector('[data-role="sched-prev"]');
  var nextBtn = root.querySelector('[data-role="sched-next"]');
  var playBtn = root.querySelector('[data-role="sched-play"]');
  var resetBtn = root.querySelector('[data-role="sched-reset"]');
  var statusBadge = root.querySelector('.scheduler-step-status');
  var seqTasks = root.querySelectorAll('[data-panel="sequential"] .scheduler-task-row');
  var conTasks = root.querySelectorAll('[data-panel="concurrent"] .scheduler-task-row');
  var timeSeq = root.querySelector('[data-role="time-seq"]');
  var timeCon = root.querySelector('[data-role="time-con"]');

  var currentStep = 0;
  var maxStep = 3;
  var timer = null;

  var stepDescriptions = [
    "Step 0 of 3 (Ready & Idle)",
    "Step 1 of 3 (Tasks Dispatched to M:N:P)",
    "Step 2 of 3 (I/O Wait: OS Thread Blocks vs Work-Stealing)",
    "Step 3 of 3 (Completed: 150ms Concurrent vs 450ms Sequential)"
  ];

  function renderStep(step) {
    currentStep = step;
    if (statusBadge) statusBadge.textContent = stepDescriptions[step];

    // Reset task classes
    seqTasks.forEach(function (t) {
      t.classList.remove('is-active', 'is-done');
      var statusEl = t.querySelector('.scheduler-task-status');
      if (statusEl) statusEl.textContent = 'Waiting';
    });
    conTasks.forEach(function (t) {
      t.classList.remove('is-active', 'is-done');
      var statusEl = t.querySelector('.scheduler-task-status');
      if (statusEl) statusEl.textContent = 'Waiting';
    });

    if (step === 0) {
      if (timeSeq) timeSeq.textContent = "T = 0ms";
      if (timeCon) timeCon.textContent = "T = 0ms";
    } else if (step === 1) {
      if (seqTasks[0]) {
        seqTasks[0].classList.add('is-active');
        seqTasks[0].querySelector('.scheduler-task-status').textContent = 'Running (T1)';
      }
      conTasks.forEach(function (t, idx) {
        t.classList.add('is-active');
        t.querySelector('.scheduler-task-status').textContent = 'Running (P' + (idx % 2) + ')';
      });
      if (timeSeq) timeSeq.textContent = "T = 150ms";
      if (timeCon) timeCon.textContent = "T = 75ms";
    } else if (step === 2) {
      if (seqTasks[0]) {
        seqTasks[0].classList.add('is-done');
        seqTasks[0].querySelector('.scheduler-task-status').textContent = 'Done';
      }
      if (seqTasks[1]) {
        seqTasks[1].classList.add('is-active');
        seqTasks[1].querySelector('.scheduler-task-status').textContent = 'Blocked (Syscall)';
      }
      if (conTasks[0]) {
        conTasks[0].classList.add('is-done');
        conTasks[0].querySelector('.scheduler-task-status').textContent = 'Done';
      }
      if (conTasks[1]) {
        conTasks[1].classList.add('is-active');
        conTasks[1].querySelector('.scheduler-task-status').textContent = 'Netpoller Parked';
      }
      if (conTasks[2]) {
        conTasks[2].classList.add('is-active');
        conTasks[2].querySelector('.scheduler-task-status').textContent = 'Running (P0 Stolen)';
      }
      if (timeSeq) timeSeq.textContent = "T = 300ms (Blocked)";
      if (timeCon) timeCon.textContent = "T = 120ms";
    } else if (step === 3) {
      seqTasks.forEach(function (t) {
        t.classList.add('is-done');
        t.querySelector('.scheduler-task-status').textContent = 'Done (~450ms)';
      });
      conTasks.forEach(function (t) {
        t.classList.add('is-done');
        t.querySelector('.scheduler-task-status').textContent = 'Done (~150ms)';
      });
      if (timeSeq) timeSeq.textContent = "Total: ~450ms";
      if (timeCon) timeCon.textContent = "Total: ~150ms (3x Faster)";
    }
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', function () {
      if (currentStep > 0) renderStep(currentStep - 1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      if (currentStep < maxStep) renderStep(currentStep + 1);
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      if (timer) { clearInterval(timer); timer = null; }
      if (playBtn) playBtn.innerHTML = '<span>▶ Play Demo</span>';
      renderStep(0);
    });
  }

  if (playBtn) {
    playBtn.addEventListener('click', function () {
      if (timer) {
        clearInterval(timer);
        timer = null;
        playBtn.innerHTML = '<span>▶ Play Demo</span>';
      } else {
        if (currentStep >= maxStep) renderStep(0);
        playBtn.innerHTML = '<span>⏸ Pause</span>';
        timer = setInterval(function () {
          if (currentStep < maxStep) {
            renderStep(currentStep + 1);
          } else {
            clearInterval(timer);
            timer = null;
            playBtn.innerHTML = '<span>▶ Play Demo</span>';
          }
        }, 1100);
      }
    });
  }

  renderStep(0);
}

/* ---------- Memory Intuition Quiz Engine ---------- */
function initMemoryIntuitionQuiz() {
  var root = document.querySelector('[data-viz="memory-quiz"]');
  if (!root) return;

  var quizData = [
    {
      id: "slice",
      badge: "MEMORY & SLICES | QUESTION 1 OF 3",
      question: "You create a slice <code>a := []int{1, 2, 3}</code>, then take a sub-slice <code>b := a[:2]</code> and run <code>b[0] = 99</code>. What happens to <code>a[0]</code>?",
      options: [
        "a[0] remains 1 — sub-slicing copies the underlying elements to avoid mutation.",
        "a[0] becomes 99 — slices share the same underlying backing array in memory.",
        "Go throws a compile error — sub-slices are read-only views by default.",
        "A runtime panic occurs because b was sliced with a half-open range bounds."
      ],
      correct: 1,
      explanation: "<strong>Correct!</strong> In Go, a sub-slice is just a 24-byte SliceHeader containing a pointer to the existing backing array. Mutating <code>b[0]</code> writes straight into memory slot <code>0x104008</code>, so <code>a[0]</code> immediately reads <code>99</code>.",
      diagram: function(selected, checked) {
        var val0 = (selected === 1 || checked) ? "99" : "1";
        var isMut = (selected === 1 || checked);
        return '<div style="font-family:var(--font-mono); font-size:0.75rem;">' +
          '<div style="color:#64748b; margin-bottom:0.8rem;">FLASHBOARD MEMORY REPRESENTATION</div>' +
          '<div style="display:grid; grid-template-columns:1fr 1fr; gap:0.6rem; margin-bottom:1rem;">' +
            '<div style="background:#0d1527; border:1px solid ' + (isMut ? '#00f2fe' : '#1e2d4a') + '; border-radius:4px; padding:0.5rem;">' +
              '<div style="color:#38bdf8; font-weight:700;">Slice a (24B)</div>' +
              '<div style="font-size:0.7rem; color:#94a3b8;">ptr: 0x1040 | len: 3 | cap: 3</div>' +
            '</div>' +
            '<div style="background:#0d1527; border:1px solid ' + (isMut ? '#00f2fe' : '#1e2d4a') + '; border-radius:4px; padding:0.5rem;">' +
              '<div style="color:#38bdf8; font-weight:700;">Slice b (24B)</div>' +
              '<div style="font-size:0.7rem; color:#94a3b8;">ptr: 0x1040 | len: 2 | cap: 3</div>' +
            '</div>' +
          '</div>' +
          '<div style="background:#0a0f1d; border:1px solid #1a273f; border-radius:4px; padding:0.6rem;">' +
            '<div style="display:flex; justify-content:space-between; color:#64748b; font-size:0.68rem; margin-bottom:0.4rem;">' +
              '<span>SHARED BACKING ARRAY (0x1040)</span>' +
              '<span style="color:' + (isMut ? '#00f2fe' : '#94a3b8') + ';">' + (isMut ? 'MUTATED MEMORY' : 'ORIGINAL') + '</span>' +
            '</div>' +
            '<div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:0.4rem; text-align:center;">' +
              '<div style="background:#050811; border:1px solid ' + (isMut ? '#00f2fe' : '#1e2d4a') + '; padding:0.4rem; border-radius:4px;">' +
                '<div style="color:' + (isMut ? '#00f2fe' : '#38bdf8') + '; font-weight:800; font-size:1.1rem;">' + val0 + '</div>' +
                '<div style="font-size:0.62rem; color:#64748b;">[0] +0x00</div>' +
              '</div>' +
              '<div style="background:#050811; border:1px solid #1e2d4a; padding:0.4rem; border-radius:4px;">' +
                '<div style="color:#38bdf8; font-weight:800; font-size:1.1rem;">2</div>' +
                '<div style="font-size:0.62rem; color:#64748b;">[1] +0x08</div>' +
              '</div>' +
              '<div style="background:#050811; border:1px solid #1e2d4a; padding:0.4rem; border-radius:4px;">' +
                '<div style="color:#38bdf8; font-weight:800; font-size:1.1rem;">3</div>' +
                '<div style="font-size:0.62rem; color:#64748b;">[2] +0x10</div>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div style="color:#94a3b8; font-size:0.72rem; margin-top:0.8rem;">' +
            '↳ Both slice headers point to the exact same continuous buffer address in heap.' +
          '</div>' +
        '</div>';
      }
    },
    {
      id: "interface",
      badge: "INTERFACES & RUNTIME | QUESTION 2 OF 3",
      question: "<code>var r *bytes.Buffer = nil; var i io.Reader = r;</code> What does <code>i == nil</code> evaluate to in Go?",
      options: [
        "true — because the underlying pointer r holds the value nil.",
        "false — an interface is only nil when both (type, value) are nil; here type is *bytes.Buffer.",
        "Compile error — typed nil cannot be assigned to an interface variable.",
        "A runtime panic occurs when checking equality on an empty receiver."
      ],
      correct: 1,
      explanation: "<strong>Gotcha Unlocked!</strong> In Go, an interface is represented as an <code>iface</code> 2-word struct: <code>{tab *itab, data unsafe.Pointer}</code>. Because <code>r</code> is a typed pointer, <code>tab</code> points to <code>*bytes.Buffer</code> metadata. Thus <code>tab != nil</code>, making <code>i == nil</code> evaluate to <strong>false</strong>!",
      diagram: function(selected, checked) {
        var isTyped = (selected === 1 || checked);
        return '<div style="font-family:var(--font-mono); font-size:0.75rem;">' +
          '<div style="color:#64748b; margin-bottom:0.8rem;">RUNTIME INTERFACE (iface) TUPLE</div>' +
          '<div style="background:#0a0f1d; border:1px solid ' + (isTyped ? '#fbbf24' : '#1a273f') + '; border-radius:6px; padding:0.8rem; margin-bottom:0.8rem;">' +
            '<div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">' +
              '<span style="color:#fbbf24; font-weight:700;">interface value (io.Reader)</span>' +
              '<span style="color:#f87171;">i != nil</span>' +
            '</div>' +
            '<div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem;">' +
              '<div style="background:#050811; border:1px solid #1e2d4a; padding:0.5rem; border-radius:4px;">' +
                '<div style="color:#64748b; font-size:0.65rem;">itab (Type Info)</div>' +
                '<div style="color:#38bdf8; font-weight:700; font-size:0.85rem;">*bytes.Buffer</div>' +
                '<div style="color:#22c55e; font-size:0.62rem;">Non-nil pointer!</div>' +
              '</div>' +
              '<div style="background:#050811; border:1px solid #1e2d4a; padding:0.5rem; border-radius:4px;">' +
                '<div style="color:#64748b; font-size:0.65rem;">data (Value)</div>' +
                '<div style="color:#f87171; font-weight:700; font-size:0.85rem;">nil (0x0)</div>' +
                '<div style="color:#94a3b8; font-size:0.62rem;">nil concrete ptr</div>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div style="color:#94a3b8; font-size:0.72rem;">' +
            '↳ An interface equals nil <em>only</em> if both itab == nil and data == nil.' +
          '</div>' +
        '</div>';
      }
    },
    {
      id: "goroutine",
      badge: "CONCURRENCY INTERNALS | QUESTION 3 OF 3",
      question: "A goroutine sends to an unbuffered channel: <code>ch &lt;- val</code>, but no other goroutine ever reads from it. What happens to this goroutine?",
      options: [
        "The Go garbage collector reclaims the inactive goroutine automatically after 10ms.",
        "The Go runtime returns an ErrChannelClosed error after a default timeout.",
        "The goroutine blocks permanently in 'chan send' waiting state, leaking its memory.",
        "A runtime panic: send on unbuffered channel is immediately raised."
      ],
      correct: 2,
      explanation: "<strong>Critical Production Pitfall!</strong> In Go, blocked goroutines are <strong>never garbage collected</strong>! It parks on the channel's <code>sendq</code> linked list indefinitely, leaking its 2KB stack and everything reachable on it.",
      diagram: function(selected, checked) {
        return '<div style="font-family:var(--font-mono); font-size:0.75rem;">' +
          '<div style="color:#64748b; margin-bottom:0.8rem;">GOROUTINE STATE & CHANNEL SENDQ</div>' +
          '<div style="background:#0a0f1d; border:1px solid #ef4444; border-radius:6px; padding:0.8rem; margin-bottom:0.8rem;">' +
            '<div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">' +
              '<span style="color:#ef4444; font-weight:700;">Goroutine #17 (Parked)</span>' +
              '<span style="background:rgba(239,68,68,0.2); color:#fca5a5; padding:0.1em 0.4em; border-radius:3px; font-size:0.65rem;">Gwaiting (LEAK)</span>' +
            '</div>' +
            '<div style="background:#050811; border:1px solid #1e2d4a; padding:0.5rem; border-radius:4px; margin-bottom:0.5rem;">' +
              '<div style="color:#64748b; font-size:0.65rem;">Channel (hchan) Wait Queue (sendq)</div>' +
              '<div style="color:#38bdf8; font-weight:700;">sendq: [sudog -> G17 (val)]</div>' +
              '<div style="color:#f87171; font-size:0.65rem;">No receiver on recvq!</div>' +
            '</div>' +
            '<div style="font-size:0.7rem; color:#fca5a5;">Memory Stack: 2,048 B permanently pinned in heap.</div>' +
          '</div>' +
          '<div style="color:#94a3b8; font-size:0.72rem;">' +
            '↳ Always use buffered channels with capacity 1 or select with ctx.Done() to prevent goroutine leaks.' +
          '</div>' +
        '</div>';
      }
    }
  ];

  var activeIndex = 0;
  var selectedChoice = null;
  var isChecked = false;

  var tabs = root.querySelectorAll('.quiz-topic-btn');
  var metaTag = root.querySelector('.quiz-meta-tag');
  var qTitle = root.querySelector('.quiz-q-title');
  var optList = root.querySelector('.quiz-options-list');
  var checkBtn = root.querySelector('[data-role="quiz-check-btn"]');
  var resetBtn = root.querySelector('[data-role="quiz-reset-btn"]');
  var feedbackBox = root.querySelector('.quiz-feedback-box');
  var diagramArea = root.querySelector('[data-role="quiz-diagram-area"]');
  var stateBadge = root.querySelector('.quiz-state-badge');

  function loadQuestion(idx) {
    activeIndex = idx;
    selectedChoice = null;
    isChecked = false;
    var data = quizData[idx];

    tabs.forEach(function (t, i) {
      t.classList.toggle('active', i === idx);
    });

    if (metaTag) metaTag.textContent = data.badge;
    if (qTitle) qTitle.innerHTML = data.question;

    if (optList) {
      optList.innerHTML = '';
      data.options.forEach(function (optText, optIdx) {
        var btn = document.createElement('button');
        btn.className = 'quiz-opt-btn';
        btn.type = 'button';
        var letter = String.fromCharCode(65 + optIdx);
        btn.innerHTML = '<span class="quiz-opt-badge">' + letter + '</span><span>' + optText + '</span>';
        btn.addEventListener('click', function () {
          if (isChecked) return;
          selectedChoice = optIdx;
          optList.querySelectorAll('.quiz-opt-btn').forEach(function (b) {
            b.classList.remove('selected');
          });
          btn.classList.add('selected');
          if (checkBtn) checkBtn.disabled = false;
          updateDiagram();
        });
        optList.appendChild(btn);
      });
    }

    if (feedbackBox) {
      feedbackBox.className = 'quiz-feedback-box';
      feedbackBox.style.display = 'none';
      feedbackBox.innerHTML = '';
    }
    if (checkBtn) {
      checkBtn.disabled = true;
      checkBtn.style.display = 'inline-flex';
    }
    if (resetBtn) resetBtn.style.display = 'none';
    if (stateBadge) {
      stateBadge.className = 'quiz-state-badge';
      stateBadge.textContent = 'Awaiting Answer';
    }
    updateDiagram();
  }

  function updateDiagram() {
    var data = quizData[activeIndex];
    if (diagramArea && data.diagram) {
      diagramArea.innerHTML = data.diagram(selectedChoice, isChecked);
    }
  }

  tabs.forEach(function (tab, idx) {
    tab.addEventListener('click', function () {
      loadQuestion(idx);
    });
  });

  if (checkBtn) {
    checkBtn.addEventListener('click', function () {
      if (selectedChoice === null || isChecked) return;
      isChecked = true;
      var data = quizData[activeIndex];
      var isCorrect = (selectedChoice === data.correct);

      var optionButtons = optList.querySelectorAll('.quiz-opt-btn');
      optionButtons.forEach(function (btn, i) {
        btn.classList.remove('selected');
        if (i === data.correct) {
          btn.classList.add('correct');
        } else if (i === selectedChoice) {
          btn.classList.add('wrong');
        }
      });

      if (feedbackBox) {
        feedbackBox.className = 'quiz-feedback-box ' + (isCorrect ? 'correct' : 'wrong');
        feedbackBox.innerHTML = isCorrect ? data.explanation : "<strong>Incorrect mental model.</strong> Check the memory layout on the right to see what actually happens in the Go runtime.";
        feedbackBox.style.display = 'block';
      }

      if (stateBadge) {
        stateBadge.className = 'quiz-state-badge ' + (isCorrect ? 'verified' : 'error');
        stateBadge.textContent = isCorrect ? 'Verified Correct' : 'Intuition Trap';
      }

      checkBtn.style.display = 'none';
      if (resetBtn) resetBtn.style.display = 'inline-flex';
      updateDiagram();
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      loadQuestion(activeIndex);
    });
  }

  loadQuestion(0);
}

/* ============================================================
   GMP RUNTIME SCHEDULER VISUALIZER (Mockup 3)
   ============================================================ */
function initGMPVisualizer() {
  var root = document.querySelector('[data-viz="gmp-scheduler"]');
  if (!root) return;

  var tabBtns = root.querySelectorAll('.btn-gmp-tab');
  var statusBadge = root.querySelector('[data-role="gmp-status"]');
  var actionBanner = root.querySelector('[data-role="gmp-action-banner"]');

  var p0Card = root.querySelector('[data-role="proc-p0"]');
  var p1Card = root.querySelector('[data-role="proc-p1"]');

  var p0CurrentG = root.querySelector('[data-role="p0-current-g"]');
  var p1CurrentG = root.querySelector('[data-role="p1-current-g"]');

  var p0Machine = root.querySelector('[data-role="p0-machine"]');
  var p1Machine = root.querySelector('[data-role="p1-machine"]');

  var p0Queue = root.querySelector('[data-role="p0-queue"]');
  var p1Queue = root.querySelector('[data-role="p1-queue"]');

  var grqSlots = root.querySelector('[data-role="grq-slots"]');

  var states = [
    {
      tabIndex: 0,
      status: "STATUS: RUNNING (NORMAL_LOAD)",
      statusClass: "running",
      actionText: "<strong>Step 1 State: Normal Local Execution.</strong> Machine M0 executes Goroutine G1 bound to Processor context P0. M0 fetches directly from P0's 256-slot lock-free local queue with 0 mutex overhead. Global run queue is bypassed.",
      p0: {
        cardClass: "processor-card running",
        badge: "RUNNING",
        machine: "<span>MACHINE M0 (OS THREAD)</span><span>TID: 4092</span>",
        currentG: "<strong>G1: HTTP CLIENT (RUNNING)</strong><div style=\"font-size:0.7rem; color:#64748b;\">PC: 0x482991 &bull; Stack: 2048 B</div>",
        queue: '<span class="proc-q-pill active">G2 (Database)</span><span class="proc-q-pill active">G3 (Telemetry)</span><span class="proc-q-pill active">G4 (Metrics)</span>'
      },
      p1: {
        cardClass: "processor-card idle",
        badge: "IDLE",
        machine: "<span>MACHINE M1 (OS THREAD)</span><span>TID: 4093</span>",
        currentG: "<strong>G0: RUNTIME SCHEDULER LOOP (IDLE)</strong><div style=\"font-size:0.7rem; color:#64748b;\">Awaiting runnable work</div>",
        queue: '<span class="proc-q-pill">EMPTY</span><span class="proc-q-pill">EMPTY</span>'
      },
      grq: '<span class="grq-slot-pill active-g">G10 (cron.Task)</span><span class="grq-slot-pill active-g">G12 (metrics.Flush)</span><span class="grq-slot-pill active-g">G14 (heartbeat)</span><span class="grq-slot-pill empty">EMPTY (MUTEX HELD)</span>'
    },
    {
      tabIndex: 1,
      status: "STATUS: SYSCALL HANDOFF (BLOCKING)",
      statusClass: "blocked",
      actionText: "<strong>Step 2 State: Syscall Handoff (handoffp).</strong> Goroutine G1 executes a synchronous blocking I/O read (syscall). Thread M0 blocks in the kernel with G1. The runtime immediately invokes <code>handoffp()</code>: Processor P0 detaches from M0 and transitions its local queue to idle Thread M2, ensuring G2, G3, G4 keep running without starvation.",
      p0: {
        cardClass: "processor-card running",
        badge: "HANDOFF -> M2",
        machine: "<span>MACHINE M2 (WOKEN THREAD)</span><span>TID: 4105</span>",
        currentG: "<strong>G2: DATABASE QUERY (RUNNING)</strong><div style=\"font-size:0.7rem; color:#64748b;\">M0 + G1 blocked in kernel &bull; P0 reattached to M2</div>",
        queue: '<span class="proc-q-pill active">G3 (Telemetry)</span><span class="proc-q-pill active">G4 (Metrics)</span>'
      },
      p1: {
        cardClass: "processor-card idle",
        badge: "IDLE",
        machine: "<span>MACHINE M1 (OS THREAD)</span><span>TID: 4093</span>",
        currentG: "<strong>G0: RUNTIME SCHEDULER LOOP (IDLE)</strong><div style=\"font-size:0.7rem; color:#64748b;\">Local run queue empty</div>",
        queue: '<span class="proc-q-pill">EMPTY</span><span class="proc-q-pill">EMPTY</span>'
      },
      grq: '<span class="grq-slot-pill active-g">G10 (cron.Task)</span><span class="grq-slot-pill active-g">G12 (metrics.Flush)</span><span class="grq-slot-pill active-g">G14 (heartbeat)</span><span class="grq-slot-pill empty">EMPTY</span>'
    },
    {
      tabIndex: 2,
      status: "STATUS: WORK-STEALING (REBALANCED)",
      statusClass: "stealing",
      actionText: "<strong>Step 3 State: Work-Stealing Algorithm (findrunnable).</strong> Processor P1 has no local runnable goroutines. Instead of putting OS Thread M1 to sleep, P1 queries peer processor P0 and executes an atomic lock-free batch steal of <strong>50% of P0's queue (G3, G4)</strong>. Both CPU cores are now 100% utilized!",
      p0: {
        cardClass: "processor-card running",
        badge: "RUNNING",
        machine: "<span>MACHINE M0 (OS THREAD)</span><span>TID: 4092</span>",
        currentG: "<strong>G1: HTTP CLIENT (RUNNING)</strong><div style=\"font-size:0.7rem; color:#64748b;\">PC: 0x482991 &bull; 1 Goroutine remaining</div>",
        queue: '<span class="proc-q-pill active">G2 (Database)</span>'
      },
      p1: {
        cardClass: "processor-card stealing",
        badge: "STEALING 50%",
        machine: "<span>MACHINE M1 (ACTIVE THREAD)</span><span>TID: 4093</span>",
        currentG: "<strong>G3: TELEMETRY (STOLEN &amp; RUNNING)</strong><div style=\"font-size:0.7rem; color:#fbbf24;\">Executed via work-stealing from P0</div>",
        queue: '<span class="proc-q-pill stolen">G4 (Metrics &bull; Stolen)</span>'
      },
      grq: '<span class="grq-slot-pill active-g">G10 (cron.Task)</span><span class="grq-slot-pill active-g">G12 (metrics.Flush)</span><span class="grq-slot-pill empty">EMPTY</span><span class="grq-slot-pill empty">EMPTY</span>'
    }
  ];

  function setStep(index) {
    var state = states[index];
    tabBtns.forEach(function (btn, idx) {
      if (idx === index) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    if (statusBadge) {
      statusBadge.textContent = state.status;
      if (index === 0) {
        statusBadge.style.color = '#22c55e';
        statusBadge.style.borderColor = 'rgba(34, 197, 94, 0.3)';
        statusBadge.style.background = 'rgba(34, 197, 94, 0.1)';
      } else if (index === 1) {
        statusBadge.style.color = '#f43f5e';
        statusBadge.style.borderColor = 'rgba(244, 63, 94, 0.3)';
        statusBadge.style.background = 'rgba(244, 63, 94, 0.1)';
      } else {
        statusBadge.style.color = '#fbbf24';
        statusBadge.style.borderColor = 'rgba(251, 191, 36, 0.3)';
        statusBadge.style.background = 'rgba(251, 191, 36, 0.1)';
      }
    }

    if (actionBanner) actionBanner.innerHTML = state.actionText;

    if (p0Card) {
      p0Card.className = state.p0.cardClass;
      var p0HeadBadge = p0Card.querySelector('.proc-status-badge');
      if (p0HeadBadge) p0HeadBadge.textContent = state.p0.badge;
    }
    if (p0Machine) p0Machine.innerHTML = state.p0.machine;
    if (p0CurrentG) p0CurrentG.innerHTML = state.p0.currentG;
    if (p0Queue) p0Queue.innerHTML = state.p0.queue;

    if (p1Card) {
      p1Card.className = state.p1.cardClass;
      var p1HeadBadge = p1Card.querySelector('.proc-status-badge');
      if (p1HeadBadge) p1HeadBadge.textContent = state.p1.badge;
    }
    if (p1Machine) p1Machine.innerHTML = state.p1.machine;
    if (p1CurrentG) p1CurrentG.innerHTML = state.p1.currentG;
    if (p1Queue) p1Queue.innerHTML = state.p1.queue;

    if (grqSlots) grqSlots.innerHTML = state.grq;
  }

  tabBtns.forEach(function (btn, idx) {
    btn.addEventListener('click', function () {
      setStep(idx);
    });
  });

  setStep(0);
}

/* Concurrency Incident Checkpoint Quiz */
function initConcurrencyIncidentQuiz() {
  var root = document.querySelector('[data-role="concurrency-incident-quiz"]');
  if (!root) return;

  var optBtns = root.querySelectorAll('.incident-opt-btn');
  var checkBtn = root.querySelector('[data-role="check-incident"]');
  var feedbackBox = root.querySelector('[data-role="incident-feedback"]');
  var selectedIndex = null;
  var isChecked = false;

  optBtns.forEach(function (btn, idx) {
    btn.addEventListener('click', function () {
      if (isChecked) return;
      selectedIndex = idx;
      optBtns.forEach(function (b) { b.classList.remove('selected'); });
      btn.classList.add('selected');
    });
  });

  if (checkBtn) {
    checkBtn.addEventListener('click', function () {
      if (selectedIndex === null || isChecked) return;
      isChecked = true;
      var isCorrect = (selectedIndex === 1); // Option B is correct

      optBtns.forEach(function (btn, idx) {
        btn.classList.remove('selected');
        if (idx === 1) {
          btn.classList.add('correct');
        } else if (idx === selectedIndex) {
          btn.classList.add('wrong');
        }
      });

      if (feedbackBox) {
        feedbackBox.style.display = 'block';
        if (isCorrect) {
          feedbackBox.className = 'quiz-feedback-box correct';
          feedbackBox.innerHTML = '<strong>✔ Architecture Verified!</strong> The Go runtime executes <code>handoffp(p)</code>: Processor P disassociates from the blocking OS thread M (which stays asleep in the kernel waiting on I/O) and moves itself and its entire local run queue to another available OS thread (or spawns a new M via <code>startm()</code>). Thus, the remaining goroutines continue executing with zero starvation.';
        } else {
          feedbackBox.className = 'quiz-feedback-box wrong';
          feedbackBox.innerHTML = '<strong>✖ Intuition Error.</strong> In Go, blocking system calls do not freeze other runnable goroutines! The runtime automatically executes <code>handoffp()</code>, releasing Processor P to another OS thread so execution proceeds immediately.';
        }
      }
      checkBtn.style.display = 'none';
    });
  }
}

/* ============================================================
   LRU CACHE INTERACTIVE VISUALIZER (Mockup 2)
   ============================================================ */
function initLRUCacheVisualizer() {
  var root = document.querySelector('[data-viz="lru-visualizer"]');
  if (!root) return;

  var stepCounter = root.querySelector('[data-role="lru-step-name"]');
  var nextBtn = root.querySelector('[data-role="lru-next"]');
  var prevBtn = root.querySelector('[data-role="lru-prev"]');
  var resetBtn = root.querySelector('[data-role="lru-reset"]');
  var chainList = root.querySelector('[data-role="lru-nodes-list"]');
  var mapList = root.querySelector('[data-role="lru-map-list"]');
  var codeLines = root.querySelectorAll('[data-line]');
  var capText = root.querySelector('[data-role="lru-cap"]');
  var hitRatio = root.querySelector('[data-role="lru-hit-ratio"]');
  var evictionCount = root.querySelector('[data-role="lru-evictions"]');
  var memUsage = root.querySelector('[data-role="lru-mem"]');

  var currentStep = 0;
  var steps = [
    {
      name: 'Initial State: Cache Full (3/3)',
      highlightLines: [2, 3],
      cap: '3 / 3 (100%)',
      hit: '82%',
      evictions: '12',
      mem: '144 Bytes',
      nodes: [
        { key: 'user:101', ptr: '0x1040', mru: true, evict: false, desc: 'MRU (Head)' },
        { key: 'user:102', ptr: '0x1080', mru: false, evict: false, desc: 'Middle' },
        { key: 'user:103', ptr: '0x1120', mru: false, evict: true, desc: 'LRU (Tail candidate)' }
      ],
      map: [
        { key: '"user:101"', ptr: '0x1040' },
        { key: '"user:102"', ptr: '0x1080' },
        { key: '"user:103"', ptr: '0x1120' }
      ]
    },
    {
      name: 'Step 1: Get("user:103") -> Promoted to MRU Head',
      highlightLines: [11, 12, 13],
      cap: '3 / 3 (100%)',
      hit: '85% (+3%)',
      evictions: '12',
      mem: '144 Bytes',
      nodes: [
        { key: 'user:103', ptr: '0x1120', mru: true, evict: false, desc: 'MRU (Promoted from tail)' },
        { key: 'user:101', ptr: '0x1040', mru: false, evict: false, desc: 'Shifted down' },
        { key: 'user:102', ptr: '0x1080', mru: false, evict: true, desc: 'New LRU (Tail candidate)' }
      ],
      map: [
        { key: '"user:103"', ptr: '0x1120' },
        { key: '"user:101"', ptr: '0x1040' },
        { key: '"user:102"', ptr: '0x1080' }
      ]
    },
    {
      name: 'Step 2: Put("user:104") -> Evict LRU "user:102" & Insert',
      highlightLines: [23, 24, 25, 26],
      cap: '3 / 3 (100%)',
      hit: '87%',
      evictions: '13 (+1)',
      mem: '144 Bytes',
      nodes: [
        { key: 'user:104', ptr: '0x1160', mru: true, evict: false, desc: 'MRU (Newly inserted)' },
        { key: 'user:103', ptr: '0x1120', mru: false, evict: false, desc: 'Shifted' },
        { key: 'user:101', ptr: '0x1040', mru: false, evict: true, desc: 'New LRU (Oldest)' }
      ],
      map: [
        { key: '"user:104"', ptr: '0x1160' },
        { key: '"user:103"', ptr: '0x1120' },
        { key: '"user:101"', ptr: '0x1040' }
      ]
    },
    {
      name: 'Step 3: Get("user:999") -> Cache Miss (No Mutation)',
      highlightLines: [8, 9],
      cap: '3 / 3 (100%)',
      hit: '84%',
      evictions: '13',
      mem: '144 Bytes',
      nodes: [
        { key: 'user:104', ptr: '0x1160', mru: true, evict: false, desc: 'MRU (Unchanged)' },
        { key: 'user:103', ptr: '0x1120', mru: false, evict: false, desc: 'Middle' },
        { key: 'user:101', ptr: '0x1040', mru: false, evict: true, desc: 'LRU' }
      ],
      map: [
        { key: '"user:104"', ptr: '0x1160' },
        { key: '"user:103"', ptr: '0x1120' },
        { key: '"user:101"', ptr: '0x1040' }
      ]
    }
  ];

  function renderStep(idx) {
    var s = steps[idx];
    if (stepCounter) stepCounter.textContent = s.name;
    if (capText) capText.textContent = s.cap;
    if (hitRatio) hitRatio.textContent = s.hit;
    if (evictionCount) evictionCount.textContent = s.evictions;
    if (memUsage) memUsage.textContent = s.mem;

    if (codeLines) {
      codeLines.forEach(function (line) {
        var num = parseInt(line.getAttribute('data-line'), 10);
        if (s.highlightLines.indexOf(num) !== -1) {
          line.style.background = 'rgba(0, 242, 254, 0.15)';
          line.style.borderLeft = '3px solid #00f2fe';
        } else {
          line.style.background = 'transparent';
          line.style.borderLeft = 'none';
        }
      });
    }

    if (chainList) {
      var html = '<div class="lru-node-card" style="border-style:dashed; opacity:0.75;"><span class="lru-node-key">HEAD (DUMMY SENTINEL)</span><span class="lru-node-ptr">ptr: 0x0000</span></div>';
      s.nodes.forEach(function (n) {
        var cls = 'lru-node-card' + (n.mru ? ' mru mutated' : '') + (n.evict ? ' lru-evict' : '');
        html += '<div class="' + cls + '"><div><span class="lru-node-key">' + n.key + '</span> <span style="font-size:0.68rem; color:#64748b;">(' + n.desc + ')</span></div><span class="lru-node-ptr">' + n.ptr + '</span></div>';
      });
      html += '<div class="lru-node-card" style="border-style:dashed; opacity:0.75;"><span class="lru-node-key">TAIL (DUMMY SENTINEL)</span><span class="lru-node-ptr">ptr: 0xFFFF</span></div>';
      chainList.innerHTML = html;
    }

    if (mapList) {
      var mapHtml = '';
      s.map.forEach(function (m) {
        mapHtml += '<div class="lru-map-entry"><span class="lru-map-key">' + m.key + '</span><span>&rarr;</span><span class="lru-map-ptr">' + m.ptr + '</span></div>';
      });
      mapList.innerHTML = mapHtml;
    }
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      currentStep = (currentStep + 1) % steps.length;
      renderStep(currentStep);
    });
  }
  if (prevBtn) {
    prevBtn.addEventListener('click', function () {
      currentStep = (currentStep - 1 + steps.length) % steps.length;
      renderStep(currentStep);
    });
  }
  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      currentStep = 0;
      renderStep(0);
    });
  }

  renderStep(0);
}

/* LRU Cache Incident Checkpoint Quiz */
function initLRUIncidentQuiz() {
  var root = document.querySelector('[data-role="lru-incident-quiz"]');
  if (!root) return;

  var optBtns = root.querySelectorAll('.incident-opt-btn');
  var checkBtn = root.querySelector('[data-role="check-lru-incident"]');
  var feedbackBox = root.querySelector('[data-role="lru-incident-feedback"]');
  var selectedIndex = null;
  var isChecked = false;

  optBtns.forEach(function (btn, idx) {
    btn.addEventListener('click', function () {
      if (isChecked) return;
      selectedIndex = idx;
      optBtns.forEach(function (b) { b.classList.remove('selected'); });
      btn.classList.add('selected');
    });
  });

  if (checkBtn) {
    checkBtn.addEventListener('click', function () {
      if (selectedIndex === null || isChecked) return;
      isChecked = true;
      var isCorrect = (selectedIndex === 1); // Option B is correct (Partition into 16 sharded cache stripes)

      optBtns.forEach(function (btn, idx) {
        btn.classList.remove('selected');
        if (idx === 1) {
          btn.classList.add('correct');
        } else if (idx === selectedIndex) {
          btn.classList.add('wrong');
        }
      });

      if (feedbackBox) {
        feedbackBox.style.display = 'block';
        if (isCorrect) {
          feedbackBox.className = 'quiz-feedback-box correct';
          feedbackBox.innerHTML = '<strong>✔ Senior Systems Design Verified!</strong> In an LRU cache, every <code>Get()</code> mutates the doubly-linked list pointers to promote accessed keys to the MRU head. A single <code>sync.RWMutex</code> forces full write-lock acquisition across all threads, collapsing under 200,000+ RPS. Partitioning the cache into 16 or 32 independent shards based on <code>hash(key) % shards</code> spreads mutex lock contention across cores, eliminating the bottleneck.';
        } else {
          feedbackBox.className = 'quiz-feedback-box wrong';
          feedbackBox.innerHTML = '<strong>✖ Contention Pitfall.</strong> Simply changing lock types or buffer sizes does not solve write-lock serialization when every Get() mutates the list. Sharding the cache (hash striping) is the proven production fix.';
        }
      }
      checkBtn.style.display = 'none';
    });
  }
}

document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll('[data-viz="goroutines"]').forEach(initGoroutineViz);
  document.querySelectorAll('[data-viz="unbuffered"]').forEach(initUnbufferedViz);
  document.querySelectorAll('[data-viz="buffered"]').forEach(initBufferedViz);
  document.querySelectorAll('[data-viz="select"]').forEach(initSelectViz);
  document.querySelectorAll('[data-viz="interview-qa"]').forEach(initInterviewQA);

  // Redesign interactive engines
  initHeroSliceInspector();
  initTrackFilters();
  initSchedulerScrubber();
  initMemoryIntuitionQuiz();

  // Deep Dive & Interview interactive engines (Mockups 2 & 3)
  initGMPVisualizer();
  initConcurrencyIncidentQuiz();
  initLRUCacheVisualizer();
  initLRUIncidentQuiz();
});


