const express = require('express');
const Booking = require('../models/Booking');
const Boat = require('../models/Boat');
const authenticate = require('../middleware/authenticate');
const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const bookingData = req.body;
        const newBooking = new Booking(bookingData);

        await newBooking.save();

        const { boatId, startDate, endDate } = bookingData;
        const boat = await Boat.findById(boatId);

        const overlapping = boat.availability.some(period => {
            const periodStart = new Date(period.startDate);
            const periodEnd = new Date(period.endDate);
            return (new Date(startDate) <= periodEnd && new Date(endDate) >= periodStart);
        });

        if (overlapping) {
            throw new Error('Selected dates are not available');
        } else {
            await Boat.updateOne(
                { _id: boatId },
                {
                    $push: {
                        availability: {
                            startDate: new Date(startDate),
                            endDate: new Date(endDate),
                            isBooked: true
                        }
                    }
                }
            );
        }

        res.status(201).json({ message: 'Booking created successfully', booking: newBooking });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.get('/my-rentals', authenticate, async (req, res) => {
    try {
        const userId = req.user.userId;
        let bookings = await Booking.find({ renterId: userId }).populate('boatId');
        bookings = bookings.map(booking => ({
            ...booking.toObject(),
            currentStatus: booking.currentStatus
        }));
        res.json(bookings);
    } catch (error) {
        res.status(500).send({ message: 'Error fetching user rentals', error: error.message });
    }
});

router.get('/my-boats', authenticate, async (req, res) => {
    try {
        const userId = req.user.userId; 
        const userBoats = await Boat.find({ ownerId: userId }).select('_id'); 
        let bookings = await Booking.find({ boatId: { $in: userBoats.map(boat => boat._id) } }).populate('boatId');
        
        bookings = bookings.map(booking => {
            const bookingObject = booking.toObject();
            return {
                ...bookingObject,
                currentStatus: booking.currentStatus
            };
        });

        res.json(bookings);
    } catch (error) {
        res.status(500).send({ message: 'Error fetching bookings for user\'s boats', error: error.message });
    }
});

router.patch('/cancel/:bookingId', authenticate, async (req, res) => {
    try {
        const { bookingId } = req.params;
        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.status !== 'Pending') {
            return res.status(400).json({ message: 'Only pending bookings can be cancelled' });
        }

        booking.status = 'Cancelled';
        await booking.save();

        res.json({ message: 'Booking cancelled successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;