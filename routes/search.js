const express = require('express');
const Boat = require('../models/Boat');
const router = express.Router();

function buildQuery(params) {
    let query = {};

    if (params['price.min'] !== undefined && params['price.max'] !== undefined) {
        query['pricing.referencePrice'] = { $gte: Number(params['price.min']), $lte: Number(params['price.max']) };
    }
    if (params['length.min'] !== undefined && params['length.max'] !== undefined) {
        query['technicalInformation.boatLength'] = { $gte: Number(params['length.min']), $lte: Number(params['length.max']) };
    }
    if (params['power.min'] !== undefined && params['power.max'] !== undefined) {
        query['technicalInformation.enginePower'] = { $gte: Number(params['power.min']), $lte: Number(params['power.max']) };
    }
    if (params.location) {
        query['generalInformation.cityHarbour.city'] = params.location;
    }

    return query;
};

router.get('/locations', async (req, res) => {
    try {
        const uniqueLocations = await Boat.aggregate([
            { $group: { _id: "$generalInformation.cityHarbour.city" } },
            { $sort: { _id: 1 } }
        ]);

        const locationList = uniqueLocations.map(location => location._id).filter(Boolean);
        res.json(locationList);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.get('/search', async (req, res) => {
    try {
        const query = buildQuery(req.query);

        const boats = await Boat.find(query);
        res.status(200).json(boats);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});


module.exports = router;