import { useRef, useState } from "react";

export function useAudioRecorder() {
  const recorderRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);

  const startRecording = (stream) => {
    if (!stream) {
      console.warn("No microphone stream available.");
      return;
    }

    try {
      const recorder = new MediaRecorder(stream);

      recorderRef.current = recorder;

      recorder.onstart = () => {
        console.log("🎙️ Audio recording started.");
        setIsRecording(true);
      };

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          console.log(
            "🔊 Audio chunk received:",
            event.data.size,
            "bytes"
          );

          // The audio chunk is intentionally not stored.
          // A real backend prediction service can be connected here later.
        }
      };

      recorder.onerror = (event) => {
        console.error("Audio recorder error:", event.error);
      };

      recorder.onstop = () => {
        console.log("🛑 Audio recording stopped.");
        setIsRecording(false);
      };

      recorder.start(1800);
    } catch (error) {
      console.error("Unable to start audio recorder:", error);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (
      recorderRef.current &&
      recorderRef.current.state !== "inactive"
    ) {
      recorderRef.current.stop();
    }

    recorderRef.current = null;
    setIsRecording(false);
  };

  return {
    startRecording,
    stopRecording,
    isRecording,
  };
}