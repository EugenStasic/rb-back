const express = require('express');
const { body, validationResult } = require('express-validator');
const Boat = require('../models/Boat');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

router.post('/register', [
    body('generalInformation.type')
        .notEmpty()
        .isIn(['Motorboat', 'Sailboat', 'RIB', 'Catamaran', 'Jet-Ski', 'Yacht'])
        .withMessage('Boat type is required'),
    body('generalInformation.manufacturer')
        .notEmpty()
        .withMessage('Manufacturer is required'),
    body('generalInformation.model')
        .notEmpty()
        .withMessage('Model is required'),
    body('generalInformation.cityHarbour.postalCode')
        .notEmpty()
        .withMessage('Postal code is required'),
    body('generalInformation.cityHarbour.city')
        .notEmpty()
        .withMessage('City is required'),
    body('technicalInformation.boatLength')
        .notEmpty()
        .withMessage('Boat length is required'),
    body('technicalInformation.onboardCapacity')
        .notEmpty()
        .withMessage('Onboard capacity is required'),
    body('technicalInformation.engineType')
        .notEmpty()
        .isIn(['Inboard', 'Outboard'])
        .withMessage('Engine type is required'),
    body('technicalInformation.enginePower')
        .notEmpty()
        .withMessage('Engine power is required'),
], authenticate, async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const ownerId = req.user.userId;
        const {
            generalInformation,
            technicalInformation,
            pricing,
            booking,
            equipment,
            extras
        } = req.body;

        const newBoat = new Boat({
            ownerId,
            generalInformation,
            technicalInformation,
            pricing,
            booking,
            equipment,
            extras
        });

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

router.patch('/user-boats/:boatId', [
    body('generalInformation.manufacturer').optional().isString().withMessage('Manufacturer must be a string'),
    body('generalInformation.model').optional().isString().withMessage('Model must be a string'),
    body('generalInformation.cityHarbour.postalCode').optional().isString().withMessage('Postal code must be a string'),
    body('generalInformation.cityHarbour.city').optional().isString().withMessage('City must be a string'),
    body('generalInformation.description').optional().isString().withMessage('Description must be a string'),
    body('generalInformation.photos.*').optional().isString().withMessage('Each photo must be a string'),

    body('technicalInformation.boatLength').optional().isNumeric().withMessage('Boat length must be a number'),
    body('technicalInformation.onboardCapacity').optional().isNumeric().withMessage('Onboard capacity must be a number'),
    body('technicalInformation.engineType').optional().isIn(['Inboard', 'Outboard']).withMessage('Invalid engine type'),
    body('technicalInformation.enginePower').optional().isNumeric().withMessage('Engine power must be a number'),
    body('technicalInformation.avgFuelConsumption').optional().isNumeric().withMessage('Average fuel consumption must be a number'),
    body('technicalInformation.yearOfConstruction').optional().isNumeric().withMessage('Year of construction must be a number'),

    body('pricing.referencePrice').optional().isNumeric().withMessage('Reference price must be a number'),
    body('pricing.minCharterPeriod').optional().isIn(['Half-Day', '1 Day', '2 Days', '3 Days', '4 Days', '5 Days', '6 Days', '7 Days']).withMessage('Invalid minimum charter period'),
    body('pricing.pricePeriods.*.fromDate').optional().isDate().withMessage('From date must be a date'),
    body('pricing.pricePeriods.*.toDate').optional().isDate().withMessage('To date must be a date'),
    body('pricing.pricePeriods.*.price').optional().isNumeric().withMessage('Price must be a number'),

    body('booking.checkInTime').optional().isString().withMessage('Check-in time must be a string'),
    body('booking.checkOutTime').optional().isString().withMessage('Check-out time must be a string'),
    body('booking.boatLicenseRequirement').optional().isIn(['Yes', 'No']).withMessage('Invalid boat license requirement'),
    body('booking.fuelCost').optional().isIn(['Included', 'Not included']).withMessage('Invalid fuel cost option'),
    body('booking.cancellationConditions').optional().isIn(['Flexible', 'Moderate', 'Strict']).withMessage('Invalid cancellation condition'),

    body('equipment.navigationEquipment.*').optional().isString().withMessage('Each navigation equipment item must be a string'),
    body('equipment.boatEquipment.*').optional().isString().withMessage('Each boat equipment item must be a string'),
    body('equipment.waterSportsEquipment.*').optional().isString().withMessage('Each water sports equipment item must be a string'),

    body('extras.*.option').optional().isString().withMessage('Each extra option must be a string'),
    body('extras.*.pricePerDay').optional().isNumeric().withMessage('Price per day must be a number'),
], authenticate, async (req, res) => {
    const { boatId } = req.params;
    const updates = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const boat = await Boat.findById(boatId);
        if (!boat) {
            return res.status(404).json({ message: 'Boat not found' });
        }
        if (boat.ownerId.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'User is not authorized to edit boat information' });
        }

        const updateQuery = {};
        for (const [key, value] of Object.entries(updates)) {
            if (value && typeof value === 'object' && !Array.isArray(value)) {
                for (const [nestedKey, nestedValue] of Object.entries(value)) {
                    updateQuery[`${key}.${nestedKey}`] = nestedValue;
                }
            } else {
                updateQuery[key] = value;
            }
        }

        const updatedBoat = await Boat.findByIdAndUpdate(boatId, { $set: updateQuery }, { new: true, runValidators: true });

        res.status(200).json({ message: 'Boat information updated successfully', boat: updatedBoat });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
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