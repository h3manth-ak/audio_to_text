import React, { useState, useEffect, useRef } from "react";
import "./index.css";

function MicrophoneComponent() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [status, setStatus] = useState("Not Connected");
  const [socket, setSocket] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [isLoading, setIsLoading] = useState(false); 
  const [isPaused, setIsPaused] = useState(false); 
  const [savedTranscripts, setSavedTranscripts] = useState([]); 
  const transcriptRef = useRef(null); 

  useEffect(() => {
    const connectSocket = () => {
      const deepgramSocket = new WebSocket("wss://api.deepgram.com/v1/listen", [
          "token",
          process.env.REACT_APP_DEEPGRAM_API_KEY,
      ]);

      deepgramSocket.onopen = () => {
          setStatus("Connected");
          console.log("WebSocket connection established");
      };

      deepgramSocket.onmessage = (message) => {
        const received = JSON.parse(message.data);
        if (received.channel && received.channel.alternatives) {
          const newTranscript = received.channel.alternatives[0].transcript;

          if (newTranscript && received.is_final) {
            setTranscript((prev) => prev + " " + newTranscript); 
            setIsLoading(false); 
            setIsPaused(false); 
          }
        } else {
          console.error("Received message is not in the expected format:", received);
        }
      };

      deepgramSocket.onclose = () => {
          console.log("WebSocket connection closed, trying to reconnect...");
          setTimeout(connectSocket, 2000);
      };

      deepgramSocket.onerror = (error) => {
          console.log("WebSocket error:", error);
      };

      setSocket(deepgramSocket);
    };

    connectSocket();

    return () => {
        socket && socket.close();
    };
  }, []);

  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [transcript]);

  const handleRecordToggle = () => {
    if (!isRecording) {
      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        if (!MediaRecorder.isTypeSupported("audio/webm")) {
          alert("Browser does not support audio/webm recording");
          return;
        }

        const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0 && socket && socket.readyState === 1) {
            setIsLoading(true); 
            socket.send(event.data); 
          }
        };

        recorder.start(1000); 
        setMediaRecorder(recorder);
        setIsRecording(true);
      });
    } else {
      mediaRecorder && mediaRecorder.stop();
      setIsRecording(false);
      setIsLoading(false); 
    }
  };

  const handlePauseToggle = () => {
    if (isRecording) {
      mediaRecorder && mediaRecorder.stop();
      setIsPaused(true);
      setIsLoading(true); 
      setIsRecording(false);
    } else {
      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0 && socket && socket.readyState === 1) {
            socket.send(event.data); 
          }
        };

        recorder.start(1000); 
        setMediaRecorder(recorder);
        setIsRecording(true);
        setIsLoading(false); 
        setIsPaused(false);
      });
    }
  };

  const handleSaveTranscript = () => {
    const title = prompt("Enter a title for the transcription:");
    if (title && transcript) {
      const newTranscript = { title, content: transcript };
      setSavedTranscripts((prev) => [...prev, newTranscript]);
      setTranscript(""); // Clear transcript after saving
      setIsLoading(false);
    } else {
      alert("Please provide a title and ensure there is content to save.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-700 p-6">
      <div className="bg-white bg-opacity-20 backdrop-filter backdrop-blur-xl rounded-3xl shadow-lg p-8 max-w-lg w-full text-white">
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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 1v11m0 0a4 4 0 01-4-4V7a4 4 0 018 0v1a4 4 0 01-4 4zm0 6v3m-4 0h8m-4-3a4 4 0 004-4H8a4 4 0 004 4z"
                />
              </svg>
            )}
          </div>
        </div>

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

        {/* Save Button */}
        <button
          onClick={handleSaveTranscript}
          className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition duration-300 mb-4"
        >
          Save Transcription
        </button>

        {/* Display Saved Transcripts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {savedTranscripts.map((item, index) => (
            <div key={index} className="bg-white bg-opacity-20 p-4 rounded-lg shadow-md text-gray-200">
              <h2 className="text-lg font-semibold">{item.title}</h2>
              <p>{item.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MicrophoneComponent;
