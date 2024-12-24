import uuid
import os
import bcrypt
from flask import current_app
from flask_jwt_extended import create_access_token
from itsdangerous import URLSafeTimedSerializer, SignatureExpired, BadSignature
from flask_mail import Message
from datetime import datetime, timedelta

from src.models.user_model import User
from src.dals import user_dal


EMAIL_SENDER = os.environ.get("PSEF_TASKS_EMAIL")
SECRET_KEY = os.environ.get("SECRET_KEY")
EMAIL_VERIFICATION_SECURITY_SALT = os.environ.get("EMAIL_VERIFICATION_SECURITY_SALT")

serializer = URLSafeTimedSerializer(SECRET_KEY)

def register(user: User, password):

    # Check if user already exists
    if user_dal.check_user_exists_by_email(user.email):
        return "user_exists"
    
    try:
        user_id = uuid.uuid4()
        
        salt = bcrypt.gensalt()
        hash_password = bcrypt.hashpw(
            password = password.encode("utf-8"),
            salt = salt
        )

        user.user_id = user_id
        user.password_hash = hash_password.decode("utf-8")

        user_dal.register(user)
        response = send_verification_email(user)

        if response == "error":
            return "email_error"

        return "success"
    
    except Exception as e:
        # Handle other exceptions
        print(f"Error during registration: {str(e)}")
        return "error"

def login(user: User, password: str):
    result = {"message": None, "access_token": None}

    try:
        if user_dal.check_user_exists_by_email(user.email):
            user_record = user_dal.get_user_by_email(user.email)
        
        else:
            result["message"] = 'DNE'
            return result
            
        # Check if the user is verified
        if not user_record.verified:
            result["message"] = 'unverified'
            return result

        if bcrypt.checkpw(password=password.encode(), hashed_password=user_record.password_hash.encode()):
            result["message"] = 'success'
            access_token = create_access_token(identity=user_record.user_id)
            result["access_token"] = access_token
            return result
        else:
            result["message"] = 'wrong password'
            return result
        
    except Exception as e:
        print(f'Error occured while logging in: {str(e)}')
        return 'error'

def send_verification_email(user: User):
    verification_expiry_datetime = datetime.now() + timedelta(days=1)
    formatted_datetime = verification_expiry_datetime.strftime("%B %d, %Y at %I:%M %p")

    # Generate verification token containing user_id
    verification_token = serializer.dumps(str(user.user_id), salt=EMAIL_VERIFICATION_SECURITY_SALT)

    # Create verification link
    verification_link = f'http://localhost:5000/api/v1/auth/verify_user/{verification_token}'

    mail = current_app.extensions.get('mail')
    if not mail:
        print("Mail not configured")
        return "error"

    msg = Message(
        subject='Verify your email', 
        sender=EMAIL_SENDER,
        recipients=[user.email]
    )

    print(msg)
    msg.html = f"""
        <html>
        <head>
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 0;
                }}
                .container {{
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }}
                .header {{
                    text-align: center;
                    background-color: #2d2d2d;
                    color: #ffffff;
                    padding: 10px 0;
                    font-size: 24px;
                    font-weight: bold;
                    border-radius: 8px 8px 0 0;
                }}
                .content {{
                    margin: 20px 0;
                    text-align: center;
                }}
                .content p {{
                    font-size: 16px;
                    margin: 10px 0;
                }}
                .btn {{
                    display: inline-block;
                    padding: 12px 24px;
                    margin: 10px 5px;
                    border-radius: 5px;
                    text-decoration: none;
                    font-size: 16px;
                    user-select: none;
                    cursor: pointer;
                }}
                .btn-confirm {{
                    background-color: #28a745;
                    color: #ffffff;
                }}
                .btn-cancel {{
                    background-color: #dc3545;
                    color: #ffffff;
                }}
                .footer {{
                    font-size: 12px;
                    color: #888888;
                    text-align: center;
                    margin-top: 20px;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    PSEF TASK TRACKER
                </div>
                <div class="content">
                    <h2>Verify Your Email Address</h2>
                    <p>{user.email}</p>
                    <p>Hi {user.first_name},</p>
                    <p>As an extra security measure, please verify this is the correct email address for your account.</p>
                    <a href="{verification_link}/true" class="btn btn-confirm">CONFIRM EMAIL</a>
                    <a href="{verification_link}/false" class="btn btn-cancel">THIS ISN'T MY ACCOUNT</a>
                    <p>If you don't recognize this account, let us know above and we'll handle the safety concern.</p>
                </div>
                <div class="footer">
                    <p>This email is valid until {formatted_datetime}.</p>
                </div>
            </div>
        </body>
        </html>
    """

    try:
        mail.send(msg)
    except Exception as e:
        return "error"
    
    return "success"

