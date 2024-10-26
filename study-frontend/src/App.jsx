import { useState, useRef } from 'react';

const StudyApp = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [notes, setNotes] = useState('');
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/mp3' });
        
        setLoading(true);
        setError('');
        try {
          const formData = new FormData();
          formData.append('file', audioBlob, 'recording.mp3');

          const response = await fetch('http://localhost:5001/api/transcribe', {
            method: 'POST',
            body: formData,
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Transcription failed');
          }
          
          const data = await response.json();
          setTranscription(data.transcript);
        } catch (error) {
          setError(error.message);
          console.error('Transcription error:', error);
        }
        setLoading(false);
      };

      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (error) {
      setError('Error accessing microphone: ' + error.message);
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    mediaRecorder.current?.stop();
    setIsRecording(false);
  };

  const convertToNotes = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:5001/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcript: transcription }), // Changed to match API request format
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate notes');
      }

      const data = await response.json();
      setNotes(data.notes);
    } catch (error) {
      setError(error.message);
      console.error('Notes generation error:', error);
    }
    setLoading(false);
  };

  const createFlashcards = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:5001/api/flashcards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notes }), // Changed to match API request format
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate flashcards');
      }

      const data = await response.json();
      setFlashcards(data.flashcards.map(([term, definition]) => ({
        question: term,
        answer: definition
      }))); // Transform the array format to object format for rendering
    } catch (error) {
      setError(error.message);
      console.error('Flashcard generation error:', error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold mb-6">Study Assistant</h1>
          
          {/* Error Display */}
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          
          {/* Recording Controls */}
          <div className="mb-6">
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Start Recording
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Stop Recording
              </button>
            )}
          </div>

          {/* Transcription Section */}
          {transcription && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Transcription</h2>
              <div className="bg-gray-50 p-4 rounded">
                {transcription}
              </div>
              <button
                onClick={convertToNotes}
                className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                disabled={loading}
              >
                Convert to Notes
              </button>
            </div>
          )}

          {/* Notes Section */}
          {notes && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Notes</h2>
              <div className="bg-gray-50 p-4 rounded whitespace-pre-wrap">
                {notes}
              </div>
              <button
                onClick={createFlashcards}
                className="mt-4 bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
                disabled={loading}
              >
                Create Flashcards
              </button>
            </div>
          )}

          {/* Flashcards Section */}
          {flashcards.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Flashcards</h2>
              <div className="space-y-4">
                {flashcards.map((card, index) => (
                  <div key={index} className="border p-4 rounded">
                    <div className="font-semibold mb-2">Q: {card.question}</div>
                    <div>A: {card.answer}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Loading Indicator */}
          {loading && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-4 rounded">
                Processing...
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudyApp;
