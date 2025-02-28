# psef-tasks-app

A mobile application built with Python-flask, React Native to help members of the Purdue Student Engineering Foundation (PSEF) manage tasks, track progress and receive reminders for upcoming assignments.

# Table of contents
- [Setting up your backend environment](#setting-up-your-backend-environment) 
- [Setting up your frontend environment](#setting-up-your-frontend-environment)
- [Features](#features)
> [!NOTE]  
> For windows machines, change your terminal to bash. Most of these commands are tailored for linux. Some might be different for windows powershell or command prompt.
## Setting up your backend environment
Ensure you have python3 and pip3 installed on your local machine. Checkout [python](python.org) to install python for windows and macOS.

Install pip3 on windows
```
python3 -m pip install --upgrade pip
```

Install pip3 on macOS
```
python3 -m ensurepip --default-pip
```
### Running the backend server
```
cd backend
```
Create a virtual environment. You only need to do this once - when you clone the repo
```
python3 -m venv venv
```
Activate the virtual environment
```
source venv/Scripts/activate
```
Install the latest python3 libraries required for the program
```
pip3 install -r requirements.txt
```
To add new requirements to the requirements.txt
```
pip3 freeze > requirements.txt
```
Run the server
```
python3 run.py
```
> [!NOTE]   
>Check out the postman visual studio code [here](https://learning.postman.com/docs/getting-started/basics/about-vs-code-extension/) and learn about how to use postman to run and test backend api endpoints.

Backend documentation can be found at http://localhost:5000/api/v1/docs. The server needs to be running on your local machine to access the api documentation.
> [!NOTE]   
> The server runs in debug mode so you can make changes to teh backend without having to rebuild the server. Although, if you make errors in the code that persist, the server might automatically shut down and you will have to rebuild it.

> [!IMPORTANT]  
> Ensure to shut down the server when done using it. (Ctrl+C)

## Setting up your frontend environment
Ensure you have npm installed on your local machine. Checkout [Node.js](https://nodejs.org/en) and install the LTS version (Long-Term Support) with default settings

Verifiy installation by checking the node and npm version numbers
```
node -v
npm -v
```

Install Expo CLI for React Native with `npm install -g expo-cli` and verify installation with `expo --version`

### Running the frontend server
```
cd frontend
```

Install the dependencies for the frontend
```
npm install
```
Install the expo go app on the App store/Google store to simulate the frontend when it is running.
> [!IMPORTANT]  
> Before your run the frontend, if your need connectivity between the backend and frontend, you need to ensure the backend is using the right backend server address when making api requests. Do the following to ensure this.

#### Specifying the right backend server address in the frontend
You can get you IPv4 address from the device running the backend server by going to settings and checking the IPv4/IP address.

Alternatively, you could run `ipconfig` in command prompt (for windows) and get the `IPv4 Address` under the under the `Wireless LAN adapter Wi-Fi` section.

For macOS, you can run `ipconfig getifaddr en0` in terminal.

After you get the IP address, navigate to frontend/src/constants/api_cosntants.ts. The `BACKEND_URL` is in the format `http://{IP4_ADDRESS}:5000`. Replace IP4_ADDRESS with the IP Address of your device.

To finally run the frontend server, run `npx expo start`. Scan the QR code on the expo go app for android and scan it on the camera app for iOS.

## Features
### Coordinators
- Create & manage tasks
- Assign/deassign users to/from tasks
- Delete users & revoke access

### Users
- View & manage assigned tasks
- Sign up and drop tasks before task start dates 

### General
- Real-time task updates via Websockets
- Role based access control
- Secure authentication with JWT & Flask-Mail
- Update task statuses (Completed/Incompleted)
- Receive task notifications & reminders (upcoming)
- View task calendar (upcoming)