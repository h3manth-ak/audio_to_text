import React, { useState, useEffect, useRef } from "react";
import "./index.css";

function MicrophoneComponent() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [status, setStatus] = useState("Not Connected");
  const [socket, setSocket] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Loading animation for when recording starts
  const [isPaused, setIsPaused] = useState(false); // Track if recording is paused
  const transcriptRef = useRef(null); // Reference for auto-scrolling

  useEffect(() => {
    // Establish WebSocket connection to Deepgram API when component mounts
    const deepgramSocket = new WebSocket("wss://api.deepgram.com/v1/listen", [
      "token",
      process.env.REACT_APP_DEEPGRAM_API_KEY, // Using the API key from .env
    ]);

    deepgramSocket.onopen = () => {
      setStatus("Connected");
      console.log("WebSocket connection established");
    };

    deepgramSocket.onmessage = (message) => {
      const received = JSON.parse(message.data);
      const newTranscript = received.channel.alternatives[0].transcript;

      if (newTranscript && received.is_final) {
        setTranscript((prev) => prev + " " + newTranscript); // Append the new transcript
        setIsLoading(false); // Stop loading animation when transcription is received
        setIsPaused(false); // Reset paused state after receiving data
      }
    };

    deepgramSocket.onclose = () => {
      console.log("WebSocket connection closed");
    };

    deepgramSocket.onerror = (error) => {
      console.log("WebSocket error:", error);
    };

    setSocket(deepgramSocket);

    return () => {
      deepgramSocket.close();
    };
  }, []);

  useEffect(() => {
    // Auto-scroll to the bottom when new transcript is added
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [transcript]);

  const handleRecordToggle = () => {
    if (!isRecording) {
      // Start recording and sending audio data
      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        if (!MediaRecorder.isTypeSupported("audio/webm")) {
          alert("Browser does not support audio/webm recording");
          return;
        }

        const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0 && socket && socket.readyState === 1) {
            setIsLoading(true); // Start loading animation when sending audio data
            socket.send(event.data); // Send audio data to Deepgram API via WebSocket
          }
        };

        recorder.start(1000); // Record in chunks of 1 second
        setMediaRecorder(recorder);
        setIsRecording(true);
      });
    } else {
      // Stop recording when toggled off
      mediaRecorder && mediaRecorder.stop();
      setIsRecording(false);
      setIsLoading(false); // Stop loading animation when recording stops
    }
  };

  const handlePauseToggle = () => {
    if (isRecording) {
      mediaRecorder && mediaRecorder.stop();
      setIsPaused(true);
      setIsLoading(true); // Show loading animation while paused
      setIsRecording(false);
    } else {
      // Resume recording
      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0 && socket && socket.readyState === 1) {
            socket.send(event.data); // Send audio data to Deepgram API via WebSocket
          }
        };

        recorder.start(1000); // Record in chunks of 1 second
        setMediaRecorder(recorder);
        setIsRecording(true);
        setIsLoading(false); // Hide loading animation when starting to record
        setIsPaused(false);
      });
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-700 p-6">
      {/* Main Container */}
      <div className="bg-white bg-opacity-20 backdrop-filter backdrop-blur-xl rounded-3xl shadow-lg p-8 max-w-lg w-full text-white">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-semibold text-white drop-shadow-lg">
            Audio Transcription
          </h1>
          <p className="text-gray-300 text-sm mt-2">
            Convert real-time audio to text
          </p>
          <p className="text-sm text-yellow-400 mt-2" id="status">
            {status}
          </p>
        </div>

        {/* Microphone Button */}
        <div className="relative flex justify-center items-center mb-8">
          <div
            className={`w-40 h-40 rounded-full flex items-center justify-center bg-gradient-to-br ${
              isRecording
                ? "from-red-600 to-red-400 animate-pulse"
                : "from-gray-700 to-gray-500"
            } shadow-2xl cursor-pointer transition-all duration-500 ease-in-out transform hover:scale-105`}
            onClick={handleRecordToggle}
          >
            {isRecording ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-20 h-20 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                {/* Pause icon while recording */}
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10 9v6m4-6v6"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-20 h-20 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                {/* Mic icon when not recording */}
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 1v11m0 0a4 4 0 01-4-4V7a4 4 0 018 0v1a4 4 0 01-4 4zm0 6v3m-4 0h8m-4-3a4 4 0 004-4H8a4 4 0 004 4z"
                />
              </svg>
            )}
          </div>
        </div>

        {/* Transcription Text Area */}
        <div
          ref={transcriptRef}
          className="w-full h-48 bg-white bg-opacity-10 text-white placeholder-gray-300 p-4 rounded-lg border-none focus:ring-2 focus:ring-indigo-400 focus:outline-none mb-6 transition-all duration-200 overflow-y-auto"
          style={{ maxHeight: "200px" }}
        >
          {transcript ? (
            <>
              {transcript}
              {isPaused && <div className="wave-animation">Listening...</div>}
            </>
          ) : isLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
              <p className="ml-3 text-gray-300">Listening...</p>
            </div>
          ) : (
            <p className="text-gray-300">
              Click the button above to start speech-to-text
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default MicrophoneComponent;
