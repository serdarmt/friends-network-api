require('dotenv').config()
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const friendsRoutes = require('./routes/friends'); 

const app = express();

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true, // Allow cookies to be sent
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));

function logger(req, res, next) {
    console.log(`[LOG] ${req.method} ${req.originalUrl}`);
    next();
}
app.use(logger);

app.get('/health', (req, res) => {
    res.json({
        message: 'Health check OK',
        headers: req.headers,
        ip: req.ip,
    })
})

app.use('/v1/auth', authRoutes);
app.use('/v1/profile', profileRoutes);
app.use('/v1/friends', friendsRoutes);

app.use((req, res, next) => {
    console.log('[DEBUG] Unmatched route:', req.method, req.originalUrl);
    res.status(404).json({ msg: 'Route not found' });
})

async function startServer() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('[LOG] Connected to DB: ', mongoose.connection.name);

        app.listen(process.env.PORT, () => {
            console.log(`[LOG] Server running at http://localhost:${process.env.PORT}`);
        });
    } catch (error) {
        console.error('[ERROR] MongoDB connection error: ', error.message);
        process.exit(1);
    }
}

startServer();