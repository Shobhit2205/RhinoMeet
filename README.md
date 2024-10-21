# RhinoMeet

[![GitHub license](https://img.shields.io/github/license/Shobhit2205/RhinoMeet)](https://github.com/Shobhit2205/RhinoMeet/blob/main/LICENSE)
[![GitHub issues](https://img.shields.io/github/issues/Shobhit2205/RhinoMeet)](https://github.com/Shobhit2205/RhinoMeet/issues)
[![GitHub stars](https://img.shields.io/github/stars/Shobhit2205/RhinoMeet)](https://github.com/Shobhit2205/RhinoMeet/stargazers)
![Node.js](https://img.shields.io/badge/Node.js-8CC84A?style=flat&logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)
![WebRTC](https://img.shields.io/badge/WebRTC-33B4D9?style=flat&logo=webrtc&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=flat&logo=socketdotio&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)

RhinoMeet is a WebRTC-based video chat application inspired by Omegle. It allows users to connect and communicate in real-time via audio, video, and text chat. The application leverages WebSockets for signaling and WebRTC for media transmission between peers. Users can join random video chats with other connected users, enjoy features like screen sharing, skipping users, and real-time text messaging.

## Features

- **Real-time video and audio chat**: Connect instantly with peers using WebRTC technology for seamless communication.
- **Random user matching**: Enjoy the spontaneity of random pairing, just like Omegle, for engaging video chat sessions.
- **Screen sharing**: Share your screen with the connected user during your conversation for added interactivity.
- **Text messaging**: Send and receive real-time messages while on a video chat for a complete chat experience.
- **Skip functionality**: Easily skip the current user and connect with a new one in seconds.
- **Peer-to-peer connection**: High-quality, efficient media transmission powered by WebRTC for smooth video and audio calls.
- **Echo cancellation and noise suppression**: Built-in browser features ensure crisp and clear audio without background noise or echoes.

## Installation

To install and run this project locally, follow these steps:

1. Clone the repository:

    ```bash
    git clone https://github.com/Shobhit2205/RhinoMeet.git
    ```

2. Navigate to the folder:

    ```bash
    cd RhinoMeet
    ```

### Backend Setup

1. Install dependencies:

    ```bash
    cd server
    npm install
    ```

2. Set up environment variables:

   ```bash
    cp .env.example .env
    ```

3. Start the backend server:

    ```bash
    npm run start:dev
    ```

    The server should now be running on [http://localhost:8000](http://localhost:8000).

### Frontend Setup

1. Install dependencies:

    ```bash
    cd client
    npm install
    ```

2. Set up environment variables:

    ```bash
    cp .env.example .env
    ```

3. Start the frontend:

    ```bash
    npm run dev
    ```

    The client should now be running on [http://localhost:5173](http://localhost:5173).

## Usage

1. Open your browser and navigate to the frontend of your application.
2. Once connected, the application will randomly match you with another online user.
3. You can engage in video chat, share your screen, send messages, and skip users.

## Contributing

1. Fork the repository.
2. Create a new branch:

    ```bash
    git checkout -b feature/your-feature
    ```

3. Make your changes and commit them:

    ```bash
    git commit -m "Add a new feature"
    ```

4. Push your changes:

    ```bash
    git push origin feature/your-feature
    ```

5. Submit a pull request.

## Contributors

<a href="https://github.com/Shobhit2205/RhinoMeet/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=Shobhit2205/RhinoMeet" />
</a>
<!-- Add more contributors here -->
<!-- Example -->
<!-- <a href="https://github.com/username">
    <img src="https://avatars.githubusercontent.com/u/xxx?v=4" alt="Contributor Name" width="60" height="60" />
</a> -->

## Acknowledgments

- Inspired by [Omegle](https://www.omegle.com/).
- Powered by WebRTC and WebSockets for real-time communication.

## Author

- [Shobhit Pandey](https://github.com/Shobhit2205) - [shobhitpandey2205@gmail.com](mailto:shobhitpandey2205@gmail.com)

## Screenshots

![Screenshot 1](screenshots/screenshot1.png)
![Screenshot 2](screenshots/screenshot2.png)
![Screenshot 3](screenshots/screenshot3.png)
![Screenshot 4](screenshots/screenshot4.png)
![Screenshot 5](screenshots/screenshot5.png)

