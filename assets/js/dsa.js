/* Interactive visualizers and filtering for 30 Days DSA in Go.
   Inspired by DSA-30 interactive visualizer suite. */

/* ---------- 1. Interactive Array & Memory Diagram ---------- */
function initDSAArrayViz(root) {
  var arr = [10, 20, 30, 40, 50];
  var highlighted = [];
  var baseAddr = 0x1000;
  var elemSize = 8; // int64 in Go

  var container = root.querySelector('[data-role="array-cells"]');
  var memContainer = root.querySelector('[data-role="mem-cells"]');
  var msgBox = root.querySelector('[data-role="msg"]');
  var valInput = root.querySelector('[data-role="input-val"]');
  var idxInput = root.querySelector('[data-role="input-idx"]');
  var insertBtn = root.querySelector('[data-role="btn-insert"]');
  var deleteBtn = root.querySelector('[data-role="btn-delete"]');
  var searchBtn = root.querySelector('[data-role="btn-search"]');
  var resetBtn = root.querySelector('[data-role="btn-reset"]');
  var formulaBox = root.querySelector('[data-role="formula-box"]');

  function render() {
    if (!container) return;
    container.innerHTML = '';
    if (memContainer) memContainer.innerHTML = '';

    arr.forEach(function(val, i) {
      var isHigh = highlighted.indexOf(i) !== -1;
      var addr = baseAddr + i * elemSize;
      var hexAddr = '0x' + addr.toString(16).toUpperCase();

      // Array cell item
      var cellWrap = document.createElement('div');
      cellWrap.style.display = 'flex';
      cellWrap.style.flexDirection = 'column';
      cellWrap.style.alignItems = 'center';
      cellWrap.style.gap = '4px';

      var valBox = document.createElement('div');
      valBox.className = 'array-cell' + (isHigh ? ' touched' : '');
      valBox.textContent = val;
      valBox.style.width = '52px';
      valBox.style.height = '52px';
      valBox.style.fontSize = '1.05rem';
      if (isHigh) {
        valBox.style.transform = 'scale(1.1)';
        valBox.style.boxShadow = '0 0 16px rgba(0, 173, 216, 0.4)';
      }

      var idxLabel = document.createElement('span');
      idxLabel.style.fontSize = '11px';
      idxLabel.style.fontFamily = 'var(--font-mono)';
      idxLabel.style.color = 'var(--text-muted)';
      idxLabel.textContent = '[' + i + ']';

      cellWrap.appendChild(valBox);
      cellWrap.appendChild(idxLabel);
      container.appendChild(cellWrap);

      // Memory diagram block
      if (memContainer) {
        var memBlock = document.createElement('div');
        memBlock.style.display = 'flex';
        memBlock.style.flexDirection = 'column';
        memBlock.style.alignItems = 'center';
        memBlock.style.cursor = 'pointer';

        memBlock.innerHTML =
          '<span style="font-size:10px; font-family:var(--font-mono); color:var(--text-muted); margin-bottom:3px;">' + hexAddr + '</span>' +
          '<div style="width:60px; height:44px; display:flex; align-items:center; justify-content:center; border:2px solid ' + (isHigh ? 'var(--go-cyan)' : 'var(--border-interactive)') + '; border-radius:6px; background:' + (isHigh ? 'var(--accent-bg)' : 'var(--bg)') + '; font-family:var(--font-mono); font-weight:700; font-size:14px; transition:all 0.2s ease;">' + val + '</div>' +
          '<span style="font-size:10px; font-family:var(--font-mono); color:var(--accent); margin-top:3px;">s[' + i + ']</span>' +
          '<span style="font-size:9px; font-family:var(--font-mono); color:var(--text-muted);">' + elemSize + 'B</span>';

        memBlock.addEventListener('mouseenter', function() {
          if (formulaBox) {
            formulaBox.style.display = 'block';
            formulaBox.innerHTML =
              'Memory Calculation for <code>s[' + i + ']</code>: ' +
              '<code>Base (' + ('0x' + baseAddr.toString(16).toUpperCase()) + ') + (Index ' + i + ' &times; ' + elemSize + 'B) = ' + hexAddr + '</code>';
          }
        });

        memBlock.addEventListener('mouseleave', function() {
          if (formulaBox) formulaBox.style.display = 'none';
        });

        memContainer.appendChild(memBlock);
      }
    });

    // Update SliceHeader stats
    var headerStat = root.querySelector('[data-role="slice-header-stat"]');
    if (headerStat) {
      headerStat.innerHTML =
        'SliceHeader: <code>Data = 0x' + baseAddr.toString(16).toUpperCase() + '</code>, ' +
        '<code>Len = ' + arr.length + '</code>, ' +
        '<code>Cap = ' + Math.max(5, Math.pow(2, Math.ceil(Math.log2(arr.length || 1)))) + '</code>';
    }
  }

  function setMsg(txt, isErr) {
    if (!msgBox) return;
    msgBox.style.display = 'block';
    msgBox.innerHTML = txt;
    msgBox.style.color = isErr ? 'var(--danger)' : 'var(--ok)';
    msgBox.style.background = isErr ? 'var(--danger-bg)' : 'var(--ok-bg)';
    msgBox.style.borderColor = isErr ? 'var(--danger-border)' : 'var(--ok-border)';
  }

  if (insertBtn) {
    insertBtn.addEventListener('click', function() {
      var val = parseInt(valInput.value, 10);
      var idx = parseInt(idxInput.value, 10);
      if (isNaN(val)) {
        setMsg('Please enter a valid numeric value to insert.', true);
        return;
      }
      var targetIdx = isNaN(idx) ? arr.length : Math.max(0, Math.min(idx, arr.length));
      arr.splice(targetIdx, 0, val);
      highlighted = [targetIdx];
      setMsg('Appended <code>' + val + '</code> at index <code>[' + targetIdx + ']</code>. In Go: <code>s = append(s[:' + targetIdx + '], append([]int{' + val + '}, s[' + targetIdx + ':]...)...)</code>');
      valInput.value = '';
      idxInput.value = '';
      render();
      setTimeout(function() { highlighted = []; render(); }, 1400);
    });
  }

  if (deleteBtn) {
    deleteBtn.addEventListener('click', function() {
      var idx = parseInt(idxInput.value, 10);
      if (isNaN(idx) || idx < 0 || idx >= arr.length) {
        setMsg('Please enter a valid index between 0 and ' + (arr.length - 1) + ' to delete.', true);
        return;
      }
      var removed = arr.splice(idx, 1)[0];
      highlighted = [];
      setMsg('Deleted <code>' + removed + '</code> from index <code>[' + idx + ']</code>. In Go: <code>s = append(s[:' + idx + '], s[' + (idx + 1) + ':]...)</code>');
      idxInput.value = '';
      render();
    });
  }

  if (searchBtn) {
    searchBtn.addEventListener('click', function() {
      var val = parseInt(valInput.value, 10);
      if (isNaN(val)) {
        setMsg('Please enter a valid numeric value to search.', true);
        return;
      }
      var foundIdx = arr.indexOf(val);
      if (foundIdx === -1) {
        highlighted = [];
        setMsg('Value <code>' + val + '</code> not found in array (linear scan O(n)).', true);
      } else {
        highlighted = [foundIdx];
        setMsg('Found <code>' + val + '</code> at index <code>[' + foundIdx + ']</code> in memory address <code>0x' + (baseAddr + foundIdx * elemSize).toString(16).toUpperCase() + '</code>!');
        setTimeout(function() { highlighted = []; render(); }, 2000);
      }
      render();
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', function() {
      arr = [10, 20, 30, 40, 50];
      highlighted = [];
      valInput.value = '';
      idxInput.value = '';
      if (msgBox) msgBox.style.display = 'none';
      if (formulaBox) formulaBox.style.display = 'none';
      render();
    });
  }

  render();
}

