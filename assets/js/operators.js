/* Interactive visuals for the Kubernetes Operators page. */

/* ---------- AWS EC2 Operator Interactive Simulator ---------- */
function initEC2Simulator(root) {
  // Elements
  const k8sCol = root.querySelector('[data-col="k8s"]');
  const ctrlCol = root.querySelector('[data-col="ctrl"]');
  const awsCol = root.querySelector('[data-col="aws"]');

  const crNameEl = root.querySelector('[data-k8s="name"]');
  const crSpecTypeEl = root.querySelector('[data-k8s="spec-type"]');
  const crSpecRegionEl = root.querySelector('[data-k8s="spec-region"]');
  const crFinalizersEl = root.querySelector('[data-k8s="finalizers"]');
  const crDeletionEl = root.querySelector('[data-k8s="deletion-ts"]');
  const crStatusIdEl = root.querySelector('[data-k8s="status-id"]');
  const crStatusStateEl = root.querySelector('[data-k8s="status-state"]');
  const crStatusIpEl = root.querySelector('[data-k8s="status-ip"]');

  const ctrlActiveEl = root.querySelector('[data-ctrl="active"]');
  const ctrlQueueEl = root.querySelector('[data-ctrl="queue"]');
  const ctrlActionEl = root.querySelector('[data-ctrl="action"]');

  const awsIdEl = root.querySelector('[data-aws="id"]');
  const awsStateEl = root.querySelector('[data-aws="state"]');
  const awsIpEl = root.querySelector('[data-aws="ip"]');
  const awsCostEl = root.querySelector('[data-aws="cost"]');

  const stepCounterEl = root.querySelector('[data-role="step-counter"]');
  const progressBarEl = root.querySelector('[data-role="progress-bar"]');
  const captionEl = root.querySelector('[data-role="caption"]');

  const stepBtn = root.querySelector('[data-btn="step"]');
  const resetBtn = root.querySelector('[data-btn="reset"]');
  const driftBtn = root.querySelector('[data-btn="drift"]');
  const deleteBtn = root.querySelector('[data-btn="delete"]');

  if (!k8sCol || !ctrlCol || !awsCol || !stepBtn) return;

  // Stages:
  // 0: idle
  // 1: cr_applied (Reconcile 1 begins)
  // 2: finalizer_added (Reconcile 2 queued, Reconcile 1 continues)
  // 3: aws_provisioned (AWS RunInstances & Waiter)
  // 4: status_updated (Status.Update queues Reconcile 3, Reconcile 1 finishes)
  // 5: queue_drained (Reconcile 2 & 3 run, idempotent no-op, converged)
  // 6: drift_detected (AWS stopped out of band, reconcile syncs status)
  // 7: cr_deleted (DeletionTimestamp -> AWS Terminate -> Remove Finalizer -> Purged)
  let currentStage = 0;

  function renderState() {
    [k8sCol, ctrlCol, awsCol].forEach(col => col && col.classList.remove("active"));

    // Reset button disabled states
    if (driftBtn) driftBtn.disabled = (currentStage !== 5);
    if (deleteBtn) deleteBtn.disabled = (currentStage === 0 || currentStage === 7);

    switch (currentStage) {
      case 0: // Idle
        if (stepCounterEl) stepCounterEl.textContent = "Step 0 of 5: Cluster Ready";
        if (progressBarEl) progressBarEl.style.width = "0%";
        if (stepBtn) {
          stepBtn.textContent = "1. Apply EC2Instance CR";
          stepBtn.disabled = false;
        }

        if (crNameEl) crNameEl.textContent = "—";
        if (crSpecTypeEl) crSpecTypeEl.textContent = "—";
        if (crSpecRegionEl) crSpecRegionEl.textContent = "—";
        if (crFinalizersEl) crFinalizersEl.innerHTML = '<span class="ec2-finalizer-tag none">[]</span>';
        if (crDeletionEl) crDeletionEl.textContent = "null";
        if (crStatusIdEl) crStatusIdEl.textContent = "—";
        if (crStatusStateEl) crStatusStateEl.innerHTML = '<span class="ec2-status-pill ec2-status-none">None</span>';
        if (crStatusIpEl) crStatusIpEl.textContent = "—";

        if (ctrlActiveEl) ctrlActiveEl.textContent = "Idle (Watching API)";
        if (ctrlQueueEl) ctrlQueueEl.textContent = "[] (0 items)";
        if (ctrlActionEl) ctrlActionEl.textContent = "Waiting for watch event...";

        if (awsIdEl) awsIdEl.textContent = "—";
        if (awsStateEl) awsStateEl.innerHTML = '<span class="ec2-status-pill ec2-status-none">No Instance</span>';
        if (awsIpEl) awsIpEl.textContent = "—";
        if (awsCostEl) awsCostEl.textContent = "$0.00 / hr";

        if (captionEl) captionEl.innerHTML = "Click <strong>&ldquo;1. Apply EC2Instance CR&rdquo;</strong> to submit <code>kubectl apply -f ec2instance.yaml</code> requesting a <code>t3.micro</code> VM in AWS <code>us-east-1</code>.";
        break;

      case 1: // CR Applied
        k8sCol.classList.add("active");
        ctrlCol.classList.add("active");
        if (stepCounterEl) stepCounterEl.textContent = "Step 1 of 5: CR Applied & Reconcile 1 Started";
        if (progressBarEl) progressBarEl.style.width = "20%";
        if (stepBtn) {
          stepBtn.textContent = "2. Add Finalizer (r.Update)";
          stepBtn.disabled = false;
        }

        if (crNameEl) crNameEl.textContent = "prod-server";
        if (crSpecTypeEl) crSpecTypeEl.textContent = "t3.micro";
        if (crSpecRegionEl) crSpecRegionEl.textContent = "us-east-1";
        if (crFinalizersEl) crFinalizersEl.innerHTML = '<span class="ec2-finalizer-tag none">[]</span>';
        if (crDeletionEl) crDeletionEl.textContent = "null";
        if (crStatusIdEl) crStatusIdEl.textContent = "—";
        if (crStatusStateEl) crStatusStateEl.innerHTML = '<span class="ec2-status-pill ec2-status-pending">Pending</span>';
        if (crStatusIpEl) crStatusIpEl.textContent = "—";

        if (ctrlActiveEl) ctrlActiveEl.textContent = "Reconcile #1 (In Flight)";
        if (ctrlQueueEl) ctrlQueueEl.textContent = '["default/prod-server"]';
        if (ctrlActionEl) ctrlActionEl.textContent = "r.Get() succeeded. Checking finalizers...";

        if (captionEl) captionEl.innerHTML = "<strong>CR Created in API server!</strong> Controller-runtime informer observed the new custom resource and enqueued <code>default/prod-server</code>. <strong>Reconcile #1</strong> began processing.";
        break;

      case 2: // Finalizer Added
        k8sCol.classList.add("active");
        ctrlCol.classList.add("active");
        if (stepCounterEl) stepCounterEl.textContent = "Step 2 of 5: Finalizer Added (Queues Reconcile 2)";
        if (progressBarEl) progressBarEl.style.width = "40%";
        if (stepBtn) {
          stepBtn.textContent = "3. Call AWS RunInstances";
          stepBtn.disabled = false;
        }

        if (crFinalizersEl) crFinalizersEl.innerHTML = '<span class="ec2-finalizer-tag">🔒 ec2instance.compute.cloud.com</span>';
        if (ctrlActiveEl) ctrlActiveEl.textContent = "Reconcile #1 (Calling AWS)";
        if (ctrlQueueEl) ctrlQueueEl.textContent = '["default/prod-server (Queued Reconcile 2)"]';
        if (ctrlActionEl) ctrlActionEl.textContent = "r.Update() added finalizer -> Watch event queued Reconcile 2!";

        if (captionEl) captionEl.innerHTML = "<strong>Cloud Safety First:</strong> Controller called <code>controllerutil.AddFinalizer</code> and <code>r.Update()</code>. This guarantees the object cannot be accidentally deleted from Kubernetes while cloud infrastructure exists. Notice: <code>r.Update()</code> emitted a watch event, queueing <strong>Reconcile #2</strong> &mdash; but controller-runtime serializes work by key, so Reconcile #1 continues!";
        break;

      case 3: // AWS RunInstances & Waiter
        ctrlCol.classList.add("active");
        awsCol.classList.add("active");
        if (stepCounterEl) stepCounterEl.textContent = "Step 3 of 5: AWS RunInstances & State Waiter";
        if (progressBarEl) progressBarEl.style.width = "60%";
        if (stepBtn) {
          stepBtn.textContent = "4. Update Status (r.Status().Update)";
          stepBtn.disabled = false;
        }

        if (ctrlActiveEl) ctrlActiveEl.textContent = "Reconcile #1 (AWS SDK v2)";
        if (ctrlActionEl) ctrlActionEl.textContent = "RunInstances() returned i-08a97b21c4ef. Waiting for 'running' state...";

        if (awsIdEl) awsIdEl.textContent = "i-08a97b21c4ef";
        if (awsStateEl) awsStateEl.innerHTML = '<span class="ec2-status-pill ec2-status-running">● Running</span>';
        if (awsIpEl) awsIpEl.textContent = "54.210.88.19";
        if (awsCostEl) awsCostEl.textContent = "$0.0104 / hr";

        if (captionEl) captionEl.innerHTML = "<strong>AWS SDK v2 in action:</strong> Reconciler called <code>ec2Client.RunInstances</code> with AMI, InstanceType, and Subnet. Then <code>ec2.NewInstanceRunningWaiter</code> polled AWS until the instance transitioned from <code>pending</code> to <code>running</code> and allocated public IP <code>54.210.88.19</code>.";
        break;

      case 4: // Status Updated
        k8sCol.classList.add("active");
        ctrlCol.classList.add("active");
        if (stepCounterEl) stepCounterEl.textContent = "Step 4 of 5: Status Updated (Queues Reconcile 3)";
        if (progressBarEl) progressBarEl.style.width = "80%";
        if (stepBtn) {
          stepBtn.textContent = "5. Drain Queued Reconciles (2 & 3)";
          stepBtn.disabled = false;
        }

        if (crStatusIdEl) crStatusIdEl.textContent = "i-08a97b21c4ef";
        if (crStatusStateEl) crStatusStateEl.innerHTML = '<span class="ec2-status-pill ec2-status-running">● Running</span>';
        if (crStatusIpEl) crStatusIpEl.textContent = "54.210.88.19";

        if (ctrlActiveEl) ctrlActiveEl.textContent = "Reconcile #1 Completed";
        if (ctrlQueueEl) ctrlQueueEl.textContent = '["Reconcile #2 (from finalizer)", "Reconcile #3 (from status)"]';
        if (ctrlActionEl) ctrlActionEl.textContent = "r.Status().Update() written. Reconcile #1 returns success!";

        if (captionEl) captionEl.innerHTML = "<strong>Status Subresource Updated:</strong> Reconcile #1 executed <code>r.Status().Update()</code>, recording AWS instance ID and IP. <code>kubectl get ec2instances</code> now shows healthy state! This status update emitted another watch event, queueing <strong>Reconcile #3</strong>.";
        break;

      case 5: // Queued Reconciles 2 & 3 drained (Idempotency)
        ctrlCol.classList.add("active");
        if (stepCounterEl) stepCounterEl.textContent = "Step 5 of 5: Fully Converged & Idempotent";
        if (progressBarEl) progressBarEl.style.width = "100%";
        if (stepBtn) {
          stepBtn.textContent = "✓ Converged (All Loops Done)";
          stepBtn.disabled = true;
        }

        if (ctrlActiveEl) ctrlActiveEl.textContent = "Idle (Waiting for events / 30s poll)";
        if (ctrlQueueEl) ctrlQueueEl.textContent = "[] (0 items)";
        if (ctrlActionEl) ctrlActionEl.textContent = "Reconcile #2 & #3 saw Status.InstanceID != '', checked AWS running, and no-oped cleanly.";

        if (captionEl) captionEl.innerHTML = "<strong>Level-Based Idempotency Proved:</strong> Reconcile #2 and #3 popped off the queue sequentially. Both inspected <code>Status.InstanceID != ''</code>, verified via <code>DescribeInstances</code> that AWS is running, and returned <code>ctrl.Result{RequeueAfter: 30s}</code> with 0 redundant creates. Now try <strong>&ldquo;Simulate Cloud Drift&rdquo;</strong> or <strong>&ldquo;Delete CR&rdquo;</strong>!";
        break;

      case 6: // Drift
        awsCol.classList.add("active");
        k8sCol.classList.add("active");
        if (stepCounterEl) stepCounterEl.textContent = "Drift Detected & Reconciled";
        if (progressBarEl) progressBarEl.style.width = "100%";
        if (stepBtn) {
          stepBtn.textContent = "Drift Resolved";
          stepBtn.disabled = true;
        }

        if (awsStateEl) awsStateEl.innerHTML = '<span class="ec2-status-pill ec2-status-stopped">■ Stopped</span>';
        if (awsCostEl) awsCostEl.textContent = "$0.00 / hr (Compute stopped)";

        if (crStatusStateEl) crStatusStateEl.innerHTML = '<span class="ec2-status-pill ec2-status-stopped">■ Stopped</span>';
        if (ctrlActiveEl) ctrlActiveEl.textContent = "Periodic Drift Poll Reconcile";
        if (ctrlActionEl) ctrlActionEl.textContent = "DescribeInstances detected state drifted from running to stopped. Updated status!";

        if (captionEl) captionEl.innerHTML = "<strong>Out-of-Band Cloud Drift Reconciled:</strong> Someone stopped the instance in the AWS Console. The operator's 30-second periodic reconcile ran <code>DescribeInstances</code>, observed the difference, and automatically corrected Kubernetes <code>.status.state</code> to <code>Stopped</code>.";
        break;

      case 7: // Deletion & Finalizer Cleanup
        k8sCol.classList.add("active");
        ctrlCol.classList.add("active");
        awsCol.classList.add("active");
        if (stepCounterEl) stepCounterEl.textContent = "Teardown Complete: Finalizer Stripped";
        if (progressBarEl) progressBarEl.style.width = "100%";
        if (stepBtn) {
          stepBtn.textContent = "CR Deleted from etcd";
          stepBtn.disabled = true;
        }

        if (crDeletionEl) crDeletionEl.innerHTML = '<span style="color:var(--warn);">2026-09-12T03:30:15Z</span>';
        if (crFinalizersEl) crFinalizersEl.innerHTML = '<span class="ec2-finalizer-tag none">[] (Removed)</span>';

        if (awsStateEl) awsStateEl.innerHTML = '<span class="ec2-status-pill ec2-status-terminated">✕ Terminated</span>';
        if (awsCostEl) awsCostEl.textContent = "$0.00 / hr (Cleaned)";

        if (ctrlActiveEl) ctrlActiveEl.textContent = "Teardown Reconcile";
        if (ctrlActionEl) ctrlActionEl.textContent = "TerminateInstances() confirmed by Terminated Waiter -> controllerutil.RemoveFinalizer() -> CR deleted!";

        if (captionEl) captionEl.innerHTML = "<strong>Safe Teardown via Finalizers:</strong> On <code>kubectl delete</code>, the API server set <code>deletionTimestamp</code>. The reconciler intercepted deletion, called AWS <code>TerminateInstances</code>, waited for AWS to confirm termination, and stripped the finalizer. Only then did Kubernetes remove the CR from etcd &mdash; <strong>zero orphaned cloud VMs, zero billing leaks!</strong>";
        break;
    }
  }

  if (stepBtn) {
    stepBtn.addEventListener("click", function () {
      if (currentStage < 5) {
        currentStage++;
        renderState();
      }
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      currentStage = 0;
      renderState();
    });
  }

  if (driftBtn) {
    driftBtn.addEventListener("click", function () {
      if (currentStage === 5) {
        currentStage = 6;
        renderState();
      }
    });
  }

  if (deleteBtn) {
    deleteBtn.addEventListener("click", function () {
      currentStage = 7;
      renderState();
    });
  }

  renderState();
}

