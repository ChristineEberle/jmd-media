export function makeIrisSession({getSdk, agentId, getAudio, update}) {
  let id = 0, session = null, state = "idle";
  const render = (value, error = "") => { state = value; update({state, error}); };
  async function stop() {
    ++id;
    const current = session;
    session = null;
    render("stopping");
    try { if (current) await current.endSession(); }
    finally { render("idle"); }
  }
  async function start() {
    if (state !== "idle") return;
    if (!agentId) {
      render("idle", "Iris is not connected in this preview.");
      return;
    }
    const attempt = ++id;
    let phase = "microphone";
    render("permission");
    try {
      const stream = await getAudio();
      for (const track of stream.getTracks()) track.stop();
      if (attempt !== id) return;
      phase = "network";
      render("connecting");
      let timer;
      const {Conversation} = await getSdk();
      if (attempt !== id) return;
      const pending = Conversation.startSession({
        agentId, connectionType: "websocket",
        onDisconnect() {
          if (attempt !== id) return;
          ++id; session = null; render("idle");
        },
      });
      const watchdog = new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error("Connection timed out")), 15000);
      });
      let connected;
      try { connected = await Promise.race([pending, watchdog]); }
      catch (error) {
        // A session that eventually opens after timeout must release its microphone.
        pending.then(late => late.endSession()).catch(() => {});
        throw error;
      } finally { clearTimeout(timer); }
      if (attempt !== id) {
        await connected.endSession();
        return;
      }
      session = connected;
      render("live");
    } catch (error) {
      if (attempt !== id) return;
      ++id;
      session = null;
      const micError = phase === "microphone" || ["NotAllowedError","NotFoundError","NotReadableError","SecurityError"].includes(error?.name);
      render("idle", micError
        ? "Couldn’t access your microphone. Allow it in your browser’s site settings, check that a microphone is available, and try again."
        : "Couldn’t connect to Iris. Try again or go back to the gallery.");
    }
  }
  return {start, stop};
}
