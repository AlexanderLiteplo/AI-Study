import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_KEY = 'YOUR_OPENAI_API_KEY';
const openai = axios.create({
  baseURL: 'https://api.openai.com/v1',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY}`,
  },
});

const getOpenAIResponse = async (prompt) => {
  const response = await openai.post('/completions', {
    model: 'gpt-3.5-turbo',
    prompt: prompt,
    max_tokens: 100,
  });
  return response.data

}

const VoiceComponent = () => {
  const [text, setText] = useState('');
  const [response, setResponse] = useState('');

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            setText((prevText) => prevText + event.results[i][0].transcript);
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
      };

      recognition.onerror = (event) => {
        console.error(event.error);
      };

      recognition.onend = () => {
        getOpenAIResponse(text).then((aiResponse) => {
          setResponse(aiResponse.choices[0].text);
        });
      };

      recognition.start();
    } else {
      alert('Speech Recognition not supported in this browser.');
    }
  }, [text]);

  return (
    <div>
      <h1>Speak to ChatGPT</h1>
      <p>Transcript: {text}</p>
      <p>Response: {response}</p>
    </div>
  );
};

export default VoiceComponent;
