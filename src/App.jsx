import { useAudioRecorder } from "./hooks/useAudioRecorder";
import { useEffect, useState } from "react";
import { useMicrophone } from "./hooks/useMicrophone";
import "./App.css";

function App() {
  // Microphone
  const {
    startMicrophone,
    stopMicrophone,
    isListening,
    error: micError,
  } = useMicrophone();

  // App state
  const [status, setStatus] = useState("idle");
  const [probability, setProbability] = useState(0);
  const [riskLevel, setRiskLevel] = useState("LOW");
  const [history, setHistory] = useState([]);
  const [sessionTime, setSessionTime] = useState(0);

  // Handle predictions coming from the audio recorder
  const handlePrediction = (prediction) => {
    console.log("📊 Updating dashboard:", prediction);

    setProbability(prediction.synthetic_probability);
    setRiskLevel(prediction.risk_level);

    setHistory((previous) => [
      ...previous.slice(-7),
      prediction.synthetic_probability,
    ]);
  };

  // Audio recorder
  const {
    startRecording,
    stopRecording,
    isRecording,
  } = useAudioRecorder(handlePrediction);

  // Session timer
  useEffect(() => {
    if (status !== "active") return;

    const timer = setInterval(() => {
      setSessionTime((previous) => previous + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [status]);

  // Start protection
  const handleStart = async () => {
    console.log("🎙️ Starting VoiceGuard...");

    setStatus("starting");

    const stream = await startMicrophone();

    if (stream) {
      console.log("✅ Microphone stream received:", stream);

      // Start recording audio
      startRecording(stream);

      // Reset dashboard
      setProbability(0);
      setRiskLevel("LOW");
      setHistory([]);
      setSessionTime(0);

      // Start protection
      setStatus("active");

      console.log("🛡️ VoiceGuard protection active");
    } else {
      console.log("❌ Microphone permission denied");

      setStatus("permission-denied");
    }
  };

  // Stop protection
  const handleStop = () => {
    console.log("🛑 Stopping VoiceGuard...");

    stopRecording();
    stopMicrophone();

    setStatus("stopped");
  };

  // Try again after microphone permission error
  const handleTryAgain = () => {
    stopRecording();
    stopMicrophone();

    setStatus("idle");
  };

  // Format session time
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

  // Risk messages
  const riskMessage = {
    LOW: "Voice appears likely human",
    MEDIUM: "Possible synthetic voice detected",
    HIGH: "High synthetic voice risk detected",
  };

  return (
    <div className="app">

      {/* ================= HEADER ================= */}
      <header className="header">
        <div className="logo">
          <span className="logo-icon">🛡️</span>
          <span>VoiceGuard</span>
        </div>

        <div className="header-status">
          <span className="status-dot"></span>
          Browser Prototype
        </div>
      </header>

      <main className="main-content">

        {/* ================= IDLE ================= */}
        {status === "idle" && (
          <section className="landing">

            <div className="hero-icon">
              🛡️
            </div>

            <h1>
              Protect Yourself From
              <span> AI Voice Scams</span>
            </h1>

            <p className="hero-text">
              VoiceGuard listens for suspicious synthetic voice
              patterns during your phone calls.
            </p>

            <button
              className="start-button"
              onClick={handleStart}
            >
              🎙️ Start Protection
            </button>

            <div className="privacy-box">
              🔒 Your audio is processed temporarily and is not
              stored on your device.
            </div>

          </section>
        )}

        {/* ================= STARTING ================= */}
        {status === "starting" && (
          <section className="state-screen">

            <div className="loading-spinner"></div>

            <h2>
              Requesting Microphone Access
            </h2>

            <p>
              Please allow microphone access in your browser.
            </p>

          </section>
        )}

        {/* ================= PERMISSION DENIED ================= */}
        {status === "permission-denied" && (
          <section className="state-screen">

            <div className="error-icon">
              🎙️
            </div>

            <h2>
              Microphone Access Needed
            </h2>

            <p>
              {micError ||
                "VoiceGuard needs microphone access to analyze the call."}
            </p>

            <button
              className="start-button"
              onClick={handleTryAgain}
            >
              Try Again
            </button>

          </section>
        )}

        {/* ================= ACTIVE ================= */}
        {status === "active" && (
          <section className="dashboard">

            {/* Protection header */}
            <div className="protection-header">

              <div>

                <div className="active-indicator">
                  <span className="pulse-dot"></span>

                  PROTECTION ACTIVE
                </div>

                <h2>
                  Monitoring Call
                </h2>

              </div>

              <button
                className="stop-button"
                onClick={handleStop}
              >
                ■ Stop Protection
              </button>

            </div>

            {/* Dashboard cards */}
            <div className="dashboard-grid">

              {/* ================= PROBABILITY ================= */}
              <div className="card probability-card">

                <p className="card-label">
                  SYNTHETIC VOICE PROBABILITY
                </p>

                <div className="probability">
                  {Math.round(probability * 100)}%
                </div>

                <div
                  className={`risk-badge ${riskLevel.toLowerCase()}`}
                >
                  {riskLevel}
                </div>

                <p className="risk-message">
                  {riskMessage[riskLevel]}
                </p>

              </div>

              {/* ================= RISK GAUGE ================= */}
              <div className="card">

                <p className="card-label">
                  RISK LEVEL
                </p>

                <div className="gauge-container">

                  <div
                    className="gauge"
                    style={{
                      background: `conic-gradient(
                        ${
                          riskLevel === "HIGH"
                            ? "#ef4444"
                            : riskLevel === "MEDIUM"
                            ? "#f59e0b"
                            : "#22c55e"
                        }
                        ${probability * 360}deg,
                        #334155 ${probability * 360}deg
                      )`,
                    }}
                  >

                    <div className="gauge-inner">

                      <strong>
                        {Math.round(probability * 100)}%
                      </strong>

                      <span>
                        {riskLevel}
                      </span>

                    </div>

                  </div>

                </div>

              </div>

              {/* ================= SESSION ================= */}
              <div className="card">

                <p className="card-label">
                  SESSION
                </p>

                <div className="session-stat">

                  <span>
                    Duration
                  </span>

                  <strong>
                    {formatTime(sessionTime)}
                  </strong>

                </div>

                <div className="session-stat">

                  <span>
                    Microphone
                  </span>

                  <strong className="active-text">
                    ● {isListening ? "Active" : "Inactive"}
                  </strong>

                </div>

                <div className="session-stat">

                  <span>
                    AI Analysis
                  </span>

                  <strong className="active-text">
                    ● {isRecording ? "Running" : "Stopped"}
                  </strong>

                </div>

              </div>

            </div>

            {/* ================= TIMELINE ================= */}
            <div className="card timeline-card">

              <div className="timeline-header">

                <p className="card-label">
                  RISK TIMELINE
                </p>

                <span>
                  Live
                </span>

              </div>

              <div className="timeline">

                {history.length === 0 ? (
                  <p className="waiting">
                    Waiting for voice analysis...
                  </p>
                ) : (
                  history.map((value, index) => (
                    <div
                      className="timeline-bar"
                      key={index}
                      style={{
                        height: `${Math.max(
                          value * 100,
                          8
                        )}%`,
                      }}
                    ></div>
                  ))
                )}

              </div>

              {/* High risk warning */}
              {riskLevel === "HIGH" && (
                <div className="warning-box">

                  ⚠️{" "}

                  <strong>
                    High Risk:
                  </strong>{" "}

                  Verify caller independently before
                  sharing sensitive information.

                </div>
              )}

            </div>

            {/* Signal disclaimer */}
            <div className="signal-note">
              Signal only — verify caller independently.
            </div>

          </section>
        )}

        {/* ================= STOPPED ================= */}
        {status === "stopped" && (
          <section className="state-screen">

            <div className="stopped-icon">
              ✓
            </div>

            <h2>
              Protection Stopped
            </h2>

            <p>
              Your microphone has been disconnected and the
              monitoring session has ended.
            </p>

            <button
              className="start-button"
              onClick={handleStart}
            >
              🎙️ Start Protection Again
            </button>

          </section>
        )}

      </main>

      {/* ================= FOOTER ================= */}
      <footer className="footer">
        VoiceGuard • Browser Prototype
      </footer>

    </div>
  );
}

export default App;