require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const boatRoutes = require('./routes/boat');
const searchRoutes = require('./routes/search');
const bookingRoutes = require('./routes/booking');
const reviewRoutes = require('./routes/review');

const app = express();

app.use(cors({ 
    origin: 'http://localhost:3000',
    credentials: true
 }));
app.use(express.json());
app.use(cookieParser());
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/boat', boatRoutes);
app.use('/search', searchRoutes)
app.use('/bookings', bookingRoutes);
app.use('/review', reviewRoutes);

mongoose.connect(process.env.MONGODB_URI,{
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then (() => console.log('Connected to Database'))
.catch(err => console.error('Could not connect to Database'));

const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});