const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },

    lastName: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

    profile: {
        dateOfBirth: Date,
        gender: {
            type: String,
            enum: ['Male', 'Female', 'Other']
        },

        contact: {
            phone: { type: String, default: '' },
            address: {
                city: {type: String, default: '' },
                postalCode: { type: String, default: '' },
                street: { type: String, default: '' }
            }
        },

        nauticalLevel: { type: String, enum: ['Beginner', 'Intermediate', 'Experienced', 'Pro' ]},
        
        yachtLicenseHolder: { type: Boolean, default: false} 
    }

}, { timestamps: true});

userSchema.pre('save', async function (next){
    if(!this.isModified('password')) return next();

    const salt = await bcrypt.genSalt(15);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

module.exports = User;