/* ---------- 2. Binary Search Algorithm Stepper (Day 13) ---------- */
function initBinarySearchViz(root) {
  var data = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91];
  var target = 23;
  var step = 0;
  var playing = false;
  var timer = null;

  var steps = [
    {
      low: 0, high: 9, mid: 4,
      desc: 'Initial state: Search range is entire slice [0..9]. Compute <code>mid = 0 + (9-0)/2 = 4</code> (value: <strong>16</strong>). Since <code>16 &lt; 23</code>, target must lie in the right half. Set <code>low = mid + 1 = 5</code>.',
      eliminated: [0, 1, 2, 3, 4]
    },
    {
      low: 5, high: 9, mid: 7,
      desc: 'Range narrowed to [5..9]. Compute <code>mid = 5 + (9-5)/2 = 7</code> (value: <strong>56</strong>). Since <code>56 &gt; 23</code>, target must lie in the left half. Set <code>high = mid - 1 = 6</code>.',
      eliminated: [0, 1, 2, 3, 4, 7, 8, 9]
    },
    {
      low: 5, high: 6, mid: 5,
      desc: 'Range narrowed to [5..6]. Compute <code>mid = 5 + (6-5)/2 = 5</code> (value: <strong>23</strong>). Check: <code>data[5] == 23</code> &mdash; <strong>TARGET FOUND!</strong>',
      eliminated: [0, 1, 2, 3, 4, 6, 7, 8, 9],
      found: 5
    },
    {
      low: 5, high: 5, mid: 5,
      desc: 'Search complete in only <strong>3 comparisons</strong> instead of 10 linear checks! Binary Search complexity: <strong>O(log n)</strong> time, <strong>O(1)</strong> auxiliary space.',
      eliminated: [0, 1, 2, 3, 4, 6, 7, 8, 9],
      found: 5
    }
  ];

  var container = root.querySelector('[data-role="bs-cells"]');
  var descEl = root.querySelector('[data-role="bs-desc"]');
  var counter = root.querySelector('.viz-step-counter');
  var bar = root.querySelector('.viz-progress-bar');
  var prevBtn = root.querySelector('.btn-step-prev');
  var nextBtn = root.querySelector('.btn-step-next');
  var playBtn = root.querySelector('.btn-step-play');
  var resetBtn = root.querySelector('.btn-step-reset');
  var dots = root.querySelectorAll('.step-dot');

  function render() {
    var cur = steps[step];
    if (descEl) descEl.innerHTML = cur.desc;
    if (counter) counter.textContent = 'Step ' + (step + 1) + ' of ' + steps.length;
    if (bar) bar.style.width = (((step + 1) / steps.length) * 100) + '%';
    if (prevBtn) prevBtn.disabled = step === 0;
    if (nextBtn) nextBtn.textContent = step >= steps.length - 1 ? 'Restart ↺' : 'Next ▶';

    dots.forEach(function(d, i) {
      d.classList.toggle('active', i === step);
    });

    if (!container) return;
    container.innerHTML = '';

    data.forEach(function(val, i) {
      var isLow = cur.low === i;
      var isHigh = cur.high === i;
      var isMid = cur.mid === i;
      var isEliminated = cur.eliminated && cur.eliminated.indexOf(i) !== -1;
      var isFound = cur.found === i;

      var col = document.createElement('div');
      col.style.display = 'flex';
      col.style.flexDirection = 'column';
      col.style.alignItems = 'center';
      col.style.gap = '3px';
      col.style.minWidth = '42px';

      // Pointer tag above
      var ptrTag = document.createElement('div');
      ptrTag.style.minHeight = '20px';
      ptrTag.style.display = 'flex';
      ptrTag.style.gap = '2px';

      if (isMid) ptrTag.innerHTML += '<span class="stepper-pointer ptr-mid">MID</span>';
      else if (isLow && isHigh) ptrTag.innerHTML += '<span class="stepper-pointer ptr-low">L=H</span>';
      else if (isLow) ptrTag.innerHTML += '<span class="stepper-pointer ptr-low">LOW</span>';
      else if (isHigh) ptrTag.innerHTML += '<span class="stepper-pointer ptr-high">HIGH</span>';

      col.appendChild(ptrTag);

      // Cell
      var cell = document.createElement('div');
      cell.className = 'array-cell';
      cell.textContent = val;
      cell.style.width = '44px';
      cell.style.height = '44px';
      cell.style.fontSize = '14px';

      if (isFound) {
        cell.style.borderColor = 'var(--ok)';
        cell.style.background = 'var(--ok-bg)';
        cell.style.color = 'var(--ok)';
        cell.style.transform = 'scale(1.15)';
        cell.style.boxShadow = '0 0 16px rgba(16, 185, 129, 0.4)';
      } else if (isMid) {
        cell.style.borderColor = 'var(--warn)';
        cell.style.background = 'var(--warn-bg)';
        cell.style.color = 'var(--warn)';
      } else if (isEliminated) {
        cell.style.opacity = '0.3';
        cell.style.borderColor = 'var(--border)';
      }

      col.appendChild(cell);

      var idx = document.createElement('span');
      idx.style.fontSize = '10px';
      idx.style.fontFamily = 'var(--font-mono)';
      idx.style.color = 'var(--text-muted)';
      idx.textContent = '[' + i + ']';
      col.appendChild(idx);

      container.appendChild(col);
    });
  }

  function stopPlay() {
    playing = false;
    if (timer) clearTimeout(timer);
    if (playBtn) playBtn.textContent = 'Auto ▶';
  }

  function togglePlay() {
    if (playing) {
      stopPlay();
    } else {
      playing = true;
      if (playBtn) playBtn.textContent = 'Pause ❚❚';
      if (step >= steps.length - 1) step = 0;
      render();
      advance();
    }
  }

  function advance() {
    if (!playing) return;
    timer = setTimeout(function() {
      if (!playing) return;
      if (step < steps.length - 1) {
        step++;
        render();
        advance();
      } else {
        stopPlay();
      }
    }, 1400);
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', function() {
      stopPlay();
      step = Math.max(0, step - 1);
      render();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', function() {
      stopPlay();
      step = step >= steps.length - 1 ? 0 : step + 1;
      render();
    });
  }

  if (playBtn) playBtn.addEventListener('click', togglePlay);

  if (resetBtn) {
    resetBtn.addEventListener('click', function() {
      stopPlay();
      step = 0;
      render();
    });
  }

  dots.forEach(function(dot, idx) {
    dot.addEventListener('click', function() {
      stopPlay();
      step = idx;
      render();
    });
  });

  render();
}