def verify_user(verification_token, verification_type):
    # The user didn't make the account
    if verification_type == "false":
        decoded_user_id = serializer.loads(verification_token, salt=EMAIL_VERIFICATION_SECURITY_SALT)
        # Delete the user from the database
        user_dal.delete_user(decoded_user_id)

    # The user made the account, but check if the token is valid or not
    elif verification_type == "true":
        try:
            decoded_user_id = serializer.loads(verification_token, salt=EMAIL_VERIFICATION_SECURITY_SALT, max_age=86400)
            user_dal.verify_user(decoded_user_id)
            # send them email that they have been successfully verified
            user: User = user_dal.get_user_by_id(decoded_user_id)
 
            mail = current_app.extensions.get('mail')
            if not mail:
                print("Mail not configured")
                return

            print("Mail configured")

            msg = Message(
                subject='Email Verification Successful', 
                sender=EMAIL_SENDER,
                recipients=[user.email]
            )

            print(msg)

            msg.html = f"""
                <html>
                <head>
                    <style>
                        body {{
                            font-family: Arial, sans-serif;
                            background-color: #f4f4f4;
                            margin: 0;
                            padding: 0;
                        }}
                        .container {{
                            max-width: 600px;
                            margin: 0 auto;
                            background-color: #ffffff;
                            padding: 20px;
                            border-radius: 8px;
                            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                        }}
                        .header {{
                            text-align: center;
                            background-color: #2d2d2d;
                            color: #ffffff;
                            padding: 10px 0;
                            font-size: 24px;
                            font-weight: bold;
                            border-radius: 8px 8px 0 0;
                        }}
                        .content {{
                            margin: 20px 0;
                            text-align: center;
                        }}
                        .content p {{
                            font-size: 16px;
                            margin: 10px 0;
                        }}
                        .footer {{
                            font-size: 12px;
                            color: #888888;
                            text-align: center;
                            margin-top: 20px;
                        }}
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            PSEF TASK TRACKER
                        </div>
                        <div class="content">
                            <h2>Email Address Verified</h2>
                            <p>{user.email}</p>
                            <p>Hi {user.first_name},</p>
                            <p>Congratulations! Your email address has been successfully verified for your account.</p>
                        </div>
                        <div class="footer">
                            <p>Thank you for using PSEF TASK TRACKER.</p>
                        </div>
                    </div>
                </body>
                </html>
            """

            mail.send(msg)


        except Exception as e:
            # resend a verification email
            decoded_user_id = serializer.loads(verification_token, salt=EMAIL_VERIFICATION_SECURITY_SALT)
            user: User = user_dal.get_user_by_id(decoded_user_id)
            send_verification_email(user)

def forgot_password(login_info: User):
    result = {'message': None, 'access_token': None}

    try:
        if user_dal.check_user_exists_by_email(login_info.email):
            result['message'] = 'user_exists'
            user = user_dal.get_user_by_email(login_info.email)
        else:
            result['message'] = 'DNE'

        # Send password reset email 
        if result['message'] == 'user_exists':

            # Resend the email verification if user is not verified
            if not user.verified:
                result['message'] = 'unverified'
            else:
                # Should be redirected to reset password page
                send_reset_email(user)

    except Exception as e:
        result['message'] = 'error'
    
    return result

