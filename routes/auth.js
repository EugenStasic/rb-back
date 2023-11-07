const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

router.post('/register', [
    body('firstName').notEmpty().withMessage('Name is required'),
    body('lastName').notEmpty().withMessage('Surname is required'),
    body('email').isEmail().withMessage('Invalid email format'),
    body('password').isLength({ min: 3 }).withMessage('Password shoud be at least 3 charachters!')
], async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    
    const { firstName, lastName, email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already exists'});

        user = new User({
            firstName,
            lastName,
            email,
            password
        });

        await user.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch(error) {
        res.status(500).json({ message: 'Server Error' });  
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if(!user) return res.status(400).json({ message: 'User does not exist' });

        const isMatch = bcrypt.compareSync(password, user.password);
        if(!isMatch) return res.status(400).json({ message: 'Invalid password' });

        const payload = { userId: user._id };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'strict',
            maxAge: 3600000
        });

        res.status(200).json({ token });
    } catch(error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/logout', authenticate, async (req, res) => {
    try{
        res.clearCookie('token');

        res.status(200).json({ message: 'Logged out successfully ' })
    } catch (error) {
        res.status(500).json({ message: 'Server error during logout' });
    }
});

module.exports = router;