/* Interactive visuals for the Core page. */

function initStructViz(root) {
  const original = root.querySelector('[data-role="original"]');
  const ghost = root.querySelector('[data-role="ghost"]');
  const btnValue = root.querySelector('[data-role="call-value"]');
  const btnPointer = root.querySelector('[data-role="call-pointer"]');
  const caption = root.querySelector('[data-role="caption"]');
  let count = 0;

  btnValue.addEventListener("click", function () {
    const previewCount = count + 1;
    ghost.textContent = "Counter{count: " + previewCount + "}";
    ghost.classList.add("changed");
    setTimeout(function () {
      ghost.classList.remove("changed");
      ghost.textContent = "Counter{count: " + count + "}";
    }, 900);
    caption.innerHTML =
      "<code>IncByValue()</code> got its own <strong>copy</strong> of the struct. " +
      "The copy changed, but the original is untouched.";
  });

  btnPointer.addEventListener("click", function () {
    count++;
    original.textContent = "Counter{count: " + count + "}";
    original.classList.add("changed");
    setTimeout(function () { original.classList.remove("changed"); }, 900);
    caption.innerHTML =
      "<code>IncByPointer()</code> operated on the <strong>original</strong> struct through its address. The change sticks.";
  });
}

function initSliceViz(root) {
  const cells = [...root.querySelectorAll(".array-cell")];
  const btn = root.querySelector('[data-role="mutate"]');
  const caption = root.querySelector('[data-role="caption"]');
  let mutated = false;

  function render() {
    cells[0].textContent = mutated ? "99" : "1";
    cells.forEach(function (c, i) { c.classList.toggle("touched", mutated && i === 0); });
    btn.disabled = mutated;
    caption.innerHTML = mutated
      ? "<code>b[0] = 99</code> changed the shared backing array &mdash; so <code>a[0]</code> changed too, even though we never touched <code>a</code> directly."
      : "<code>a := []int{1, 2, 3}</code>, then <code>b := a[:2]</code>. Both slices point into the <em>same</em> backing array.";
  }

  btn.addEventListener("click", function () {
    mutated = true;
    render();
  });
  render();
}

function initNilIfaceViz(root) {
  const typeBox = root.querySelector('[data-role="type-box"]');
  const valueBox = root.querySelector('[data-role="value-box"]');
  const result = root.querySelector('[data-role="result"]');
  const btn = root.querySelector('[data-role="run"]');
  const caption = root.querySelector('[data-role="caption"]');

  btn.addEventListener("click", function () {
    typeBox.classList.add("set");
    typeBox.textContent = "*MyError";
    valueBox.textContent = "nil";
    result.textContent = "err == nil: false";
    caption.innerHTML =
      "The interface has a concrete <strong>type</strong> (<code>*MyError</code>) even though its " +
      "<strong>value</strong> is nil. Both the type and the value must be unset for the interface " +
      "itself to equal nil &mdash; so it doesn't.";
  });
}

document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll('[data-viz="struct-receiver"]').forEach(initStructViz);
  document.querySelectorAll('[data-viz="slice-header"]').forEach(initSliceViz);
  document.querySelectorAll('[data-viz="interface-nil"]').forEach(initNilIfaceViz);
});
