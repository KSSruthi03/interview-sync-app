import express from 'express';
import dotenv from 'dotenv';
import mongoose from "mongoose";
import http from "http";
import { Server } from "socket.io";

import InterviewSync from './routes/Routes.js';


dotenv.config();

const app = express();

app.use(express.json());

const port = process.env.PORT || 3000;

// Create HTTP server
const server = http.createServer(app);

// Socket.IO setup
const activeUsers = {};

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

// Socket connection
io.on("connection", (socket) => {
    console.log("✅ User connected:", socket.id);

    // JOIN ROOM
    socket.on("join-room", (roomId, userName) => {

        socket.join(roomId);
        // store room data
        socket.roomId = roomId;

        socket.userName = userName;

        if (!activeUsers[roomId]) {
            activeUsers[roomId] = [];
        }
        // add user to active users
        activeUsers[roomId].push(userName);

         // send active users
        io.to(roomId).emit("active-users", activeUsers[roomId]);

        console.log(`✅ User joined room: ${roomId}`);

        // notify room users-Target only this room
        io.to(roomId).emit("user-joined", {
            userName,
            message: `${userName} joined the room`

        });

    });

    // SEND MESSAGE
    socket.on("send-message", ({ roomId, userName, message }) => {
        io.to(roomId).emit("receive-message", {
            userName,
            message
        });
    });


    // DISCONNECT
    socket.on("disconnect", () => {
        console.log("❌ User disconnected:", socket.id);
        // notify room users
        io.to(socket.roomId).emit("user-left", {
            userName: socket.userName,
            message: `${socket.userName} left the room`
        });

    });
});




//Database Connection
const db = mongoose.connect(process.env.MONGO_URL + process.env.DB_NAME);
db.then(() => {
    console.log("Connected to MOngodb🚀");
}).catch((err) => {
    console.log("Error connecting to MongoDB:", err)
});


app.use('/api', InterviewSync);

server.listen(port, () => {
    console.log(`🚀 Server is running on http://localhost:${port}`);
});