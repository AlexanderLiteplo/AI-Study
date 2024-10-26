import React, { useState } from 'react';
import { Menu } from 'lucide-react';

// Logo Component
const Logo = ({ onNavigate }) => (
  <button onClick={() => onNavigate('home')} className="flex items-center gap-2">
    <svg viewBox="0 0 100 100" className="w-10 h-10">
      <path
        d="M50 0 L100 25 L100 75 L50 100 L0 75 L0 25 Z"
        fill="#4834d4"
        stroke="#4834d4"
        strokeWidth="2"
      />
      <path
        d="M30 30 L70 30 L70 70 L30 70 Z"
        fill="white"
        transform="rotate(45 50 50)"
      />
    </svg>
    <span className="text-2xl font-bold text-blue-600">RetainAI</span>
  </button>
);

// Header Component
const Header = ({ onNavigate }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  return (
    <header className="p-4 border-b">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <Logo onNavigate={onNavigate} />
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-blue-600">
          <Menu size={24} />
        </button>
      </div>
    </header>
  );
};

// Home Page
const HomePage = ({ onNavigate }) => (
  <div className="min-h-screen bg-gradient-to-b from-blue-500 to-purple-600 flex flex-col items-center justify-center p-4">
    <h1 className="text-4xl md:text-6xl text-white font-serif text-center mb-8">
      Study Without<br />the Hassle
    </h1>
    <button
      onClick={() => onNavigate('record')}
      className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-8 py-3 rounded-full text-xl transition-all duration-300"
    >
      Record a Lecture
    </button>
  </div>
);

// Record Page
const RecordPage = ({ onNavigate }) => {
  const [transcript, setTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-serif mb-4">Transcript: {new Date().toLocaleDateString()}</h2>
      <div className="border-2 border-blue-600 rounded-lg p-4 min-h-[300px] mb-4">
        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          className="w-full h-full min-h-[280px] resize-none focus:outline-none"
          placeholder="Your transcript will appear here..."
        />
      </div>
      <div className="flex flex-col gap-3">
        <button className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-full transition-colors">
          Edit Transcript
        </button>
        <button
          onClick={() => onNavigate('flashcards')}
          className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-full text-center transition-colors"
        >
          Generate Flash Cards
        </button>
      </div>
    </div>
  );
};

// Flashcards Page
const FlashcardsPage = () => {
  const [cards, setCards] = useState(Array(16).fill({ question: '', answer: '' }));

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {cards.map((card, index) => (
          <div
            key={index}
            className="border-2 border-blue-600 rounded-lg p-4 h-32 flex items-center justify-center"
          >
            <textarea
              className="w-full h-full resize-none focus:outline-none text-center"
              placeholder="Enter card content..."
            />
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-3 items-center">
        <button className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-full transition-colors">
          Edit Flashcards
        </button>
        <button className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-full transition-colors">
          Study Card Set
        </button>
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  const [currentPage, setCurrentPage] = useState('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={setCurrentPage} />;
      case 'record':
        return <RecordPage onNavigate={setCurrentPage} />;
      case 'flashcards':
        return <FlashcardsPage onNavigate={setCurrentPage} />;
      default:
        return <HomePage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header onNavigate={setCurrentPage} />
      {renderPage()}
    </div>
  );
};

export default App;