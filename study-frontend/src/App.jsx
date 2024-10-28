import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import VoiceComponent from './VoiceComponent';
import axios from 'axios';  // Add this import at the top of the file

const StudyApp = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [notes, setNotes] = useState('');
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);
  const [uploadedFile, setUploadedFile] = useState(null);
  const fileInputRef = useRef(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [soundFiles, setSoundFiles] = useState([]);
  const audioRef = useRef(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [showImage, setShowImage] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  useEffect(() => {
    // Fetch the list of sound files from the server
    fetch('http://localhost:5001/api/sounds')
      .then(response => response.json())
      .then(data => setSoundFiles(data.sounds))
      .catch(error => console.error('Error fetching sound files:', error));
  }, []);

  useEffect(() => { 
    // This is a simulated list of sound files
    // In a real scenario, you might want to generate this list dynamically
    setSoundFiles([
      'sound1.mp3',
      'sound2.mp3',
      'sound3.mp3',
      'sound4.mp3',
      'sound5.mp3',
      'sound6.mp3',
    ]);
  }, []);

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

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'audio/mpeg') {
      setUploadedFile(file);
    } else {
      setError('Please upload a valid MP3 file.');
    }
  };

  const transcribeUploadedFile = async () => {
    if (!uploadedFile) {
      setError('Please upload an MP3 file first.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);

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

  const handleTranscriptionChange = (event) => {
    setTranscription(event.target.value);
  };

  const nextCard = () => {
    setCurrentCardIndex((prevIndex) => (prevIndex + 1) % flashcards.length);
    setShowAnswer(false);
    setClickCount((prevCount) => prevCount + 1);
    
    if (clickCount % 3 === 2) { // Every 3rd click (0, 1, 2, 3, 4, 5, ...)
      playRandomSound();
      setCurrentImage(getRandomImage());
      setShowImage(true);
      
      // Set a timeout to hide the image after 5 seconds
      setTimeout(() => {
        setShowImage(false);
      }, 5000);
    } else {
      setShowImage(false);
    }
  };

  const previousCard = () => {
    setCurrentCardIndex((prevIndex) => (prevIndex - 1 + flashcards.length) % flashcards.length);
    setShowAnswer(false);
  };

  const flipCard = () => {
    setShowAnswer(!showAnswer);
  };

  const playRandomSound = () => {
    if (soundFiles.length > 0) {
      const randomSound = soundFiles[Math.floor(Math.random() * soundFiles.length)];
      const audio = new Audio(`/sounds/${randomSound}`);
      audio.play().catch(error => console.error('Error playing sound:', error));
    }
  };

  const getRandomImage = () => {
    const images = ['image1.png', 'image2.png'];
    return images[Math.floor(Math.random() * images.length)];
  };

  return (
    <div className="container">
      
      {/* <VoiceComponent/> */}

      <div className="card">
        <h1>Study Assistant</h1>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <div className="input-group">
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="btn-primary"
            >
              Start Recording
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="btn-danger"
            >
              Stop Recording
            </button>
          )}
        </div>

        <div className="input-group">
          <input
            type="file"
            accept=".mp3,audio/mpeg"
            onChange={handleFileUpload}
            ref={fileInputRef}
            className="hidden"
            style={{ display: 'none' }}
          />
          <button
            onClick={() => fileInputRef.current.click()}
            className="btn-secondary"
          >
            Upload MP3
          </button>
          {uploadedFile && (
            <span className="text-light">
              {uploadedFile.name}
            </span>
          )}
        </div>

        {uploadedFile && (
          <button
            onClick={transcribeUploadedFile}
            className="btn-primary"
          >
            Transcribe Uploaded File
          </button>
        )}

        {transcription && (
          <div className="card transcription-card">
            <h2>Transcription</h2>
            <div className="transcription-content">
              <textarea
                value={transcription}
                onChange={handleTranscriptionChange}
                className="transcription-textarea"
                rows={10}
                placeholder="Your transcription will appear here. Feel free to edit any mistakes."
              />
            </div>
            <button
              onClick={convertToNotes}
              className="btn-secondary"
              disabled={loading}
            >
              Convert to Notes
            </button>
          </div>
        )}

        {notes && (
          <div className="card">
            <h2>Notes</h2>
            <div className="notes-content">
              <ReactMarkdown>{notes}</ReactMarkdown>
            </div>
            <button
              onClick={createFlashcards}
              className="btn-accent"
              disabled={loading}
            >
              Create Flashcards
            </button>
          </div>
        )}

        {flashcards.length > 0 && (
          <div className="card">
            <h2>Flashcards</h2>
            <div className="flashcard-container">
              <div 
                className="flashcard" 
                onClick={flipCard}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  textAlign: 'center',
                  height: '300px',
                }}
              >
                {showImage && currentImage && (
                  <img 
                    src={`/images/${currentImage}`} 
                    alt="Random study image" 
                    style={{
                      maxWidth: '100%',
                      maxHeight: '150px',
                      marginBottom: '10px'
                    }}
                  />
                )}
                {showAnswer ? (
                  <div className="flashcard-question">
                    <strong>A:</strong> {flashcards[currentCardIndex].answer}
                  </div>
                ) : (
                  <div className="flashcard-question">
                    <strong>Q:</strong> {flashcards[currentCardIndex].question}
                  </div>
                )}
              </div>
              <div className="flashcard-navigation" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                <button onClick={previousCard} className="btn-secondary">Previous</button>
                <span>{currentCardIndex + 1} / {flashcards.length}</span>
                <button onClick={nextCard} className="btn-secondary">
                  Complete <span role="img" aria-label="check mark">✅</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="loading-overlay">
            <div className="loading-content">
              Processing...
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyApp;
