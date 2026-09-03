const mockSequence = [0.12, 0.25, 0.43, 0.67, 0.87];

export function getRiskLevel(probability) {
  if (probability >= 0.7) {
    return "HIGH";
  }

  if (probability >= 0.4) {
    return "MEDIUM";
  }

  return "LOW";
}

export function getMockPrediction(index) {
  const probability =
    mockSequence[index % mockSequence.length];

  return {
    synthetic_probability: probability,
    label: probability >= 0.5 ? "SYNTHETIC" : "LIKELY HUMAN",
    risk_level: getRiskLevel(probability),
    timestamp: Date.now(),
  };
}

// Simulates sending an audio chunk to the future backend.
export async function sendAudioChunk(audioBlob) {
  console.log(
    "📡 Sending audio chunk to prediction service:",
    audioBlob.size,
    "bytes"
  );

  // Simulate backend response delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  const probability =
    mockSequence[Math.floor(Math.random() * mockSequence.length)];

  return {
    synthetic_probability: probability,
    label: probability >= 0.5 ? "SYNTHETIC" : "LIKELY HUMAN",
    risk_level: getRiskLevel(probability),
    timestamp: Date.now(),
  };
}