/* ---------- Reconcile Loop Single Field Visualizer ---------- */
function initReconVisual(root) {
  const actualEl = root.querySelector('[data-role="actual-replicas"]');
  const loopIcon = root.querySelector(".recon-loop-icon");
  const driftBtn = root.querySelector('[data-role="drift"]');
  const reconcileBtn = root.querySelector('[data-role="reconcile"]');
  const caption = root.querySelector('[data-role="caption"]');

  if (!actualEl || !driftBtn || !reconcileBtn) return;

  let actual = "running";

  function render() {
    actualEl.textContent = actual;
    const matches = actual === "running";
    actualEl.classList.toggle("drift", !matches);
    actualEl.classList.toggle("match", matches);
    reconcileBtn.disabled = matches;
    driftBtn.disabled = !matches;
  }

  driftBtn.addEventListener("click", function () {
    actual = "stopped";
    render();
    if (caption) {
      caption.innerHTML =
        "Someone stopped the EC2 instance in the AWS Management Console directly. " +
        "The actual AWS cloud state is now <strong>stopped</strong>, but the Kubernetes CR status still says <strong>running</strong>.";
    }
  });

  reconcileBtn.addEventListener("click", function () {
    if (loopIcon) {
      loopIcon.classList.remove("spin");
      void loopIcon.offsetWidth;
      loopIcon.classList.add("spin");
    }
    if (caption) caption.textContent = "Reconciling with AWS DescribeInstances API...";
    setTimeout(function () {
      actual = "running";
      render();
      if (caption) {
        caption.innerHTML =
          "The operator queries AWS <code>DescribeInstances</code>, detects the discrepancy, and re-converges the system. " +
          "This is level-based reconciliation: it re-evaluates current reality on every cycle, not an ephemeral event stream.";
      }
    }, 500);
  });

  render();
  if (caption) {
    caption.textContent = 'Click "Simulate manual drift" to simulate an out-of-band AWS console change, then "Reconcile" to watch the operator correct it.';
  }
}

