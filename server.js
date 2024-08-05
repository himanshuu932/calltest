const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public')); // Serve static files from the 'public' directory

const rooms = {}; // Object to keep track of rooms and their users

io.on('connection', (socket) => {
    console.log('A user connected');

    // Join a room
    socket.on('joinCall', (roomId) => {
        socket.join(roomId);
        if (!rooms[roomId]) {
            rooms[roomId] = [];
        }
        rooms[roomId].push(socket.id);
        console.log(`User ${socket.id} joined room ${roomId}`);
    });
  
    // Relay signaling messages between clients in the same room
    socket.on('offer', (roomId, offer) => {
        socket.to(roomId).emit('offer', offer);
    });

    socket.on('answer', (roomId, answer) => {
        socket.to(roomId).emit('answer', answer);
    });

    socket.on('candidate', (roomId, candidate) => {
        socket.to(roomId).emit('candidate', candidate);
    });

    // Handle hangup event
    socket.on('hangup', (roomId) => {
        socket.to(roomId).emit('hangup');
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
        for (let roomId in rooms) {
            rooms[roomId] = rooms[roomId].filter(id => id !== socket.id);
            if (rooms[roomId].length === 0) {
                delete rooms[roomId];
            }
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
