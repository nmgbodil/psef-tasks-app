from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS, cross_origin
from flask_jwt_extended import JWTManager
from flask_swagger_ui import get_swaggerui_blueprint
from flask_mail import Mail
import os
import atexit
import datetime
from dotenv import load_dotenv

from src.views.auth_view import auth
from src.views.task_view import task
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
    
    # Configure gmail client for sending emails
    app.config['MAIL_SERVER'] = 'smtp.gmail.com'
    app.config['MAIL_PORT'] = 587
    app.config['MAIL_USERNAME'] = os.environ.get("PSEF_TASKS_EMAIL")
    app.config['MAIL_PASSWORD'] = os.environ.get("PSEF_TASKS_EMAIL_PASSWORD")
    app.config['MAIL_USE_TLS'] = True
    app.config['MAIL_USE_SSL'] = False
    mail = Mail(app)

    # App Blueprints
    app.register_blueprint(auth)
    app.register_blueprint(task)

    # Configure Swagger UI for api documentation
    SWAGGER_URL = '/api/v1/docs'
    API_FILES = [
        {'name': 'auth', 'url': '/static/auth_api.yaml', 'prefix': f'{SWAGGER_URL}/auth'},
        {'name': 'task', 'url': '/static/task_api.yaml', 'prefix': f'{SWAGGER_URL}/task'}
    ]

    for api_file in API_FILES:
        swagger_blueprint = get_swaggerui_blueprint(
            api_file['prefix'], api_file['url'],
            config={'app_name': f"PSEF Task Tracker {api_file['name'].capitalize()} API"}
        )
        swagger_blueprint.name = f"swagger_ui_{api_file['name']}"
        app.register_blueprint(swagger_blueprint, url_prefix=api_file['prefix'])

    @app.route('/static/<path:filename>')
    def serve_static(filename):
        return send_from_directory('src/static', filename)

    @atexit.register
    def app_shutdown_cleanup():
        sync_db_util.close_all_connections()

    @app.get("/")
    def hello():
        return "Hello World, welcome to PSEF TASKS TRACKER backend!"
    
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
