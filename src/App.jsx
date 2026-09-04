import { useEffect, useState } from "react";
import { useMicrophone } from "./hooks/useMicrophone";
import { useAudioRecorder } from "./hooks/useAudioRecorder";
import "./App.css";

const mockRiskSequence = [0.12, 0.25, 0.43, 0.67, 0.87];

function getRiskLevel(value) {
  if (value >= 0.7) return "HIGH";
  if (value >= 0.4) return "MEDIUM";
  return "LOW";
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(
    2,
    "0"
  )}`;
}

function App() {
  const {
    startMicrophone,
    stopMicrophone,
    isListening,
    error: micError,
  } = useMicrophone();

  const [status, setStatus] = useState("idle");
  const [risk, setRisk] = useState(0);
  const [riskHistory, setRiskHistory] = useState([]);
  const [sessionTime, setSessionTime] = useState(0);
  const [callerName] = useState("Alice D.");

  

  const {
    startRecording,
    stopRecording,
    isRecording,
  } = useAudioRecorder();

  const riskLevel = getRiskLevel(risk);

  // Session timer
  useEffect(() => {
    if (status !== "active") return;

    const timer = setInterval(() => {
      setSessionTime((previous) => previous + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [status]);

  // Mock risk updates for the demonstration
  useEffect(() => {
    if (status !== "active") return;

    let index = 0;

    setRiskHistory([mockRiskSequence[0]]);
    setRisk(mockRiskSequence[0]);

    const timer = setInterval(() => {
      index += 1;

      const nextRisk =
        mockRiskSequence[index % mockRiskSequence.length];

      setRisk(nextRisk);

      setRiskHistory((previous) => [
        ...previous.slice(-9),
        nextRisk,
      ]);
    }, 1800);

    return () => clearInterval(timer);
  }, [status]);

  const handleStart = async () => {
    setStatus("starting");

    const stream = await startMicrophone();

    if (!stream) {
      setStatus("permission-denied");
      return;
    }

    setRisk(0.12);
    setRiskHistory([0.12]);
    setSessionTime(0);

    startRecording(stream);

    setStatus("active");
  };

  const handleStop = () => {
    stopRecording();
    stopMicrophone();

    setStatus("stopped");
  };

  const handleReset = () => {
    stopRecording();
    stopMicrophone();

    setRisk(0);
    setRiskHistory([]);
    setSessionTime(0);
    setStatus("idle");
  };

  return (
    <div className="app">

      {/* ================= HEADER ================= */}

      <header className="topbar">
        <div className="brand">
          <div className="brand-icon">
            <span>✦</span>
          </div>

          <div>
            <h1>VOICEGUARD</h1>
            <p>AI VOICE SAFETY</p>
          </div>
        </div>

        {status === "active" && (
          <div className="live-status">
            <span className="live-dot"></span>
            PROTECTION ACTIVE
          </div>
        )}

        {status !== "active" && (
          <div className="prototype-label">
            BROWSER PROTOTYPE
          </div>
        )}
      </header>

      <div className="app-layout">

        {/* ================= SIDEBAR ================= */}

        <aside className="sidebar">

          <button className="nav-item active" title="Dashboard">
            <span>⌂</span>
          </button>

          <button className="nav-item" title="Call Monitor">
            <span>◉</span>
          </button>

          <button className="nav-item" title="Contacts">
            <span>♙</span>
          </button>

          <button className="nav-item" title="Messages">
            <span>▢</span>
          </button>

          <div className="sidebar-spacer"></div>

          <button className="nav-item" title="Settings">
            <span>⚙</span>
          </button>

        </aside>

        {/* ================= MAIN ================= */}

        <main className="dashboard">

          {/* IDLE */}

          {status === "idle" && (
            <section className="welcome-screen">

              <div className="welcome-badge">
                SECURE VOICE MONITORING
              </div>

              <h2>
                Detect suspicious
                <br />
                <span>synthetic voices.</span>
              </h2>

              <p>
                VoiceGuard analyzes live call audio and provides
                a real-time synthetic voice risk signal.
              </p>

              <button
                className="primary-button"
                onClick={handleStart}
              >
                <span>◉</span>
                Start Protection
              </button>

              <div className="privacy-note">
                <span>◉</span>
                Microphone access is requested only when you
                start protection. Audio is analyzed live and
                not stored.
              </div>

            </section>
          )}

          {/* STARTING */}

          {status === "starting" && (
            <section className="center-state">

              <div className="loading-ring"></div>

              <h2>Starting Protection</h2>

              <p>
                Please allow microphone access in your browser.
              </p>

            </section>
          )}

          {/* PERMISSION DENIED */}

          {status === "permission-denied" && (
            <section className="center-state">

              <div className="state-icon error">
                !
              </div>

              <h2>Microphone Access Required</h2>

              <p>
                {micError ||
                  "VoiceGuard needs microphone access to analyze the call."}
              </p>

              <button
                className="primary-button"
                onClick={handleStart}
              >
                Try Again
              </button>

            </section>
          )}

          {/* ================= ACTIVE DASHBOARD ================= */}

          {status === "active" && (
            <>
              <div className="dashboard-heading">

                <div>
                  <div className="eyebrow">
                    LIVE CALL MONITORING
                  </div>

                  <h2>Incoming Call</h2>
                </div>

                <div className="session-controls">

                  <div className="session-time">
                    <span>SESSION</span>
                    <strong>
                      {formatTime(sessionTime)}
                    </strong>
                  </div>

                  <button
                    className="stop-button"
                    onClick={handleStop}
                  >
                    Stop Protection
                  </button>

                </div>

              </div>

              <div className="main-grid">

                {/* ================= CALL CARD ================= */}

                <section className="card call-card">

                  <div className="card-header">
                    <span>INCOMING CALL</span>
                    <button className="more-button">•••</button>
                  </div>

                  <div className="caller">

                    <div className="caller-avatar">
                      AD
                    </div>

                    <div>
                      <h3>{callerName}</h3>
                      <p>VERIFY IDENTITY</p>
                    </div>

                  </div>

                  {/* RISK GAUGE */}

                  <div
                    className={`risk-gauge ${riskLevel.toLowerCase()}`}
                  >

                    <div className="gauge-track">
                      <div
                        className="gauge-progress"
                        style={{
                          transform: `rotate(${
                            -135 + risk * 270
                          }deg)`,
                        }}
                      ></div>
                    </div>

                    <div className="gauge-center">

                      <strong>
                        {Math.round(risk * 100)}%
                      </strong>

                      <span>SYNTHETIC RISK</span>

                    </div>

                  </div>

                  <div
                    className={`risk-pill ${riskLevel.toLowerCase()}`}
                  >
                    {riskLevel === "HIGH"
                      ? "HIGH RISK"
                      : riskLevel === "MEDIUM"
                      ? "MODERATE RISK"
                      : "LOW RISK"}
                  </div>

                  <p className="signal-caption">
                    Signal only — not a certainty
                  </p>

                  <div className="call-controls">

                    <button
                      className="control-button"
                      title="Mute"
                    >
                      ◉
                    </button>

                    <button
                      className="control-button end"
                      onClick={handleStop}
                      title="Stop protection"
                    >
                      ■
                    </button>

                    <button
                      className="control-button"
                      title="Audio"
                    >
                      ◫
                    </button>

                  </div>

                </section>

                {/* ================= RIGHT SIDE ================= */}

                <div className="right-column">

                  {/* VISUALIZER */}

                  <section className="card visualizer-card">

                    <div className="card-header">
                      <div>
                        <span>VISUALIZER</span>
                        <small>
                          LIVE AUDIO SIGNAL
                        </small>
                      </div>

                      <button className="more-button">
                        •••
                      </button>
                    </div>

                    <div className="waveform">

                      {Array.from(
                        { length: 42 },
                        (_, index) => (
                          <span
                            key={index}
                            className="wave-bar"
                            style={{
                              height: `${
                                20 +
                                Math.abs(
                                  Math.sin(index * 1.7)
                                ) * 60
                              }%`,
                              animationDelay: `${
                                index * 0.04
                              }s`,
                            }}
                          ></span>
                        )
                      )}

                    </div>

                    <div className="visualizer-footer">

                      <span>
                        <i></i>
                        AUDIO ANALYZING
                      </span>

                      <span>
                        {isRecording
                          ? "STREAMING"
                          : "READY"}
                      </span>

                    </div>

                  </section>

                  {/* TEMPORAL RISK */}

                  <section className="card timeline-card">

                    <div className="card-header">

                      <div>
                        <span>TEMPORAL RISK SCORE</span>

                        <small>
                          Risk probability over time
                        </small>
                      </div>

                      <span className="timeline-value">
                        {Math.round(risk * 100)}%
                      </span>

                    </div>

                    <div className="chart">

                      <div className="chart-y">
                        <span>100%</span>
                        <span>75%</span>
                        <span>50%</span>
                        <span>25%</span>
                        <span>0%</span>
                      </div>

                      <div className="chart-area">

                        <div className="chart-grid"></div>

                        <svg
                          viewBox="0 0 600 180"
                          preserveAspectRatio="none"
                        >

                          <defs>
                            <linearGradient
                              id="riskFill"
                              x1="0"
                              x2="0"
                              y1="0"
                              y2="1"
                            >
                              <stop
                                offset="0%"
                                stopOpacity="0.25"
                              />

                              <stop
                                offset="100%"
                                stopOpacity="0"
                              />
                            </linearGradient>
                          </defs>

                          {riskHistory.length > 1 && (
                            <>
                              <polyline
                                points={riskHistory
                                  .map(
                                    (value, index) => {
                                      const x =
                                        (index /
                                          Math.max(
                                            riskHistory.length -
                                              1,
                                            1
                                          )) *
                                        580 +
                                        10;

                                      const y =
                                        165 -
                                        value * 140;

                                      return `${x},${y}`;
                                    }
                                  )
                                  .join(" ")}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />

                              <polyline
                                points={`10,165 ${riskHistory
                                  .map(
                                    (value, index) => {
                                      const x =
                                        (index /
                                          Math.max(
                                            riskHistory.length -
                                              1,
                                            1
                                          )) *
                                        580 +
                                        10;

                                      const y =
                                        165 -
                                        value * 140;

                                      return `${x},${y}`;
                                    }
                                  )
                                  .join(
                                    " "
                                  )} 590,165`}
                                fill="url(#riskFill)"
                                stroke="none"
                              />
                            </>
                          )}

                        </svg>

                        {riskHistory.length > 0 && (
                          <div
                            className="chart-point"
                            style={{
                              left: `${
                                ((riskHistory.length - 1) /
                                  Math.max(
                                    riskHistory.length - 1,
                                    1
                                  )) *
                                  100
                              }%`,
                              bottom: `${
                                risk * 100
                              }%`,
                            }}
                          ></div>
                        )}

                      </div>

                    </div>

                    <div className="chart-x">
                      <span>0s</span>
                      <span>15s</span>
                      <span>30s</span>
                      <span>45s</span>
                      <span>60s</span>
                    </div>

                  </section>

                </div>

              </div>

              {/* HIGH RISK NOTICE */}

              {riskLevel === "HIGH" && (
                <div className="high-risk-notice">

                  <div className="notice-icon">
                    !
                  </div>

                  <div>
                    <strong>
                      High synthetic voice risk
                    </strong>

                    <span>
                      Verify the caller independently
                      before sharing sensitive information.
                    </span>
                  </div>

                </div>
              )}

              {/* BOTTOM STATUS */}

              <div className="bottom-status">

                <span>
                  <i></i>
                  Microphone active
                </span>

                <span>
                  Audio analyzed live — not stored
                </span>

              </div>
            </>
          )}

          {/* ================= STOPPED ================= */}

          {status === "stopped" && (
            <section className="stopped-screen">

              <div className="state-icon success">
                ✓
              </div>

              <div className="eyebrow">
                SESSION COMPLETE
              </div>

              <h2>Protection Stopped</h2>

              <p>
                Your microphone has been released and the
                monitoring session has ended.
              </p>

              <div className="summary-card">

                <div>
                  <span>SESSION TIME</span>
                  <strong>
                    {formatTime(sessionTime)}
                  </strong>
                </div>

                <div>
                  <span>HIGHEST RISK</span>
                  <strong>
                    {Math.round(
                      Math.max(...riskHistory, 0) * 100
                    )}
                    %
                  </strong>
                </div>

                <div>
                  <span>SIGNALS</span>
                  <strong>
                    {riskHistory.length}
                  </strong>
                </div>

              </div>

              <button
                className="primary-button"
                onClick={handleReset}
              >
                Start Protection Again
              </button>

            </section>
          )}

        </main>
      </div>

      <footer className="footer">
        VoiceGuard · Real-time synthetic voice risk detection
      </footer>

    </div>
  );
}

export default App;