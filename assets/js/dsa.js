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

/* ---------- 5. Interactive Linked List Visualizer (Day 3) ---------- */
function initDSALinkedList(root) {
  var list = [10, 20, 30, 40];
  var highlighted = -1;
  var isNew = -1;

  var container = root.querySelector('[data-role="ll-container"]');
  var msgBox = root.querySelector('[data-role="ll-msg"]');
  var valInput = root.querySelector('[data-role="ll-input"]');
  var btnInsertFront = root.querySelector('[data-role="btn-ll-insert-front"]');
  var btnInsertEnd = root.querySelector('[data-role="btn-ll-insert-end"]');
  var btnDeleteFront = root.querySelector('[data-role="btn-ll-delete-front"]');
  var btnReverse = root.querySelector('[data-role="btn-ll-reverse"]');
  var btnReset = root.querySelector('[data-role="btn-ll-reset"]');

  function flash(msg, isErr) {
    if (!msgBox) return;
    msgBox.style.display = 'block';
    msgBox.innerHTML = msg;
    msgBox.style.color = isErr ? 'var(--danger)' : 'var(--ok)';
  }

  function render() {
    if (!container) return;
    container.innerHTML = '';

    // Head indicator
    var headWrap = document.createElement('div');
    headWrap.className = 'll-head-indicator';
    headWrap.innerHTML = '<span>HEAD</span><span style="font-size:1.1rem;">&darr;</span>';
    container.appendChild(headWrap);

    list.forEach(function(val, idx) {
      var isLast = idx === list.length - 1;
      var nodeBox = document.createElement('div');
      nodeBox.className = 'll-node-box' + (idx === highlighted ? ' highlight' : '') + (idx === isNew ? ' new-node' : '');

      var dataField = document.createElement('div');
      dataField.className = 'll-data-field';
      dataField.textContent = val;

      var nextField = document.createElement('div');
      nextField.className = 'll-next-field';
      nextField.textContent = isLast ? 'nil' : '&bull;';

      nodeBox.appendChild(dataField);
      nodeBox.appendChild(nextField);
      container.appendChild(nodeBox);

      // Arrow
      var arrow = document.createElement('div');
      arrow.className = 'll-arrow';
      arrow.innerHTML = '&rarr;';
      container.appendChild(arrow);
    });

    var nullBadge = document.createElement('div');
    nullBadge.className = 'll-null-badge';
    nullBadge.textContent = 'nil (0x0)';
    container.appendChild(nullBadge);
  }

  if (btnInsertFront) {
    btnInsertFront.addEventListener('click', function() {
      var val = parseInt(valInput ? valInput.value : '5', 10);
      if (isNaN(val)) val = Math.floor(Math.random() * 90) + 10;
      list.unshift(val);
      isNew = 0;
      flash('✓ Inserted <code>' + val + '</code> at front in <strong>O(1)</strong>! In Go: <code>newNode.Next = head; head = newNode</code>');
      render();
      setTimeout(function() { isNew = -1; render(); }, 1200);
    });
  }

  if (btnInsertEnd) {
    btnInsertEnd.addEventListener('click', function() {
      var val = parseInt(valInput ? valInput.value : '50', 10);
      if (isNaN(val)) val = Math.floor(Math.random() * 90) + 10;
      list.push(val);
      isNew = list.length - 1;
      flash('✓ Inserted <code>' + val + '</code> at tail in <strong>O(n)</strong> (or O(1) with tail pointer).');
      render();
      setTimeout(function() { isNew = -1; render(); }, 1200);
    });
  }

  if (btnDeleteFront) {
    btnDeleteFront.addEventListener('click', function() {
      if (list.length === 0) { flash('List is empty!', true); return; }
      var removed = list.shift();
      flash('✓ Deleted head node <code>' + removed + '</code> in <strong>O(1)</strong>: <code>head = head.Next</code>');
      render();
    });
  }

  if (btnReverse) {
    btnReverse.addEventListener('click', function() {
      list.reverse();
      flash('✓ Reversed in-place in <strong>O(n)</strong> time and <strong>O(1)</strong> space using 3 pointers (prev, curr, next).');
      render();
    });
  }

  var btnSearch = root.querySelector('[data-role="btn-ll-search"]');
  var btnRandom = root.querySelector('[data-role="btn-ll-random"]');

  if (btnSearch) {
    btnSearch.addEventListener('click', function() {
      var targetVal = parseInt(valInput ? valInput.value : '30', 10);
      if (isNaN(targetVal)) targetVal = 30;
      var nodeBoxes = container.querySelectorAll('.ll-node-box');
      var step = 0;
      flash('Scanning nodes sequentially from HEAD for value ' + targetVal + '...', false);

      function scanNext() {
        if (step > 0 && step <= nodeBoxes.length) {
          nodeBoxes[step - 1].classList.remove('scanning');
        }
        if (step < list.length) {
          nodeBoxes[step].classList.add('scanning');
          if (list[step] === targetVal) {
            nodeBoxes[step].classList.remove('scanning');
            nodeBoxes[step].classList.add('highlight');
            flash('✓ Found value <code>' + targetVal + '</code> at index [' + step + '] in ' + (step + 1) + ' pointer hops — O(n) sequential access!', false);
            setTimeout(function() { nodeBoxes[step].classList.remove('highlight'); }, 2200);
            return;
          }
          step++;
          setTimeout(scanNext, 450);
        } else {
          flash('✗ Value <code>' + targetVal + '</code> not found after traversing entire list to nil (0x0).', true);
        }
      }
      scanNext();
    });
  }

  if (btnRandom) {
    btnRandom.addEventListener('click', function() {
      list = Array.from({ length: 4 }, function() { return Math.floor(Math.random() * 89) + 10; });
      highlighted = -1;
      isNew = -1;
      flash('Generated randomized linked list with 4 nodes.', false);
      render();
    });
  }

  if (btnReset) {
    btnReset.addEventListener('click', function() {
      list = [10, 20, 30, 40];
      highlighted = -1;
      isNew = -1;
      if (msgBox) msgBox.style.display = 'none';
      render();
    });
  }

  render();
}

