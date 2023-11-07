const express = require('express');
const { body, validationResult } = require('express-validator');
const Boat = require('../models/Boat');
const authenticate = require('../middleware/authenticate');

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

], authenticate, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    };

    try {
        const ownerId = req.user.userId;
        const { type, manufacturer, model, cityHarbour, skipperOption, capacity, length, engine } = req.body;
        const newBoat = new Boat({ ownerId, type, manufacturer, model, cityHarbour, skipperOption, capacity, length, engine });
        await newBoat.save();
        
        res.status(201).json({ message: 'Boat registered successfully', boat: newBoat });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.get('/user-boats', authenticate, async (req, res) => {
    try {
        const ownerId = req.user.userId;
        const userBoats = await Boat.find({ ownerId });
    
        res.status(200).json(userBoats);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.get('/:boatId', authenticate, async (req, res) => {
    try {
        const boatId = req.params.boatId;
        const boat = await Boat.findById(boatId)

        if (boat.ownerId.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'User is not authorized to edit boat information' });
        };

        res.status(200).json(boat);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
})

router.patch('/user-boats/:boatId',[
    body('type').notEmpty().isIn(['Motorboat', 'Sailboat', 'RIB', 'Catamaran', 'Jet-Ski', 'Yacht']).withMessage('Type is required'),
    body('manufacturer').notEmpty().withMessage('Manufacturer is required'),
    body('model').notEmpty().withMessage('Model is required'),
    body('cityHarbour').notEmpty().withMessage('City/Harbour is required'),
    body('skipperOption').notEmpty().isIn(['Yes', 'No', 'Both']).withMessage('Skipper options is required'),
    body('capacity').notEmpty().withMessage('Maximum capacity of the boat is required'),
    body('length').notEmpty().withMessage('Boat length is required'),
    body('engine.type').notEmpty().isIn(['Inboard', 'Outboard']).withMessage('Engine type is required'),
    body('engine.power').notEmpty().withMessage('Engine power is required')
],authenticate, async (req, res) => {
    console.log("Received PATCH request for boat update");

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.error("Validation errors:", errors.array());
        return res.status(400).json({ errors: errors.array() });
    };

    try {
        const boatId = req.params.boatId;
        console.log("Boat ID:", boatId);

        const updates = req.body;
        console.log("Update data:", updates);

        const boat = await Boat.findById(boatId);
        if (!boat) {
            console.error("Boat not found with ID:", boatId);
            return res.status(404).json({ message: 'Boat not found' });
        };

        console.log("Boat found, checking ownership...");
        if (boat.ownerId.toString() !== req.user.userId) {
            console.error("Unauthorized attempt to edit boat by User ID:", req.user.userId);
            return res.status(403).json({ message: 'User is not authorized to edit boat information' });
        };

        console.log("Ownership verified, updating boat...");
        const updatedBoat = await Boat.findByIdAndUpdate(boatId, { $set: updates }, { new: true, runValidators: true });
        
        console.log("Boat updated successfully:", updatedBoat);
        res.status(200).json({ message: 'Boat information updated successfully', boat: updatedBoat })
    } catch (error) {
        console.error("Server error during boat update:", error.message);
        res.status(500).json({ message: 'Server error', error: error.message })
    }
});

router.delete('/user-boats/:boatId', authenticate, async (req, res) =>{
    try {
        const boatId = req.params.boatId;
        const boat = await Boat.findById(boatId)
   
        if (!boat) {
            return res.status(404).json({ message: 'Boat not found' });
        };

        if (boat.ownerId.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'User not authorized to delete this boat' });
        };

        await Boat.findByIdAndDelete(boatId);

        res.status(200).json({})
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;