/* Interactive visuals for the REST API page. */

function initHTTPMethodsViz(root) {
  const buttons = root.querySelectorAll('[data-method]');
  const serverBox = root.querySelector('[data-role="server-box"]');
  const caption = root.querySelector('[data-role="caption"]');

  const methodInfo = {
    'GET': {
      title: 'GET',
      description: 'Retrieves data from the server. Safe (no side effects) and idempotent. Used to read resources without modifying them.',
      color: 'var(--accent)'
    },
    'POST': {
      title: 'POST',
      description: 'Creates a new resource. Not safe (creates data) and not idempotent (multiple calls create multiple resources).',
      color: 'var(--warn)'
    },
    'PUT': {
      title: 'PUT',
      description: 'Replaces a resource entirely. Not safe but idempotent (replacing the same data multiple times has the same effect).',
      color: 'var(--accent)'
    },
    'PATCH': {
      title: 'PATCH',
      description: 'Updates part of a resource. Not safe and not idempotent (unless designed to be). More efficient than PUT for partial updates.',
      color: 'var(--accent)'
    },
    'DELETE': {
      title: 'DELETE',
      description: 'Removes a resource. Not safe but idempotent (deleting an already-deleted resource returns 404, which is idempotent).',
      color: 'var(--danger)'
    }
  };

  buttons.forEach(function(btn) {
    btn.addEventListener('click', function() {
      const method = btn.getAttribute('data-method');
      const info = methodInfo[method];

      // Reset all buttons
      buttons.forEach(function(b) { b.style.borderColor = ''; });

      // Highlight selected button
      btn.style.borderColor = info.color;
      btn.style.color = info.color;

      // Update server box
      serverBox.style.borderColor = info.color;
      serverBox.style.opacity = '1';
      serverBox.querySelector('.recon-box-title').textContent = info.title;

      // Update caption
      caption.innerHTML = '<strong>' + info.title + ':</strong> ' + info.description;
    });
  });
}

function initMethodTableViz(root) {
  const rows = root.querySelectorAll('[data-method-row]');
  const descriptionBox = root.getElementById('method-description');

  const methodDetails = {
    'GET': {
      safe: 'Yes',
      idempotent: 'Yes',
      body: 'Not recommended',
      desc: 'Retrieves data. Safe and idempotent. Should not modify server state.'
    },
    'POST': {
      safe: 'No',
      idempotent: 'No',
      body: 'Required',
      desc: 'Creates a new resource. Not idempotent — multiple calls create multiple resources.'
    },
    'PUT': {
      safe: 'No',
      idempotent: 'Yes',
      body: 'Required',
      desc: 'Replaces a resource entirely. Idempotent — replacing the same data multiple times has the same effect.'
    },
    'PATCH': {
      safe: 'No',
      idempotent: 'No',
      body: 'Required',
      desc: 'Updates part of a resource. Not idempotent unless designed to be. More efficient than PUT for partial updates.'
    },
    'DELETE': {
      safe: 'No',
      idempotent: 'Yes',
      body: 'Not recommended',
      desc: 'Removes a resource. Idempotent — deleting an already-deleted resource returns 404, which is idempotent.'
    }
  };

  rows.forEach(function(row) {
    row.addEventListener('click', function() {
      const method = row.getAttribute('data-method-row');
      const details = methodDetails[method];

      // Reset all rows
      rows.forEach(function(r) { r.style.borderColor = ''; });

      // Highlight selected row
      row.style.borderColor = 'var(--gopher-cyan)';

      // Update description
      const descriptionBox = document.getElementById('method-description');
      descriptionBox.innerHTML = '<strong>' + method + '</strong><br><br>' +
        '<span style="color:var(--text-dim)">Safe:</span> ' + details.safe + '<br>' +
        '<span style="color:var(--text-dim)">Idempotent:</span> ' + details.idempotent + '<br>' +
        '<span style="color:var(--text-dim)">Body:</span> ' + details.body + '<br><br>' +
        details.desc;
    });
  });
}

function initRequestResponseViz(root) {
  const btn = root.querySelector('[data-role="send"]');
  const requestBox = root.querySelector('[data-role="request"]');
  const responseBox = root.querySelector('[data-role="response"]');
  const caption = root.querySelector('[data-role="caption"]');

  if (!btn) return;

  btn.addEventListener('click', function () {
    btn.disabled = true;
    requestBox.style.borderColor = 'var(--gopher-cyan)';
    caption.textContent = 'Sending POST request to /todos...';

    setTimeout(function () {
      responseBox.style.opacity = '1';
      responseBox.style.borderColor = 'var(--ok)';
      caption.innerHTML = 'Server received the request, validated the input, created the todo in MongoDB, and returned HTTP 201 Created with the new todo object.';
      btn.disabled = false;
    }, 800);
  });
}

function initErrorHandlingViz(root) {
  const scenarios = root.querySelectorAll('[data-scenario]');
  const resultBox = root.querySelector('[data-role="result"]');
  const caption = root.querySelector('[data-role="caption"]');

  const statusColors = {
    'bad-request': 'var(--warn)',
    'not-found': 'var(--accent-strong)',
    'server-error': 'var(--danger)'
  };

  scenarios.forEach(function(scenario) {
    scenario.addEventListener('click', function() {
      const type = scenario.getAttribute('data-scenario');
      const color = statusColors[type];

      resultBox.style.color = color;
      resultBox.style.fontWeight = '700';

      const messages = {
        'bad-request': {
          status: '400 Bad Request',
          body: '{"error":"Title is required"}',
          caption: 'Validation failed on the client input. The server rejected the request before touching the database.'
        },
        'not-found': {
          status: '404 Not Found',
          body: '{"error":"Todo not found"}',
          caption: 'The requested todo ID doesn\'t exist in the database. The server returns 404 to indicate the resource is missing.'
        },
        'server-error': {
          status: '500 Internal Server Error',
          body: '{"error":"Failed to create todo"}',
          caption: 'An unexpected error occurred on the server (database connection failed, etc.). Always return 500 for unhandled errors.'
        }
      };

      const msg = messages[type];
      resultBox.innerHTML = '<div style="margin-bottom:0.5rem;">' + msg.status + '</div><div>' + msg.body + '</div>';
      caption.innerHTML = msg.caption;
    });
  });
}

document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('[data-viz="http-methods"]').forEach(initHTTPMethodsViz);
  document.querySelectorAll('[data-viz="method-table"]').forEach(initMethodTableViz);
  document.querySelectorAll('[data-viz="request-response"]').forEach(initRequestResponseViz);
  document.querySelectorAll('[data-viz="error-handling"]').forEach(initErrorHandlingViz);
});