/* ---------- 6. Interactive Binary Tree Visualizer (Day 6) ---------- */
function initDSABinaryTree(root) {
  var msgBox = root.querySelector('[data-role="tree-msg"]');
  var svgEl = root.querySelector('svg.tree-svg');
  var btnInorder = root.querySelector('[data-role="btn-tree-inorder"]');
  var btnPreorder = root.querySelector('[data-role="btn-tree-preorder"]');
  var btnPostorder = root.querySelector('[data-role="btn-tree-postorder"]');
  var btnSearch = root.querySelector('[data-role="btn-tree-search"]');
  var btnReset = root.querySelector('[data-role="btn-tree-reset"]');

  function clearHighlight() {
    if (!svgEl) return;
    svgEl.querySelectorAll('.tree-node-circle').forEach(function(c) {
      c.classList.remove('active');
    });
    svgEl.querySelectorAll('.tree-edge-line, .tree-curve-line').forEach(function(l) {
      l.classList.remove('active');
    });
  }

  function highlightSequence(seq, label) {
    clearHighlight();
    if (msgBox) {
      msgBox.style.display = 'block';
      msgBox.innerHTML = '<strong>' + label + ':</strong> ';
    }
    seq.forEach(function(val, step) {
      setTimeout(function() {
        var circle = svgEl.querySelector('[data-node="' + val + '"]');
        if (circle) circle.classList.add('active');
        if (msgBox) {
          msgBox.innerHTML += '<span class="badge-difficulty badge-easy" style="margin-right:4px;">' + val + '</span> ';
        }
      }, step * 380);
    });
  }

  if (btnInorder) {
    btnInorder.addEventListener('click', function() {
      highlightSequence([20, 30, 40, 50, 60, 70, 80], 'In-Order Traversal (Sorted: Left → Root → Right)');
    });
  }

  if (btnPreorder) {
    btnPreorder.addEventListener('click', function() {
      highlightSequence([50, 30, 20, 40, 70, 60, 80], 'Pre-Order Traversal (Root → Left → Right)');
    });
  }

  if (btnPostorder) {
    btnPostorder.addEventListener('click', function() {
      highlightSequence([20, 40, 30, 60, 80, 70, 50], 'Post-Order Traversal (Left → Right → Root)');
    });
  }

  if (btnSearch) {
    btnSearch.addEventListener('click', function() {
      clearHighlight();
      var path = [50, 30, 40]; // Binary search path to 40
      if (msgBox) {
        msgBox.style.display = 'block';
        msgBox.innerHTML = '<strong>BST Search for 40:</strong> ';
      }
      path.forEach(function(val, step) {
        setTimeout(function() {
          var circle = svgEl.querySelector('[data-node="' + val + '"]');
          if (circle) circle.classList.add('active');
          if (msgBox) {
            var isEnd = step === path.length - 1;
            msgBox.innerHTML += '<span class="badge-difficulty ' + (isEnd ? 'badge-medium' : 'badge-easy') + '" style="margin-right:4px;">' + val + (isEnd ? ' (Found!)' : ' &rarr;') + '</span> ';
          }
        }, step * 480);
      });
    });
  }

  if (btnReset) {
    btnReset.addEventListener('click', function() {
      clearHighlight();
      if (msgBox) msgBox.style.display = 'none';
    });
  }
}

