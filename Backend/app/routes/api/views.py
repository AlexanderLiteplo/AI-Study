from flask import abort, jsonify, request
import logging
import openai
import os

# from app.content_generation import  
from . import api_bp  # Import the Blueprint

logging.basicConfig(level=logging.INFO)

# Set up OpenAI client
openai.api_key = os.environ.get("OPENAI_API_KEY")

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
    from openai import OpenAI
    client = OpenAI()

    audio_file= open("/test_files/yc.mp3", "rb")
    transcription = client.audio.transcriptions.create(
        model="whisper-1", 
        file=audio_file
    )
    print(transcription.text)
    if file:
        try:
            # Call OpenAI's transcription API
            transcript = openai.Audio.transcribe("whisper-1", file)
            logging.info(f"Transcript: {transcript['text']}")
            return jsonify({"transcript": transcript['text']}), 200
        except Exception as e:
            logging.error(f"Error during transcription: {str(e)}")
            return jsonify({"error": "Transcription failed"}), 500

# Test: curl -X POST -H "Content-Type: multipart/form-data" -F "file=@/test_files/yc.mp3" http://localhost:5001/api/transcribe


@api_bp.route('/notes', methods=['POST'])
def notes():
    '''
    input will be a transcript
    {
        "transcript": "string"
    }
    '''
    # fetch transcript from request
    transcript = request.json.get('transcript')
    notes = ""
    # make stub return
    return jsonify({"notes": notes}), 200