def send_reset_email(user: User):
    reset_token_expiry_datetime = datetime.now() + timedelta(days=1)
    formatted_datetime = reset_token_expiry_datetime.strftime('%B %d, %Y at %I:%M %p')

    # Generate reset token containing user_id
    reset_token = serializer.dumps(str(user.user_id), salt=EMAIL_VERIFICATION_SECURITY_SALT)

    # Need actual reset_password link
    reset_link = f'http://localhost:5000/api/v1/auth/reset_password/{reset_token}'

    mail = current_app.extensions.get('mail')
    if not mail:
        print('Mail not configured')

    msg = Message(
        subject='Reset your password',
        sender=EMAIL_SENDER,
        recipients=[user.email]
    )
    msg.html = f"""
        <html>
        <head>
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 0;
                }}
                .container {{
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }}
                .header {{
                    text-align: center;
                    background-color: #2d2d2d;
                    color: #ffffff;
                    padding: 10px 0;
                    font-size: 24px;
                    font-weight: bold;
                    border-radius: 8px 8px 0 0;
                }}
                .content {{
                    margin: 20px 0;
                    text-align: center;
                }}
                .content p {{
                    font-size: 16px;
                    margin: 10px 0;
                }}
                .btn {{
                    display: inline-block;
                    padding: 12px 24px;
                    margin: 10px 5px;
                    border-radius: 5px;
                    text-decoration: none;
                    font-size: 16px;
                    user-select: none;
                    cursor: pointer;
                }}
                .btn-confirm {{
                    background-color: #28a745;
                    color: #ffffff;
                }}
                .footer {{
                    font-size: 12px;
                    color: #888888;
                    text-align: center;
                    margin-top: 20px;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    PSEF TASK TRACKER
                </div>
                <div class="content">
                    <h2>Reset your password</h2>
                    <p>{user.email}</p>
                    <p>Hi {user.first_name},</p>
                    <p>To reset your password, click on the link below</p>
                    <a href="{reset_link}" class="btn btn-confirm">RESET PASSWORD</a>
                    <p>If you did not request to reset your password, please ignore this email</p>
                </div>
                <div class="footer">
                    <p>This email is valid until {formatted_datetime}.</p>
                </div>
            </div>
        </body>
        </html>
    """

    try:
        mail.send(msg)
    except Exception as e:
        return 'error'
    
    return 'success'

def reset_password(password, reset_token):
    try:
        user_id = serializer.loads(reset_token, salt=EMAIL_VERIFICATION_SECURITY_SALT, max_age=86400)
        
        # Hash the password
        salt = bcrypt.gensalt()
        password_hash = bcrypt.hashpw(
            password = password.encode('utf-8'),
            salt = salt
        )

        provided_password_hash = password_hash.decode('utf-8')
        
        user = user_dal.get_user_by_id(user_id)

        # Check if password is the same as current password
        if bcrypt.checkpw(password=password.encode(), hashed_password=user.password_hash.encode()):
            return 'password is same as the last'
    
        user_dal.update_user_password(user_id, provided_password_hash)

        mail = current_app.extensions.get('mail')
        if not mail:
            print('Mail not configured')
        
        # Need actual login page link
        login_link = 'this is a fake string'
        
        msg = Message(
            subject='Password Reset Successful',
            sender=EMAIL_SENDER,
            recipients=[user.email]
        )

        msg.html = f"""
            <html>
            <head>
                <style>
                    body {{
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        margin: 0;
                        padding: 0;
                    }}
                    .container {{
                        max-width: 600px;
                        margin: 0 auto;
                        background-color: #ffffff;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    }}
                    .header {{
                        text-align: center;
                        background-color: #2d2d2d;
                        color: #ffffff;
                        padding: 10px 0;
                        font-size: 24px;
                        font-weight: bold;
                        border-radius: 8px 8px 0 0;
                    }}
                    .content {{
                        margin: 20px 0;
                        text-align: center;
                    }}
                    .content p {{
                        font-size: 16px;
                        margin: 10px 0;
                    }}
                    .footer {{
                        font-size: 12px;
                        color: #888888;
                        text-align: center;
                        margin-top: 20px;
                    }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        PSEF TASK TRACKER
                    </div>
                    <div class="content">
                        <h2>Password Reset</h2>
                        <p>{user.email}</p>
                        <p>Hi {user.first_name},</p>
                        <p>Your password has been successfully reset.</p>
                        <p>Click <a href='{login_link}'>here<a> to login.</p>
                    </div>
                    <div class="footer">
                        <p>Thank you for using PSEF TASK TRACKER.</p>
                    </div>
                </div>
            </body>
            </html>
        """

        mail.send(msg)
    # Should be redirected to login page
    except SignatureExpired:
        return None
    
    # Should be redirected to login page
    except BadSignature:
        return None

    except Exception:
        return 'error'
    
    return 'success'