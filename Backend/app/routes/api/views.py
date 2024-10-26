from flask import abort, jsonify, request
import logging
from openai import OpenAI
import os

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
