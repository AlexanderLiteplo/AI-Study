
from flask import abort, jsonify, request
import logging
import google.generativeai as genai
from os import getenv
import os
from supabase import create_client, Client

# from app.content_generation import  
from . import api_bp  # Import the Blueprint

logging.basicConfig(level=logging.INFO)

url_expiry_time = 3600*5 #(5 hours)

@api_bp.route('/prompt', methods=['POST'])
def prompt():
    '''
    input:
    {
        'promptdata': "what does andrew huberman say about fat loss"
    }
    '''
    # ensure the id field is in the request
    data = request.get_json()
    if not all(key in data for key in ['promptdata']):
        abort(400, description="Missing data in request payload")
    

    PROMPT = f'''Please turn this user's search query into a keyword search that will be used to retrieve data from the library of a health podcast.
                 RETURN AS A COMMA SEPERATED LIST ONLY AND NOTHING ELSE. DO NOT RETURN THE NAMES OF PEOPLE UNLESS THE SEARCH TERM IS THEIR NAME.
                
                 Example: 
                 User input: weight loss
                 Your output: weight loss, fat loss protocols
                 Another example: 
                 User input: What does Andrew Huberman say about Vitamin D?
                 Your output: Vitamin D
                 Another example: 
                 User input: What supplements should I take if I have a cold?
                 Your output: treating cold, flu supplements, cold remedies, reducing cold symptoms
                 Another example:
                 User input: What does Andrew Huberman say about sauna?
                 Your output: sauna, sauna duration, sauna benefits, sauna time, sauna protocols, minutes in sauna
                 Another example: 
                 User input: How long should I sauna for?
                 Your output: sauna benefits, sauna time, sauna protocols, minutes in sauna
                 
                 Here is the ACTUAL user prompt: {data['promptdata']}'''
    MODEL = 'gemini-pro'
    # print('** GenAI text: %r model & prompt %r\n' % (MODEL, PROMPT))

    genai.configure(api_key='AIzaSyASZwo5T5jF_uCYHwX_KO_Mds7W9xzgDFU')
    model = genai.GenerativeModel(MODEL)
    response = model.generate_content(PROMPT)
    result = response.text
    
    logging.info(f"Generated content: {result}")
    if result:
        return jsonify({"result": result}), 200
    else:
        abort(500, description="Failed to generate content")

@api_bp.route('/searchtranscripts', methods=['GET'])
def search_transcripts():
    '''
    Endpoint to search transcripts by search term.
    input:
    {
        'search_term': "fat loss"
    }
    '''
    search_term = request.args.get('search_term')  # Get the search term from query parameters
    logging.info(f"Search term: {search_term}")

    url: str = "https://qdebnruvfqxnkpldyaha.supabase.co"
    key: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkZWJucnV2ZnF4bmtwbGR5YWhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTU0ODA0NDQsImV4cCI6MjAzMTA1NjQ0NH0.GMoI3J_CoUHgmrYowNQu_IyuPCnxGcM2iJwBaP6TRlQ"
    supabase = create_client(url, key)

    query_result = []
    try:
        offset = 0
        batch_size = 1000
        more_records = True
        logging.info("Querying the database...")
        # Loop through the database table in chunks of 5
        while more_records:
            logging.info(f"Fetching records {offset} to {offset + batch_size - 1}...")
            result = supabase.table("transcripts") \
                .select("*") \
                .range(offset, offset + batch_size - 1) \
                .execute()
                
            # make a query to the database that is just a sanity check
            
            logging.info(f"Retrieved {len(result.data)} records")
            # Check if any rows contain the search term
            filtered_rows = [row for row in result.data if search_term.lower() in row['text'].lower()]
            query_result.extend(filtered_rows)

            # Update the offset to get the next chunk
            offset += batch_size

            # Determine if there are more records to fetch
            more_records = len(result.data) == batch_size

        logging.info(f"Query results matching term '{search_term}': {query_result}")

    except Exception as e:
        logging.error(f"Error querying the database: {e}")
        abort(500, description=str(e))

    return jsonify(query_result), 200