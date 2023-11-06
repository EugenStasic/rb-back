const mongoose = require('mongoose');

const BoatSchema = new mongoose.Schema({
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },

    type: {
        type: String,
        required: true,
        enum: ['Motorboat', 'Sailboat', 'RIB', 'Catamaran', 'Jet-Ski', 'Yacht']
    },

    manufacturer: {
        type: String,
        required: true,
    },

    model: {
        type: String,
        required: true
    },

    cityHarbour: {
        type: String,
        required: true,
    },

    skipperOption: {
        type: String,
        required: true,
        enum: ['Yes', 'No', 'Both']
    },

    capacity: {
        type: Number,
        required: true
    },

    length: {
        type: Number,
        required: true
    },

    engine: {
        type: {
            type: String,
            required: true,
            enum: ['Inboard', 'Outboard']
        },

        power: {
            type: Number,
            required: true
        }
    }
})

const Boat = mongoose.model('Boat', BoatSchema);

module.exports = Boat;