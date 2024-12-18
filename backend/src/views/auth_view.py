from flask import Blueprint, request, jsonify, Response
from pydantic import ValidationError
from flask_jwt_extended import jwt_required

from src.models.user_model import User
from src.managers import auth_manager
from src.constants.http_status_codes import *

auth = Blueprint("auth", __name__, url_prefix="/api/v1/auth")

@auth.post("/register")
def register():
    try:
        data = request.get_json()

        # Validate required fields
        required_fields = ["email", "password", "first_name", "last_name"]
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return jsonify({"error": f"Missing fields: {', '.join(missing_fields)}"}), HTTP_400_BAD_REQUEST

        user = User(
            email=data.get("email"),
            first_name=data.get("first_name"),
            last_name=data.get("last_name")
        )
        password = data.get("password")
        
        # Attempt to register the user and handle different outcomes
        result = auth_manager.register(user, password)

        if result == "user_exists":
            return jsonify({"error": "User already exists"}), HTTP_409_CONFLICT
        elif result == "email_error":
            return jsonify({"error": "Error sending verification email"}), HTTP_500_INTERNAL_SERVER_ERROR
        elif result == "success":
            return jsonify({"message": "User registered successfully. Prompt to verify email."}), HTTP_201_CREATED
        else:
            return jsonify({"error": "Unknown error"}), HTTP_500_INTERNAL_SERVER_ERROR

    except ValidationError as e:
        return jsonify({"error": e.errors()}), HTTP_422_UNPROCESSABLE_ENTITY
    
    except Exception as e:
        return jsonify({"error": str(e)}), HTTP_500_INTERNAL_SERVER_ERROR


@auth.post("/login")
def login():
    try:
        login_info = request.get_json()
        required_fields = ['email', 'password']
        missing_fields = [field for field in required_fields if field not in login_info]
        if missing_fields:
            return jsonify({'error': f"Missing fields {', '.join(missing_fields)}"}), HTTP_400_BAD_REQUEST
        
        user = User(
            email = login_info.get('email')
        )
        password = login_info.get('password')

        result = auth_manager.login(user, password)
        message = result.get('message')

        if message == 'success':
            access_token = result.get('access_token')
            return jsonify({'message': 'Welcome to your profile', 'access_token': access_token}), HTTP_200_OK
        elif message == 'DNE':
            return jsonify({'error': 'This account owner does not exist'}), HTTP_401_UNAUTHORIZED
        elif message == 'wrong password':
            return jsonify({'error': 'Incorrect password'}), HTTP_401_UNAUTHORIZED
        elif message == 'unverified':
            return jsonify({'error': 'This account has not been verified'}), HTTP_401_UNAUTHORIZED
        else:
            return jsonify({'error': 'Unknown error'}), HTTP_500_INTERNAL_SERVER_ERROR

    except ValidationError as e:
        return jsonify({'error': e.errors()}), HTTP_422_UNPROCESSABLE_ENTITY
    
    except Exception as e:
        return jsonify({'error': str(e)}), HTTP_500_INTERNAL_SERVER_ERROR
    
@auth.post("/logout")
@jwt_required()
def logout():
    return jsonify({"message": "Successfully logged out, destroy the access_token"}), HTTP_200_OK

# enforce frontend logic to call the method as post and change auth_api.yaml
@auth.get("/verify_user/<string:verification_token>/<string:verification_type>")
def verify_user(verification_token, verification_type):
    try:
        auth_manager.verify_user(verification_token, verification_type)

        # Ideally, we should redirect them to the login page
        return Response(status=HTTP_204_NO_CONTENT)
    except Exception as e:
        return jsonify({"error": str(e)}), HTTP_500_INTERNAL_SERVER_ERROR
    
@auth.post("/forgot_password")
def forgot_password():
    try:
        login_info = request.get_json()
        required_fields = ['email']
        missing_fields = [field for field in required_fields if field not in login_info]
        if missing_fields:
            return jsonify({'error': f"Missing fields {', '.join(missing_fields)}"}), HTTP_400_BAD_REQUEST

        login_info = User(
                email = login_info.get('email')
            )
        
        result = auth_manager.forgot_password(login_info)
        message = result['message']

        if message == 'user_exists':
            return jsonify({'message': 'Password reset email sent'}), HTTP_200_OK
        elif message == 'DNE':
            return jsonify({'error': 'This account owner does not exist'}), HTTP_401_UNAUTHORIZED
        elif message == 'unverified':
            return jsonify({'message': 'This account has not been verified. Verify it through the link sent to your email'}), HTTP_401_UNAUTHORIZED
        else:
            return jsonify({'error': 'unknown error'}), HTTP_500_INTERNAL_SERVER_ERROR
    
    except Exception as e:
       return jsonify({'error': str(e)}), HTTP_500_INTERNAL_SERVER_ERROR

@auth.post('/reset_password/<string:reset_token>')
def reset_password(reset_token):
    try:
        reset_info = request.get_json()

        if 'password' not in reset_info:
            return jsonify({'error': f'Missing field: password'}), HTTP_400_BAD_REQUEST
        
        password = reset_info['password']

        result = auth_manager.reset_password(password, reset_token)

        if result == 'success':
            return jsonify({'message': 'Your password has successful been reset'}), HTTP_200_OK
        elif result == 'password is same as the last':
            return jsonify({'message': 'Password cannot be the same as your last password'}), HTTP_409_CONFLICT
        elif result is None:
            return jsonify({'error': 'This link is either invalid or has expired'}), HTTP_400_BAD_REQUEST
        else:
            return jsonify({'error': 'unknown error'}), HTTP_204_NO_CONTENT
    
    except Exception as e:
        return jsonify({'error': str(e)}), HTTP_500_INTERNAL_SERVER_ERROR