/* ---------- Owner Tree Visualizer (In-Cluster GC vs Cloud Finalizer) ---------- */
function initOwnerTreeVisual(root) {
  const parent = root.querySelector('[data-role="parent"]');
  const children = root.querySelectorAll('[data-role="child"]');
  const btn = root.querySelector('[data-role="delete"]');
  const caption = root.querySelector('[data-role="caption"]');
  const controls = root.querySelector(".viz-controls");

  if (!parent || !btn) return;

  if (!root.querySelector(".viz-header")) {
    const header = document.createElement("div");
    header.className = "viz-header";
    header.innerHTML = '<div class="viz-title"><span class="viz-badge">Garbage Collector</span><span>OwnerReference Cascading Deletion (In-Cluster)</span></div><span class="viz-step-counter">k8s GC Tree</span>';
    root.insertBefore(header, root.firstChild);
  }

  let resetBtn = controls ? controls.querySelector('[data-role="reset"]') : null;
  if (controls && !resetBtn) {
    resetBtn = document.createElement("button");
    resetBtn.className = "btn btn-sm";
    resetBtn.setAttribute("data-role", "reset");
    resetBtn.textContent = "↺ Reset Tree";
    resetBtn.style.display = "none";
    resetBtn.addEventListener("click", function () {
      parent.classList.remove("gc-deleted");
      children.forEach(function (child) { child.classList.remove("gc-deleted"); });
      btn.disabled = false;
      resetBtn.style.display = "none";
      if (caption) caption.innerHTML = "Click &ldquo;Delete Parent Resource&rdquo; to see what the Kubernetes garbage collector does to in-cluster children.";
    });
    controls.appendChild(resetBtn);
  }

  btn.addEventListener("click", function () {
    btn.disabled = true;
    if (resetBtn) resetBtn.style.display = "inline-flex";
    parent.classList.add("gc-deleted");
    if (caption) caption.textContent = "Parent CR deleted. Kubernetes' garbage collector notices the owner reference is gone...";
    children.forEach(function (child, i) {
      setTimeout(function () {
        child.classList.add("gc-deleted");
        if (i === children.length - 1 && caption) {
          caption.innerHTML =
            "Owned Kubernetes objects (ConfigMaps, Secrets, Pods) are cascade-deleted automatically by <code>kube-controller-manager</code>. " +
            "<strong>CRITICAL CONTRAST:</strong> External resources like AWS EC2 instances have no owner reference in K8s, so they <em>never</em> get deleted by GC &mdash; you MUST use a <strong>Finalizer</strong>!";
        }
      }, 300 + i * 300);
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

document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll('[data-viz="ec2-reconciler"]').forEach(initEC2Simulator);
  document.querySelectorAll('[data-viz="recon-loop"]').forEach(initReconVisual);
  document.querySelectorAll('[data-viz="owner-tree"]').forEach(initOwnerTreeVisual);
  document.querySelectorAll('[data-viz="interview-qa"]').forEach(initInterviewQA);
});
