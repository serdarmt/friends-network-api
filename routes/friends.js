const express = require('express');
const router = express.Router();
const User = require('../models/User');


router.post('/add', async (req, res) => {
    try {
        const userid = req.cookies.token;
        if (!userid) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const user = await User.findById(userid);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const freindEmail = req.body.friendEmail;
        if (!freindEmail) {
            return res.status(400).json({ message: 'Friend email is required' });
        }
        const friend = await User.findOne({ email: freindEmail });
        if (!friend) {
            return res.status(404).json({ message: 'Friend not found' });
        }

        if (user.friends.includes(friend._id)) {
            return res.status(400).json({ message: 'Friend already added' });
        }

        user.friends.push(friend._id);
        console.log(`[LOG] Adding friend: ${friend.email} to user: ${user.email}`);
        const updatedUser = await user.save();
        res.status(200).json({ message: 'Friend added successfully', user: updatedUser });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Validation error', error: error.message });
        }
        console.error('[ERROR] Error adding friend:', error.message);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const userId = req.cookies.token;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const mainUser = await User.findById(userId);
        if (!mainUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        const queue = [{ user: mainUser, degree: 0 }];
        const visited = new Set([mainUser._id.toString()]);
        const result = [];

        while (queue.length > 0) {
            const { user, degree } = queue.shift();
            if (degree > 3) {
                continue;
            }

            if (degree > 0) {
                let degreeStr = degree === 1 ? '1st' : degree === 2 ? '2nd' : '3rd';
                result.push({
                    name: user.name,
                    email: user.email,
                    degree: degreeStr,
                })
            }

            const populatedUser = await User.findById(user._id).populate('friends');

            for (const friend of populatedUser.friends) {
                const id = friend._id.toString();
                if (!visited.has(id)) {
                    visited.add(id);
                    queue.push({ user: friend, degree: degree + 1 });
                }
            }
        }

        console.log(`Frends of user ${mainUser.email}:`, result);
        res.status(200).json(result);
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Validation error', error: error.message });
        }
        console.error('[ERROR] Error fetching friends:', error.message);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

module.exports = router;