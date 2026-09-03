import { useRef, useState } from "react";
import { sendAudioChunk } from "../services/predictionService";

export function useAudioRecorder(onPrediction) {
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

      recorder.ondataavailable = async (event) => {
        if (event.data && event.data.size > 0) {
          console.log(
            "🔊 Audio chunk received:",
            event.data.size,
            "bytes"
          );

          try {
            const prediction = await sendAudioChunk(event.data);

            console.log("🤖 Mock prediction received:", prediction);
            if (onPrediction) {
              onPrediction(prediction);
}
          } catch (error) {
            console.error("❌ Prediction error:", error);
          }
        }
      };

      recorder.onerror = (event) => {
        console.error("❌ Audio recorder error:", event.error);
      };

      recorder.onstop = () => {
        console.log("🛑 Audio recording stopped.");
        setIsRecording(false);
      };

      // Create a new audio chunk approximately every 1.8 seconds.
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