/* ---------- 3. Interactive Stack & Queue Engine (Day 4) ---------- */
function initStackQueueViz(root) {
  var stack = [10, 20, 30];
  var queue = [10, 20, 30];

  var stackContainer = root.querySelector('[data-role="stack-items"]');
  var queueContainer = root.querySelector('[data-role="queue-items"]');
  var stackInput = root.querySelector('[data-role="stack-val"]');
  var queueInput = root.querySelector('[data-role="queue-val"]');
  var pushBtn = root.querySelector('[data-role="btn-push"]');
  var popBtn = root.querySelector('[data-role="btn-pop"]');
  var enqBtn = root.querySelector('[data-role="btn-enq"]');
  var deqBtn = root.querySelector('[data-role="btn-deq"]');
  var stackMsg = root.querySelector('[data-role="stack-msg"]');
  var queueMsg = root.querySelector('[data-role="queue-msg"]');

  function renderStack() {
    if (!stackContainer) return;
    stackContainer.innerHTML = '';
    if (stack.length === 0) {
      stackContainer.innerHTML = '<div style="color:var(--text-muted); font-size:12px; font-family:var(--font-mono); text-align:center; padding:1.5rem 0;">(stack is empty)</div>';
      return;
    }
    stack.slice().reverse().forEach(function(val, revIdx) {
      var isTop = revIdx === 0;
      var item = document.createElement('div');
      item.style.padding = '0.55rem 1rem';
      item.style.border = '2px solid ' + (isTop ? 'var(--accent)' : 'var(--border-interactive)');
      item.style.borderRadius = '6px';
      item.style.background = isTop ? 'var(--accent-bg)' : 'var(--bg)';
      item.style.fontFamily = 'var(--font-mono)';
      item.style.fontWeight = '700';
      item.style.fontSize = '14px';
      item.style.display = 'flex';
      item.style.justifyContent = 'space-between';
      item.style.alignItems = 'center';

      item.innerHTML = '<span>' + val + '</span>' + (isTop ? '<span style="font-size:10px; color:var(--accent); font-weight:800;">&larr; TOP</span>' : '');
      stackContainer.appendChild(item);
    });
  }

  function renderQueue() {
    if (!queueContainer) return;
    queueContainer.innerHTML = '';
    if (queue.length === 0) {
      queueContainer.innerHTML = '<div style="color:var(--text-muted); font-size:12px; font-family:var(--font-mono); text-align:center; padding:1.5rem 0;">(queue is empty)</div>';
      return;
    }
    queue.forEach(function(val, idx) {
      var isFront = idx === 0;
      var isBack = idx === queue.length - 1;
      var item = document.createElement('div');
      item.style.width = '48px';
      item.style.height = '48px';
      item.style.border = '2px solid ' + (isFront ? 'var(--ok)' : isBack ? 'var(--warn)' : 'var(--border-interactive)');
      item.style.borderRadius = '6px';
      item.style.background = isFront ? 'var(--ok-bg)' : isBack ? 'var(--warn-bg)' : 'var(--bg)';
      item.style.fontFamily = 'var(--font-mono)';
      item.style.fontWeight = '700';
      item.style.fontSize = '14px';
      item.style.display = 'flex';
      item.style.flexDirection = 'column';
      item.style.alignItems = 'center';
      item.style.justifyContent = 'center';

      item.innerHTML = '<span>' + val + '</span><span style="font-size:8px; font-weight:700;">' + (isFront ? 'HEAD' : isBack ? 'TAIL' : '') + '</span>';
      queueContainer.appendChild(item);
    });
  }

  if (pushBtn) {
    pushBtn.addEventListener('click', function() {
      var val = parseInt(stackInput.value, 10);
      if (isNaN(val)) val = Math.floor(Math.random() * 90 + 10);
      stack.push(val);
      if (stackMsg) stackMsg.innerHTML = 'Pushed <code>' + val + '</code> &rarr; <code>s = append(s, ' + val + ')</code> (O(1) amortized)';
      stackInput.value = '';
      renderStack();
    });
  }

  if (popBtn) {
    popBtn.addEventListener('click', function() {
      if (stack.length === 0) {
        if (stackMsg) stackMsg.innerHTML = '<span style="color:var(--danger)">Stack underflow: cannot pop from empty stack.</span>';
        return;
      }
      var val = stack.pop();
      if (stackMsg) stackMsg.innerHTML = 'Popped <code>' + val + '</code> &rarr; <code>top := s[len(s)-1]; s = s[:len(s)-1]</code> (O(1))';
      renderStack();
    });
  }

  if (enqBtn) {
    enqBtn.addEventListener('click', function() {
      var val = parseInt(queueInput.value, 10);
      if (isNaN(val)) val = Math.floor(Math.random() * 90 + 10);
      queue.push(val);
      if (queueMsg) queueMsg.innerHTML = 'Enqueued <code>' + val + '</code> at back &rarr; <code>q = append(q, ' + val + ')</code>';
      queueInput.value = '';
      renderQueue();
    });
  }

  if (deqBtn) {
    deqBtn.addEventListener('click', function() {
      if (queue.length === 0) {
        if (queueMsg) queueMsg.innerHTML = '<span style="color:var(--danger)">Queue underflow: queue is empty.</span>';
        return;
      }
      var val = queue.shift();
      if (queueMsg) queueMsg.innerHTML = 'Dequeued <code>' + val + '</code> from head &rarr; <code>front := q[0]; q = q[1:]</code>';
      renderQueue();
    });
  }

  renderStack();
  renderQueue();
}

