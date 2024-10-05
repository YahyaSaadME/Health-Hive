const express = require('express');
const Doctor = require('../../models/DoctorSchema');  // Assuming the model is in models/Doctor.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const doctorAuth = require('../../utils/doctorAuth');
const DR = express.Router();

// JWT Secret Key
const JWT_SECRET = process.env.JWT_SECRET_DOCT;

// Doctor Signup Route
DR.post('/signup', async (req, res) => {
    const { name, email, password, specialization, availabilityFrom, availabilityTo } = req.body;

    try {
        // Check if doctor already exists
        let doctor = await Doctor.findOne({ email });
        if (doctor) {
            return res.status(400).json({ msg: 'Doctor already exists' });
        }

        // Create new doctor
        doctor = new Doctor({
            name,
            email,
            password,
            specialization,
            availabilityFrom,
            availabilityTo
        });

        // Save doctor in the database
        await doctor.save();

        // Create JWT token
        const token = jwt.sign({ id: doctor._id }, JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({ token, doctor: { name: doctor.name, email: doctor.email, specialization: doctor.specialization, availabilityFrom: doctor.availabilityFrom, availabilityTo: doctor.availabilityTo } });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

// Doctor Login Route
DR.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if doctor exists
        const doctor = await Doctor.findOne({ email });
        if (!doctor) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await doctor.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        // Create JWT token
        const token = jwt.sign({ id: doctor._id }, JWT_SECRET, { expiresIn: '1h' });

        res.json({ token, doctor: { name: doctor.name, email: doctor.email, specialization: doctor.specialization, availabilityFrom: doctor.availabilityFrom, availabilityTo: doctor.availabilityTo } });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});
DR.get('/profile', doctorAuth, async (req, res) => {
    try {
        // Fetch the doctor by their ID (decoded from the JWT token)
        const doctor = await Doctor.findById(req.user).select('-password');  // Exclude password from response

        if (!doctor) {
            return res.status(404).json({ msg: 'Doctor not found' });
        }

        res.json({
            name: doctor.name,
            email: doctor.email,
            specialization: doctor.specialization,
            availabilityFrom: doctor.availabilityFrom,
            availabilityTo: doctor.availabilityTo
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
    
});
module.exports = DR;
