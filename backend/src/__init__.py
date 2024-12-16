from flask import Flask, jsonify
from flask_cors import CORS, cross_origin
import os
import atexit
from flask_jwt_extended import JWTManager
from flask_swagger_ui import get_swaggerui_blueprint
import datetime
from flask_mail import Mail
from dotenv import load_dotenv

from src.views.auth_view import auth
from src.utils.db import sync_connect_db_example, sync_db_util
from src.constants.http_status_codes import HTTP_404_NOT_FOUND, HTTP_500_INTERNAL_SERVER_ERROR

#  Load variables from the .env file
load_dotenv()

def create_app(test_config=None):

    app = Flask(__name__, instance_relative_config=True)
    CORS(app)   
 
    if test_config is None:
        app.config.from_mapping(
            SECRET_KEY=os.environ.get("SECRET_KEY"),
            JWT_SECRET_KEY=os.environ.get("JWT_SECRET_KEY"),
            JWT_ACCESS_TOKEN_EXPIRES=datetime.timedelta(minutes=30),
        )
    else:
        app.config.from_mapping(test_config)

    # Configure JWT manager
    jwt = JWTManager(app)
    
    # # Configure gmail client for sending emails
    # app.config['MAIL_SERVER'] = 'smtp.gmail.com'
    # app.config['MAIL_PORT'] = 587
    # app.config['MAIL_USERNAME'] = os.environ.get("WAHALA_COMMS_EMAIL")
    # app.config['MAIL_PASSWORD'] = os.environ.get("WAHALA_COMMS_EMAIL_PASSWORD")
    # app.config['MAIL_USE_TLS'] = True
    # app.config['MAIL_USE_SSL'] = False
    # mail = Mail(app)

    # # Configure Swagger UI for api documentation
    # SWAGGER_URL = '/api/v1/docs'
    # API_URL = '/static/openapi.yaml'

    # # Call factory function to create our blueprint
    # swaggerui_blueprint = get_swaggerui_blueprint(
    #     SWAGGER_URL,
    #     API_URL
    # )

    # App Blueprints
    app.register_blueprint(auth)
    # app.register_blueprint(swaggerui_blueprint)

    @atexit.register
    def app_shutdown_cleanup():
        sync_db_util.close_all_connections()

    @app.get("/")
    def hello():
        return "Hello World, welcome to Wahala App backend!"
    
    @app.get("/testdb/<string:connectionType>")
    def testDB(connectionType):
        if connectionType == "sync":
            return jsonify(sync_connect_db_example.get_db_info())
        elif connectionType == "async":
            return "Async connection not yet implemented."
        else:
            return "Invalid connection type. Please use 'sync' or 'async'."
        
    @app.errorhandler(HTTP_404_NOT_FOUND)
    def handle_404(e):
        return jsonify({'error': 'Not found'}), HTTP_404_NOT_FOUND

    @app.errorhandler(HTTP_500_INTERNAL_SERVER_ERROR)
    def handle_500(e):
        return jsonify({'error': 'Something went wrong, we are working on it'}), HTTP_500_INTERNAL_SERVER_ERROR
    
    return app
