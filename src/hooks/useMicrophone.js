import { useRef, useState } from "react";

export function useMicrophone() {
  const streamRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);

  const startMicrophone = async () => {
    setError(null);

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error(
          "Microphone access is not supported by this browser."
        );
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      streamRef.current = stream;
      setIsListening(true);

      return stream;
    } catch (err) {
      console.error("Microphone error:", err);

      if (err.name === "NotAllowedError") {
        setError(
          "Microphone permission was denied. Please allow microphone access and try again."
        );
      } else if (err.name === "NotFoundError") {
        setError(
          "No microphone was found. Please connect a microphone and try again."
        );
      } else {
        setError(
          "Unable to access the microphone. Please check your browser settings."
        );
      }

      setIsListening(false);
      return null;
    }
  };

  const stopMicrophone = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });

      streamRef.current = null;
    }

    setIsListening(false);
    setError(null);
  };

  return {
    startMicrophone,
    stopMicrophone,
    isListening,
    error,
  };
}