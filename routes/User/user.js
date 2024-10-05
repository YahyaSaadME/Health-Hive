const express = require('express')
const UR = express.Router()
const User = require('../../models/UserSchema');  // Assuming the model is in models/User.js
const jwt = require('jsonwebtoken');
const authAuth = require('../../utils/userAuth');
const DoctorSchema = require('../../models/DoctorSchema');

const JWT_SECRET = process.env.JWT_SECRET;

// Signup Route
UR.post('/signup', async (req, res) => {
    const { name, email, password, address, bloodGroup, phoneNumber } = req.body;

    try {
        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // Create new user
        user = new User({
            name,
            email,
            password,
            address,
            bloodGroup,
            phoneNumber
        });

        // Save user in the database
        await user.save();

        // Create JWT token
        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({ token, user: { name: user.name, email: user.email, address: user.address, bloodGroup: user.bloodGroup, phoneNumber: user.phoneNumber } });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

// Login Route
UR.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        // Create JWT token
        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });

        res.json({ token, user: { name: user.name, email: user.email, address: user.address, bloodGroup: user.bloodGroup, phoneNumber: user.phoneNumber } });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

UR.get('/profile', authAuth, async (req, res) => {
    try {
        // Fetch the user by their ID (decoded from the JWT token)
        const user = await User.findById(req.user).select('-password');  // Exclude password from response

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

UR.post('/doctor',async(req,res)=>{
    const {search}= req.body
    try{
        const doctor = await DoctorSchema.find({search})
        res.json(doctor)

    }catch(e){
        res.status(500).json({message:"Server Error"})
    }
})

UR.post('/book/appointment', async (req, res) => {
    const { doctorId, userId, date, time } = req.body;

    try {
        // 1. Check if the doctor exists
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }

        // 2. Check if the requested time falls within the doctor's availability
        const availableFrom = new Date(`1970-01-01T${doctor.availabilityFrom}`);
        const availableTo = new Date(`1970-01-01T${doctor.availabilityTo}`);
        const requestedTime = new Date(`1970-01-01T${time}`);

        if (requestedTime < availableFrom || requestedTime > availableTo) {
            return res.status(400).json({ message: "Requested time is outside the doctor's availability" });
        }

        // 3. Check if the doctor already has an appointment booked at the same date and time
        const existingAppointment = await Appointment.findOne({
            doctorId,
            date: new Date(date),  // Convert to Date object
            time
        });

        if (existingAppointment) {
            return res.status(400).json({ message: "This time slot is already booked by another patient" });
        }

        // 4. Create a new appointment if the doctor is available and the slot is free
        const newAppointment = new Appointment({
            doctorId,
            userId,
            date: new Date(date),
            time
        });

        await newAppointment.save();

        res.status(201).json({ message: "Appointment booked successfully", appointment: newAppointment });
    } catch (e) {
        console.error(e.message);
        res.status(500).json({ message: "Server Error" });
    }
});
module.exports = UR;

