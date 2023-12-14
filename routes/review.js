const express = require('express');
const Review = require('../models/Review');
const Boat = require('../models/Boat');
const authenticate = require('../middleware/authenticate');
const router = express.Router();

router.post('/submit-review/:boatId', authenticate, async (req, res) => {
    try {
        const { boatId } = req.params;
        const { rating, comment } = req.body;
        const userId = req.user.userId;

        const review = new Review({ boatId, userId, rating, comment });
        await review.save();

        const boat = await Boat.findById(boatId);
        const reviews = await Review.find({ boatId: boat._id });
        const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;

        boat.averageRating = averageRating;
        boat.ratingsCount = reviews.length;
        await boat.save();

        res.status(201).json({ message: 'Review submitted successfully', review });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.get('/check-review/:boatId', authenticate, async (req, res) => {
    try {
        const { boatId } = req.params;
        const userId = req.user.userId;

        const reviewExists = await Review.findOne({ boatId, userId });
        res.json({ hasReviewed: !!reviewExists });
    } catch (error) {
        res.status(500).send({ error: 'Server error' });
    }
});

router.get('/:boatId', async (req, res) => {
    try {
        const { boatId } = req.params;
        const reviews = await Review.find({ boatId }).populate('userId', 'firstName lastName profilePic');
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;