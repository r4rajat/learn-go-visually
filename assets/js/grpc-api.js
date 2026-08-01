/* Interactive visuals for the gRPC API page. */

function initUnaryRpcViz(root) {
  const btn = root.querySelector('[data-role="call"]');
  const clientBox = root.querySelector('[data-role="client"]');
  const serverBox = root.querySelector('[data-role="server"]');
  const caption = root.querySelector('[data-role="caption"]');

  if (!btn) return;

  btn.addEventListener('click', function () {
    btn.disabled = true;
    clientBox.style.borderColor = '';
    serverBox.style.opacity = '0.3';
    serverBox.style.borderColor = '';
    caption.textContent = 'Initiating unary RPC call...';

    setTimeout(function () {
      clientBox.style.borderColor = 'var(--gopher-cyan)';
      caption.textContent = 'Client sends CreateTodo request with binary Protocol Buffer encoding over HTTP/2...';
    }, 300);

    setTimeout(function () {
      serverBox.style.opacity = '1';
      serverBox.style.borderColor = 'var(--ok)';
      caption.innerHTML = 'Server receives the request, deserializes it, creates the todo in the database, and sends back a single Todo response. One request, one response.';
      btn.disabled = false;
    }, 900);
  });
}

function initStreamingViz(root) {
  const buttons = root.querySelectorAll('[data-stream-type]');
  const visualization = root.querySelector('[data-role="visualization"]');
  const caption = root.querySelector('[data-role="caption"]');

  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      const type = btn.getAttribute('data-stream-type');
      visualization.className = 'streaming-viz ' + type;

      const messages = {
        'server': {
          caption: 'Server Streaming: Client sends one request, server responds with a stream of messages. Perfect for large result sets or real-time updates.'
        },
        'client': {
          caption: 'Client Streaming: Client sends a stream of messages, server responds with one response. Ideal for bulk uploads or batch operations.'
        },
        'bidirectional': {
          caption: 'Bidirectional Streaming: Both client and server send streams of messages simultaneously. Great for chat, collaborative editing, or real-time sync.'
        }
      };

      const msg = messages[type];
      caption.innerHTML = msg.caption;

      buttons.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
    });
  });
}

function initProtobufViz(root) {
  const fields = root.querySelectorAll('[data-field]');
  const caption = root.querySelector('[data-role="caption"]');

  fields.forEach(function (field) {
    field.addEventListener('click', function () {
      const fieldName = field.getAttribute('data-field');

      const descriptions = {
        'id': 'Field 1: Unique identifier for the todo. In Protocol Buffers, each field has a number for binary encoding.',
        'title': 'Field 2: The todo title. Strings are variable-length in protobuf, encoded efficiently.',
        'completed': 'Field 3: Boolean flag. Booleans are 1 byte in protobuf, very efficient.',
        'created_at': 'Field 4: Unix timestamp. int64 is fixed-size, perfect for timestamps.'
      };

      fields.forEach(function (f) { f.style.borderColor = ''; });
      field.style.borderColor = 'var(--gopher-cyan)';
      caption.innerHTML = descriptions[fieldName] || 'Click a field to learn about it.';
    });
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

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-viz="unary-rpc"]').forEach(initUnaryRpcViz);
  document.querySelectorAll('[data-viz="streaming"]').forEach(initStreamingViz);
  document.querySelectorAll('[data-viz="protobuf"]').forEach(initProtobufViz);
  document.querySelectorAll('[data-viz="interview-qa"]').forEach(initInterviewQA);
});
