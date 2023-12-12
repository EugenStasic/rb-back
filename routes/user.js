const express = require('express');
const format = require('date-fns/format')
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const authenticate = require('../middleware/authenticate');
const { upload } = require('../middleware/multerMiddleware');

const router = express.Router();

router.get('/me', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId)
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { password, ...userWithoutPassword } = user.toObject();

        res.status(200).json(userWithoutPassword);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.patch('/me', [
    body('dateOfBirth').optional().isISO8601().withMessage('Invalid date format'),
    body('gender').optional().isIn(['Male', 'Female', 'Other']),
    body('contact.phone').optional().isMobilePhone().withMessage('Invalid phone number'),
    body('contact.address.city').optional().notEmpty().withMessage('City cannot be empty'),
    body('contact.address.postalCode').optional().notEmpty().withMessage('Postal code cannot be empty'),
    body('contact.address.street').optional().notEmpty().withMessage('Street cannot be empty'),
    body('nauticalLevel').optional().isIn(['Beginner', 'Intermediate', 'Experienced', 'Pro']),
    body('yachtLicenseHolder').optional().isBoolean(),
], authenticate, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array });
    }

    try {
        const userId = req.user.userId;
        const updates = req.body;

        if (updates.profile && updates.profile.dateOfBirth) {
            const formattedDate = format(new Date(updates.profile.dateOfBirth), 'yyyy-MM-dd');
            updates.profile.dateOfBirth = formattedDate;
        }

        const user = await User.findByIdAndUpdate(userId, { $set: updates }, { new: true, runValidators: true });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userProfile = user.profile.toObject();
        if(userProfile.dateOfBirth) {
            userProfile.dateOfBirth = format(new Date(userProfile.dateOfBirth), 'yyyy-MM-dd');
        }

        res.status(200).json({ message: 'Profile updated successfully', profile: userProfile });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.get('/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await User.findById(userId).select('firstName email profile.contact.phone');
        if (!user) {
            return res.status(404).json({ message: 'User not found'});
        };
        const publicProfile = {
            firstName: user.firstName,
            email: user.email,
            phone: user.profile.contact.phone
        };

        res.status(200).json(publicProfile);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message});
    }
});

router.post('/me/profile-pic', authenticate, upload.single('profilePic'), async (req, res) => {
    try {
      const user = await User.findById(req.user.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      if (req.file) {
        user.profilePic = {
          data: req.file.buffer,
          contentType: req.file.mimetype
        };
      } else {
        return res.status(400).json({ message: 'No file uploaded' });
      }
  
      await user.save();
      res.status(200).json({ message: 'Profile picture updated successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  router.get('/me/profile-pic', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user || !user.profilePic || !user.profilePic.data) {
            return res.status(404).json({ message: 'Profile picture not found' });
        }

        const buffer = Buffer.from(user.profilePic.data, 'base64');

        res.set('Content-Type', user.profilePic.contentType);

        res.send(buffer);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

  router.delete('/me/profile-pic', authenticate, async (req, res) => {
    try {
      const user = await User.findById(req.user.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      user.profilePic = { data: null, contentType: null }; 
      res.status(200).json({ message: 'Profile picture removed successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
module.exports = router;