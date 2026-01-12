# BranchOut 🎓
> **Break the Silos. Connect, collaborate, and chat with students across campus instantly.**

BranchOut is a real-time, anonymous networking platform designed for university students to bridge the gap between different departments. It provides a secure, private environment to meet peers across the campus ecosystem.

## ✨ Features

* **Smart Matchmaking:** A custom-built queue system that handles three distinct states:
    * **Searching:** Standard partner matching.
    * **Lobby Quiet:** Alerts users when they are the first to arrive.
    * **Campus Active:** Intelligently detects when all online users are already in chats and places new users in a waiting queue.
* **Real-Time Communication:** Instant messaging with zero lag powered by WebSockets (Socket.io).
* **Strategic Anonymity:** Secure pseudonym-based chatting with JWT (JSON Web Token) authentication.
* **Persistent Connections:** Built-in reconnection logic to maintain chats during page refreshes.
* **Cross-Device Protection:** Prevents a single account from being used in multiple sessions simultaneously.

## 🛠️ Tech Stack

* **Frontend:** HTML5, CSS3 (with dynamic blobs), JavaScript (ES6+)
* **Backend:** Node.js, Express.js
* **Real-Time Engine:** Socket.io
* **Database:** PostgreSQL (Hosted on **Neon.tech**)
* **Security:** JWT, Bcrypt for password hashing

## 🚀 Technical Highlights

### **Sophisticated Matchmaking Logic**
The server-side logic manages the `availableOthers` by comparing the total `onlineCount` against the `activeChat.size`. This ensures users are never left wondering why they haven't matched yet.



### **Serverless Database Integration**
By utilizing **Neon.tech**, the application benefits from serverless PostgreSQL, ensuring fast "wake-up" times and reliable storage for student credentials and pseudonym mapping.

## 📦 Installation & Setup (Ubuntu/Linux)

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/yourusername/BranchOut.git](https://github.com/yourusername/BranchOut.git)
    cd BranchOut
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Setup:**
    Create a `.env` file in the root directory:
    ```env
    DATABASE_URL=your_neon_connection_string
    JWT_SECRET=your_secret_key
    PORT=3000
    ```

4.  **Run the application:**
    ```bash
    npm start
    ```


---
Developed with ❤️ for the campus community.