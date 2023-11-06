const express = require('express');
const { body, validationResult } = require('express-validator');
const Boat = require('../models/Boat')

const router = express.Router();

router.post('/register', [
    body('type').notEmpty().isIn(['Motorboat', 'Sailboat', 'RIB', 'Catamaran', 'Jet-Ski', 'Yacht']).withMessage('Type is required'),
    body('manufacturer').notEmpty().withMessage('Manufacturer is required'),
    body('model').notEmpty().withMessage('Model is required'),
    body('cityHarbour').notEmpty().withMessage('City/Harbour is required'),
    body('skipperOption').notEmpty().isIn(['Yes', 'No', 'Both']).withMessage('Skipper options is required'),
    body('capacity').notEmpty().withMessage('Maximum capacity of the boat is required'),
    body('length').notEmpty().withMessage('Boat length is required'),
    body('engine.type').notEmpty().isIn(['Inboard', 'Outboard']).withMessage('Engine type is required'),
    body('engine.power').notEmpty().withMessage('Engine power is required')

] ,async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    };

    try {
        const { ownerId, type, manufacturer, model, cityHarbour, skipperOption, capacity, length, engine } = req.body;
        const newBoat = new Boat({ ownerId, type, manufacturer, model, cityHarbour, skipperOption, capacity, length, engine });
        await newBoat.save();

        res.status(201).json({ message: 'Boat registered successfully', boat: newBoat });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;