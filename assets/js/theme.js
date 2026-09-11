/* Theme toggle, code panel copy helper, and interactive learning components. */
(function () {
  var KEY = "gv-theme";
  var root = document.documentElement;
  var saved = localStorage.getItem(KEY);
  if (saved) root.setAttribute("data-theme", saved);

  var SUN_ICON = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>';
  var MOON_ICON = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';
  var COPY_ICON = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
  var CHECK_ICON = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';

  function current() {
    var attr = root.getAttribute("data-theme");
    if (attr) return attr;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function apply(theme) {
    root.setAttribute("data-theme", theme);
    localStorage.setItem(KEY, theme);
    updateToggleButtons(theme);
  }

  function updateToggleButtons(theme) {
    var isDark = theme === "dark";
    document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
      btn.innerHTML = (isDark ? SUN_ICON : MOON_ICON) + "<span>" + (isDark ? "Light" : "Dark") + "</span>";
      btn.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
      btn.classList.toggle("is-dark", isDark);
    });
  }

  /* Automatically decorate code panels with terminal dots and copy buttons */
  function setupCodePanels() {
    document.querySelectorAll(".code-panel").forEach(function (panel) {
      var head = panel.querySelector(".code-panel-head");
      var pre = panel.querySelector("pre");
      if (!head || !pre) return;

      // Add macOS-style terminal dots if not present
      if (!head.querySelector(".code-dots")) {
        var dots = document.createElement("div");
        dots.className = "code-dots";
        dots.setAttribute("aria-hidden", "true");
        dots.innerHTML = '<span class="dot-red"></span><span class="dot-yellow"></span><span class="dot-green"></span>';
        head.insertBefore(dots, head.firstChild);
      }

      // Group actions (Open in Playground + Copy)
      var actions = head.querySelector(".code-panel-actions");
      if (!actions) {
        actions = document.createElement("div");
        actions.className = "code-panel-actions";
        var existingLinks = head.querySelectorAll("a.btn, button:not(.btn-copy)");
        existingLinks.forEach(function (el) {
          actions.appendChild(el);
        });
        head.appendChild(actions);
      }

      // Add copy button if not already added
      if (!actions.querySelector(".btn-copy")) {
        var copyBtn = document.createElement("button");
        copyBtn.className = "btn btn-sm btn-copy";
        copyBtn.type = "button";
        copyBtn.innerHTML = COPY_ICON + "<span>Copy</span>";
        copyBtn.setAttribute("aria-label", "Copy code to clipboard");

        copyBtn.addEventListener("click", function () {
          var codeText = pre.textContent || pre.innerText || "";
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(codeText).then(onSuccess, onFallback);
          } else {
            onFallback();
          }

          function onSuccess() {
            copyBtn.innerHTML = CHECK_ICON + "<span>Copied!</span>";
            copyBtn.classList.add("copied");
            setTimeout(function () {
              copyBtn.innerHTML = COPY_ICON + "<span>Copy</span>";
              copyBtn.classList.remove("copied");
            }, 2000);
          }

          function onFallback() {
            try {
              var textarea = document.createElement("textarea");
              textarea.value = codeText;
              textarea.style.position = "fixed";
              textarea.style.opacity = "0";
              document.body.appendChild(textarea);
              textarea.select();
              document.execCommand("copy");
              document.body.removeChild(textarea);
              onSuccess();
            } catch (err) {
              copyBtn.innerHTML = "<span>Failed</span>";
              setTimeout(function () {
                copyBtn.innerHTML = COPY_ICON + "<span>Copy</span>";
              }, 2000);
            }
          }
        });

        actions.appendChild(copyBtn);
      }
    });
  }

  /* Interactive QuizBox engine (inspired by DSA-30) */
  function setupQuizBoxes() {
    document.querySelectorAll(".quiz-box").forEach(function (box) {
      if (box.dataset.quizInit) return;
      box.dataset.quizInit = "true";

      var options = box.querySelectorAll(".quiz-option");
      var explanation = box.querySelector(".quiz-explanation");
      var checkBtn = box.querySelector('[data-role="quiz-check"]');
      var resetBtn = box.querySelector('[data-role="quiz-reset"]');
      var correctIndex = parseInt(box.getAttribute("data-correct"), 10);
      var selectedIndex = null;
      var checked = false;

      options.forEach(function (opt, idx) {
        opt.addEventListener("click", function () {
          if (checked) return;
          selectedIndex = idx;
          options.forEach(function (o) { o.classList.remove("selected"); });
          opt.classList.add("selected");
          if (checkBtn) checkBtn.disabled = false;
        });
      });

      if (checkBtn) {
        checkBtn.addEventListener("click", function () {
          if (selectedIndex === null || checked) return;
          checked = true;
          checkBtn.style.display = "none";
          if (resetBtn) resetBtn.style.display = "inline-flex";

          options.forEach(function (opt, idx) {
            opt.classList.remove("selected");
            if (idx === correctIndex) {
              opt.classList.add("correct");
            } else if (idx === selectedIndex) {
              opt.classList.add("wrong");
            }
          });

          if (explanation) {
            explanation.style.display = "block";
          }
        });
      }

      if (resetBtn) {
        resetBtn.addEventListener("click", function () {
          checked = false;
          selectedIndex = null;
          options.forEach(function (opt) {
            opt.classList.remove("selected", "correct", "wrong");
          });
          if (explanation) explanation.style.display = "none";
          if (checkBtn) {
            checkBtn.style.display = "inline-flex";
            checkBtn.disabled = true;
          }
          resetBtn.style.display = "none";
        });
      }
    });
  }

  /* Interactive PredictBox engine (inspired by DSA-30) */
  function setupPredictBoxes() {
    document.querySelectorAll(".predict-box").forEach(function (box) {
      if (box.dataset.predictInit) return;
      box.dataset.predictInit = "true";

      var input = box.querySelector(".predict-input");
      var revealBtn = box.querySelector('[data-role="predict-reveal"]');
      var hideBtn = box.querySelector('[data-role="predict-hide"]');
      var revealArea = box.querySelector(".predict-reveal-area");
      var predictionDisplay = box.querySelector(".predict-user-guess");

      function doReveal() {
        var guess = input ? input.value.trim() : "";
        if (predictionDisplay && guess) {
          predictionDisplay.textContent = 'You predicted: "' + guess + '"';
          predictionDisplay.style.display = "block";
        }
        if (revealArea) revealArea.style.display = "block";
        if (revealBtn) revealBtn.style.display = "none";
        if (input) input.disabled = true;
      }

      function doHide() {
        if (revealArea) revealArea.style.display = "none";
        if (predictionDisplay) predictionDisplay.style.display = "none";
        if (revealBtn) revealBtn.style.display = "inline-flex";
        if (input) {
          input.disabled = false;
          input.focus();
        }
      }

      if (revealBtn) revealBtn.addEventListener("click", doReveal);
      if (hideBtn) hideBtn.addEventListener("click", doHide);
      if (input) {
        input.addEventListener("keydown", function (e) {
          if (e.key === "Enter") doReveal();
        });
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    updateToggleButtons(current());
    document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        apply(current() === "dark" ? "light" : "dark");
      });
    });

    setupCodePanels();
    setupQuizBoxes();
    setupPredictBoxes();
  });

  // Expose global helper if dynamically injected
  window.initQuizBoxes = setupQuizBoxes;
  window.initPredictBoxes = setupPredictBoxes;
  window.setupCodePanels = setupCodePanels;
})();
