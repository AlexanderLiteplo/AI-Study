
from flask import abort, jsonify, request
import logging

# from app.content_generation import  
from . import api_bp  # Import the Blueprint

logging.basicConfig(level=logging.INFO)


@api_bp.route('/transcribe', methods=['POST'])
def transcribe():
    '''
    audio file will be passed in
    '''
    

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