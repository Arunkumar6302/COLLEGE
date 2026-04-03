require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');

// Connect to Database
connectDB();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());

const gpsManager = require('./services/gpsManager');

// Start GPS Priority Polling Service
gpsManager.startService(io);

// Socket.io for Real-time location
io.on('connection', (socket) => {
    console.log('New client connected', socket.id);

    socket.on('join_bus', (busId) => {
        socket.join(`bus_${busId}`);
        console.log(`Socket joined bus room: bus_${busId}`);
    });

    socket.on('update_location', (data) => {
        // Handle legacy update_location if emitted
        const { busId, latitude, longitude } = data;
        gpsManager.updateDriverLocation(busId, latitude, longitude, io);
    });

    socket.on('driverLocation', (data) => {
        // data: { busId, lat, lng }  from new architecture
        const { busId, lat, lng } = data;
        gpsManager.updateDriverLocation(busId, lat, lng, io);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Define Routes (Placeholder for now)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/driver', require('./routes/driver'));
app.use('/api/student', require('./routes/student'));
app.use('/api/chatbot', require('./routes/chatbot'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/bus', require('./routes/bus'));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
