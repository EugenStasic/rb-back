const mongoose = require('mongoose');

const BoatSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  generalInformation: {
    type: {
      type: String,
      required: true,
      enum: ['Motorboat', 'Sailboat', 'RIB', 'Catamaran', 'Jet-Ski', 'Yacht'],
      immutable: true
    },
    manufacturer: {
      type: String,
      required: true
    },
    model: {
      type: String,
      required: true
    },
    cityHarbour: {
      postalCode: {
        type: String,
        required: true
      },
      city: {
        type: String,
        required: true
      }
    },
    description: String,
    photos: [String]
  },
  technicalInformation: {
    boatLength: {
      type: Number,
      required: true
    },
    onboardCapacity: {
      type: Number,
      required: true
    },
    engineType: {
      type: String,
      required: true,
      enum: ['Inboard', 'Outboard']
    },
    enginePower: {
      type: Number,
      required: true
    },
    avgFuelConsumption: Number,
    yearOfConstruction: Number
  },
  pricing: {
    referencePrice: Number,
    minCharterPeriod: {
      type: String,
      enum: ['Half-Day', '1 Day', '2 Days', '3 Days', '4 Days', '5 Days', '6 Days', '7 Days']
    },
    pricePeriods: [{
      fromDate: Date,
      toDate: Date,
      price: Number
    }]
  },
  booking: {
    checkInTime: String,
    checkOutTime: String,
    boatLicenseRequirement: {
      type: String,
      enum: ['Yes', 'No']
    },
    fuelCost: {
      type: String,
      enum: ['Included', 'Not included']
    },
    cancellationConditions: {
      type: String,
      enum: ['Flexible', 'Moderate', 'Strict']
    }
  },
  equipment: {
    navigationEquipment: {
        type: [String],
        enum: ['Bow thruster', 'Electric windlass', 'Autopilot', 'GPS', 'Depth sounder', 'VHF', 'Guides & Maps'],
        default: []
      },
      boatEquipment: {
        type: [String],
        enum: ['Bimini', 'Shower', 'External table', 'External speakers', 'Teak deck', 'Sundeck', 'Bathing Platform', 'Bathing ladder'],
        default: []
      },
      waterSportsEquipment: {
        type: [String],
        enum: ['Water skis', 'Wakeboard', 'Towable Tube'],
        default: []
      }
  },
  extras: [{
    option: String,
    pricePerDay: Number
  }],

  images: [{
    data: Buffer,
    contentType: String
  }]

});

const Boat = mongoose.model('Boat', BoatSchema);

module.exports = Boat;