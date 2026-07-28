/* Interactive concept visualizations. Each init function is self-contained
   and driven by data-attributes so it can be wired up independently per page. */

/* ---------- 1. Goroutines: sequential vs concurrent ---------- */
function initGoroutineViz(root) {
  // Durations mirror the verified example (worker sleeps 150/100/50ms), scaled x8 for visibility.
  var durations = [1200, 800, 400];
  var playBtn = root.querySelector('[data-role="play"]');
  var caption = root.querySelector('[data-role="caption"]');

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
        lanes.fills[i].style.transition = "width " + d + "ms linear";
        // Force reflow so the transition reliably restarts on repeated clicks.
        void lanes.fills[i].offsetWidth;
        lanes.fills[i].style.width = "100%";
      }, start);
      setTimeout(function () {
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
    caption.innerHTML = "Running both strategies now&hellip;";

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
          "Sequential took <strong>~" + seqTime + "ms</strong> (each task waits for the last). " +
          "Concurrent took <strong>~" + conTime + "ms</strong> (all three run at once &mdash; " +
          "total time is set by the slowest task, not the sum).";
        playBtn.disabled = false;
      }
    }
  });
}

/* ---------- 2. Unbuffered channel: synchronous handshake ---------- */
function initUnbufferedViz(root) {
  var stepBtn = root.querySelector('[data-role="step"]');
  var caption = root.querySelector('[data-role="caption"]');
  var senderDot = root.querySelector('[data-node="sender"] .hs-dot');
  var receiverDot = root.querySelector('[data-node="receiver"] .hs-dot');
  var packet = root.querySelector(".hs-packet");
  var step = 0;

  var messages = [
    'Click "Next step" to start: the sender goroutine is about to attempt <code>ch &lt;- "hello"</code>.',
    "Sender reaches the send &mdash; and <strong>blocks</strong>. An unbuffered channel has no room to hold a value, so the send cannot complete until a receiver is ready to take it right now.",
    "Receiver reaches <code>&lt;-ch</code> and is ready. The instant both sides are ready, the handoff happens.",
    "Value transferred directly from sender to receiver &mdash; this is the one moment they synchronize. Both goroutines are now free to continue.",
  ];

  function render() {
    senderDot.classList.remove("waiting", "active");
    receiverDot.classList.remove("waiting", "active");
    packet.classList.remove("show");
    packet.style.transition = "none";
    packet.style.left = "6%";
    void packet.offsetWidth; // force reflow so transition is suppressed for the reset
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
    stepBtn.textContent = step >= messages.length - 1 ? "Restart" : "Next step";
  }

  if (!stepBtn) return;
  stepBtn.addEventListener("click", function () {
    step = step >= messages.length - 1 ? 0 : step + 1;
    render();
  });
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
    meta.textContent = "len(ch) = " + buffer.length + "   cap(ch) = " + CAP;
  }

  function flashBlocked(msg) {
    senderDot.classList.add("waiting");
    caption.innerHTML = msg;
    setTimeout(function () {
      senderDot.classList.remove("waiting");
    }, 700);
  }

  sendBtn.addEventListener("click", function () {
    if (buffer.length >= CAP) {
      flashBlocked(
        "<code>ch &lt;- " + nextVal + "</code> would <strong>block</strong> right now &mdash; " +
        "the buffer is full (len == cap). A real send here waits until something is received."
      );
      return;
    }
    buffer.push(nextVal);
    caption.innerHTML = "Sent <code>" + nextVal + "</code>. Since the buffer isn't full, the send " +
      "returns immediately &mdash; no receiver needed yet.";
    nextVal++;
    render();
  });

  recvBtn.addEventListener("click", function () {
    if (buffer.length === 0) {
      caption.innerHTML = "<code>&lt;-ch</code> would <strong>block</strong> right now &mdash; " +
        "the buffer is empty. A real receive here waits until something is sent.";
      return;
    }
    var v = buffer.shift();
    caption.innerHTML = "Received <code>" + v + "</code>, freeing one slot.";
    render();
  });

  render();
  caption.innerHTML = "Try it: send a few values, then try sending past capacity " + CAP + ".";
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

  function updateTallyUI() {
    var total = tally[1] + tally[2];
    tallyEls[1].textContent = "ch1: " + tally[1];
    tallyEls[2].textContent = "ch2: " + tally[2];
    barEls[1].style.width = (total ? (tally[1] / total) * 100 : 0) + "%";
    barEls[2].style.width = (total ? (tally[2] / total) * 100 : 0) + "%";
  }

  fireBtn.addEventListener("click", function () {
    fireBtn.disabled = true;
    box.classList.remove("picked");
    box.textContent = "?";
    chDots[1].classList.add("waiting");
    chDots[2].classList.add("waiting");
    caption.textContent = "Both channels have a value ready at the same time...";

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
        "Run it several times &mdash; per the Go spec, when multiple cases are ready, one is chosen " +
        "<em>pseudo-randomly</em>, not always the first one written.";
      setTimeout(function () {
        chDots[pick].classList.remove("active");
        fireBtn.disabled = false;
      }, 500);
    }, 500);
  });

  updateTallyUI();
}

document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll('[data-viz="goroutines"]').forEach(initGoroutineViz);
  document.querySelectorAll('[data-viz="unbuffered"]').forEach(initUnbufferedViz);
  document.querySelectorAll('[data-viz="buffered"]').forEach(initBufferedViz);
  document.querySelectorAll('[data-viz="select"]').forEach(initSelectViz);
});
