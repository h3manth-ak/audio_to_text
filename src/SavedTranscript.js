import { useNavigate, useLocation } from "react-router-dom";

const SavedTranscript = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Correctly destructure savedTranscripts with a fallback
  const savedTranscripts = location.state?.savedTranscripts || [];
  console.log("Location state:", location.state);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-700 p-6">
      <div className="bg-white bg-opacity-20 backdrop-filter backdrop-blur-xl rounded-3xl shadow-lg p-8 max-w-lg w-full text-white">
        <h1 className="text-3xl font-semibold text-center mb-6">
          Saved Transcripts
        </h1>
        {savedTranscripts.length > 0 ? (
          savedTranscripts.map((transcript, index) => (
            <div key={index} className="mb-4 p-4 border border-gray-500 rounded">
              <h2 className="text-lg font-semibold">{transcript.title || "Transcript Title"}</h2>
              <p className="text-gray-300">{transcript.content || "No content available."}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-300">No saved transcripts yet.</p>
        )}
        <button
          onClick={() => navigate("/")}
          className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition duration-300 mt-4"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default SavedTranscript;
