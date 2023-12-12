const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    renterId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    boatId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Boat'
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    totalPrice: Number,
    priceDetails: {
        basePrice: Number,
        extrasPrice: Number,
        totalPrice: Number
    },
    status: {
        type: String,
        enum: ['Pending', 'Cancelled', 'Completed'],
        default: 'Pending'
    },
    contactInfo: {
        renter: {
            email: String,
            phone: String
        },
        owner: {
            email: String,
            phone: String
        }
    },
    extras: [{
        option: String,
        price: Number
    }],
    cancellationPolicy: {
        type: String,
        enum: ['Flexible', 'Moderate', 'Strict']
    },
    checkInTime: String,
    checkOutTime: String
});

BookingSchema.virtual('currentStatus').get(function () {
    const today = new Date();
    if (this.status === 'Cancelled') {
        return 'Cancelled';
    } else if (today >= this.startDate && today <= this.endDate) {
        return 'Active';
    } else if (today > this.endDate) {
        return 'Completed';
    } else {
        return 'Pending';
    }
});

BookingSchema.set('toJSON', { virtuals: true });

const Booking = mongoose.model('Booking', BookingSchema);

module.exports = Booking;