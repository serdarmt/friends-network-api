const express = require('express');
const router = express.Router();
const User = require('../models/User');


router.get('/', async (req, res) => {
    try {
        const userId = req.cookies.token;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        console.log('Fetching profile for user ID:', userId);

        const user = await User.findById(userId);
        console.log('User found:', user);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ email: user.email, name: user.name });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Validation error', error: error.message });
        }
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

module.exports = router;