/* ---------- 7. Interactive Hash Table Visualizer (Day 8) ---------- */
function initDSAHashTable(root) {
  var buckets = [
    [{ k: "apple", v: 5 }, { k: "avocado", v: 8 }],
    [{ k: "banana", v: 3 }],
    [],
    [{ k: "cherry", v: 7 }]
  ];

  var container = root.querySelector('[data-role="ht-container"]');
  var msgBox = root.querySelector('[data-role="ht-msg"]');
  var keyInput = root.querySelector('[data-role="ht-key-input"]');
  var btnInsert = root.querySelector('[data-role="btn-ht-insert"]');
  var btnSearch = root.querySelector('[data-role="btn-ht-search"]');
  var btnReset = root.querySelector('[data-role="btn-ht-reset"]');

  function hashFn(str) {
    var h = 0;
    for (var i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
    return h % 4;
  }

  function render(highBucket) {
    if (!container) return;
    container.innerHTML = '';

    buckets.forEach(function(chain, bIdx) {
      var row = document.createElement('div');
      row.className = 'ht-row';

      var slot = document.createElement('div');
      slot.className = 'ht-slot';
      if (bIdx === highBucket) slot.style.borderColor = 'var(--ok)';
      slot.textContent = 'Bucket [' + bIdx + ']';

      var arrow = document.createElement('div');
      arrow.className = 'ht-slot-arrow';
      arrow.innerHTML = '&rarr;';

      var chainItems = document.createElement('div');
      chainItems.className = 'ht-chain-items';

      if (chain.length === 0) {
        var empty = document.createElement('span');
        empty.style.color = 'var(--text-muted)';
        empty.style.fontFamily = 'var(--font-mono)';
        empty.style.fontSize = '0.8rem';
        empty.textContent = 'nil (empty)';
        chainItems.appendChild(empty);
      } else {
        chain.forEach(function(item) {
          var badge = document.createElement('span');
          badge.className = 'ht-entry-badge';
          badge.innerHTML = '<span class="ht-entry-key">"' + item.k + '"</span>:<span class="ht-entry-val">' + item.v + '</span>';
          chainItems.appendChild(badge);
        });
      }

      row.appendChild(slot);
      row.appendChild(arrow);
      row.appendChild(chainItems);
      container.appendChild(row);
    });
  }

  if (btnInsert) {
    btnInsert.addEventListener('click', function() {
      var k = keyInput ? keyInput.value.trim() : '';
      if (!k) k = 'fruit_' + Math.floor(Math.random() * 50);
      var b = hashFn(k);
      buckets[b].push({ k: k, v: Math.floor(Math.random() * 20) + 1 });
      render(b);
      if (msgBox) {
        msgBox.style.display = 'block';
        msgBox.innerHTML = '✓ Computed <code>hash("' + k + '") % 4 = ' + b + '</code>. Chained in bucket [' + b + '] in O(1) average time!';
      }
      if (keyInput) keyInput.value = '';
    });
  }

  if (btnSearch) {
    btnSearch.addEventListener('click', function() {
      var k = keyInput ? keyInput.value.trim() : 'banana';
      var b = hashFn(k);
      render(b);
      var found = buckets[b].find(function(it) { return it.k === k; });
      if (msgBox) {
        msgBox.style.display = 'block';
        if (found) {
          msgBox.innerHTML = '✓ Found key <code>"' + k + '"</code> in bucket [' + b + ']! Value = <strong>' + found.v + '</strong> (O(1) lookup).';
          msgBox.style.color = 'var(--ok)';
        } else {
          msgBox.innerHTML = '✗ Key <code>"' + k + '"</code> hashes to bucket [' + b + '] but was not found in chain.';
          msgBox.style.color = 'var(--danger)';
        }
      }
    });
  }

  if (btnReset) {
    btnReset.addEventListener('click', function() {
      buckets = [
        [{ k: "apple", v: 5 }, { k: "avocado", v: 8 }],
        [{ k: "banana", v: 3 }],
        [],
        [{ k: "cherry", v: 7 }]
      ];
      render(-1);
      if (msgBox) msgBox.style.display = 'none';
    });
  }

  render(-1);
}

/* ---------- 8. Interactive Sorting Bars Visualizer (Day 11) ---------- */
function initDSASortingBars(root) {
  var orig = [45, 18, 72, 34, 90, 23, 61];
  var arr = orig.slice();
  var i = 0, j = 0;
  var maxVal = 95;
  var timer = null;
  var comparisons = 0;
  var swaps = 0;

  var container = root.querySelector('[data-role="sort-container"]');
  var msgBox = root.querySelector('[data-role="sort-msg"]');
  var btnStep = root.querySelector('[data-role="btn-sort-step"]');
  var btnPlay = root.querySelector('[data-role="btn-sort-play"]');
  var btnShuffle = root.querySelector('[data-role="btn-sort-shuffle"]');
  var btnReset = root.querySelector('[data-role="btn-sort-reset"]');
  var statComps = root.querySelector('[data-role="sort-stat-comps"]');
  var statSwaps = root.querySelector('[data-role="sort-stat-swaps"]');

  function updateStats() {
    if (statComps) statComps.textContent = comparisons;
    if (statSwaps) statSwaps.textContent = swaps;
  }

  function render(compA, compB, swapped, isDone) {
    if (!container) return;
    container.innerHTML = '';

    arr.forEach(function(val, idx) {
      var col = document.createElement('div');
      col.className = 'sort-bar-col';

      var num = document.createElement('div');
      num.className = 'sort-bar-num';
      num.textContent = val;

      var bar = document.createElement('div');
      bar.className = 'sort-bar';
      bar.style.height = Math.max(12, (val / maxVal) * 140) + 'px';

      if (isDone) {
        bar.className += ' sorted';
      } else if (idx === compA || idx === compB) {
        bar.className += swapped ? ' swapped' : ' comparing';
      }

      var idxLabel = document.createElement('div');
      idxLabel.className = 'sort-bar-idx';
      idxLabel.textContent = '[' + idx + ']';

      col.appendChild(num);
      col.appendChild(bar);
      col.appendChild(idxLabel);
      container.appendChild(col);
    });
    updateStats();
  }

  function stepSort() {
    if (i < arr.length - 1) {
      if (j < arr.length - 1 - i) {
        var a = j, b = j + 1;
        var didSwap = false;
        comparisons++;
        if (arr[a] > arr[b]) {
          var tmp = arr[a];
          arr[a] = arr[b];
          arr[b] = tmp;
          didSwap = true;
          swaps++;
        }
        render(a, b, didSwap, false);
        if (msgBox) {
          msgBox.style.display = 'block';
          msgBox.innerHTML = didSwap ?
            'Comparing [' + a + '] and [' + b + ']: <strong>Swapped</strong> ' + arr[b] + ' and ' + arr[a] + '!' :
            'Comparing [' + a + '] and [' + b + ']: In correct order, no swap needed.';
        }
        j++;
        return true;
      } else {
        j = 0;
        i++;
        render(-1, -1, false, false);
        return true;
      }
    } else {
      render(-1, -1, false, true);
      if (msgBox) {
        msgBox.style.display = 'block';
        msgBox.innerHTML = '🎉 <strong>Sorting Complete!</strong> Fully sorted with ' + comparisons + ' comparisons and ' + swaps + ' swaps.';
        msgBox.style.color = 'var(--ok)';
      }
      if (timer) {
        clearInterval(timer);
        timer = null;
        if (btnPlay) btnPlay.textContent = 'Auto Play ▶';
      }
      return false;
    }
  }

  if (btnStep) {
    btnStep.addEventListener('click', function() {
      stepSort();
    });
  }

  if (btnPlay) {
    btnPlay.addEventListener('click', function() {
      if (timer) {
        clearInterval(timer);
        timer = null;
        btnPlay.textContent = 'Auto Play ▶';
      } else {
        btnPlay.textContent = 'Pause ⏸';
        timer = setInterval(function() {
          var keepGoing = stepSort();
          if (!keepGoing) {
            clearInterval(timer);
            timer = null;
            btnPlay.textContent = 'Auto Play ▶';
          }
        }, 220);
      }
    });
  }

  if (btnShuffle) {
    btnShuffle.addEventListener('click', function() {
      if (timer) { clearInterval(timer); timer = null; if (btnPlay) btnPlay.textContent = 'Auto Play ▶'; }
      arr = Array.from({ length: 7 }, function() { return Math.floor(Math.random() * 80) + 15; });
      orig = arr.slice();
      i = 0; j = 0; comparisons = 0; swaps = 0;
      render(-1, -1, false, false);
      if (msgBox) {
        msgBox.style.display = 'block';
        msgBox.innerHTML = 'Generated fresh random array. Click Step or Auto Play to sort.';
        msgBox.style.color = 'var(--text)';
      }
    });
  }

  if (btnReset) {
    btnReset.addEventListener('click', function() {
      if (timer) { clearInterval(timer); timer = null; if (btnPlay) btnPlay.textContent = 'Auto Play ▶'; }
      arr = orig.slice();
      i = 0; j = 0; comparisons = 0; swaps = 0;
      render(-1, -1, false, false);
      if (msgBox) msgBox.style.display = 'none';
    });
  }

  render(-1, -1, false, false);
}

/* ---------- 9. Interactive Sliding Window Visualizer (Day 24) ---------- */
function initDSASlidingWindow(root) {
  var s = ["a", "b", "c", "a", "b", "c", "b", "b"];
  var left = 0, right = 2;
  var maxLen = 3;

  var container = root.querySelector('[data-role="sw-container"]');
  var msgBox = root.querySelector('[data-role="sw-msg"]');
  var btnExpand = root.querySelector('[data-role="btn-sw-expand"]');
  var btnShrink = root.querySelector('[data-role="btn-sw-shrink"]');
  var btnWalkthrough = root.querySelector('[data-role="btn-sw-walkthrough"]');
  var btnReset = root.querySelector('[data-role="btn-sw-reset"]');

  function render() {
    if (!container) return;
    container.innerHTML = '';

    s.forEach(function(char, idx) {
      var item = document.createElement('div');
      var inWin = idx >= left && idx <= right;
      item.className = 'sw-item' + (inWin ? ' in-window' : '');
      item.textContent = char;

      if (idx === left) {
        var lTag = document.createElement('span');
        lTag.className = 'sw-pointer-tag ptr-left';
        lTag.textContent = 'L';
        item.appendChild(lTag);
      }
      if (idx === right) {
        var rTag = document.createElement('span');
        rTag.className = 'sw-pointer-tag ptr-right';
        rTag.textContent = 'R';
        item.appendChild(rTag);
      }

      container.appendChild(item);
    });

    if (msgBox) {
      var sub = s.slice(left, right + 1).join('');
      var len = right - left + 1;
      maxLen = Math.max(maxLen, len);
      msgBox.innerHTML =
        'Window Substring: <code>"' + sub + '"</code> &bull; Current Size: <strong>' + len + '</strong> &bull; Range: <code>[' + left + '..' + right + ']</code> &bull; Max Unique Size: <strong>' + maxLen + '</strong>';
    }
  }

  if (btnExpand) {
    btnExpand.addEventListener('click', function() {
      if (right < s.length - 1) {
        right++;
        render();
      }
    });
  }

  if (btnShrink) {
    btnShrink.addEventListener('click', function() {
      if (left < right) {
        left++;
        render();
      }
    });
  }

  if (btnWalkthrough) {
    btnWalkthrough.addEventListener('click', function() {
      // Step-by-step longest substring simulation
      var steps = [
        { l: 0, r: 0 },
        { l: 0, r: 1 },
        { l: 0, r: 2 }, // "abc"
        { l: 1, r: 3 }, // duplicate 'a', shrink left to 1, expand to 3
        { l: 2, r: 4 }, // "bca"
        { l: 3, r: 5 }  // "cab"
      ];
      var stepIdx = 0;
      var walkTimer = setInterval(function() {
        if (stepIdx < steps.length) {
          left = steps[stepIdx].l;
          right = steps[stepIdx].r;
          render();
          stepIdx++;
        } else {
          clearInterval(walkTimer);
        }
      }, 600);
    });
  }

  if (btnReset) {
    btnReset.addEventListener('click', function() {
      left = 0; right = 2; maxLen = 3;
      render();
    });
  }

  render();
}

/* ---------- 10. Interactive Two Pointers Visualizer (Day 25) ---------- */
function initDSATwoPointers(root) {
  var nums = [2, 7, 11, 15, 18, 22];
  var target = 25;
  var l = 0, r = nums.length - 1;
  var found = false;

  var container = root.querySelector('[data-role="tp-container"]');
  var msgBox = root.querySelector('[data-role="tp-msg"]');
  var btnStep = root.querySelector('[data-role="btn-tp-step"]');
  var btnReset = root.querySelector('[data-role="btn-tp-reset"]');

  function render() {
    if (!container) return;
    container.innerHTML = '';

    nums.forEach(function(val, idx) {
      var item = document.createElement('div');
      item.className = 'sw-item';
      item.textContent = val;

      if (idx === l) {
        item.classList.add('in-window');
        var lTag = document.createElement('span');
        lTag.className = 'sw-pointer-tag ptr-left';
        lTag.textContent = 'L';
        item.appendChild(lTag);
      }
      if (idx === r) {
        item.classList.add('in-window');
        var rTag = document.createElement('span');
        rTag.className = 'sw-pointer-tag ptr-right';
        rTag.textContent = 'R';
        item.appendChild(rTag);
      }

      container.appendChild(item);
    });

    if (msgBox) {
      var curSum = nums[l] + nums[r];
      if (found) {
        msgBox.innerHTML = '🎉 <strong>TARGET MATCH!</strong> <code>nums[' + l + '] (' + nums[l] + ') + nums[' + r + '] (' + nums[r] + ') == ' + target + '</code> in O(n) time!';
        msgBox.style.color = 'var(--ok)';
      } else {
        msgBox.innerHTML =
          'Sum = <code>nums[' + l + '] + nums[' + r + '] = ' + nums[l] + ' + ' + nums[r] + ' = ' + curSum + '</code> (Target: ' + target + '). ' +
          (curSum < target ? 'Since ' + curSum + ' &lt; ' + target + ', increment Left pointer.' : 'Since ' + curSum + ' &gt; ' + target + ', decrement Right pointer.');
        msgBox.style.color = 'var(--text)';
      }
    }
  }

  if (btnStep) {
    btnStep.addEventListener('click', function() {
      if (found || l >= r) return;
      var sum = nums[l] + nums[r];
      if (sum === target) {
        found = true;
      } else if (sum < target) {
        l++;
      } else {
        r--;
      }
      if (nums[l] + nums[r] === target) found = true;
      render();
    });
  }

  if (btnReset) {
    btnReset.addEventListener('click', function() {
      l = 0; r = nums.length - 1; found = false;
      render();
    });
  }

  render();
}

/* ---------- 11. Interactive Bit Manipulation Register (Day 28) ---------- */
function initDSABitRegister(root) {
  var bits = [0, 0, 1, 0, 1, 1, 0, 1]; // 45 decimal

  var container = root.querySelector('[data-role="bit-container"]');
  var decEl = root.querySelector('[data-role="bit-dec"]');
  var hexEl = root.querySelector('[data-role="bit-hex"]');
  var btnAnd = root.querySelector('[data-role="btn-bit-and"]');
  var btnOr = root.querySelector('[data-role="btn-bit-or"]');
  var btnXor = root.querySelector('[data-role="btn-bit-xor"]');
  var btnShl = root.querySelector('[data-role="btn-bit-shl"]');
  var btnShr = root.querySelector('[data-role="btn-bit-shr"]');
  var btnClearLsb = root.querySelector('[data-role="btn-bit-clear-lsb"]');
  var btnReset = root.querySelector('[data-role="btn-bit-reset"]');

  function toDec() {
    var val = 0;
    for (var i = 0; i < 8; i++) {
      if (bits[i]) val += Math.pow(2, 7 - i);
    }
    return val;
  }

  function render() {
    if (!container) return;
    container.innerHTML = '';

    bits.forEach(function(b, idx) {
      var box = document.createElement('div');
      box.className = 'bit-box' + (b === 1 ? ' active' : '');
      box.innerHTML = '<span class="bit-value">' + b + '</span><span class="bit-index">' + (7 - idx) + '</span>';

      box.addEventListener('click', function() {
        bits[idx] = bits[idx] === 1 ? 0 : 1;
        render();
      });

      container.appendChild(box);
    });

    var dec = toDec();
    if (decEl) decEl.textContent = dec;
    if (hexEl) hexEl.textContent = '0x' + (dec.toString(16).toUpperCase().padStart(2, '0'));
  }

  if (btnAnd) {
    btnAnd.addEventListener('click', function() {
      // AND with 0x0F (clear upper 4 bits)
      for (var i = 0; i < 4; i++) bits[i] = 0;
      render();
    });
  }

  if (btnOr) {
    btnOr.addEventListener('click', function() {
      // OR with 0x80 (set MSB)
      bits[0] = 1;
      render();
    });
  }

  if (btnXor) {
    btnXor.addEventListener('click', function() {
      // XOR with 0xFF (invert all)
      for (var i = 0; i < 8; i++) bits[i] = bits[i] === 1 ? 0 : 1;
      render();
    });
  }

  if (btnShl) {
    btnShl.addEventListener('click', function() {
      bits.shift();
      bits.push(0);
      render();
    });
  }

  if (btnShr) {
    btnShr.addEventListener('click', function() {
      bits.pop();
      bits.unshift(0);
      render();
    });
  }

  if (btnClearLsb) {
    btnClearLsb.addEventListener('click', function() {
      // Clear lowest set bit: n & (n - 1)
      var d = toDec();
      d = d & (d - 1);
      for (var i = 7; i >= 0; i--) {
        bits[i] = (d & 1);
        d = d >> 1;
      }
      render();
    });
  }

  if (btnReset) {
    btnReset.addEventListener('click', function() {
      bits = [0, 0, 1, 0, 1, 1, 0, 1];
      render();
    });
  }

  render();
}

/* ---------- 4. Phase Filter for the 30-Day Grid ---------- */
function initDSAPhaseFilter() {
  var filterButtons = document.querySelectorAll('.dsa-phase-filter .dsa-phase-btn');
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
  document.querySelectorAll('[data-viz="dsa-linked-list"]').forEach(initDSALinkedList);
  document.querySelectorAll('[data-viz="dsa-binary-tree"]').forEach(initDSABinaryTree);
  document.querySelectorAll('[data-viz="dsa-hash-table"]').forEach(initDSAHashTable);
  document.querySelectorAll('[data-viz="dsa-sorting"]').forEach(initDSASortingBars);
  document.querySelectorAll('[data-viz="dsa-sliding-window"]').forEach(initDSASlidingWindow);
  document.querySelectorAll('[data-viz="dsa-two-pointers"]').forEach(initDSATwoPointers);
  document.querySelectorAll('[data-viz="dsa-bit-register"]').forEach(initDSABitRegister);
  initDSAPhaseFilter();
});

