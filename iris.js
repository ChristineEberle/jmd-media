import {makeIrisSession} from "./iris-session.mjs";
const by = id => document.getElementById(id);
const toggle = by("iris-toggle"), panel = by("iris-panel"), back = by("iris-back");
const start = by("iris-start"), error = by("iris-error");
const status = by("iris-status"), viewer = by("iris-viewer-status");
let state = "idle";
const syncStatus = () => { status.hidden = state === "idle" || !panel.hidden; };
const showPanel = (open, moveFocus = true) => {
  panel.hidden = !open;
  toggle.setAttribute("aria-expanded", String(open));
  syncStatus();
  if (moveFocus) (open ? by("iris-title") : toggle).focus({preventScroll:true});
};
const feedback = makeIrisSession({
  agentId: "agent_5501m8fdzvx5e01r3an2czxdferh",
  getSdk: () => import("./iris-sdk.js"), // Bundle the pinned official ElevenLabs client before integration.
  getAudio: () => {
    if (!navigator.mediaDevices?.getUserMedia) throw new Error("Microphone unavailable");
    return navigator.mediaDevices.getUserMedia({audio:true});
  },
  update(snapshot) {
    const wasLive = state === "live";
    ({state} = snapshot);
    const active = state !== "idle";
    const mic = state === "live" || state === "connecting" || state === "stopping";
    const label = state === "stopping" ? "Ending call…" : state === "connecting" ? "Connecting · mic access allowed" : mic ? "Mic on" : "Waiting for microphone permission…";
    for (const row of [status, viewer]) {
      row.hidden = !active;
      row.dataset.live = String(mic);
      row.querySelector("[data-iris-label]").textContent = label;
    }
    toggle.dataset.live = String(mic);
    toggle.setAttribute("aria-label", mic ? "Feedback, microphone on" : "Feedback");
    if (state === "live" && !wasLive && !panel.hidden) {
      showPanel(false, panel.contains(document.activeElement));
    }
    panel.querySelector("[data-iris-stop]").hidden = !active;
    for (const el of document.querySelectorAll("[data-iris-stop]")) el.disabled = state === "stopping";
    syncStatus();
    start.disabled = active;
    start.textContent = snapshot.error ? "Try again" : "Agree and start";
    error.textContent = snapshot.error;
    error.hidden = !snapshot.error;
  },
});
toggle.addEventListener("click", () => {
  if (state === "live" || state === "stopping") {
    status.querySelector("[data-iris-stop]").focus({preventScroll:true});
    return;
  }
  showPanel(panel.hidden);
});
back.addEventListener("click", () => showPanel(false));
start.addEventListener("click", feedback.start);
for (const el of document.querySelectorAll("[data-iris-stop]")) {
  el.addEventListener("click", () => feedback.stop().catch(() => {}));
}
window.addEventListener("pagehide", () => { feedback.stop().catch(() => {}); });
