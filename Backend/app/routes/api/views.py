from flask import abort, jsonify, request
import logging
from openai import OpenAI
import os
import json
from notes import get_notes
import random

# from app.content_generation import  
from . import api_bp  # Import the Blueprint

logging.basicConfig(level=logging.INFO)

@api_bp.route('/transcribe', methods=['POST'])
def transcribe():
    '''
    Audio file will be passed in
    '''
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    if file:
        try:
            # Save the file temporarily
            temp_path = f"/tmp/{file.filename}"
            file.save(temp_path)
            
            # Open the file in binary mode
            with open(temp_path, "rb") as audio_file:
                transcription = client.audio.transcriptions.create(
                    model="whisper-1", 
                    file=audio_file
                )
            
            # Remove the temporary file
            os.remove(temp_path)
            
            logging.info(f"Transcript: {transcription.text}")
            # print the number of words in the transcript
            logging.info(f"Number of words: {len(transcription.text.split())}")
            return jsonify({"transcript": transcription.text}), 200
        except Exception as e:
            logging.error(f"Error during transcription: {str(e)}")
            return jsonify({"error": "Transcription failed"}), 500

# Test: curl -X POST -H "Content-Type: multipart/form-data" -F "file=@/test_files/yc.mp3" http://localhost:5001/api/transcribe

@api_bp.route('/flashcards', methods=['POST'])
def flashcards():
    '''
    input:
    {
        "notes": "string"
    }
    '''
    notes = request.json.get('notes')
    
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    
    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": """You are a flashcard text maker. 
                You are given a text and you must make flashcards for it of any memorizable concepts or facts.
                You must reply in only json format with a list of flashcards.
                Flashcards must be of the format: {"term": "front of card", "definition": "back of card"}.
                The list should be of the format: {"card_list": [{"term": "front of card", "definition": "back of card"}, ...]}
                Reply with the json list and nothing else."""},
                {"role": "user", "content": f"Here is the text to make json flashcards for: {notes}"}
            ]
        )
        
        # Extract the JSON content from the response
        flashcards_json = json.loads(response.choices[0].message.content)
        logging.info(f"Flashcards: {flashcards_json}")
        # Convert the JSON to a list of tuples
        flashcards_list = [(card['term'], card['definition']) for card in flashcards_json['card_list']]
        
        return jsonify({"flashcards": flashcards_list}), 200
    except Exception as e:
        logging.error(f"Error generating flashcards: {str(e)}")
        return jsonify({"error": "Failed to generate flashcards"}), 500

@api_bp.route('/notes', methods=['POST'])
def notes():
    '''
    input will be a transcript
    {
        "transcript": "string"
    }
    '''
    transcript = request.json.get('transcript')
    if not transcript:
        return jsonify({"error": "No transcript provided"}), 400
    try:
        response = get_notes(transcript)
        notes = response.text

        # Preserve formatting by using json.dumps with ensure_ascii=False
        formatted_notes = json.dumps({"notes": notes}, ensure_ascii=False)

        logging.info(f"Generated notes: {notes}")  # Log first 100 characters
        return formatted_notes, 200, {'Content-Type': 'application/json; charset=utf-8'}
    except Exception as e:
        logging.error(f"Error generating notes: {str(e)}")
        return jsonify({"error": "Failed to generate notes"}), 500

#curl -X POST http://localhost:5001/api/notes   -H "Content-Type: application/json"   -d @../transcript_example.json

@api_bp.route('/random-sound', methods=['GET'])
def random_sound():
    sounds_folder = './sounds'
    sound_files = [f for f in os.listdir(sounds_folder) if f.endswith('.mp3')]
    
    if not sound_files:
        return jsonify({"error": "No sound files found"}), 404
    
    random_sound = random.choice(sound_files)
    return jsonify({"sound": random_sound}), 200
