# This file is the entry point for the application. 
# It creates the Flask app and registers the blueprints.
from flask import Flask
from flask_cors import CORS
import os
from app.config import Config
from app.routes.api import api_bp

def create_app():
    application = Flask(__name__)
    application.config.from_object(Config)
    application.logger.setLevel(application.config['LOG_LEVEL'])
    
    CORS(application)
    application.static_folder = os.path.abspath('./sounds')
    application.static_url_path = '/sounds'
    application.register_blueprint(api_bp, url_prefix='/api')
    return application
