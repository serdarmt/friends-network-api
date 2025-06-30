const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const newUser = new User({ name, email, password });
        const saved = await newUser.save();

        res.cookie('token', saved._id, {
            httpOnly: true,
            secure: false,
            sameSite: 'Lax',
        });

        res.status(201).json({ message: 'User registered successfully', user: saved });

    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Validation error', error: error.message });
        }
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Login attempt:', { email, password });
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // check the password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // set the cookie
        res.cookie('token', user._id, {
            httpOnly: true,
            secure: false,
            sameSite: 'Lax',
        });
        
        res.status(200).json({ message: 'Login successful', user: user._id });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Validation error', error: error.message });
        }
        console.error('Login error:', error.message);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

router.post('/logout', (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: false,
            sameSite: 'Lax',
        });
        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        console.error('Logout error:', error.message);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

module.exports = router;