/* ---------- 4. Phase Filter for the 30-Day Grid ---------- */
function initDSAPhaseFilter() {
  var filterButtons = document.querySelectorAll('.dsa-phase-btn');
  var cards = document.querySelectorAll('.dsa-card');
  var searchInput = document.querySelector('#dsa-search-input');
  var counterEl = document.querySelector('#dsa-visible-count');

  function filterCards() {
    var activeBtn = document.querySelector('.dsa-phase-btn.active');
    var selectedPhase = activeBtn ? activeBtn.getAttribute('data-phase') : 'all';
    var query = searchInput ? searchInput.value.trim().toLowerCase() : '';

    var visible = 0;
    cards.forEach(function(card) {
      var phase = card.getAttribute('data-phase');
      var text = card.textContent.toLowerCase();

      var matchesPhase = selectedPhase === 'all' || phase === selectedPhase;
      var matchesQuery = query === '' || text.indexOf(query) !== -1;

      if (matchesPhase && matchesQuery) {
        card.style.display = 'flex';
        visible++;
      } else {
        card.style.display = 'none';
      }
    });

    if (counterEl) {
      counterEl.textContent = 'Showing ' + visible + ' of 30 Days';
    }
  }

  filterButtons.forEach(function(btn) {
    btn.addEventListener('click', function() {
      filterButtons.forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      filterCards();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', filterCards);
  }

  filterCards();
}

document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('[data-viz="dsa-array"]').forEach(initDSAArrayViz);
  document.querySelectorAll('[data-viz="dsa-binary-search"]').forEach(initBinarySearchViz);
  document.querySelectorAll('[data-viz="dsa-stack-queue"]').forEach(initStackQueueViz);
  initDSAPhaseFilter();
});
